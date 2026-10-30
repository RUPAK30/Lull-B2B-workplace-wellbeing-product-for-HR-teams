import test from 'node:test';
import assert from 'node:assert/strict';
import {interpretNeed} from '../dist/server/lull.js';
const kind=t=>interpretNeed(t).kind, reset=t=>interpretNeed(t).reset, level=t=>interpretNeed(t).level;

test('Hindi in Devanagari: pain and emergencies stop before any movement',()=>{
  for(const t of ['कमर में दर्द हो रहा है','गर्दन में दर्द','पैर में मोच आ गई','चक्कर आ रहा है']) assert.equal(kind(t),'care',t);
  for(const t of ['सीने में दर्द','साँस नहीं आ रही','बेहोश जैसा लग रहा']) assert.equal(level(t),'urgent',t);
  assert.equal(level('ऑपरेशन के बाद'),'rehab');
});
test('Hindi in Devanagari: everyday needs map to the right break',()=>{
  assert.equal(reset('गर्दन अकड़ गई है'),'unknot');
  assert.equal(reset('कमर अकड़ गई'),'unsit');
  assert.equal(reset('बहुत थकान है'),'energy');
  assert.equal(reset('काम का बहुत तनाव है'),'calm');
  assert.equal(reset('आँखें थक गई हैं'),'screen');
});
test('Marathi in Devanagari: pain stops, needs map',()=>{
  for(const t of ['पाठ दुखतंय','मान दुखते','पायात वेदना']) assert.equal(kind(t),'care',t);
  assert.equal(level('छातीत दुखतंय'),'urgent');
  assert.equal(reset('मान आखडली आहे'),'unknot');
  assert.equal(reset('खूप थकलो आहे'),'energy');
  assert.equal(reset('कामाचा ताण आहे'),'calm');
  assert.equal(reset('डोळे थकलेत'),'screen');
});
test('Marathi and Hinglish typed in English letters, with common spellings',()=>{
  for(const t of ['paath dukhtay','kambar dukhte','kamar mai dard','dard ho rha hai','sar dukh raha']) assert.equal(kind(t),'care',t);
  assert.equal(level('chhatit dukhtay'),'urgent');
  assert.equal(reset('maan aakhadli'),'unknot');
  assert.equal(reset('khup thaklo'),'energy');
  assert.equal(reset('zop yetey'),'energy');
  assert.equal(reset('kamachi tension aahe'),'calm');
  assert.equal(reset('neend aa rhi'),'energy');
});
test('Everyday words that only look like pain are not treated as pain',()=>{
  assert.notEqual(kind('neend lag gayi thi kal'),'care');
  assert.notEqual(kind('pair programming all day'),'care');
});
