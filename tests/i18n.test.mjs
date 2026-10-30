import test from 'node:test';
import assert from 'node:assert/strict';
import {STRINGS} from '../dist/web/i18n-strings.js';
test('every app line has English, Hindi and Marathi',()=>{
  const lines=STRINGS.split('\n').filter(l=>l.trim());
  assert(lines.length>300,'expected 300+ lines, got '+lines.length);
  for(const l of lines){const p=l.split(' || ');assert.equal(p.length,3,l);for(const x of p)assert(x.trim(),l);assert(/[ऀ-ॿ]/.test(p[1])&&/[ऀ-ॿ]/.test(p[2]),l);}
});
