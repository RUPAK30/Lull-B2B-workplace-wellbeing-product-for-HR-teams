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
import {FEEL_GROUPS} from '../dist/server/lull.js';
test('every ready choice on the feel screen leads to a suggested break',()=>{
  for(const [,chips] of FEEL_GROUPS) for(const t of chips) assert.equal(interpretNeed(t).kind,'suggest',t);
});
test('feeling unwell, in any language, is treated as care, not ignored',()=>{
  for(const t of ['not feeling okay','I feel unwell','not well today','tabiyat theek nahi','bara vatat nahi','बरं वाटत नाही','तबीयत ठीक नहीं है']) assert.equal(interpretNeed(t).kind,'care',t);
});
import {interpretSessionRequest as during} from '../dist/server/lull.js';
test('mid-session control phrases work in all four languages',()=>{
  const k=t=>during(t).kind;
  for(const t of ['stop','I want to stop','bas karo','ruko','thamba','bas zala','बस करो','रुको','थांबा','मला नको']) assert.equal(k(t),'stop',t);
  for(const t of ['too hard','slow down','aaram se','dheere','halu','sopa kara','धीरे','आराम से','हळू','जास्त होतंय']) assert.equal(k(t),'seated',t);
  for(const t of ['too easy','a bit more','thoda aur','ajun thoda','थोड़ा और','अजून']) assert.equal(k(t),'standing',t);
  for(const t of ['I am on a call','baith ke','basun','बैठकर','बसून']) assert.equal(k(t),'seated',t);
  for(const t of ['stand up','khade hokar','ubhe rahun','खड़े होकर','उभे राहून']) assert.equal(k(t),'standing',t);
  for(const t of ['something else','kuch aur','badlo','दूसरा','बदला','हे नको']) assert.equal(k(t),'switch',t);
  for(const t of ['how long','kitna time','किती वेळ','thank you','dhanyavad','धन्यवाद','feeling better','bara vatla','बरं वाटलं','kaise karu','समजलं नाही']) assert.equal(k(t),'tip',t);
  for(const t of ['not feeling well','बरं वाटत नाही','seene mein dard']) assert.equal(k(t),'safety',t);
});
