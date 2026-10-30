// Sukoon: three-minute desk resets for people between calls. Everything an employee sees comes
// from here: the five resets (each seated or standing), the screens that offer them, the
// session itself, and the safety screens that always come first.
import { serializeStatement as statement } from '../shared/openui/serialize.js?v=mvvb3ryq';
import { RESETS, RESET_NAMES, RESET_MOMENTS, POSTURES, POSTURE_LABELS, DEFAULT_POSTURE, fromTitle } from '../shared/resets.js?v=mvvb3ryq';
export { RESETS, RESET_NAMES, RESET_MOMENTS, POSTURES, POSTURE_LABELS, DEFAULT_POSTURE };
const WHY = {
    unknot: 'Slow neck and shoulder release for after a run of calls.',
    unsit: 'Gentle movement for the back and hips after a long stretch of sitting.',
    energy: 'A quiet lift for a heavy afternoon. No sweat, nothing on the floor.',
    calm: 'Longer exhales and a few slow releases, to let the day settle.',
    screen: 'A proper break for eyes and wrists after a long stretch at the screen.',
};
// The first screens: how are you feeling, then one suggested reset.
export const ONBOARDING = ['feel', 'pick'];
// Each reset has the same four steps seated or standing, so switching keeps your place.
// Everything is office-safe: work clothes, beside the desk, nothing on the floor, no sweat.
const PLANS = {
    unknot: {
        seated: [
            { key: 'neck', title: 'Neck side release', label: 'Ear toward shoulder, both sides', seconds: 40, text: 'Sit tall and let one ear drift toward the same shoulder. Switch sides halfway.', steps: ['Keep both shoulders low and relaxed.', 'Mild stretch only; no pulling with the hand.', 'Come back to centre slowly before switching.'], cue: 'Small and slow beats big.' },
            { key: 'rolls', title: 'Shoulder rolls', label: 'Slow shoulder rolls', seconds: 40, text: 'Roll the shoulders up, back and down. Reverse halfway through.', steps: ['Make the circles slow and round.', 'Let each exhale drop the shoulders.', 'Go smaller if anything pinches.'], cue: 'Let the shoulders get heavy.' },
            { key: 'chest', title: 'Chest opener', label: 'Hands behind, chest lifts', seconds: 40, text: 'Hold the back of your chair or clasp your hands behind you, then gently lift the chest.', steps: ['Shoulders back, not up.', 'Keep breathing slowly.', 'Ease off if the shoulders pinch.'], cue: 'Open up after all that leaning in.' },
            { key: 'exhale', title: 'Long exhale', label: 'Slow breathing', seconds: 30, text: 'Let the breath slow down. Make each exhale a little longer than the inhale.', steps: ['Soften the jaw.', 'Drop the shoulders.', 'Notice what feels looser.'], cue: 'Nearly there.' },
        ],
        standing: [
            { key: 'neck', title: 'Neck side release', label: 'Ear toward shoulder, both sides', seconds: 40, text: 'Stand tall beside your desk and let one ear drift toward the same shoulder. Switch sides halfway.', steps: ['Keep both shoulders low and relaxed.', 'Mild stretch only; no pulling with the hand.', 'Come back to centre slowly before switching.'], cue: 'Small and slow beats big.' },
            { key: 'rolls', title: 'Shoulder rolls and reach', label: 'Rolls, then reach and draw back', seconds: 45, text: 'Roll the shoulders up, back and down, then reach both arms forward and draw the elbows back.', steps: ['Slow, round circles.', 'Squeeze gently between the shoulder blades as you draw back.', 'Keep the neck long.'], cue: 'Let the shoulders get heavy.' },
            { key: 'chest', title: 'Chest opener', label: 'Hands on lower back, chest lifts', seconds: 45, text: 'Rest your hands on your lower back and gently lift the chest, elbows drawing back.', steps: ['Shoulders back, not up.', 'Keep breathing slowly.', 'Ease off if the shoulders pinch.'], cue: 'Open up after all that leaning in.' },
            { key: 'exhale', title: 'Long exhale', label: 'Slow breathing', seconds: 30, text: 'Let the breath slow down. Make each exhale a little longer than the inhale.', steps: ['Soften the jaw.', 'Drop the shoulders.', 'Notice what feels looser.'], cue: 'Nearly there.' },
        ],
    },
    unsit: {
        seated: [
            { key: 'spine', title: 'Seated spine waves', label: 'Round and lift, with the breath', seconds: 40, text: 'Round your back as you breathe out, lift your chest as you breathe in.', steps: ['Hands rest on your thighs.', 'Keep the movement small and smooth.', 'Let the neck follow without forcing it.'], cue: 'Easy does it.' },
            { key: 'twist', title: 'Seated twist', label: 'Gentle turn, both sides', seconds: 40, text: 'Sit tall and turn gently to one side, a hand on the back of the chair. Switch halfway.', steps: ['Grow tall before you turn.', 'Turn from the middle of your back.', 'No bouncing; just breathe.'], cue: 'Let the back unwind.' },
            { key: 'hinge', title: 'Seated forward lean', label: 'Long back, lean from the hips', seconds: 40, text: 'Feet flat, lean forward from the hips with a long back, then sit tall again.', steps: ['Lead with the chest.', 'Only as far as feels easy.', 'Come up slowly.'], cue: 'Long back, slow pace.' },
            { key: 'calves', title: 'Ankle pumps', label: 'Toes up, heels up', seconds: 30, text: 'Lift your toes, then your heels, in a slow, steady rhythm.', steps: ['Feet stay on the floor.', 'Keep a steady pace.', 'Breathe normally.'], cue: 'Nearly back to work.' },
        ],
        standing: [
            { key: 'spine', title: 'Standing spine waves', label: 'Round and lift, hands on the desk', seconds: 40, text: 'Hands on the desk, round your back as you breathe out and lift your chest as you breathe in.', steps: ['Soft knees.', 'Keep the movement small and smooth.', 'Let the neck follow without forcing it.'], cue: 'Easy does it.' },
            { key: 'twist', title: 'Standing twist', label: 'Gentle turn, both sides', seconds: 35, text: 'Stand tall, hips facing forward, and turn your upper body gently side to side.', steps: ['Arms relaxed.', 'Turn from the middle of your back.', 'Keep it easy and smooth.'], cue: 'Let the back unwind.' },
            { key: 'hinge', title: 'Desk hip hinge', label: 'Hands on the desk, hinge back', seconds: 45, text: 'Hands on the desk, step back and hinge from the hips with a long back, then stand tall.', steps: ['Soft knees.', 'Long back rather than deep.', 'Press through the feet to stand.'], cue: 'Long back, slow pace.' },
            { key: 'calves', title: 'Calf raises', label: 'Up on the toes, down slowly', seconds: 40, text: 'Rise onto your toes and lower slowly, a hand on the desk for balance.', steps: ['Slow on the way down.', 'Stand tall.', 'Smaller if your balance wobbles.'], cue: 'Nearly back to work.' },
        ],
    },
    energy: {
        seated: [
            { key: 'swing', title: 'Seated arm swings', label: 'Loose, easy arm swings', seconds: 35, text: 'Sit tall and swing your arms forward and back, loose and easy.', steps: ['Shoulders relaxed.', 'Let the rhythm build a little.', 'Breathe freely.'], cue: 'Wake things up gently.' },
            { key: 'reach', title: 'Tall reach', label: 'Reach up, lower with control', seconds: 35, text: 'Reach both arms up, grow tall, then lower them with control.', steps: ['Reach through the fingertips.', 'Shoulders stay away from the ears.', 'Breathe in as you reach.'], cue: 'Grow a little taller.' },
            { key: 'lift', title: 'Seated knee lifts', label: 'One knee at a time', seconds: 40, text: 'Lift one knee at a time at an easy, steady pace.', steps: ['Sit tall near the front of the chair.', 'Keep it quiet and controlled.', 'Hold the chair if you like.'], cue: 'Keep a steady rhythm.' },
            { key: 'breath', title: 'Fuller breaths', label: 'Fuller in, easy out', seconds: 30, text: 'Take a few fuller breaths in through the nose and let them out easily.', steps: ['Only as full as is comfortable.', 'Let the shoulders stay down.', 'Back to normal breathing after.'], cue: 'That’s the lift.' },
        ],
        standing: [
            { key: 'swing', title: 'Arm swings', label: 'Loose, easy arm swings', seconds: 40, text: 'Stand beside your desk and swing your arms forward and back, loose and easy.', steps: ['Soft knees.', 'Let the rhythm build a little.', 'Breathe freely.'], cue: 'Wake things up gently.' },
            { key: 'reach', title: 'Tall reach', label: 'Reach up, lower with control', seconds: 35, text: 'Reach both arms up, rise a little onto your toes, then lower with control.', steps: ['Reach through the fingertips.', 'A hand on the desk if you need balance.', 'Breathe in as you reach.'], cue: 'Grow a little taller.' },
            { key: 'lift', title: 'Desk push-aways', label: 'Hands on the desk, push away', seconds: 40, text: 'Hands on the edge of a sturdy desk, step back, bend the elbows and push away. Slow and controlled.', steps: ['Body in one long line.', 'Make sure the desk won’t move.', 'Fewer, slower ones are fine.'], cue: 'Keep a steady rhythm.' },
            { key: 'breath', title: 'Fuller breaths', label: 'Fuller in, easy out', seconds: 30, text: 'Take a few fuller breaths in through the nose and let them out easily.', steps: ['Only as full as is comfortable.', 'Let the shoulders stay down.', 'Back to normal breathing after.'], cue: 'That’s the lift.' },
        ],
    },
    calm: {
        seated: [
            { key: 'breath', title: 'Longer exhale', label: 'Longer exhale: in for four, out for six', seconds: 45, text: 'Breathe in for a count of four and out for a count of six.', steps: ['Let the belly soften.', 'If the counts feel long, shorten them.', 'Out a little longer than in.'], cue: 'Let the pace slow down.' },
            { key: 'jaw', title: 'Jaw and neck release', label: 'Loose jaw, slow nods', seconds: 35, text: 'Let the jaw hang loose, lips apart, and slowly nod yes, then no.', steps: ['Unclench the teeth.', 'Small, slow movements.', 'Let the shoulders drop.'], cue: 'Let go of what you’re holding.' },
            { key: 'hands', title: 'Hand and forearm stretch', label: 'Fingers back, both arms', seconds: 35, text: 'One arm out, palm up, gently ease the fingers back with the other hand. Switch halfway.', steps: ['Mild stretch only.', 'Elbow soft, not locked.', 'Breathe out as you ease in.'], cue: 'Ease out the typing.' },
            { key: 'settle', title: 'Settle', label: 'Quiet breathing', seconds: 35, text: 'Hands in your lap, eyes soft or closed. Just notice the breath.', steps: ['Nothing to do.', 'Let the breath set its own pace.', 'Notice what feels quieter.'], cue: 'Stay here a moment.' },
        ],
        standing: [
            { key: 'breath', title: 'Longer exhale', label: 'Longer exhale: in for four, out for six', seconds: 45, text: 'Stand easy beside your desk. Breathe in for a count of four and out for a count of six.', steps: ['Let the belly soften.', 'If the counts feel long, shorten them.', 'Out a little longer than in.'], cue: 'Let the pace slow down.' },
            { key: 'jaw', title: 'Jaw and neck release', label: 'Loose jaw, slow nods', seconds: 35, text: 'Let the jaw hang loose, lips apart, and slowly nod yes, then no.', steps: ['Unclench the teeth.', 'Small, slow movements.', 'Let the shoulders drop.'], cue: 'Let go of what you’re holding.' },
            { key: 'hands', title: 'Hand and forearm stretch', label: 'Fingers back, both arms', seconds: 35, text: 'One arm out, palm up, gently ease the fingers back with the other hand. Switch halfway.', steps: ['Mild stretch only.', 'Elbow soft, not locked.', 'Breathe out as you ease in.'], cue: 'Ease out the typing.' },
            { key: 'settle', title: 'Settle', label: 'Quiet breathing', seconds: 35, text: 'Stand easy, hands loose. Just notice the breath.', steps: ['Nothing to do.', 'Let the breath set its own pace.', 'Notice what feels quieter.'], cue: 'Stay here a moment.' },
        ],
    },
    screen: {
        seated: [
            { key: 'far', title: 'Look far away', label: 'Rest your eyes on something distant', seconds: 30, text: 'Find the farthest point you can see, out of a window if you can, and rest your eyes on it.', steps: ['Let your eyes go soft.', 'Blink slowly a few times.', 'Keep your shoulders down.'], cue: 'Give your eyes some distance.' },
            { key: 'palms', title: 'Palms over eyes', label: 'Warm palms, eyes closed', seconds: 30, text: 'Rub your palms warm and rest them over closed eyes.', steps: ['No pressure on the eyes.', 'Breathe slowly.', 'Enjoy the dark for a moment.'], cue: 'Rest them properly.' },
            { key: 'wrists', title: 'Wrist circles and stretch', label: 'Circles, then palms back', seconds: 45, text: 'Circle the wrists both ways, then gently stretch each palm back, then down.', steps: ['Slow circles.', 'Mild stretch only.', 'Shake the hands out after.'], cue: 'Undo the mouse and keyboard.' },
            { key: 'posture', title: 'Posture reset', label: 'Sit tall, screen at eye level', seconds: 45, text: 'Feet flat, sit tall, chin slightly back, shoulders down. Check your screen sits at eye level.', steps: ['Lower back against the chair.', 'Elbows close to your sides.', 'Screen about an arm’s length away.'], cue: 'Set up for the next stretch of work.' },
        ],
        standing: [
            { key: 'far', title: 'Look far away', label: 'Rest your eyes on something distant', seconds: 30, text: 'Stand and find the farthest point you can see, out of a window if you can, and rest your eyes on it.', steps: ['Let your eyes go soft.', 'Blink slowly a few times.', 'Keep your shoulders down.'], cue: 'Give your eyes some distance.' },
            { key: 'palms', title: 'Palms over eyes', label: 'Warm palms, eyes closed', seconds: 30, text: 'Rub your palms warm and rest them over closed eyes.', steps: ['No pressure on the eyes.', 'Breathe slowly.', 'Enjoy the dark for a moment.'], cue: 'Rest them properly.' },
            { key: 'wrists', title: 'Wrist circles and stretch', label: 'Circles, then palms back', seconds: 45, text: 'Circle the wrists both ways, then gently stretch each palm back, then down.', steps: ['Slow circles.', 'Mild stretch only.', 'Shake the hands out after.'], cue: 'Undo the mouse and keyboard.' },
            { key: 'posture', title: 'Posture reset', label: 'Stand tall, then set up your desk', seconds: 45, text: 'Stand tall, chin slightly back, shoulders down, then check your screen sits at eye level for when you sit again.', steps: ['Weight even on both feet.', 'Let the arms hang loose.', 'Screen about an arm’s length away.'], cue: 'Set up for the next stretch of work.' },
        ],
    },
};
// The ending, per reset: back to the day, what this made room for, and a counterpart for another time.
const ENDINGS = {
    unknot: { room: 'A few unhurried minutes for your neck and shoulders.', breath: 'One slow breath before the next call.', spoken: 'There. Your shoulders can come down from your ears now.', other: 'screen' },
    unsit: { room: 'A short break from all that sitting, for your back and hips.', breath: 'Sit or stand tall for one breath before you settle back in.', spoken: 'Done. A little movement after a lot of sitting.', other: 'energy' },
    energy: { room: 'A quick, quiet lift for a heavy afternoon.', breath: 'One easy breath before you dive back in.', spoken: 'That’s it. Back to it whenever you’re ready.', other: 'unknot' },
    calm: { room: 'A few quiet minutes to let things settle.', breath: 'One more long exhale before you open the next thing.', spoken: 'That’s it. Let the quiet last a little longer, if you can.', other: 'screen' },
    screen: { room: 'A proper break for your eyes and wrists.', breath: 'Look away from the screen once more before you dive back in.', spoken: 'Done. Look up from the screen now and then.', other: 'unsit' },
};
export const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
export function planOf(reset, posture) {
    const blocks = PLANS[reset][posture];
    return { blocks, total: blocks.reduce((sum, block) => sum + block.seconds, 0) };
}
const screen = (key, children) => `${key} = Screen([${children.join(', ')}])`;
const list = (key, items) => [`${key} = List([${items.map((_, i) => `${key}_${i + 1}`).join(', ')}])`, ...items.map((item, i) => statement(`${key}_${i + 1}`, 'ListItem', [item]))];
/** Reveal `step` after the first screens already present (a session may start from home). */
export const revealRootIn = (existing, step) => { const order = ONBOARDING.filter(k => existing.includes(k) || k === step); return `root = Screens([${order.slice(0, order.indexOf(step) + 1).join(', ')}], ${step})`; };
export const revealRoot = (step) => `root = Screens([${ONBOARDING.slice(0, ONBOARDING.indexOf(step) + 1).join(', ')}], ${step})`;
/** "How are you feeling right now?": grouped the way people actually feel at work, in their own language too. */
export const FEEL_GROUPS = [
    ['Body', ['Stiff neck after calls', 'Back tight from sitting', 'Tired eyes and wrists', 'Legs stiff from sitting']],
    ['Energy', ['Post-lunch slump', 'Sleepy and slow', 'Restless, can’t sit still']],
    ['Mind', ['Stressed, can’t switch off', 'Too many meetings', 'Need a quiet minute']],
    ['Time', ['Only a couple of minutes', 'Not sure, you pick']],
    ['In your language', ['Gardan akad gayi hai', 'बहुत थकान है', 'कामाचा ताण आहे']],
];
const FEEL_KEYS = ['feel_actions', 'feel_energy', 'feel_mind', 'feel_time', 'feel_lang'];
export function feelStatements(note = 'Tap what fits, or type it below in English, Hindi, Hinglish or Marathi.') {
    const groups = FEEL_GROUPS.flatMap(([label, chips], i) => [statement(`${FEEL_KEYS[i]}_label`, 'Text', [label, 'subtitle']), statement(FEEL_KEYS[i], 'FollowUps', [chips])]);
    return [screen('feel', ['feel_title', 'feel_text', ...FEEL_KEYS.flatMap(k => [`${k}_label`, k]), 'feel_privacy', 'feel_cue']),
        statement('feel_title', 'Text', ['How are you feeling right now?', 'title']),
        statement('feel_text', 'Text', [note, 'description']),
        ...groups,
        statement('feel_privacy', 'Text', ['Nothing you type leaves this device. Your company only ever sees team totals, never names.', 'body']),
        statement('feel_cue', 'Cue', ['2½ minutes, then back to your day.']),
    ];
}
export function feelProgram() { return [revealRoot('feel'), ...feelStatements()].join('\n'); }
/** One suggested reset, with its reason: start it seated or standing, or pick something else. */
export function pickStatements(reset, need) {
    const first = need?.posture ?? DEFAULT_POSTURE[reset], second = first === 'seated' ? 'standing' : 'seated';
    const start = (p) => `Start ${p} · ${clock(planOf(reset, p).total)}`;
    return [screen('pick', ['pick_title', ...(need?.heard.length ? ['pick_need'] : []), 'pick_text', 'pick_plan', 'pick_actions', 'pick_cue']),
        ...(need?.heard.length ? [statement('pick_need', 'Text', [`For ${need.heard.map(k => HEARD[k]).join(' · ')}`, 'subtitle'])] : []),
        statement('pick_title', 'Text', [`Suggested: ${RESET_NAMES[reset]}`, 'title']),
        statement('pick_text', 'Text', [(need?.ack || WHY[reset]).replace(/ I’d suggest.*$/, '').split(/(?<=\.) /)[0], 'description']),
        ...list('pick_plan', planOf(reset, first).blocks.map(b => `${b.title} · ${clock(b.seconds)}`)),
        statement('pick_actions', 'FollowUps', [[start(first), start(second), 'Something else']]),
        statement('pick_cue', 'Cue', ['Seated works on a call with the camera off. Standing works beside your desk.']),
    ];
}
export function sessionProgram(reset, posture, ctx, cursor = 'intro') {
    const { blocks, total } = planOf(reset, posture), n = blocks.length, need = ctx.need;
    const lines = [`root = Screens([intro, ${blocks.map(b => b.key).join(', ')}, finish], ${cursor})`];
    lines.push(screen('intro', ['intro_title', 'intro_text', 'intro_plan', 'intro_note', 'intro_cue']), statement('intro_title', 'Text', [`${RESET_NAMES[reset]} · ${POSTURE_LABELS[posture]}`, 'title']), statement('intro_text', 'Text', [`${need && NEED_INTRO[need] ? NEED_INTRO[need] + ' ' : ''}${n} short steps · ${clock(total)}. Stay at your desk; nothing to change into.`, 'description']), ...list('intro_plan', blocks.map(b => `${b.title} · ${clock(b.seconds)}`)), statement('intro_note', 'Alert', ['info', 'Sukoon can’t see you. Do only what feels comfortable, and stop if anything hurts.']), statement('intro_cue', 'Cue', ['Start each timer when you’re set. Back is always there.']));
    const rail = `${RESET_NAMES[reset]} · ${posture}${need && NEED_RAIL[need] ? ` · ${NEED_RAIL[need]}` : ''}`;
    blocks.forEach((b, i) => {
        lines.push(screen(b.key, blockChildren(b.key)), statement(`${b.key}_ask`, 'TextInput', ['Something changed? Tell Sukoon', 'e.g. can I do this seated?']), statement(`${b.key}_rail`, 'Rail', [rail, blocks[i + 1]?.title ?? 'Back to your day']), statement(`${b.key}_title`, 'Text', [`${i + 1} of ${n} · ${b.title}`, 'title']), statement(`${b.key}_timer`, 'Timer', [b.label, b.seconds]), statement(`${b.key}_text`, 'Text', [b.text, 'description']), ...list(`${b.key}_steps`, b.steps), statement(`${b.key}_cue`, 'Cue', [i === n - 1 ? `Last step. ${b.cue}` : b.cue]));
    });
    const ending = ENDINGS[reset];
    lines.push(screen('finish', ['finish_title', 'finish_text', 'finish_breath', 'finish_again', 'finish_recap', 'finish_cue']), statement('finish_title', 'Text', ['Back to your day.', 'title']), statement('finish_text', 'Text', [need && NEED_CLOSE[need] ? NEED_CLOSE[need] : ending.room, 'description']), statement('finish_breath', 'Text', [ending.breath, 'body']), statement('finish_again', 'Text', [`Another time, try ${RESET_NAMES[ending.other].toLowerCase()}.`, 'body']), statement('finish_recap', 'Recap', [`What the timers recorded · ${clock(total)} planned`]), statement('finish_cue', 'Cue', [ending.spoken]));
    return lines.join('\n');
}
// Reading state back from the echoed document.
const childrenOf = (s) => s.props.children;
export const readContext = (_doc) => ({ name: '' });
/** The reset offered on the pick screen, read from its title. */
export function readOffered(doc) {
    const title = String(doc.screens.flatMap(childrenOf).find(n => n.key === 'pick_title')?.props.text ?? '');
    return RESETS.find(r => title === `Suggested: ${RESET_NAMES[r]}`) ?? null;
}
export const isOnboarding = (doc) => ONBOARDING.includes(doc.screens[0]?.key ?? '');
// Intent parsing: one clear match wins; anything ambiguous is asked about.
const single = (text, patterns) => {
    const hits = Object.keys(patterns).filter(key => patterns[key].test(text.toLowerCase()));
    return hits.length === 1 ? hits[0] : null;
};
/** A reset named directly, e.g. "calm down" or "screen break". */
export const detectReset = (text) => single(text, { unknot: /\bunknot\b|neck (and|&) shoulders/, unsit: /undo the sitting/, energy: /energy lift/, calm: /calm down/, screen: /screen break/ });
export const detectPosture = (text) => single(text, { seated: /\bseated\b|\bsitting down\b|\bin my (chair|seat)\b|\b(on|in|joining) (a |the )?(call|meeting)\b|\bcan(not|'?t) stand\b/, standing: /\bstanding\b|\bstand up\b|\bstand\b/ });
const INTENTS = {
    urgent: ['chest pain', 'chest hurts', 'chest feels tight', 'cannot breathe', 'short of breath', 'trouble breathing', 'struggling to breathe', 'faint', 'fainted', 'fainting', 'blacked out', 'passed out', 'numb', 'numbness', 'severe pain', 'sudden pain', 'seene mein dard', 'seene me dard', 'chhati mein dard', 'chati me dard', 'saans nahi aa rahi', 'saans lene mein dikkat', 'saans phool rahi', 'behosh', 'sunn ho gaya', 'sunn pad gaya', 'सीने में दर्द', 'छाती में दर्द', 'सांस नहीं आ रही', 'साँस नहीं आ रही', 'सांस लेने में दिक्कत', 'सांस फूल रही', 'बेहोश', 'सुन्न', 'छातीत दुखतंय', 'छातीत दुखत', 'छातीत कळ', 'श्वास घ्यायला त्रास', 'श्वास लागतोय', 'बेशुद्ध', 'बधिर', 'chhatit dukhtay', 'chhatit dukhat', 'shwas ghyayla tras', 'beshuddh', 'saans nhi aa rhi', 'sans nahi aa rahi'],
    rehab: ['rehab', 'rehabilitation', 'recovering from', 'recovery from', 'post op', 'after surgery', 'surgery', 'physio', 'physiotherapy', 'physical therapy', 'operation hua', 'operation ke baad', 'ऑपरेशन', 'ऑपरेशननंतर', 'सर्जरी', 'फिजियो', 'फिजिओ', 'operation nantar', 'shastrakriya'],
    pain: ['pain', 'painful', 'dizzy', 'dizziness', 'lightheaded', 'light headed', 'nauseous', 'nausea', 'feel sick', 'feeling sick', 'felt sick', 'cramp', 'something feels wrong', 'hurt', 'hurts', 'hurting', 'injury', 'injured', 'sprain', 'sprained', 'strain', 'strained', 'torn', 'broken', 'fracture', 'swollen', 'sore knee', 'bad back', 'pulled a muscle', 'unwell', 'not well', 'not feeling well', 'not feeling okay', 'not feeling ok', 'feeling unwell', 'not okay', 'not ok', 'feel off', 'feeling off', 'feel weird', 'feeling weird', 'feel bad', 'feeling bad', 'tabiyat theek nahi', 'tabiyat thik nahi', 'tabiyat kharab', 'theek nahi lag raha', 'thik nahi lag raha', 'achha nahi lag raha', 'bara nahi', 'bara vatat nahi', 'barra vatat nahi', 'तबीयत ठीक नहीं', 'तबियत ठीक नहीं', 'तबीयत खराब', 'ठीक नहीं लग रहा', 'अच्छा नहीं लग रहा', 'बरं वाटत नाही', 'बरे वाटत नाही', 'dard', 'dard ho raha', 'dard hai', 'sar dard', 'sir dard', 'kamar dard', 'dukh raha', 'dukh rahi', 'dukhta', 'dukhti', 'chot', 'moch', 'chakkar', 'ulti', 'matli', 'sujan', 'soojan', 'दर्द', 'दुख रहा', 'दुख रही', 'दुखता', 'दुखती', 'चोट', 'मोच', 'चक्कर', 'उल्टी', 'मतली', 'सूजन', 'दुखतंय', 'दुखत आहे', 'दुखते', 'दुखतो', 'वेदना', 'मुरगळ', 'सूज', 'मळमळ', 'उलटी', 'dukhtay', 'dukhat', 'dukhte', 'dukhto', 'vedna', 'vedana', 'murgal', 'malmal', 'dard ho rha', 'dukh rha', 'dukh rhi', 'dardd', 'sar dukh', 'sir dukh', 'pair dukh', 'kamar dukh', 'kamar me dard', 'kamar mai dard', 'jor se dard'],
    outside: ['run', 'running', 'jog', 'jogging', 'weights', 'lift', 'lifting', 'dumbbell', 'dumbbells', 'barbell', 'swim', 'swimming', 'cycling', 'bike', 'hiit', 'jump', 'jumping', 'push ups', 'pushups', 'sit ups', 'situps', 'sprint', 'sprints', 'jumps', 'box jumps', 'burpee', 'burpees', 'skipping', 'gym'],
    fitness: ['lose weight', 'weight loss', 'losing weight', 'burn calories', 'burn fat', 'fat burning', 'calories', 'slim down', 'get fit', 'fit', 'fitness', 'fitter', 'get in shape', 'stamina', 'endurance', 'more active', 'tone up'],
    sitting: ['sitting', 'sat', 'not moved', 'sedentary', 'couch', 'sofa', 'desk', 'computer', 'laptop', 'screen all day', 'office', 'commute', 'long drive', 'long flight', 'baithe baithe', 'baith baith ke', 'kursi pe', 'kursi par', 'screen pe', 'बैठे बैठे', 'कुर्सी', 'लैपटॉप', 'बसून बसून', 'खुर्चीत', 'basun basun', 'khurchit', 'baithe baithe thak'],
    stiff: ['stiff', 'stiffness', 'tight', 'tightness', 'tense', 'achy', 'knots', 'hunched', 'locked up', 'loosen', 'creaky', 'akad', 'akadna', 'akdan', 'akad gayi', 'akad gaya', 'akdi hui', 'akda hua', 'jakdi hui', 'akdi', 'akda', 'jakad', 'jakdan', 'jakda', 'jakdi', 'अकड़', 'अकड़ गई', 'अकड़ गया', 'जकड़', 'जकड़न', 'आखडली', 'आखडला', 'आखडलंय', 'ताठ', 'ताठरले', 'aakhadli', 'aakhadla', 'aakhadlay', 'akhadli', 'taath', 'jakdan hai', 'akad gya'],
    legs: ['leg', 'legs', 'hamstring', 'hamstrings', 'calf', 'calves', 'thighs', 'pairon', 'taange', 'taangein', 'tange', 'पैर', 'टांगें', 'टाँगें', 'पैरों', 'पाय', 'पायात', 'पोटरी', 'pairo', 'pairon mein', 'payat', 'potri'],
    time: ['quick', 'short on time', 'in a hurry', 'no time', 'not much time', 'busy', 'few minutes', 'couple of minutes', 'something short', 'jaldi', 'time nahi', 'time kam', 'thoda time', 'do minute', 'paanch minute', 'जल्दी', 'समय नहीं', 'टाइम नहीं', 'थोड़ा समय', 'वेळ नाही', 'लवकर', 'थोडा वेळ', 'vel nahi', 'lavkar', 'thoda vel'],
    low: ['tired', 'exhausted', 'drained', 'sluggish', 'sleepy', 'no energy', 'low energy', 'low on energy', 'worn out', 'wiped', 'burnt out', 'burned out', 'foggy', 'fried', 'knackered', 'thak', 'thaka', 'thaki', 'thakan', 'thakaan', 'thakawat', 'sust', 'susti', 'aalas', 'neend aa rahi', 'neend', 'energy nahi', 'sar bhaari', 'sir bhaari', 'sar bhari', 'sir bhari', 'thaka hua', 'thaki hui', 'man nahi kar raha', 'mood off', 'slump', 'post lunch', 'after lunch', 'lunch', 'sleepy after lunch', 'heavy', 'थका', 'थकी', 'थकान', 'थकावट', 'नींद', 'सुस्त', 'सुस्ती', 'आलस', 'थकलो', 'थकले', 'थकवा', 'झोप येतेय', 'झोप येते', 'कंटाळा', 'सुस्तावलो', 'thaklo', 'thakle', 'thakva', 'zop yetey', 'zop yete', 'kantala', 'thakaa', 'thakk', 'neend aa rhi', 'neend aa rahi hai', 'sust lag raha', 'energy nahi hai'],
    restless: ['restless', 'fidgety', 'antsy', 'wired', 'pent up', 'cannot sit still', 'stir crazy', 'need to move', 'itching to move', 'bechain', 'bechaini', 'man nahi lag raha', 'move', 'want to move', 'stand up and move', 'get up and move', 'बेचैन', 'बेचैनी', 'मन नहीं लग रहा', 'अस्वस्थ', 'चुळबुळ', 'मन लागत नाही', 'aswastha', 'man lagat nahi'],
    energetic: ['energetic', 'energised', 'energized', 'get moving', 'sweat', 'sweaty', 'harder', 'intense', 'heart rate', 'heart pumping', 'wake me up', 'pumped', 'motivated', 'challenge', 'push myself'],
    calm: ['reset', 'need a break', 'calm', 'unwind', 'relax', 'decompress', 'wind down', 'de stress', 'destress', 'stressed', 'overwhelmed', 'quiet', 'stress', 'tension', 'pareshan', 'pareshaan', 'tension hai', 'dimaag kharab', 'dimag kharab', 'bahut kaam', 'kaam ka load', 'ghabrahat', 'dimaag thak', 'dimag thak', 'sukoon', 'shaanti chahiye', 'shanti chahiye', 'anxious', 'anxiety', 'nervous', 'on edge', 'racing', 'mind is racing', 'तनाव', 'टेंशन', 'टेन्शन', 'परेशान', 'शांति', 'शांत', 'घबराहट', 'दिमाग खराब', 'ताण', 'तणाव', 'चिंता', 'शांतता', 'डोकं जड', 'taan', 'tanav', 'chinta', 'shant', 'shantata', 'tension aahe', 'stress hai', 'bahut stress', 'dimag kharab'],
    unsure: ['do not know', 'not sure', 'no idea', 'whatever', 'anything', 'surprise me', 'you choose', 'you pick', 'you decide', 'up to you', 'get started', 'help me start', 'where to start', 'where to begin', 'feels right', 'पता नहीं', 'कुछ भी', 'माहित नाही', 'काहीही', 'pata nahi', 'pta nahi', 'mahit nahi', 'kahihi'],
    neck: ['neck', 'gardan', 'gardan mein', 'shoulder', 'shoulders', 'kandha', 'kandhe', 'hunched', 'hunching', 'slouch', 'slouching', 'slouched', 'गर्दन', 'कंधे', 'कंधा', 'मान', 'खांदे', 'खांदा', 'khande', 'khanda', 'maan dukh', 'manet', 'gardan me', 'kandhe me'],
    back: ['my back', 'lower back', 'upper back', 'stiff back', 'back is stiff', 'back feels', 'back stiff', 'hips', 'hip', 'kamar', 'peeth', 'pith', 'reedh', 'कमर', 'पीठ', 'पाठ', 'कंबर', 'पाठीत', 'kambar', 'paath', 'pathit', 'kamar me', 'kamar mein'],
    calls: ['calls', 'call', 'meeting', 'meetings', 'zoom', 'on calls', 'teams call', 'मीटिंग', 'कॉल', 'मिटिंग', 'meeting nantar'],
    eyes: ['eyes', 'eye', 'eye strain', 'screen', 'screens', 'staring', 'wrist', 'wrists', 'typing', 'mouse', 'keyboard', 'aankh', 'aankhen', 'aankhein', 'aankhon', 'aankhon mein', 'kalai', 'ungliyan', 'आंख', 'आँख', 'आंखें', 'आँखें', 'आंखों', 'कलाई', 'डोळे', 'डोळ्यांना', 'मनगट', 'dole', 'dolyana', 'managat', 'aankhon me jalan', 'aankh dukh', 'aankhon mein jalan'],
};
const PATTERNS = Object.fromEntries(Object.entries(INTENTS).map(([k, words]) => [k, new RegExp(`(?:^| )(?:${words.map(w => w.normalize('NFC').replace(/\u093C/g, '').replace(/\u0901/g, '\u0902')).join('|')})(?= |$)`)]));
/** Lower-case, straight apostrophes, contractions expanded, punctuation dropped. */
export function normalise(raw) {
    return raw.toLowerCase().replace(/[’‘`]/g, "'").replace(/\bcan't\b/g, 'cannot').replace(/\bwon't\b/g, 'will not').replace(/n't\b/g, ' not')
        .replace(/\bi'm\b/g, 'i am').replace(/\bi've\b/g, 'i have').replace(/'s\b/g, ' is').normalize('NFC').replace(/[\u0964\u0965]/g, ' ').replace(/\u093C/g, '').replace(/\u0901/g, '\u0902').replace(/[^a-z0-9\u0900-\u097F ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
// What Sukoon heard, in its words (shown on the pick screen), and how it says so.
export const HEARD = { neck: 'neck and shoulders', back: 'a stiff back', sitting: 'a lot of sitting', stiff: 'some stiffness', legs: 'tight legs', eyes: 'tired eyes or wrists', time: 'not much time', low: 'low energy', restless: 'restless energy', energetic: 'wanting more energy', calm: 'wanting something calm', unsure: 'not sure where to start', fitness: 'general fitness' };
const NEED_ACK = {
    neck: 'After back-to-back calls, the neck and shoulders usually hold the most.',
    back: 'For a stiff back, slow movement for the spine and hips fits well.',
    sitting: 'After a lot of sitting, a short break for the back and hips fits well.',
    stiff: 'For stiffness, slow and easy range fits well.',
    legs: 'Tight legs after sitting: some easy movement for the hips and calves fits.',
    eyes: 'Your eyes and wrists could use a proper break from the screen.',
    time: 'Short on time is fine; every break is about 2½ minutes.',
    low: 'Low on energy, so a quiet lift fits.',
    restless: 'Restless energy does well with a bit of easy rhythm.',
    energetic: 'A quick lift, then.',
    calm: 'Something quieter, then.',
    unsure: 'No need to know. Let’s start with the one most people like.',
    fitness: 'Sukoon is for short breaks at your desk, not a fitness plan. An energy lift is the closest fit.',
};
const NEED_RAIL = { neck: 'after calls', back: 'for your back', sitting: 'after sitting', stiff: 'for stiffness', legs: 'for tight legs', eyes: 'for eyes and wrists', time: 'short and sweet', low: 'kept light', restless: 'for restless energy', calm: 'to unwind' };
const NEED_INTRO = { neck: 'Built for after a run of calls.', back: 'Built around a stiff back.', sitting: 'Built for a break from sitting.', stiff: 'Built around easing stiffness.', legs: 'Built for tight legs.', eyes: 'Built to rest your eyes and wrists.', time: 'Built to fit a short window.', low: 'Kept light for a low-energy moment.', restless: 'Built to give restless energy somewhere to go.', energetic: 'Built as a quick lift.', calm: 'Built to be quiet.', unsure: 'An easy place to start.' };
const NEED_CLOSE = { neck: 'A little room for the neck and shoulders between calls.', back: 'Slow, easy movement for the stiff back you mentioned.', sitting: 'A small break from all that sitting.', stiff: 'Slow, easy range for the stiffness you mentioned.', legs: 'Some easy movement for those tight legs.', eyes: 'A real break for your eyes and wrists.', time: 'Short, and still worth making room for.', low: 'Kept light, the way you wanted.', restless: 'Somewhere for that restless energy to go.', calm: 'A few quiet minutes, the way you wanted.' };
const ORDER = ['fitness', 'eyes', 'neck', 'back', 'legs', 'sitting', 'stiff', 'time', 'low', 'restless', 'energetic', 'calm', 'unsure'];
export const CARE_ACK = {
    urgent: 'That sounds like it needs urgent medical attention, not movement. Please stop and contact your local emergency number or urgent care now.',
    pain: 'I can’t assess pain or injuries, so I won’t suggest a movement around it. Getting advice from a doctor or physiotherapist before moving that area is the safe call.',
    rehab: 'If you’re recovering, your clinician’s advice and restrictions come first. These breaks aren’t a rehab plan.',
};
// Idioms that name pain without describing the body are removed before matching.
const IDIOMS = / ?\b(a |such a |what a )?pain in the (neck|backside|butt|bum|arse|ass)\b/g;
export function interpretNeed(raw) {
    // "Back-to-back" describes calls, not a back; it must never read as "stiff back" once punctuation is gone.
    const t = normalise(raw).replace(IDIOMS, ' ').replace(/\bback to back\b/g, ' ').replace(/\s+/g, ' ').trim(), on = (k) => PATTERNS[k].test(t);
    // Safety first, even when mixed with an ordinary request: never route pain into a reset.
    if (on('urgent'))
        return { kind: 'care', level: 'urgent', ack: CARE_ACK.urgent };
    if (on('rehab'))
        return { kind: 'care', level: 'rehab', ack: CARE_ACK.rehab };
    if (on('pain'))
        return { kind: 'care', level: 'pain', ack: CARE_ACK.pain };
    // The work moments map straight to their reset.
    const moment = RESETS.find(r => normalise(RESET_MOMENTS[r]) === t), named = detectReset(t);
    // Calls and meetings say "neck and shoulders" only when nothing more specific is named.
    const heard = ORDER.filter(k => k === 'time' ? on('time') || /\b\d+ ?(min|mins|minute|minutes)\b|\b(one|two|three|four|five|ten) (min|mins|minute|minutes)\b/.test(t) : k === 'neck' ? on('neck') || (on('calls') && !['eyes', 'back', 'legs', 'sitting'].some(b => on(b))) : on(k));
    const has = (k) => heard.includes(k), outside = on('outside');
    if (has('low') && (has('energetic') || has('restless')))
        return { kind: 'clarify', ack: 'Low on energy but wanting something lively? Which matters more right now: something quiet, or a quick lift?' };
    const reset = moment ?? named ?? (has('eyes') ? 'screen' : has('neck') ? 'unknot' : has('calm') ? 'calm'
        : outside || has('fitness') || has('low') || has('energetic') || has('restless') ? 'energy'
            : has('back') || has('legs') || has('sitting') ? 'unsit' : has('stiff') || has('time') || has('unsure') ? 'unknot' : null);
    if (!reset)
        return { kind: 'clarify', ack: 'Tell me a little more: is it your neck and shoulders, your back from sitting, your energy, your eyes, or just a lot on your mind?' };
    const posture = detectPosture(t);
    const lines = [...(outside ? ['Running, weights and jumping are outside what Sukoon does; these are short, quiet resets you can do at your desk.'] : []), ...heard.map(k => NEED_ACK[k])];
    const plan = planOf(reset, posture ?? DEFAULT_POSTURE[reset]);
    const pick = `I’d suggest ${RESET_NAMES[reset].toLowerCase()} (${clock(plan.total)}).`;
    if (!lines.length)
        return { kind: 'suggest', reset, posture, ack: `${WHY[reset]} ${pick}`, plain: true, heard: [] };
    return { kind: 'suggest', reset, posture, ack: `${lines.slice(0, 2).join(' ')} ${pick}`, plain: false, heard };
}
export const readHeard = (text) => Object.keys(HEARD).filter(k => text.includes(HEARD[k]));
/** Care replaces the choices on the first screen: no reset is offered around pain. */
export function careStatements(level) {
    const urgent = level === 'urgent' || level === 'rest-urgent', rest = level.startsWith('rest');
    if (rest)
        return [screen('feel', ['care_title', 'care_text', ...(urgent ? [] : ['care_actions']), 'care_cue']),
            statement('care_title', 'Text', [urgent ? 'Please look after that first.' : 'That’s a good call.', 'title']),
            statement('care_text', 'Text', [urgent ? 'Get help now. Sukoon will be here another time, when you’re ready.' : 'Look after yourself. If you change your mind, the breaks are still here.', 'description']),
            ...(urgent ? [] : [statement('care_actions', 'FollowUps', [['Show the resets']])]),
            statement('care_cue', 'Cue', ['Take care.'])];
    return [screen('feel', ['care_title', 'care_alert', 'care_text', 'care_actions', 'care_cue']),
        statement('care_title', 'Text', [urgent ? 'Please get help first.' : 'Let’s look after that first.', 'title']),
        statement('care_alert', 'Alert', [urgent ? 'danger' : 'warning', CARE_ACK[level]]),
        statement('care_text', 'Text', [urgent ? 'This isn’t something Sukoon can help with, and it isn’t a time to move.' : 'If you’d still like a break today, choose one that leaves that area alone, and stop if anything hurts.', 'description']),
        statement('care_actions', 'FollowUps', [urgent ? ['I understand'] : ['Not today', 'Show the resets']]),
        statement('care_cue', 'Cue', [urgent ? 'Please look after yourself first.' : 'No pressure either way.'])];
}
export const careLevel = (doc) => { const node = doc.screens.flatMap(childrenOf).find(n => n.key === 'care_alert' || n.key === 'care_title'); if (!node)
    return null; const alert = doc.screens.flatMap(childrenOf).find(n => n.key === 'care_alert'); return alert ? (alert.props.tone === 'danger' ? 'urgent' : 'pain') : (doc.screens.flatMap(childrenOf).some(n => n.key === 'care_actions') ? 'rest' : 'rest-urgent'); };
// In session: the person can tell Sukoon something changed. Safety always wins; every other
// change is offered and waits for an explicit yes. Nothing restarts the session or a timer.
export const blockChildren = (key) => [`${key}_rail`, `${key}_title`, `${key}_text`, `${key}_timer`, `${key}_steps`, `${key}_ask`, `${key}_cue`];
// What people say mid-session, in English, Hinglish, Hindi and Marathi (Roman and Devanagari).
const fold = (w) => w.normalize('NFC').replace(/\u093C/g, '').replace(/\u0901/g, '\u0902');
const phrases = (words) => new RegExp(`(?:^| )(?:${words.map(fold).join('|')})(?= |$)`);
const SAY = {
    stop: phrases(['stop', 'stop it', 'quit', 'end it', 'end the session', 'finish', 'enough', 'call it', 'i am done', 'done for now', 'that is enough', 'no more', 'cannot continue', 'can not continue', 'want to stop', 'let me stop', 'i want to stop', 'bas karo', 'bas karte', 'bas ho gaya', 'bas ho gayi', 'ruko', 'rehne do', 'chhodo', 'band karo', 'nahi karna', 'aur nahi', 'thamba', 'thambu', 'thambuya', 'bas zala', 'bas jhala', 'pure zala', 'nako', 'mala nako', 'बस', 'बस करो', 'बस हो गया', 'रुको', 'रहने दो', 'छोड़ो', 'बंद करो', 'नहीं करना', 'और नहीं', 'थांबा', 'थांबूया', 'बस झालं', 'बस झाले', 'पुरे', 'मला नको']),
    seated: phrases(['seated', 'sitting down', 'sit', 'sit down', 'in my chair', 'in my seat', 'on a call', 'on the call', 'in a meeting', 'joining a call', 'joining a meeting', 'call is starting', 'meeting is starting', 'cannot stand', 'can not stand', 'baith ke', 'baithkar', 'baith kar', 'baithe baithe', 'kursi par', 'kursi pe', 'call pe hoon', 'meeting mein hoon', 'basun', 'basunach', 'khurchit', 'call var', 'meeting madhe', 'बैठकर', 'बैठ के', 'बैठे बैठे', 'कुर्सी पर', 'कॉल पर', 'मीटिंग में', 'बसून', 'खुर्चीत', 'मीटिंगमध्ये']),
    standing: phrases(['standing', 'stand up', 'stand', 'on my feet', 'khade hokar', 'khade ho ke', 'khada hoke', 'ubhe rahun', 'ubha rahun', 'ubhe', 'खड़े होकर', 'खड़े हो के', 'उभे राहून', 'उभं राहून', 'उभे']),
    switch: phrases(['switch', 'change', 'change it', 'something else', 'different', 'swap', 'another one', 'another break', 'not this one', 'kuch aur', 'kuchh aur', 'dusra', 'doosra', 'badlo', 'badal do', 'ye nahi', 'yeh nahi', 'dusre', 'vegla', 'dusra kahi', 'dusra kahitari', 'he nako', 'बदलो', 'बदल दो', 'कुछ और', 'दूसरा', 'ये नहीं', 'बदला', 'दुसरं', 'वेगळं', 'हे नको']),
    harder: phrases(['too easy', 'harder', 'step it up', 'more challenging', 'more intense', 'bit more', 'a bit more', 'not enough', 'push me', 'thoda aur', 'aur tez', 'bahut aasan', 'bahut asaan', 'aasan hai', 'asaan hai', 'zyada karo', 'ajun', 'ajun thoda', 'jasta kara', 'khup sopa', 'थोड़ा और', 'और तेज़', 'बहुत आसान', 'आसान है', 'अजून', 'अजून थोडं', 'जास्त करा', 'खूप सोपं']),
    easier: phrases(['too hard', 'too intense', 'too much', 'too fast', 'easier', 'slow down', 'slow it down', 'slower', 'lighter', 'gentler', 'tone it down', 'less', 'smaller', 'make it easy', 'zyada ho gaya', 'bahut zyada', 'bahut mushkil', 'mushkil hai', 'aaram se', 'aram se', 'dheere', 'dheere dheere', 'dhire', 'halka', 'halu', 'halu halu', 'sopa', 'sopa kara', 'kami', 'kami kara', 'jast hotay', 'jaast hotay', 'avghad', 'ज़्यादा हो गया', 'बहुत ज़्यादा', 'मुश्किल', 'आराम से', 'धीरे', 'धीरे धीरे', 'हल्का', 'हळू', 'सोपं', 'सोपे करा', 'कमी', 'कमी करा', 'जास्त होतंय', 'अवघड']),
    howlong: phrases(['how long', 'how much longer', 'how much time', 'time left', 'kitna time', 'kitna samay', 'kitni der', 'kab khatam', 'kiti vel', 'kiti vela', 'kevha sampel', 'कितना समय', 'कितनी देर', 'कब खत्म', 'किती वेळ', 'कधी संपेल']),
    better: phrases(['feel better', 'feeling better', 'feels good', 'feel good', 'that helps', 'this helps', 'much better', 'lighter now', 'acha lag raha', 'achha lag raha', 'accha lag raha', 'behtar', 'aaram mila', 'bara vatla', 'bara vatatay', 'chhan vatatay', 'mast vatatay', 'अच्छा लग रहा', 'बेहतर', 'आराम मिला', 'बरं वाटलं', 'छान वाटतंय', 'मस्त वाटतंय']),
    thanks: phrases(['thanks', 'thank you', 'thx', 'ty', 'dhanyavad', 'dhanyawad', 'shukriya', 'thank u', 'aabhari', 'abhari', 'धन्यवाद', 'शुक्रिया', 'आभारी']),
    what: phrases(['what do i do', 'what should i do', 'how do i do this', 'how to do', 'i do not understand', 'not sure how', 'kaise karu', 'kaise karna', 'samajh nahi aaya', 'kasa karu', 'kase karaych', 'samajla nahi', 'कैसे करूं', 'कैसे करना', 'समझ नहीं आया', 'कसं करू', 'समजलं नाही']),
};
export function interpretSessionRequest(raw) {
    const need = interpretNeed(raw);
    if (need.kind === 'care')
        return { kind: 'safety', level: need.level };
    const t = normalise(raw), named = detectReset(t), on = (k) => SAY[k].test(t);
    if (on('stop'))
        return { kind: 'stop' };
    // At a desk, "more" means standing and fuller; "less" means seated and smaller.
    if (on('easier'))
        return { kind: 'seated' };
    if (on('harder'))
        return { kind: 'standing' };
    const posture = detectPosture(t) ?? (on('seated') ? 'seated' : on('standing') ? 'standing' : null);
    if (posture)
        return { kind: posture };
    if (on('switch') || named)
        return { kind: 'switch', reset: named };
    if (on('howlong'))
        return { kind: 'tip', text: 'Each step has its own timer, shown on the dial. The whole break is about 2½ minutes, and you can stop any time.' };
    if (on('what'))
        return { kind: 'tip', text: 'Follow the short lines under the timer, and keep every move small and comfortable. If a move doesn’t suit you, skip the step.' };
    if (on('better'))
        return { kind: 'tip', text: 'Good to hear. Carry on, or finish here if that feels like enough.' };
    if (on('thanks'))
        return { kind: 'tip', text: 'You’re welcome. Carry on whenever you’re ready.' };
    return { kind: 'unclear' };
}
/** The current session as the document shows it: the reset, the posture and the need it was built for. */
export function readSession(doc) {
    const nodes = doc.screens.flatMap(childrenOf), text = (key) => String(nodes.find(n => n.key === key)?.props.text ?? '');
    const found = fromTitle(text('intro_title'));
    if (!found)
        return null;
    const { reset, posture } = found;
    const intro = text('intro_text'), need = Object.keys(NEED_INTRO).find(k => intro.startsWith(NEED_INTRO[k])) ?? null;
    return { reset, posture, ctx: { name: '', need } };
}
/** An offer sits on top of the current step until the person answers it. */
export function offerStatements(key, text, actions) {
    return [screen(key, ['offer_note', 'offer_actions', ...blockChildren(key)]), statement('offer_note', 'Alert', ['info', text]), statement('offer_actions', 'FollowUps', [actions])];
}
/** Safety replaces the step's content; the timer stays in the document (paused by the client) but out of view. */
export function safetyStatements(key, level) {
    const urgent = level === 'urgent';
    return [screen(key, ['safety_title', 'safety_alert', 'safety_text', 'safety_actions', `${key}_timer`, 'safety_cue']),
        statement('safety_title', 'Text', [urgent ? 'Stop here and get help.' : 'Let’s stop and rest.', 'title']),
        statement('safety_alert', 'Alert', [urgent ? 'danger' : 'warning', urgent ? CARE_ACK.urgent : 'I’ve paused the timer. I can’t tell what’s causing this, so please don’t push through it. If it’s severe, or comes with chest pain or trouble breathing, get urgent medical help.']),
        statement('safety_text', 'Text', [urgent ? 'Don’t continue this break.' : 'Take a break. You don’t need to finish the rest, and I won’t suggest another movement in its place.', 'description']),
        statement('safety_actions', 'FollowUps', [urgent ? ['End the session'] : ['End the session', 'I’ve rested and feel okay']]),
        statement('safety_cue', 'Cue', [urgent ? 'Please look after yourself first.' : 'No pressure. Stopping is a perfectly good choice.'])];
}
/** Closing after stopping early or for safety: the same calm ending, honest about why it ended. */
export function earlyFinishStatements(safety) {
    return [statement('finish_title', 'Text', [safety ? 'Let’s leave it there.' : 'That’s enough for now.', 'title']),
        statement('finish_text', 'Text', [safety ? 'Stopping was the right call. Take it easy, and if it doesn’t settle, check in with a doctor or physiotherapist.' : 'Stopping early is fine. Even a minute away from the screen counts.', 'description']),
        ...(safety ? [statement('finish_breath', 'Text', ['Rest for as long as you need.', 'body']), statement('finish_again', 'Text', ['Come back whenever you feel ready. There’s no rush.', 'body'])] : []),
        statement('finish_cue', 'Cue', [safety ? 'Take care of yourself.' : 'Whenever you’re ready, there’s a break that fits.'])];
}
