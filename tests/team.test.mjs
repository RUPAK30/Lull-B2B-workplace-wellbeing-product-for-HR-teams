import test from 'node:test';
import assert from 'node:assert/strict';
import { teamReport, teamSample } from '../dist/shared/team.js';

const start = Date.UTC(2026, 0, 5), day = 86400000;
const crew = (team, n) => Array.from({ length: n }, (_, i) => ({ user: `${team}-${i}`, team }));
const ran = (user, d) => [{ t: start + d * day, type: 'timer_started', user, visit: `${user}-${d}`, run: `${user}-${d}` }, { t: start + d * day + 1, type: 'session_finished', user, visit: `${user}-${d}`, run: `${user}-${d}`, data: { reason: 'finished', minutes: 3 } }];

test('team view: small teams are hidden, and one more when a lone small team could be subtracted', () => {
  const people = [...crew('Big', 20), ...crew('Mid', 12), ...crew('Tiny', 4)];
  const r = teamReport(people.flatMap(p => ran(p.user, 1)), people, start, 2);
  const row = name => r.byTeam.find(t => t.team === name);
  assert.equal(row('Big').hidden, false);
  assert.equal(row('Tiny').hidden, true);
  assert.equal(row('Mid').hidden, true, 'otherwise Tiny = company total − Big − Mid');
  assert.match(row('Mid').reason, /subtraction/);
  const two = [...crew('Big', 20), ...crew('Mid', 12), ...crew('Tiny', 4), ...crew('Wee', 5)];
  const r2 = teamReport(two.flatMap(p => ran(p.user, 1)), two, start, 2);
  assert.equal(r2.byTeam.find(t => t.team === 'Mid').hidden, false, 'two small teams together are already 9+ people apart from the rest');
});

test('team view: never returns a person, and refuses to report on fewer than 10 people', () => {
  const t = teamSample(), r = teamReport(t.events, t.people, t.start, t.weeks);
  assert.doesNotMatch(JSON.stringify(r), /team-[a-z]{3}-\d/, 'no individual ids anywhere in the report');
  assert.equal(r.headcount, 64);
  assert(r.everActive < r.headcount && r.stayed < r.triedEarly, 'the sample includes people who never try it and people who drift away');
  assert.deepEqual(teamSample(), teamSample(), 'the sample is deterministic');
  const few = crew('Small', 6), small = teamReport(few.flatMap(p => ran(p.user, 1)), few, start, 2);
  assert.equal(small.tooSmall, true);
});

test('team view: weekly active people and time-of-day are counted correctly', () => {
  const people = crew('Big', 12);
  const events = [...ran('Big-0', 1), ...ran('Big-1', 1), ...ran('Big-0', 8)];
  const r = teamReport(events, people, start, 2);
  assert.deepEqual(r.weekly.map(w => w.n), [2, 1]);
  assert.equal(r.everActive, 2); assert.equal(r.minutes, 9);
  assert.equal(r.when.reduce((a, w) => a + w.n, 0), 3);
});
