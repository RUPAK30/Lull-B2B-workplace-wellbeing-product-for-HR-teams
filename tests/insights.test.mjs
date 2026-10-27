import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, compare, sampleEvents, median } from '../dist/shared/insights.js';

// A tiny hand-made log with known answers, so each definition is pinned down.
const ev = (t, type, user, visit, run, data) => ({ t, type, user, visit, run, data });
const log = [
  ev(0, 'visit', 'u1', 'v1'), ev(1, 'exposure', 'u1', 'v1', undefined, { exp: 'home-quick', variant: 'A' }), ev(2, 'entry', 'u1', 'v1', undefined, { route: 'typed' }),
  ev(3, 'need', 'u1', 'v1', undefined, { kinds: ['a lot of sitting', 'some stiffness'] }),
  ev(4000, 'session_loaded', 'u1', 'v1', 'r1'), ev(24000, 'timer_started', 'u1', 'v1', 'r1'), ev(30000, 'offer', 'u1', 'v1', 'r1', { ask: 'harder' }), ev(31000, 'adjusted', 'u1', 'v1', 'r1'),
  ev(90000, 'session_finished', 'u1', 'v1', 'r1', { reason: 'finished' }), ev(91000, 'feeling', 'u1', 'v1', 'r1', { value: 'lighter' }),
  ev(200000000, 'visit', 'u1', 'v2'), ev(200000001, 'returned', 'u1', 'v2'),
  ev(5, 'visit', 'u2', 'v3'), ev(6, 'exposure', 'u2', 'v3', undefined, { exp: 'home-quick', variant: 'B' }), ev(7, 'unmatched', 'u2', 'v3', undefined, { text: 'My wrists ache' }),
  ev(8, 'visit', 'u3', 'v4'), ev(9000, 'session_loaded', 'u3', 'v4', 'r2'), ev(39000, 'timer_started', 'u3', 'v4', 'r2'), ev(40000, 'safety', 'u3', 'v4', 'r2', { when: 'during', level: 'pain' }), ev(41000, 'session_finished', 'u3', 'v4', 'r2', { reason: 'safety' }),
];

test('insight definitions: funnel by visit, finish rate, first step, return and change rates', () => {
  const s = summarize(log);
  assert.equal(s.visits, 4);
  assert.deepEqual(s.funnel.map(f => f.n), [4, 2, 2, 1], 'opened → chose → started → reached the end (a safety stop is not "the end")');
  assert.equal(s.finishRate, 0.5);
  assert.equal(s.medianFirstMove, 25, 'median of 20 s and 30 s');
  assert.equal(s.finishers, 1); assert.equal(s.returners, 1); assert.equal(s.returnRate, 1);
  assert.equal(s.askedRate, 0.5); assert.equal(s.adjustedShare, 1);
  assert.deepEqual(s.needs.map(n => n.label).sort(), ['a lot of sitting', 'some stiffness']);
  assert.deepEqual(s.unmatched, [{ label: 'my wrists ache', n: 1 }], 'requests are normalised and counted');
  assert.deepEqual(s.safety, [{ label: 'during', n: 1 }]);
  assert.deepEqual(s.feelings, [{ label: 'lighter', n: 1 }]);
  const quick = s.experiments.find(e => e.id === 'home-quick');
  assert.deepEqual([quick.a.n, quick.a.hits, quick.b.n, quick.b.hits], [1, 1, 1, 0]);
  assert.equal(quick.verdict, 'Too few visits to say anything yet.', 'small samples never claim a winner');
});

test('experiment comparison: honest verdicts with a 95% range', () => {
  assert.match(compare(80, 100, 50, 100).verdict, /^A is ahead/);
  assert.match(compare(50, 100, 80, 100).verdict, /^B is ahead/);
  assert.match(compare(52, 100, 50, 100).verdict, /^No clear difference/);
  const c = compare(80, 100, 50, 100); assert(c.low > 0 && c.high > c.low && Math.abs(c.diff - 0.3) < 1e-9);
  assert.equal(median([]), null); assert.equal(median([3, 1, 2]), 2);
});

test('the synthetic sample is deterministic, plausible and clearly separate from real devices', () => {
  const a = sampleEvents(), b = sampleEvents();
  assert.deepEqual(a, b, 'same seed, same sample');
  assert(a.every(e => e.user.startsWith('sample-')), 'sample people are named as samples');
  const s = summarize(a);
  assert(s.visits > 200 && s.finishRate > 0.4 && s.finishRate < 0.9);
  assert(s.funnel.every((f, i) => i === 0 || f.n <= s.funnel[i - 1].n), 'a funnel never grows');
  assert(s.unmatched.length > 0 && s.needs.length > 0 && s.experiments.length === 2);
});
