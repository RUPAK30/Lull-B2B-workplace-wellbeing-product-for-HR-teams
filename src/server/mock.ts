import { serializeStatement } from '../shared/openui/serialize.js';
import type { RequestData, Turn } from '../shared/contracts.js';
import { ScreenDocument } from '../shared/openui/document.js';
import * as lull from './lull.js';
type MockFixtures = { wiring: string };
/** `understood` carries a live interpretation of the latest message; without it the keyword layer decides. */
// Session words rotate on their own counter so repeat sessions always get a different word.
let wordTurns = 0;
export type MockOptions = { nextWordTurn?: () => number; understood?: { need?: lull.Need; session?: lull.SessionRequest } };
const fence = (code: string) => '```openui\n' + code + '\n```';
const CLEAR = fence('root = Screens([])');
const HELP = 'Mock understands /lull for the guided onboarding, /workout [mobility|stretching|cardio] [gentle|steady] for a session, /demo for the wiring sample, next, back and “change value to 6”. It does not read your skill or call an AI provider.';
function workoutCommand(last: string): { path: lull.Path; intensity: lull.Intensity } | null {
  if (['start workout demo', 'start workout', 'mobility reset'].includes(last)) return { path: 'mobility', intensity: 'gentle' };
  const match = last.match(/^\/workout(?:\s+(mobility|stretching|cardio))?(?:\s+(gentle|steady))?$/);
  return match ? { path: (match[1] ?? 'mobility') as lull.Path, intensity: (match[2] ?? 'gentle') as lull.Intensity } : null;
}
// A confirmed choice from onboarding lands on the first movement (the plan is one step back);
// /workout, with no conversation behind it, still opens on the plan.
function session(path: lull.Path, intensity: lull.Intensity, ctx: lull.LullContext, lead: string, startMoving = false): Turn {
  const { blocks, total } = lull.planOf(path, intensity), first = blocks[0];
  const tail = startMoving ? ` First up: ${first.title.toLowerCase()}. Start the timer when you’re ready; the plan is one step back.` : '';
  return { reply: `${lead} ${blocks.length} timed blocks, ${lull.clock(total)} of timer time.${tail}\n${CLEAR}\n${fence(lull.sessionProgram(path, intensity, ctx, startMoving ? first.key : 'intro'))}` };
}
function onboardingTurn(doc: ScreenDocument, raw: string, last: string, nextWordTurn: () => number, understood?: lull.Need): Turn | null {
  const ctx = lull.readContext(doc);
  const reveal = (step: lull.OnboardingStep, statements: string[]) => fence([...statements, lull.revealRootIn(doc.screens.map(s => s.key), step)].join('\n'));
  switch (doc.cursor) {
    case 'hey': {
      // Everything typed here is an answer to the name question, never navigation.
      // A successful answer also clears any earlier feedback, in case the reader comes Back here.
      const hint = serializeStatement('name_note', 'Text', [lull.NAME_HINT, 'body']);
      if (last === 'skip the name') return { reply: 'No problem. A name is optional. So, what does today need?\n' + reveal('mood', [hint, ...lull.moodStatements({ name: '', style: null })]) };
      const parsed = lull.parseName(raw);
      if (parsed.kind === 'name') return { reply: `Nice to meet you, ${parsed.name}. What does today need?\n` + reveal('mood', [hint, ...lull.moodStatements({ name: parsed.name, style: null })]) };
      const note = parsed.kind === 'ambiguous'
        ? `Is “${parsed.word}” your name? If it is, enter it in the name field. To change screens, use Back and Next.`
        : 'I did not catch a name in that. Enter just a first name, or choose “Skip the name”.';
      return { reply: note + '\n' + fence(serializeStatement('name_note', 'Alert', ['info', note])) };
    }
    case 'mood': {
      // Buttons and free text share one path: the need is read, acknowledged, and shapes the next screen.
      const care = lull.careLevel(doc);
      if (care === 'rest-urgent' || care === 'urgent' && last !== 'i understand') return { reply: 'Please look after yourself first.' };
      if (care === 'urgent') return { reply: 'Take care of yourself.\n' + fence(lull.careStatements('rest-urgent').join('\n')) };
      if (care && last === 'not today') return { reply: 'That’s a good call. Take care.\n' + fence(lull.careStatements('rest').join('\n')) };
      if (care && last === 'show the session choices') return { reply: 'Here they are. Only pick something that leaves that area alone.\n' + reveal('mood', lull.moodStatements(ctx, 'Only choose something that leaves that area alone, and stop if anything hurts.')) };
      const need = understood ?? lull.interpretNeed(raw);
      if (need.kind === 'care') return { reply: need.ack + '\n' + reveal('mood', lull.careStatements(need.level)) };
      if (need.kind === 'clarify') return { reply: need.ack + '\n' + fence(serializeStatement('mood_text', 'Text', [need.ack, 'description'])) };
      if (need.plain) return { reply: `${need.ack} How much today?\n` + reveal('intensity', lull.intensityStatements(ctx, need.path)) };
      return { reply: need.ack + '\n' + reveal('intensity', lull.intensityStatements(ctx, need.path, { heard: need.heard, ack: need.ack, intensity: need.intensity })) };
    }
    case 'intensity': {
      if (last === 'something else') return { reply: 'Sure. What would suit you better?\n' + reveal('mood', lull.moodStatements(ctx)) };
      const intensity = lull.detectIntensity(last), offered = lull.readOfferedPath(doc), switched = lull.detectPath(last);
      if (switched && switched !== offered) return { reply: `Switching. ${lull.PATH_REPLY[switched]}\n` + reveal('intensity', lull.intensityStatements(ctx, switched)) };
      if (!intensity || !offered) return { reply: 'Choose Gentle or Steady. Gentle is shorter; Steady adds a block and longer timers.' };
      const heardNode = doc.screens.flatMap(s => s.props.children as { key: string; props: Record<string, unknown> }[]).find(n => n.key === 'intensity_need');
      return session(offered, intensity, { ...ctx, term: lull.sessionWord(offered, intensity, nextWordTurn()), need: lull.readHeard(String(heardNode?.props.text ?? ''))[0] ?? null }, `${lull.pickedFor(ctx, intensity)} ${ctx.name ? `${ctx.name}, your` : 'Your'} ${intensity} ${lull.PATH_NAMES[offered].toLowerCase()}:`, true);
    }
  }
  return null;
}
function sessionTurn(doc: ScreenDocument, raw: string, last: string, understood?: lull.SessionRequest): Turn | null {
  const current = lull.readSession(doc), key = doc.cursor;
  if (!current || key === 'intro' && !raw) return null;
  const nodes = doc.screens.flatMap(s => s.props.children as { key: string; props: Record<string, unknown> }[]);
  const inSafety = nodes.some(n => n.key === 'safety_alert'), urgent = nodes.find(n => n.key === 'safety_alert')?.props.tone === 'danger';
  const at = (k: string) => `root = Screens([${doc.screens.map(s => s.key).join(', ')}], ${k})`;
  const whole = (cursor: string) => lull.sessionProgram(current.path, current.intensity, current.ctx, cursor);
  const finish = (safety: boolean, why: string) => ({ reply: why + '\n' + fence([whole('finish'), ...lull.earlyFinishStatements(safety)].join('\n')) });
  // Safety holds until the reader decides: only "End the session" or, if not urgent, "I've rested".
  if (inSafety) {
    if (last === 'end the session') return finish(true, 'Okay. We’ll stop here.');
    if (!urgent && last === 'i’ve rested and feel okay') return { reply: 'Okay. The timer is still paused; start it again only if you want to.\n' + fence(whole(key)) };
    return { reply: urgent ? 'Please stop and get help first.' : 'Take your time. Choose “End the session”, or “I’ve rested and feel okay” when you’re ready.' };
  }
  if (!lull.planOf(current.path, current.intensity).blocks.some(b => b.key === key) && key !== 'intro') return null;
  const block = key === 'intro' ? lull.planOf(current.path, current.intensity).blocks[0].key : key;
  const request = understood ?? lull.interpretSessionRequest(raw);
  if (request.kind === 'safety') return { reply: (request.level === 'urgent' ? 'Please stop.' : 'Let’s stop and rest.') + '\n' + fence([...lull.safetyStatements(block, request.level), at(block)].join('\n')) };
  // Answers to an offer.
  const apply = (path: lull.Path, intensity: lull.Intensity) => {
    const blocks = lull.planOf(path, intensity).blocks, oldIndex = lull.planOf(current.path, current.intensity).blocks.findIndex(b => b.key === block);
    const target = blocks.find(b => b.key === block)?.key ?? blocks[Math.min(Math.max(oldIndex, 0), blocks.length - 1)].key;
    return { reply: `Done: ${intensity} ${lull.PATH_NAMES[path].toLowerCase()}, from where you are. Start the timer when you’re ready.\n` + fence(lull.sessionProgram(path, intensity, current.ctx, target)) };
  };
  const chosen = last.match(/^switch to (gentle|steady|mobility|stretching|cardio)$/)?.[1];
  if (chosen === 'gentle' || chosen === 'steady') return apply(current.path, chosen);
  if (chosen) return apply(chosen as lull.Path, current.intensity);
  if (last === 'keep this one' || last === 'keep going') return { reply: 'Sure. Carry on whenever you’re ready.\n' + fence(whole(block)) };
  if (last === 'end the session') return finish(false, 'Okay. Let’s close gently.');
  const offer = (text: string, actions: string[]) => ({ reply: text + '\n' + fence([whole(block), ...lull.offerStatements(block, text, actions)].join('\n')) });
  if (request.kind === 'harder') return current.intensity === 'gentle' ? offer('Want more? Steady adds an active block and longer timers. I’ll keep your place.', ['Switch to steady', 'Keep this one']) : offer('This is already the steadiest version here. You could slow the tempo and make each rep more controlled.', ['Keep this one']);
  if (request.kind === 'easier') return current.intensity === 'steady' ? offer('Let’s ease off. Gentle has fewer blocks and shorter timers. I’ll keep your place.', ['Switch to gentle', 'Keep this one']) : offer('This is already the gentlest version. Make the movement smaller, pause, or stop here; all are fine.', ['Keep this one', 'End the session']);
  if (request.kind === 'tip') return offer(request.text, ['Keep going', 'End the session']);
  if (request.kind === 'stop') return offer('Want to stop here? That’s completely fine.', ['End the session', 'Keep going']);
  if (request.kind === 'switch') return request.path && request.path !== current.path ? offer(`Switch to ${lull.PATH_NAMES[request.path].toLowerCase()}? I’ll keep the same intensity.`, [`Switch to ${request.path}`, 'Keep this one']) : offer('Switch to what?', lull.PATHS.filter(p => p !== current.path).map(p => `Switch to ${p}`).concat('Keep this one'));
  return { reply: 'I didn’t catch a change in that. You can ask for easier, harder, a different session, or to stop.' };
}
export function mockTurn(request: RequestData, input: string | MockFixtures, options: MockOptions = {}): Turn {
  const wiring = typeof input === 'string' ? input : input.wiring;
  const nextWordTurn = options.nextWordTurn ?? (() => wordTurns++);
  const raw = request.messages.at(-1)?.content.trim() ?? '', last = raw.toLowerCase();
  if (last === 'load wiring sample' || last === '/demo') return { reply: 'Wiring fixture loaded. This is deterministic, not a model interpreting your skill.\n' + CLEAR + '\n' + fence(wiring) };
  const command = workoutCommand(last);
  if (command) return session(command.path, command.intensity, { name: '', style: null, term: lull.sessionWord(command.path, command.intensity, nextWordTurn()) }, 'Deterministic workout demo loaded:');
  if (['/lull', '/start', 'start lull'].includes(last)) return { reply: 'Hey, I’m Lull. Glad you’re here. (Mock mode: this flow is scripted and stays on this page.)\n' + CLEAR + '\n' + fence(lull.heyProgram()) };
  const doc = new ScreenDocument(); if (request.state.ui_state) doc.apply(fence(request.state.ui_state));
  // Typed next/back still navigate during onboarding, except on the name question.
  if (lull.isOnboarding(doc) && (doc.cursor === 'hey' || !['next', 'back'].includes(last))) { const turn = onboardingTurn(doc, raw, last, nextWordTurn, options.understood?.need); if (turn) return turn; }
  const screens = doc.screens, index = screens.findIndex(s => s.key === doc.cursor), keys = screens.map(s => s.key).join(', ');
  if (['next', 'back'].includes(last) && screens.length) { const target = screens[Math.max(0, Math.min(screens.length - 1, index + (last === 'back' ? -1 : 1)))]; return { reply: 'Fixture cursor moved.\n' + fence(`root = Screens([${keys}], ${target.key})`) }; }
  if (/^change value to (\d{1,2})$/.test(last) && doc.program.includes('count1 =')) { const value = Number(last.match(/\d+/)![0]); return { reply: 'Fixture values patched under their existing names.\n' + fence(serializeStatement('count1', 'Keyword', [String(value), 'Sample value']) + '\n' + serializeStatement('count2', 'Keyword', [String(value), 'Second sample value'])) }; }
  // From home (nothing on screen yet), a typed need opens the same decision, question or safety screen.
  if (!screens.length && raw && !raw.startsWith('/')) {
    const ctx = { name: '', style: null }, need = options.understood?.need ?? lull.interpretNeed(raw), only = (step: string) => `root = Screens([${step}], ${step})`;
    if (need.kind === 'care') return { reply: need.ack + '\n' + fence([...lull.careStatements(need.level), only('mood')].join('\n')) };
    if (need.kind === 'clarify') return { reply: need.ack + '\n' + fence([...lull.moodStatements(ctx, need.ack), only('mood')].join('\n')) };
    const statements = need.plain ? lull.intensityStatements(ctx, need.path) : lull.intensityStatements(ctx, need.path, { heard: need.heard, ack: need.ack, intensity: need.intensity });
    return { reply: (need.plain ? `${need.ack} How much today?` : need.ack) + '\n' + fence([...statements, only('intensity')].join('\n')) };
  }
  if (screens[0]?.key === 'intro') { const turn = sessionTurn(doc, raw, last, options.understood?.session); if (turn) return turn; return { reply: 'This scripted session moves with the Next and Back buttons and the timer controls. ' + HELP }; }
  return { reply: HELP };
}

// Exact button labels and commands are already unambiguous: only free text goes to the model.
const SCRIPTED = /^(\/.*|next|back|mobility|stretching|cardio|gentle.*|steady.*|switch to \w+|keep this one|keep going|end the session|not today|show the session choices|i understand|something else|i’ve rested and feel okay|beginner|regular|challenge seeker|just exploring|skip the name|got it|another word|show me the word)$/;
/** Where a live interpretation of the latest message would be used, and with what context. */
export function guideTarget(request: RequestData): { raw: string; phase: 'need' | 'session'; style: string | null; current?: { path: lull.Path; intensity: lull.Intensity; block: lull.Block } } | null {
  const raw = request.messages.at(-1)?.content.trim() ?? '', last = raw.toLowerCase();
  if (!raw || SCRIPTED.test(last)) return null;
  const doc = new ScreenDocument(); if (request.state.ui_state) doc.apply(fence(request.state.ui_state));
  if (!doc.screens.length) return { raw, phase: 'need', style: null };
  const ctx = lull.readContext(doc);
  if (lull.isOnboarding(doc)) return doc.cursor === 'mood' && !lull.careLevel(doc) ? { raw, phase: 'need', style: ctx.style } : null;
  if (doc.screens[0]?.key !== 'intro') return null;
  const current = lull.readSession(doc), nodes = doc.screens.flatMap(s => s.props.children as { key: string }[]);
  if (!current || nodes.some(n => n.key === 'safety_alert')) return null;
  const blocks = lull.planOf(current.path, current.intensity).blocks, block = blocks.find(b => b.key === doc.cursor) ?? blocks[0];
  return { raw, phase: 'session', style: current.ctx.style, current: { path: current.path, intensity: current.intensity, block } };
}
