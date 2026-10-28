import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

// Guards the public site's hand-written scripts: a single syntax error silently breaks every page.
test('site scripts parse without syntax errors', () => {
  const files = readdirSync('site').filter(f => f.endsWith('.js'));
  assert.ok(files.length > 0, 'expected at least one script in site/');
  for (const f of files) {
    try { execFileSync(process.execPath, ['--check', 'site/' + f], {stdio: 'pipe'}); }
    catch (e) { assert.fail(`site/${f} has a syntax error:\n${e.stderr}`); }
  }
});
