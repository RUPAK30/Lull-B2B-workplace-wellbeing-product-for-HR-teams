import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretNeed,interpretSessionRequest} from '../dist/server/lull.js';

test('Hinglish pain and urgent symptoms stop before any session, like English',()=>{
  for(const t of ['kamar mein dard ho raha hai','gardan mein dard','ghutne mein chot lagi','moch aa gayi','chakkar aa raha hai','ulti jaisa lag raha'])
    assert.equal(interpretNeed(t).kind,'care',t);
  for(const t of ['seene mein dard','saans lene mein dikkat ho rahi','behosh jaisa lag raha'])
    assert.deepEqual([interpretNeed(t).kind,interpretNeed(t).level],['care','urgent'],t);
  assert.equal(interpretNeed('operation ke baad recover kar raha hoon').level,'rehab');
});

test('Hinglish pain during a session pauses it for safety',()=>{
  assert.deepEqual(interpretSessionRequest('pair mein dard'),{kind:'safety',level:'pain'});
  assert.deepEqual(interpretSessionRequest('seene mein dard ho raha'),{kind:'safety',level:'urgent'});
});

test('everyday Hinglish needs map to the same resets as English',()=>{
  const pick=t=>{const r=interpretNeed(t);return [r.kind,r.reset,r.posture];};
  assert.deepEqual(pick('gardan akad gayi hai'),['suggest','unknot',null]);
  assert.deepEqual(pick('kamar akad gayi hai'),['suggest','unsit',null]);
  assert.deepEqual(pick('bahut thak gaya hoon'),['suggest','energy',null]);
  assert.deepEqual(pick('bahut stress hai'),['suggest','calm',null]);
  assert.deepEqual(pick('aankhen thak gayi screen se'),['suggest','screen',null]);
  assert.deepEqual(pick('bechaini ho rahi hai'),['suggest','energy',null]);
});

test('Hinglish session commands: stop, seated (less), standing (more)',()=>{
  assert.equal(interpretSessionRequest('bas karo').kind,'stop');
  assert.equal(interpretSessionRequest('ruko').kind,'stop');
  assert.equal(interpretSessionRequest('zyada ho gaya').kind,'seated');
  assert.equal(interpretSessionRequest('aaram se').kind,'seated');
  assert.equal(interpretSessionRequest('thoda aur').kind,'standing');
});
