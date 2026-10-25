import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { interpretNeed, planOf, clock } from '../dist/server/lull.js';

// The public safety page makes promises about the product. These tests keep them true.
const page = await readFile(new URL('../src/web/safety.html', import.meta.url), 'utf8');

test('safety page: the example phrases it lists trigger the level they are listed under', () => {
  const examples = {
    urgent: ['I have chest pain', 'trouble breathing', 'I keep fainting', 'numbness in my arm', 'sudden pain in my calf', 'severe pain'],
    pain: ['my back hurts', 'dizziness', 'I feel dizzy', 'a sprain', 'cramp', 'feeling sick'],
    rehab: ['after surgery', 'seeing a physio', 'recovering from a knee injury'],
  };
  for (const [level, phrases] of Object.entries(examples)) for (const phrase of phrases) {
    const need = interpretNeed(phrase);
    assert.equal(need.kind, 'care', `“${phrase}” should stop the session`);
    assert.equal(need.level, level, `“${phrase}” should be treated as ${level}`);
  }
  assert.equal(interpretNeed('I want a stretch but my knee hurts').kind, 'care', 'safety wins over a request in the same message');
});

test('safety page: session lengths in the review table are the real timer totals', () => {
  const names = { mobility: 'Mobility', stretching: 'Stretching', cardio: 'Low-impact cardio' };
  for (const [path, label] of Object.entries(names)) for (const intensity of ['gentle', 'steady']) {
    const seconds = planOf(path, intensity).total;
    assert.match(page, new RegExp(`${label}, ${intensity}</span><span role="cell">${clock(seconds)}<`), `${label}, ${intensity} should show ${clock(seconds)}`);
  }
  assert.match(page, /not yet<\/strong> been reviewed by a physiotherapist/, 'the page says plainly that review is pending');
});
