import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {cleanTeam,pilotEvent,pilotPath,nextStart,reminderIcs,reminderGoogle,reminderSlack} from '../dist/shared/pilot.js';

test('team codes are plain and short, so they cannot carry anything personal',()=>{
  assert.equal(cleanTeam('Sales'),'sales');
  assert.equal(cleanTeam('  Eng Team #2 <b>'),'engteam2b');
  assert.equal(cleanTeam('a'.repeat(40)).length,24);
  assert.equal(cleanTeam(''),null);
  assert.equal(cleanTeam(null),null);
});

test('only allow-listed events can leave the device, and nothing about pain or what was typed',()=>{
  assert.equal(pilotEvent('session_loaded',{title:'Gentle mobility'}),'session-started');
  assert.equal(pilotEvent('session_finished',{reason:'finished'}),'session-finished');
  assert.equal(pilotEvent('reminder_set',{via:'slack'}),'reminder-set');
  assert.equal(pilotEvent('opened_from_reminder'),'opened-from-reminder');
  assert.equal(pilotEvent('returned'),'came-back');
  for(const [type,data] of [['safety',{level:'pain'}],['session_finished',{reason:'safety'}],['session_finished',{reason:'stopped'}],['unmatched',{text:'my knee hurts'}],['need',{kinds:['stiff']}],['feeling',{value:'lighter'}],['adjusted',{to:'gentle'}],['timer_started',{}],['visit',{}],['feeling',{value:'<script>'}],['need',{kinds:['a stiff back']}]])
    assert.equal(pilotEvent(type,data),null,`${type} must never be sent`);
  assert.equal(pilotPath('sales','session-started'),'pilot/sales/session-started');
});

test('the pilot path carries the team and the event, nothing else',()=>{
  const path=pilotPath(cleanTeam('Sales'),pilotEvent('session_loaded',{title:'Private title'}));
  assert.ok(!path.includes('Private'));
  assert.deepEqual(path.split('/'),['pilot','sales','session-started']);
});

test('reminders start on the next weekday at the chosen time',()=>{
  assert.equal(nextStart('15:40',new Date(2026,9,26,10,0)),'20261026T154000');   // Monday morning: today
  assert.equal(nextStart('15:40',new Date(2026,9,26,16,0)),'20261027T154000');   // Monday after 3:40: Tuesday
  assert.equal(nextStart('09:05',new Date(2026,9,30,18,0)),'20261102T090500');   // Friday evening: Monday
  assert.equal(nextStart('nonsense',new Date(2026,9,26,10,0)),'20261026T154000'); // falls back to 3:40 pm
});

test('calendar and Slack reminders recur on weekdays and link back with the team kept',()=>{
  const link='https://lull-hr.vercel.app/app/?from=reminder&team=sales',from=new Date(2026,9,26,10,0);
  const ics=reminderIcs('15:40',link,from,'uid-1@lull');
  for(const line of ['BEGIN:VEVENT','DTSTART:20261026T154000','DTEND:20261026T154500','RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',`URL:${link}`,'END:VCALENDAR'])assert.ok(ics.includes(line),line);
  assert.ok(ics.includes('\r\n'),'iCalendar lines end with CRLF');
  const google=new URL(reminderGoogle('15:40',link,from,'Asia/Kolkata'));
  assert.equal(google.searchParams.get('recur'),'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR');
  assert.equal(google.searchParams.get('dates'),'20261026T154000/20261026T154500');
  assert.equal(google.searchParams.get('ctz'),'Asia/Kolkata');
  assert.equal(reminderSlack('15:40',link),`/remind me "Take a 3-minute Lull reset: ${link}" every weekday at 3:40pm`);
  assert.equal(reminderSlack('09:05',link).endsWith('every weekday at 9:05am'),true);
  assert.equal(reminderSlack('12:00',link).endsWith('at 12:00pm'),true);
});

test('the local app still cannot send anything: its CSP only allows its own origin',async()=>{
  const server=await readFile('src/server/app.ts','utf8');
  assert.match(server,/connect-src 'self'/);
});

import {parseReset,teamResetInvite,resetFromTitle} from '../dist/shared/pilot.js';

test('feelings and needs never leave the device, even from the fixed lists',()=>{
  for(const value of ['lighter','same','not-for-me']) assert.equal(pilotEvent('feeling',{value}),null);
  for(const kinds of [['some stiffness'],['a stiff back'],['neck and shoulders'],['my back hurts']]) assert.equal(pilotEvent('need',{kinds}),null);
});

test('team reset links only open known resets',()=>{
  assert.deepEqual(parseReset('unknot-seated'),{reset:'unknot',posture:'seated'});
  assert.deepEqual(parseReset('CALM-standing'),{reset:'calm',posture:'standing'});
  for(const bad of ['', 'unknot', 'yoga-seated', 'unknot-hard', 'mobility-gentle', '/reset unknot seated', null]) assert.equal(parseReset(bad),null,String(bad));
  assert.equal(pilotEvent('team_reset'),'team-reset-joined');
  assert.equal(pilotEvent('team_reset_shared'),null,'sharing an invite is not counted');
  assert.match(teamResetInvite('https://x/app/?reset=unknot-seated'),/^Last 3 minutes: Lull team reset\. .+https:\/\/x\/app\/\?reset=unknot-seated$/);
});

test('a reset title maps back to its one-tap reset code',()=>{
  assert.equal(resetFromTitle('Unknot neck & shoulders · Seated'),'unknot-seated');
  assert.equal(resetFromTitle('Calm down · Standing'),'calm-standing');
  assert.equal(resetFromTitle('Screen break · Seated'),'screen-seated');
  assert.equal(resetFromTitle('Gentle · Mobility reset'),null,'old titles no longer map');
  assert.equal(resetFromTitle('Something else'),null);
});

test('new need categories are still never sent; free text never',()=>{
  for(const kinds of [['neck and shoulders'],['a stiff back'],['tired eyes or wrists']]) assert.equal(pilotEvent('need',{kinds}),null);
});
