import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { interpretNeed, planOf, clock, RESETS, RESET_NAMES } from '../dist/server/lull.js';

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

test('safety page: reset lengths in the review table are the real timer totals', () => {
  for (const reset of RESETS) for (const posture of ['seated', 'standing']) {
    const seconds = planOf(reset, posture).total;
    assert.match(page, new RegExp(`${RESET_NAMES[reset]}, ${posture}</span><span role="cell">${clock(seconds)}<`), `${RESET_NAMES[reset]}, ${posture} should show ${clock(seconds)}`);
  }
  assert.doesNotMatch(page, /Mobility, gentle|cardio/i, 'no sessions from the old app remain');
  assert.match(page, /not yet<\/strong> been reviewed by a physiotherapist/, 'the page says plainly that review is pending');
});
