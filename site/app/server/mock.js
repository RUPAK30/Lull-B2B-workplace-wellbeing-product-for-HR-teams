import { serializeStatement } from '../shared/openui/serialize.js';
import { ScreenDocument } from '../shared/openui/document.js';
import * as lull from './lull.js';
const fence = (code) => '```openui\n' + code + '\n```';
const CLEAR = fence('root = Screens([])');
const HELP = 'Mock understands /lull to start, /reset [unknot|unsit|energy|calm|screen] [seated|standing] for a reset, /demo for the wiring sample, next, back and “change value to 6”. It does not read your skill or call an AI provider.';
const RESET_WORD = lull.RESETS.join('|');
function resetCommand(last) {
    const match = last.match(new RegExp(`^\\/reset(?:\\s+(${RESET_WORD}))?(?:\\s+(seated|standing))?$`));
    if (!match)
        return null;
    const reset = (match[1] ?? 'unknot');
    return { reset, posture: (match[2] ?? lull.DEFAULT_POSTURE[reset]) };
}
// A choice from the pick screen lands on the first step (the plan is one step back);
// /reset, with no conversation behind it, opens on the plan.
function session(reset, posture, ctx, lead, startMoving = false) {
    const { blocks, total } = lull.planOf(reset, posture), first = blocks[0];
    const tail = startMoving ? ` First up: ${first.title.toLowerCase()}. Start the timer when you’re ready; the plan is one step back.` : '';
    return { reply: `${lead} ${blocks.length} short steps, ${lull.clock(total)}.${tail}\n${CLEAR}\n${fence(lull.sessionProgram(reset, posture, ctx, startMoving ? first.key : 'intro'))}` };
}
const pickFor = (need) => need.plain ? lull.pickStatements(need.reset, { heard: [], ack: need.ack, posture: need.posture }) : lull.pickStatements(need.reset, { heard: need.heard, ack: need.ack, posture: need.posture });
function onboardingTurn(doc, raw, last, understood) {
    const reveal = (step, statements) => fence([...statements, lull.revealRootIn(doc.screens.map(s => s.key), step)].join('\n'));
    switch (doc.cursor) {
        case 'feel': {
            // Buttons and free text share one path: the need is read, acknowledged, and one reset is offered.
            const care = lull.careLevel(doc);
            if (care === 'rest-urgent' || care === 'urgent' && last !== 'i understand')
                return { reply: 'Please look after yourself first.' };
            if (care === 'urgent')
                return { reply: 'Take care of yourself.\n' + fence(lull.careStatements('rest-urgent').join('\n')) };
            if (care && last === 'not today')
                return { reply: 'That’s a good call. Take care.\n' + fence(lull.careStatements('rest').join('\n')) };
            if (care && last === 'show the resets')
                return { reply: 'Here they are. Only pick one that leaves that area alone.\n' + reveal('feel', lull.feelStatements('Only choose a reset that leaves that area alone, and stop if anything hurts.')) };
            const need = understood ?? lull.interpretNeed(raw);
            if (need.kind === 'care')
                return { reply: need.ack + '\n' + reveal('feel', lull.careStatements(need.level)) };
            if (need.kind === 'clarify')
                return { reply: need.ack + '\n' + fence(serializeStatement('feel_text', 'Text', [need.ack, 'description'])) };
            return { reply: need.ack + '\n' + reveal('pick', pickFor(need)) };
        }
        case 'pick': {
            if (last === 'something else')
                return { reply: 'Sure. What would help more?\n' + reveal('feel', lull.feelStatements()) };
            const offered = lull.readOffered(doc), posture = lull.detectPosture(last), other = lull.detectReset(last);
            if (other && other !== offered)
                return { reply: `Switching to ${lull.RESET_NAMES[other].toLowerCase()}.\n` + reveal('pick', lull.pickStatements(other)) };
            if (!posture || !offered)
                return { reply: 'Choose seated or standing. Seated works on a call; standing works beside your desk.' };
            const heardNode = doc.screens.flatMap(s => s.props.children).find(n => n.key === 'pick_need');
            const need = lull.readHeard(String(heardNode?.props.text ?? ''))[0] ?? null;
            return session(offered, posture, { name: '', need }, `${lull.RESET_NAMES[offered]}, ${posture}:`, true);
        }
    }
    return null;
}
function sessionTurn(doc, raw, last, understood) {
    const current = lull.readSession(doc), key = doc.cursor;
    if (!current || key === 'intro' && !raw)
        return null;
    const nodes = doc.screens.flatMap(s => s.props.children);
    const inSafety = nodes.some(n => n.key === 'safety_alert'), urgent = nodes.find(n => n.key === 'safety_alert')?.props.tone === 'danger';
    const at = (k) => `root = Screens([${doc.screens.map(s => s.key).join(', ')}], ${k})`;
    const whole = (cursor) => lull.sessionProgram(current.reset, current.posture, current.ctx, cursor);
    const finish = (safety, why) => ({ reply: why + '\n' + fence([whole('finish'), ...lull.earlyFinishStatements(safety)].join('\n')) });
    // Safety holds until the person decides: only "End the session" or, if not urgent, "I've rested".
    if (inSafety) {
        if (last === 'end the session')
            return finish(true, 'Okay. We’ll stop here.');
        if (!urgent && last === 'i’ve rested and feel okay')
            return { reply: 'Okay. The timer is still paused; start it again only if you want to.\n' + fence(whole(key)) };
        return { reply: urgent ? 'Please stop and get help first.' : 'Take your time. Choose “End the session”, or “I’ve rested and feel okay” when you’re ready.' };
    }
    const plan = lull.planOf(current.reset, current.posture).blocks;
    if (!plan.some(b => b.key === key) && key !== 'intro')
        return null;
    const block = key === 'intro' ? plan[0].key : key;
    const request = understood ?? lull.interpretSessionRequest(raw);
    if (request.kind === 'safety')
        return { reply: (request.level === 'urgent' ? 'Please stop.' : 'Let’s stop and rest.') + '\n' + fence([...lull.safetyStatements(block, request.level), at(block)].join('\n')) };
    // Answers to an offer: the same step keys exist seated and standing, so the place is kept.
    const apply = (reset, posture) => {
        const blocks = lull.planOf(reset, posture).blocks, oldIndex = plan.findIndex(b => b.key === block);
        const target = blocks.find(b => b.key === block)?.key ?? blocks[Math.min(Math.max(oldIndex, 0), blocks.length - 1)].key;
        return { reply: `Done: ${lull.RESET_NAMES[reset].toLowerCase()}, ${posture}, from where you are. Start the timer when you’re ready.\n` + fence(lull.sessionProgram(reset, posture, current.ctx, target)) };
    };
    const chosenPosture = last.match(/^switch to (seated|standing)$/)?.[1];
    if (chosenPosture)
        return apply(current.reset, chosenPosture);
    const chosenReset = lull.RESETS.find(r => last === `switch to ${lull.RESET_NAMES[r].toLowerCase()}`);
    if (chosenReset)
        return apply(chosenReset, lull.DEFAULT_POSTURE[chosenReset]);
    if (last === 'keep this one' || last === 'keep going')
        return { reply: 'Sure. Carry on whenever you’re ready.\n' + fence(whole(block)) };
    if (last === 'end the session')
        return finish(false, 'Okay. Back to your day.');
    const offer = (text, actions) => ({ reply: text + '\n' + fence([whole(block), ...lull.offerStatements(block, text, actions)].join('\n')) });
    if (request.kind === 'standing')
        return current.posture === 'seated' ? offer('Want a little more? The standing version uses more of the body. I’ll keep your place.', ['Switch to standing', 'Keep this one']) : offer('This is already the standing version. Take each move a little slower, through a comfortable range.', ['Keep this one']);
    if (request.kind === 'seated')
        return current.posture === 'standing' ? offer('Let’s make it smaller. The seated version works on a call, with the camera off. I’ll keep your place.', ['Switch to seated', 'Keep this one']) : offer('This is already the seated version. Make each move smaller, pause, or stop here; all are fine.', ['Keep this one', 'End the session']);
    if (request.kind === 'tip')
        return offer(request.text, ['Keep going', 'End the session']);
    if (request.kind === 'stop')
        return offer('Want to stop here? That’s completely fine.', ['End the session', 'Keep going']);
    if (request.kind === 'switch')
        return request.reset && request.reset !== current.reset ? offer(`Switch to ${lull.RESET_NAMES[request.reset].toLowerCase()}?`, [`Switch to ${lull.RESET_NAMES[request.reset].toLowerCase()}`, 'Keep this one']) : offer('Switch to which reset?', lull.RESETS.filter(r => r !== current.reset).map(r => `Switch to ${lull.RESET_NAMES[r].toLowerCase()}`).concat('Keep this one'));
    return { reply: 'I didn’t catch a change in that. You can ask for seated or standing, a different reset, or to stop.' };
}
export function mockTurn(request, input, options = {}) {
    const wiring = typeof input === 'string' ? input : input.wiring;
    const raw = request.messages.at(-1)?.content.trim() ?? '', last = raw.toLowerCase();
    if (last === 'load wiring sample' || last === '/demo')
        return { reply: 'Wiring fixture loaded. This is deterministic, not a model interpreting your skill.\n' + CLEAR + '\n' + fence(wiring) };
    const command = resetCommand(last);
    if (command)
        return session(command.reset, command.posture, { name: '' }, `${lull.RESET_NAMES[command.reset]}, ${command.posture}:`);
    if (['/lull', '/start', 'start lull'].includes(last))
        return { reply: 'Hey, I’m Sukoon. Three minutes, then back to your day. (Mock mode: this flow is scripted and stays on this page.)\n' + CLEAR + '\n' + fence(lull.feelProgram()) };
    const doc = new ScreenDocument();
    if (request.state.ui_state)
        doc.apply(fence(request.state.ui_state));
    // Typed next/back still navigate on the first screens.
    if (lull.isOnboarding(doc) && !['next', 'back'].includes(last)) {
        const turn = onboardingTurn(doc, raw, last, options.understood?.need);
        if (turn)
            return turn;
    }
    const screens = doc.screens, index = screens.findIndex(s => s.key === doc.cursor), keys = screens.map(s => s.key).join(', ');
    if (['next', 'back'].includes(last) && screens.length) {
        const target = screens[Math.max(0, Math.min(screens.length - 1, index + (last === 'back' ? -1 : 1)))];
        return { reply: 'Fixture cursor moved.\n' + fence(`root = Screens([${keys}], ${target.key})`) };
    }
    if (/^change value to (\d{1,2})$/.test(last) && doc.program.includes('count1 =')) {
        const value = Number(last.match(/\d+/)[0]);
        return { reply: 'Fixture values patched under their existing names.\n' + fence(serializeStatement('count1', 'Keyword', [String(value), 'Sample value']) + '\n' + serializeStatement('count2', 'Keyword', [String(value), 'Second sample value'])) };
    }
    // From home (nothing on screen yet), a typed need opens the same pick, question or safety screen.
    if (!screens.length && raw && !raw.startsWith('/')) {
        const need = options.understood?.need ?? lull.interpretNeed(raw), only = (step) => `root = Screens([${step}], ${step})`;
        if (need.kind === 'care')
            return { reply: need.ack + '\n' + fence([...lull.careStatements(need.level), only('feel')].join('\n')) };
        if (need.kind === 'clarify')
            return { reply: need.ack + '\n' + fence([...lull.feelStatements(need.ack), only('feel')].join('\n')) };
        return { reply: need.ack + '\n' + fence([...pickFor(need), only('pick')].join('\n')) };
    }
    if (screens[0]?.key === 'intro') {
        const turn = sessionTurn(doc, raw, last, options.understood?.session);
        if (turn)
            return turn;
        return { reply: 'This reset moves with the Next and Back buttons and the timer controls. ' + HELP };
    }
    return { reply: HELP };
}
// Exact button labels and commands are already unambiguous: only free text goes to the model.
const LABELS = [...lull.RESETS.map(r => lull.RESET_MOMENTS[r].toLowerCase()), ...lull.RESETS.map(r => `switch to ${lull.RESET_NAMES[r].toLowerCase()}`)].map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const SCRIPTED = new RegExp(`^(\\/.*|next|back|start (seated|standing).*|switch to (seated|standing)|keep this one|keep going|end the session|not today|show the resets|i understand|something else|i’ve rested and feel okay|${LABELS.join('|')})$`);
/** Where a live interpretation of the latest message would be used, and with what context. */
export function guideTarget(request) {
    const raw = request.messages.at(-1)?.content.trim() ?? '', last = raw.toLowerCase();
    if (!raw || SCRIPTED.test(last))
        return null;
    const doc = new ScreenDocument();
    if (request.state.ui_state)
        doc.apply(fence(request.state.ui_state));
    if (!doc.screens.length)
        return { raw, phase: 'need' };
    if (lull.isOnboarding(doc))
        return doc.cursor === 'feel' && !lull.careLevel(doc) ? { raw, phase: 'need' } : null;
    if (doc.screens[0]?.key !== 'intro')
        return null;
    const current = lull.readSession(doc), nodes = doc.screens.flatMap(s => s.props.children);
    if (!current || nodes.some(n => n.key === 'safety_alert'))
        return null;
    const blocks = lull.planOf(current.reset, current.posture).blocks, block = blocks.find(b => b.key === doc.cursor) ?? blocks[0];
    return { raw, phase: 'session', current: { reset: current.reset, posture: current.posture, block } };
}
