import { test,expect } from '@playwright/test';
import {mkdir} from 'node:fs/promises';
// EVIDENCE_DIR lets a local check run without overwriting committed evidence screenshots.
const shots=process.env.EVIDENCE_DIR||'evidence/screenshots';
async function send(page,text){await page.locator('#message').fill(text);await page.locator('#send').click();await expect(page.locator('#pending')).toBeHidden();}
async function demo(page){await send(page,'/demo');await expect(page.locator('[data-statement="count1"]')).toContainText('8');}
async function openDev(page){if(await page.locator('#drawer').isHidden())await page.locator('#menu').click();await page.getByRole('tab',{name:'Developer'}).click();await page.locator('.builder').evaluate(e=>{e.open=true;});}
async function closeDrawer(page){if(await page.locator('#drawer').isVisible())await page.locator('#close-drawer').click();}
async function startOver(page){if(await page.locator('#drawer').isHidden())await page.locator('#menu').click();await page.getByRole('tab',{name:'Conversation'}).click();await page.locator('#reset').click({trial:false});await closeDrawer(page);}
// The optional 3-2-1 countdown is covered by its own test; elsewhere timers start on click.
test.beforeEach(async({page})=>{await page.addInitScript(()=>{if(!localStorage.getItem('sw.prefs'))localStorage.setItem('sw.prefs',JSON.stringify({ready:false,readySet:true}));localStorage.setItem('sw.exp.home-quick','A');});await page.goto('/');await expect(page.locator('#mode')).toHaveText('MOCK · NO MODEL CALLS');});
test('Sukoon opens on how you feel: one question, one suggested reset, then seated or standing',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.locator('#workout').click();await expect(page.locator('#screen')).toContainText('How are you feeling right now?');await expect(page.locator('#spoken')).toContainText('Three minutes, then back');
 await expect(page.locator('#next')).toBeDisabled();await expect(page.locator('#next')).toHaveText('Answer above');await expect(page.locator('#position')).toHaveText('1 / 1');
 for(const moment of ['After back-to-back calls','Stiff from sitting','Post-lunch slump','Stressed, can’t switch off','Tired eyes and wrists'])await expect(page.getByRole('button',{name:moment})).toBeVisible();
 await page.getByRole('button',{name:'After back-to-back calls'}).click();await expect(page.locator('#screen')).toContainText('Try: Unknot neck & shoulders');await expect(page.locator('#position')).toHaveText('2 / 2');
 await page.getByRole('button',{name:'Start seated · 2:30'}).click();await expect(page.locator('#position')).toHaveText('2 / 6');await expect(page.locator('#screen')).toContainText('Neck side release');
 await expect(page.locator('.workout-intent')).toContainText('Unknot neck & shoulders · seated');await expect(page.locator('.workout-next-title')).toHaveText('Shoulder rolls');await expect(page.locator('.workout-count')).toHaveText('Step 1 of 4');
 await page.locator('#back').click();await expect(page.locator('#screen')).toContainText('Unknot neck & shoulders · Seated');await expect(page.locator('#screen')).toContainText('4 short steps · 2:30');
});
test('reset recap separates a full timer, an early finish, an open timer and a skipped one',async({page})=>{
 await page.clock.install();await page.reload();await expect(page.locator('#mode')).toHaveText('MOCK · NO MODEL CALLS');await page.setViewportSize({width:1440,height:1000});
 await send(page,'/reset');await expect(page.locator('#screen')).toContainText('Unknot neck & shoulders · Seated');await expect(page.locator('#screen')).toContainText('4 short steps · 2:30');
 const timer=page.locator('.timer-status');
 await page.locator('#next').click();await expect(page.locator('#screen')).toContainText('Neck side release');await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Finish now',exact:true}).click();await expect(timer).toHaveText('done');
 await page.locator('#next').click();await expect(page.locator('#screen')).toContainText('Shoulder rolls');await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Pause timer',exact:true}).click();await expect(timer).toHaveText('paused');
 await page.locator('#next').click();await expect(page.locator('#screen')).toContainText('Chest opener');await page.getByRole('button',{name:'Start',exact:true}).click();await page.clock.fastForward(41_000);await expect(timer).toHaveText('done');
 await page.locator('#next').click();await expect(page.locator('#screen')).toContainText('Long exhale');await page.locator('#next').click();
 await expect(page.locator('#position')).toHaveText('6 / 6');await expect(page.locator('#next')).toHaveText('Finish');await expect(page.locator('#screen')).toContainText('Back to your day.');await expect(page.locator('.recap-summary')).toBeVisible();
 await expect(page.locator('.recap-summary')).toHaveText('1 of 4 timers ran to zero · 1 marked finished early · 1 still open · 1 not started.');
 await expect(page.locator('.recap')).toContainText('Hands behind, chest lifts · ran the full 0:40');await expect(page.locator('.recap')).toContainText('marked finished early with Finish now, not timed');await expect(page.locator('.recap')).toContainText('Slow breathing · not started');
});
test('a need typed in their own words, even in Hinglish, shapes the suggestion and leads into the reset',async({page})=>{
 await page.locator('#workout').click();const field=page.getByLabel('Or in your own words');await expect(field).toBeVisible();
 await field.fill('kamar akad gayi hai, baithe baithe');await field.press('Enter');await expect(page.locator('#screen')).toContainText('Try: Undo the sitting');await expect(page.locator('#screen')).toContainText('Heard:');
 await expect(page.locator('#next')).toHaveText('Answer above');await page.getByRole('button',{name:'Start standing · 2:40'}).click();await expect(page.locator('#screen')).toContainText('Standing spine waves');
 await expect(page.locator('.workout-intent')).toContainText('Undo the sitting · standing');await expect(page.locator('#position')).toHaveText('2 / 6');await page.locator('#back').click();await expect(page.locator('#screen')).toContainText('Undo the sitting · Standing');
});
test('a finished timer offers the next step',async({page})=>{
 await send(page,'/reset energy standing');await page.locator('#next').click();await expect(page.locator('#screen')).toContainText('Arm swings');
 await expect(page.locator('.timer-done')).toBeHidden();await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Finish now',exact:true}).click();
 await expect(page.locator('.timer-done')).toContainText('Marked done without timing.');await page.getByRole('button',{name:'Next step →'}).click();await expect(page.locator('#screen')).toContainText('Tall reach');await expect(page.locator('#position')).toHaveText('3 / 6');
});
test('transitions vary between steps and the ending sends you back to your day',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await send(page,'/reset calm seated');await page.locator('#next').click();await expect(page.locator('#screen')).toContainText('Longer exhale');
 const finishTimer=async()=>{await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Finish now',exact:true}).click();};
 await page.clock.install();await page.getByRole('button',{name:'Start',exact:true}).click();await page.clock.fastForward(46_000);const first=await page.locator('.timer-done p').textContent();
 await page.getByRole('button',{name:'Next step →'}).click();await page.getByRole('button',{name:'Start',exact:true}).click();await page.clock.fastForward(36_000);const second=await page.locator('.timer-done p').textContent();
 expect(first).not.toEqual(second);for(const line of [first,second])expect(line).not.toMatch(/great|proud|well done|workout/i);
 await page.getByRole('button',{name:'Next step →'}).click();await page.locator('#next').click();await finishTimer();
 await expect(page.locator('.timer-done')).toContainText('Marked done without timing.');await page.getByRole('button',{name:'Back to your day →'}).click();
 await expect(page.locator('#screen')).toContainText('Back to your day.');await expect(page.locator('[data-statement="finish_word"]')).toHaveCount(0);await expect(page.locator('#spoken')).toContainText('Let the quiet last a little longer');
 await expect(page.locator('details.recap')).not.toHaveAttribute('open','');await expect(page.locator('.recap-summary')).toBeVisible();await expect(page.locator('.recap-list')).toBeHidden();
 await expect(page.locator('#next')).toHaveText('Finish');await expect(page.locator('#next')).toBeEnabled();await page.locator('#next').click();
 await expect(page.locator('#next')).toHaveText('Done for today');await expect(page.locator('#next')).toBeDisabled();
 await page.locator('.recap summary').click();await expect(page.locator('.recap-list')).toBeVisible();
});
test('presence follows the activity; a timer that runs out offers one next step; reset is recorded',async({page})=>{
 const phase=()=>page.locator('.preview').getAttribute('data-phase');await page.clock.install();await page.reload();await expect(page.locator('#mode')).toHaveText('MOCK · NO MODEL CALLS');
 await expect(page.locator('.preview')).toHaveAttribute('data-phase','idle');await page.locator('#workout').click();await expect(page.locator('.preview')).toHaveAttribute('data-phase','arrival');
 await send(page,'/reset energy standing');await expect(page.locator('.preview')).toHaveAttribute('data-phase','arrival');await page.locator('#next').click();await expect(page.locator('.preview')).toHaveAttribute('data-phase','ready');
 await page.getByRole('button',{name:'Start',exact:true}).click();await expect(page.locator('.preview')).toHaveAttribute('data-phase','focus');await expect(page.locator('.timer-done')).toBeHidden();
 await page.clock.fastForward(41_000);await expect(page.locator('.timer-status')).toHaveText('done');await expect(page.locator('.preview')).toHaveAttribute('data-phase','rest');
 await expect(page.locator('.timer-done')).toContainText('Up next:');await expect(page.locator('.event',{hasText:'The timer for Loose, easy arm swings finished.'})).toHaveCount(1);
 await page.getByRole('button',{name:'Next step →'}).dblclick();await expect(page.locator('#screen')).toContainText('Tall reach');await page.clock.fastForward(500);await expect(page.locator('#position')).toHaveText('3 / 6');
 await page.getByRole('button',{name:'Start',exact:true}).click();await page.clock.fastForward(5_000);await page.getByRole('button',{name:'Reset timer',exact:true}).click();await expect(page.locator('.timer-status')).toHaveText('stopped');
 for(let i=0;i<3;i++)await page.locator('#next').click();await expect(page.locator('.preview')).toHaveAttribute('data-phase','closing');
 await expect(page.locator('.recap-summary')).toHaveText('1 of 4 timers ran to zero · 1 reset · 2 not started.');await expect(page.locator('.recap')).toContainText('Reach up, lower with control · reset, not run again');
 await page.locator('#next').click();await expect(page.locator('.preview')).toHaveAttribute('data-phase','closed');expect(await phase()).toBe('closed');
});
test('pain changes the interface: a calm safety screen, no reset choices, and a way back',async({page})=>{
 await page.locator('#workout').click();
 const field=page.getByLabel('Or in your own words');await field.fill('My neck hurts but I still want something');await field.press('Enter');
 await expect(page.locator('#screen .alert-warning')).toContainText('physiotherapist');await expect(page.locator('.preview')).toHaveAttribute('data-phase','care');
 await expect(page.getByRole('button',{name:'After back-to-back calls'})).toHaveCount(0);await expect(page.locator('#screen')).toHaveClass(/enter/);
 await page.getByRole('button',{name:'Show the resets'}).click();await expect(page.getByRole('button',{name:'After back-to-back calls'})).toBeVisible();await expect(page.locator('#screen')).toContainText('leaves that area alone');
});
test('in a reset: a safety report pauses the running timer and holds; seated or standing keeps your place',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await send(page,'/reset unknot seated');await page.locator('#next').click();await expect(page.locator('#screen')).toContainText('Neck side release');
 const ask=page.getByLabel('Something changed? Tell Sukoon');await ask.fill('this is too easy');await ask.press('Enter');await expect(page.locator('#screen .alert')).toContainText('standing version');
 await page.getByRole('button',{name:'Switch to standing'}).click();await expect(page.locator('.workout-intent')).toContainText('Unknot neck & shoulders · standing');await expect(page.locator('#position')).toHaveText('2 / 6');
 await page.getByRole('button',{name:'Start',exact:true}).click();await expect(page.locator('.timer-status')).toHaveText('running');
 await page.getByLabel('Something changed? Tell Sukoon').fill('ouch, my shoulder hurts');await page.getByLabel('Something changed? Tell Sukoon').press('Enter');
 await expect(page.locator('#screen .alert-warning')).toContainText('I’ve paused the timer');await expect(page.locator('.preview')).toHaveAttribute('data-phase','care');
 await expect(page.locator('.timer')).toBeHidden();await expect(page.locator('#next')).toBeDisabled();await expect(page.locator('#back')).toBeDisabled();await expect(page.locator('.event',{hasText:'for safety'})).toHaveCount(0);
 await page.getByRole('button',{name:'I’ve rested and feel okay'}).click();await expect(page.locator('.timer-status')).toHaveText('paused');await expect(page.getByRole('button',{name:'Resume timer'})).toBeEnabled();await expect(page.locator('#next')).toBeEnabled();
});
test('the active reset is one stage: step, live timer, progress, next step and Sukoon together',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.locator('#workout').click();
 const f=page.getByLabel('Or in your own words');await f.fill('so sleepy after lunch');await f.press('Enter');await page.getByRole('button',{name:'Start standing · 2:25'}).click();
 const stage=page.locator('.workout');await expect(stage).toBeVisible();await expect(stage.locator('.workout-count')).toHaveText('Step 1 of 4');await expect(stage.locator('.workout-intent')).toContainText('Energy lift · standing · kept light');await expect(stage.locator('.workout-next-title')).toHaveText('Tall reach');
 await expect(stage.locator('.workout-title')).toHaveText('Arm swings');await expect(stage.locator('.stage-timer')).toBeVisible();await expect(stage.locator('.workout-say')).toBeVisible();await expect(page.locator('.spoken')).toBeHidden();await expect(page.locator('#next')).toHaveText('Skip →');
 await page.getByRole('button',{name:'Start',exact:true}).click();await expect(stage.locator('.workout-say')).toHaveCSS('opacity','0.35');await expect(stage.locator('.workout-track span').first()).toHaveClass(/open/);
 await page.getByRole('button',{name:'Finish now',exact:true}).click();await expect(page.locator('#next')).toHaveText('Next →');await expect(stage.locator('.workout-track span').first()).toHaveClass(/early/);
 await page.getByRole('button',{name:'Next step →'}).click();await expect(stage.locator('.workout-count')).toHaveText('Step 2 of 4');await expect(stage.locator('.workout-title')).toHaveText('Tall reach');await expect(page.locator('#screen')).toHaveClass(/enter-soft/);
 await expect(stage.locator('.workout-track span').nth(1)).toHaveClass(/current/);await expect(stage.locator('.workout-track span').first()).toHaveClass(/early/);
});
test('feedback during a reset adapts the stage without errors, even with an unanswered offer',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await send(page,'/reset energy standing');await page.locator('#next').click();
 await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:'Finish now',exact:true}).click();
 const ask=async t=>{const f=page.getByLabel('Something changed? Tell Sukoon');await f.fill(t);await f.press('Enter');await expect(page.locator('#pending')).toBeHidden();};
 await ask('a colleague is right next to me, too much');await expect(page.locator('.workout-offer')).toContainText('Sukoon suggests');await page.locator('#next').click();await expect(page.locator('.workout-count')).toHaveText('Step 2 of 4');
 await ask('too easy');await expect(page.locator('#error')).toBeHidden();await expect(page.locator('.workout-offer')).toContainText('already the standing version');
 await page.getByRole('button',{name:'Keep this one'}).click();await ask('I am joining a call now');await page.getByRole('button',{name:'Switch to seated'}).click();
 await expect(page.locator('.workout-adjusted')).toHaveText('Adjusted · now energy lift, seated');await expect(page.locator('.workout-count')).toHaveText('Step 2 of 4');await expect(page.locator('.workout-intent')).toContainText('Energy lift · seated');
 await ask('too easy');await page.getByRole('button',{name:'Switch to standing'}).click();await expect(page.locator('.workout-adjusted')).toHaveText('Adjusted · now energy lift, standing');await expect(page.locator('#error')).toBeHidden();
});
test('source stepper, text cues, value patch and local timer continuity',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await mkdir(shots,{recursive:true});await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:shots+'/01-start.png',fullPage:true});await demo(page);
 await expect(page.locator('#spoken')).toContainText('current screen');await send(page,'next');await expect(page.locator('#position')).toHaveText('2 / 4');await page.getByRole('button',{name:'Start',exact:true}).click();
 await page.locator('#next').click();await expect(page.locator('#position')).toHaveText('3 / 4');await page.locator('#back').click();await expect(page.locator('.timer-status')).toHaveText('running');
 await page.locator('#pause').click();await expect(page.locator('.timer-status')).toHaveText('paused');await expect(page.locator('#next')).toBeDisabled();await page.locator('#pause').click();await expect(page.locator('.timer-status')).toHaveText('running');
 await page.getByRole('button',{name:'Finish now',exact:true}).click();await expect(page.locator('.timer-status')).toHaveText('done');await expect(page.locator('#position')).toHaveText('2 / 4');
 await send(page,'change value to 6');await expect(page.locator('#position')).toHaveText('2 / 4');await send(page,'next');await expect(page.locator('[data-statement="count2"]')).toContainText('6');await page.screenshot({path:shots+'/02-timer-state.png',fullPage:true});expect(errors).toEqual([]);
});
test('repeated sends, interruption, reset while pending and post-reset navigation',async({page})=>{
 await openDev(page);await page.locator('#fault').selectOption('slow');await page.locator('#message').fill('/demo');await page.locator('#send').click();await page.locator('#message').fill('/demo');await page.locator('#send').click();await expect(page.locator('.message.user')).toHaveCount(1);await startOver(page);await page.waitForTimeout(2500);await expect(page.locator('#screen')).toContainText('Between calls? Take three minutes.');await demo(page);await page.locator('#next').click();await startOver(page);await demo(page);await page.locator('#next').click();await expect(page.locator('#position')).toHaveText('2 / 4');
 await openDev(page);await page.locator('#fault').selectOption('slow');await page.locator('#message').fill('next');await page.locator('#send').click();await send(page,'back');await expect(page.locator('#position')).toHaveText('1 / 4');
});
for(const fault of ['schema','request'])test(`${fault} failure preserves screen and retry recovers`,async({page})=>{await demo(page);await openDev(page);await page.locator('#fault').selectOption(fault);await send(page,'next');await expect(page.locator('#error')).toBeVisible();await expect(page.locator('[data-statement="count1"]')).toContainText('8');await page.locator('#retry').click();await expect(page.locator('#position')).toHaveText('2 / 4');await expect(page.locator('#error')).toBeHidden();});
test('local valid/invalid patches are data and candidate component can be registered',async({page})=>{
 await demo(page);await openDev(page);await page.locator('#patch').fill('count1 = Keyword("<img src=x onerror=alert(1)>", "inert")');await page.locator('#apply-patch').click();await expect(page.locator('[data-statement="count1"]')).toContainText('<img src=x');await expect(page.locator('#screen img')).toHaveCount(0);
 await page.locator('#patch').fill('count1 = Function("evil")');await page.locator('#apply-patch').click();await expect(page.locator('#patch-status')).toContainText('Invalid patch');
 // Trusted test code registers a candidate component in all three local seams.
 await page.evaluate(async()=>{const {OPENUI_LIBRARY}=await import('/shared/openui/openui-library.js');const {propValidators}=await import('/shared/openui/validate.js');const {renderers}=await import('/web/components.js');OPENUI_LIBRARY.StatusPill={args:['label','value'],required:2};propValidators.StatusPill=p=>typeof p.label==='string'&&typeof p.value==='string';renderers.StatusPill=({props:p})=>{const n=document.createElement('div');n.textContent=p.label+': '+p.value;return n;};});
 await page.locator('#patch').fill('page1 = Screen([heading1, custom1])\ncustom1 = StatusPill("Sample", "A")');await page.locator('#apply-patch').click();await expect(page.locator('[data-statement="custom1"]')).toHaveText('Sample: A');
});
test('manual export contains screen/events/versions and no token; mobile fits',async({page})=>{
 await page.setViewportSize({width:390,height:844});await demo(page);await openDev(page);await page.locator('#note').fill('Tested mock only. TOKEN=do-not-export');const download=page.waitForEvent('download');await page.locator('#export').click();const d=await download;const stream=await d.createReadStream();let content='';for await(const chunk of stream)content+=chunk;const json=JSON.parse(content);expect(json.state.ui_state).toContain('root = Screens');expect(json.events.find(e=>e.result).result.versions.protocolHash).toHaveLength(64);expect(content).not.toContain('do-not-export');expect(content).not.toContain('X-Local-Token');await closeDrawer(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:shots+'/03-mobile.png',fullPage:true});
});
test('runtime starts mock; Codex blocked; selecting never calls model endpoint',async({page})=>{let turns=0;page.on('request',r=>{if(r.url().includes('/api/turn'))turns++;});await openDev(page);await page.locator('#provider').selectOption('codex-cli');await expect(page.locator('#send')).toBeDisabled();await expect(page.locator('#provider-description')).toContainText('no-command/no-private-read');expect(turns).toBe(0);});
test('configured CLI needs explicit consent and records fake provider identity',async({page})=>{
 await page.route('**/api/config',async route=>{const response=await route.fetch();const cfg=await response.json();cfg.providers.find(p=>p.id==='claude-cli').enabled=true;await route.fulfill({json:cfg});});await page.reload();await openDev(page);await page.locator('#provider').selectOption('claude-cli');await expect(page.locator('#send')).toBeDisabled();await page.locator('#consent').check();await page.route('**/api/turn',route=>route.fulfill({json:{turn:{reply:'Transport fixture, not a live CLI request.'},versions:{provider:'claude-cli',mode:'live',model:'fixture-only'}}}));await send(page,'hello');await expect(page.locator('#caption')).toContainText('Transport fixture');
});

