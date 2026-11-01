import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../site/close/index.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);

test('close page inline script parses', () => {
  assert.ok(scripts.length > 0);
  for (const s of scripts) assert.doesNotThrow(() => new vm.Script(s));
});

test('close counts only two events, each once per visit', () => {
  const all = scripts.join('\n');
  assert.ok(!all.includes("team-reset-joined"));
  assert.ok(all.includes("counted('session-started')"));
  assert.ok(all.includes("counted('session-finished')"));
});
