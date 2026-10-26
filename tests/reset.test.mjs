import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ScreenDocument} from '../dist/shared/openui/document.js';
import {mockTurn,guideTarget} from '../dist/server/mock.js';
import {RESETS,RESET_NAMES,RESET_MOMENTS,POSTURES,DEFAULT_POSTURE,planOf,clock,interpretNeed,interpretSessionRequest,sessionProgram,feelProgram,pickStatements} from '../dist/server/lull.js';

const fence=s=>'```openui\n'+s+'\n```';
const req=(text,ui_state='')=>({messages:[{role:'user',content:text}],state:{ui_state,client_events:[]},provider:'mock',consent:false,fault:'none'});
// Apply one turn to a document, as the client does.
const say=(doc,text)=>{const reply=mockTurn(req(text,doc.echo()),{wiring:''}).reply;for(const m of reply.matchAll(/```openui\n([\s\S]*?)\n```/g))doc.apply(fence(m[1]));return reply;};
const text=(doc,key)=>String(doc.screens.flatMap(s=>s.props.children).find(n=>n.key===key)?.props.text??'');
const actions=(doc,key)=>doc.screens.flatMap(s=>s.props.children).find(n=>n.key===key)?.props.prompts??[];

test('five desk resets, each seated and standing, with the same steps so switching keeps your place',()=>{
  assert.deepEqual(RESETS,['unknot','unsit','energy','calm','screen']);
  for(const r of RESETS){
    const seated=planOf(r,'seated'),standing=planOf(r,'standing');
    assert.deepEqual(seated.blocks.map(b=>b.key),standing.blocks.map(b=>b.key),`${r}: same step keys`);
    for(const p of POSTURES){const {blocks,total}=planOf(r,p);
      assert.equal(blocks.length,4,`${r} ${p}: four steps`);
      assert(total>=140&&total<=180,`${r} ${p}: about three minutes (${clock(total)})`);
      for(const b of blocks)assert(b.steps.length>=2&&b.steps.length<=3&&b.text&&b.cue&&b.label,`${r} ${p} ${b.key}: complete`);}
  }
});

test('office-safe content: nothing on the floor, no jumping, no workout or fitness language',()=>{
  const banned=/\b(workout|cardio|intervals?|reps?|squats?|lunges?|planks?|burpees?|push-?ups?|jump\w*|jog\w*|running|sprint\w*|lie down|kneel\w*|on all fours|get (down )?on the floor|sweat\w*|calories?|beginner|challenge seeker|intensity)\b/i;
  for(const r of RESETS)for(const p of POSTURES){
    const program=sessionProgram(r,p,{name:''});
    const visible=[...program.matchAll(/"([^"]*)"/g)].map(m=>m[1]).join(' | ');
    assert.doesNotMatch(visible,banned,`${r} ${p} shows: ${visible.match(banned)?.[0]}`);
  }
  assert.doesNotMatch(feelProgram(),/workout|mood for|gentle|steady|cardio|mobility/i);
});

test('the flow: how are you feeling, one suggested reset, then a session that ends back at work',()=>{
  const doc=new ScreenDocument();
  assert.match(say(doc,'/lull'),/Three minutes, then back to your day/);
  assert.equal(text(doc,'feel_title'),'How are you feeling right now?');
  assert.deepEqual(actions(doc,'feel_actions'),RESETS.map(r=>RESET_MOMENTS[r]));
  say(doc,'After back-to-back calls');
  assert.equal(doc.cursor,'pick');assert.equal(text(doc,'pick_title'),'Try: Unknot neck & shoulders');
  assert.deepEqual(actions(doc,'pick_actions'),['Start seated · 2:30','Start standing · 2:40','Something else']);
  say(doc,'Start seated · 2:30');
  assert.equal(text(doc,'intro_title'),'Unknot neck & shoulders · Seated');
  assert.equal(doc.cursor,'neck','opens on the first step, the plan one step back');
  assert.equal(text(doc,'finish_title'),'Back to your day.');
  assert(!doc.program.includes('finish_word'),'no word card');
});

test('every work moment leads to its own reset, in the posture that suits it',()=>{
  for(const r of RESETS){
    const need=interpretNeed(RESET_MOMENTS[r]);
    assert.equal(need.kind,'suggest');assert.equal(need.reset,r,RESET_MOMENTS[r]);
    const doc=new ScreenDocument();say(doc,'/lull');say(doc,RESET_MOMENTS[r]);
    assert.match(actions(doc,'pick_actions')[0],new RegExp(`^Start ${DEFAULT_POSTURE[r]} · ${clock(planOf(r,DEFAULT_POSTURE[r]).total)}$`));
  }
});

test('free text is read for the body part and the moment, and context sets the posture',()=>{
  const pick=t=>{const n=interpretNeed(t);return [n.kind,n.reset??n.level??null,n.posture??null];};
  assert.deepEqual(pick('been hunched over my laptop all morning'),['suggest','unknot',null]);
  assert.deepEqual(pick('my lower back is stiff from sitting'),['suggest','unsit',null]);
  assert.deepEqual(pick('so sleepy after lunch'),['suggest','energy',null]);
  assert.deepEqual(pick('my mind is racing, so stressed'),['suggest','calm',null]);
  assert.deepEqual(pick('eyes are tired from the screen'),['suggest','screen',null]);
  assert.deepEqual(pick('neck is stiff and I am on a call in 5'),['suggest','unknot','seated']);
  assert.deepEqual(pick('I want to stand up and move'),['suggest','energy','standing']);
  assert.equal(pick('I want to go for a run')[1],'energy','outside scope lands on the closest desk reset');
  assert.match(interpretNeed('I want to go for a run').ack,/outside what Lull does/);
  assert.equal(interpretNeed('asdf').kind,'clarify');
  // Punctuation is dropped before matching: "stiff, back-to-back" must not become "stiff back".
  const calls=interpretNeed('neck is stiff, back to back calls');assert.equal(calls.reset,'unknot');assert(!calls.heard.includes('back'),'back-to-back is about calls, not a back');
  assert.equal(interpretNeed('my back is stiff').reset,'unsit');
});

test('safety first: pain or symptoms replace the choices, before or during a reset',()=>{
  const doc=new ScreenDocument();say(doc,'/lull');say(doc,'my neck hurts after calls');
  assert.equal(text(doc,'care_title'),'Let’s not work around pain.');
  assert.deepEqual(actions(doc,'care_actions'),['Not today','Show the resets']);
  say(doc,'Show the resets');assert.equal(text(doc,'feel_title'),'How are you feeling right now?');
  const urgent=new ScreenDocument();say(urgent,'/lull');say(urgent,'chest feels tight');
  assert.deepEqual(actions(urgent,'care_actions'),['I understand'],'no route into a reset');
  const s=new ScreenDocument();say(s,'/reset unknot seated');say(s,'next');say(s,'kamar mein dard ho raha');
  assert(s.program.includes('safety_alert'),'Hinglish pain pauses the reset');
});

test('in session: less means seated, more means standing, both offered and keeping your place',()=>{
  const doc=new ScreenDocument();say(doc,'/reset unsit standing');say(doc,'next');say(doc,'next');
  assert.equal(doc.cursor,'twist');
  assert.match(say(doc,'joining a call now'),/seated version works on a call/);
  assert.deepEqual(actions(doc,'offer_actions'),['Switch to seated','Keep this one']);
  say(doc,'Switch to seated');
  assert.equal(text(doc,'intro_title'),'Undo the sitting · Seated');assert.equal(doc.cursor,'twist','same step');
  assert.match(say(doc,'too easy'),/standing version/);
  assert.equal(interpretSessionRequest('something calmer, calm down').kind,'switch');
  const end=new ScreenDocument();say(end,'/reset calm seated');say(end,'next');say(end,'bas karo');say(end,'End the session');
  assert.equal(text(end,'finish_title'),'That’s enough for now.');
});

test('scripted buttons never go to the live model; free text does',()=>{
  for(const label of [...RESETS.map(r=>RESET_MOMENTS[r]),'Start seated · 2:30','Switch to standing','Switch to calm down','Show the resets'])
    assert.equal(guideTarget(req(label)),null,label);
  assert.equal(guideTarget(req('my shoulders are up by my ears')).phase,'need');
});

test('the app’s one-tap moments state the real reset lengths',async()=>{
  const app=await readFile(new URL('../src/web/app.ts',import.meta.url),'utf8');
  const seconds=Object.fromEntries([...app.match(/const SECONDS:Record<Reset,string>=\{([^}]*)\}/)[1].matchAll(/(\w+):'([\d:]+)'/g)].map(m=>[m[1],m[2]]));
  for(const r of RESETS)assert.equal(seconds[r],clock(planOf(r,DEFAULT_POSTURE[r]).total),r);
});

test('the pick screen offers one reset with its reason, and Something else goes back',()=>{
  const lines=pickStatements('calm').join('\n');
  assert.match(lines,/Try: Calm down/);assert.match(lines,/Start seated · 2:30/);assert.match(lines,/Something else/);
  const doc=new ScreenDocument();say(doc,'/lull');say(doc,'Stressed, can’t switch off');say(doc,'Something else');
  assert.equal(doc.cursor,'feel');
});
