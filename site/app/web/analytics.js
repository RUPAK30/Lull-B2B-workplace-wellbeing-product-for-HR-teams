// A private activity log for product insight. It lives in this browser only: nothing is
// sent anywhere, it can be turned off, cleared or exported, and it never stores free text
// except the requests Sukoon could not understand (so they can shape the backlog).
import { sendPilot, noteUsual } from './pilot.js?v=mvvatlft';
const LOG = 'sw.events', ON = 'sw.analytics', DEVICE = 'sw.device', LIMIT = 3000;
const store = {
    get(key) { try {
        return localStorage.getItem(key);
    }
    catch {
        return null;
    } },
    set(key, value) { try {
        localStorage.setItem(key, value);
    }
    catch { /* storage blocked */ } },
    del(key) { try {
        localStorage.removeItem(key);
    }
    catch { /* storage blocked */ } },
};
const id = () => Math.random().toString(36).slice(2, 10);
const device = store.get(DEVICE) ?? (() => { const d = 'device-' + id(); store.set(DEVICE, d); return d; })();
const visit = 'visit-' + id();
let run;
export const logging = { get on() { return store.get(ON) !== 'off'; }, set on(value) { store.set(ON, value ? 'on' : 'off'); } };
export function events() { try {
    return JSON.parse(store.get(LOG) ?? '[]');
}
catch {
    return [];
} }
export function clearEvents() { store.del(LOG); }
let lastFinish;
/** How the latest session ended ('finished', 'stopped' or 'safety'), so care is never followed by a nudge. */
export const lastFinishReason = () => lastFinish;
export function track(type, data) {
    if (type === 'session_finished')
        lastFinish = data?.reason;
    if (type === 'session_loaded')
        noteUsual(data?.title);
    // Team pilots count a few anonymous events separately from this private log (see pilot.ts).
    sendPilot(type, data);
    if (!logging.on)
        return;
    if (type === 'session_loaded')
        run = 'run-' + id();
    const log = events();
    log.push({ t: Date.now(), type, user: device, visit, run, data });
    store.set(LOG, JSON.stringify(log.slice(-LIMIT)));
}
export const currentRun = () => run;
export const EXPERIMENTS = [
    { id: 'home-quick', name: 'Quick picks on the home screen', hypothesis: 'If people can pick a short session straight from home, more of them will reach their first movement.', metric: 'Visits that start a timer', variants: { A: 'Quick picks shown', B: 'Guided start only' } },
    { id: 'ready-default', name: '3-2-1 countdown on by default', hypothesis: 'A short countdown makes starting feel calmer without making people give up.', metric: 'Sessions that reach the end, once started', variants: { A: 'Countdown on', B: 'Countdown off' } },
];
export function variantOf(experiment) {
    const forced = store.get('sw.exp.' + experiment);
    if (forced === 'A' || forced === 'B')
        return forced;
    const key = 'sw.exp.assigned.' + experiment, assigned = store.get(key);
    if (assigned === 'A' || assigned === 'B')
        return assigned;
    const pick = Math.random() < 0.5 ? 'A' : 'B';
    store.set(key, pick);
    return pick;
}
export const overrideOf = (experiment) => store.get('sw.exp.' + experiment) ?? 'auto';
export function setOverride(experiment, value) { if (value === 'A' || value === 'B')
    store.set('sw.exp.' + experiment, value);
else
    store.del('sw.exp.' + experiment); }
/** Reads what Sukoon just did from its reply, so the log reflects product moments, not clicks. */
export function observeTurn(said, reply) {
    const heard = reply.match(/pick_need = Text\("For ([^"]+)"/);
    if (heard)
        track('need', { kinds: heard[1].split(' · ') });
    if (/feel_text = Text\("(Tell me a little more|Low on energy but)/.test(reply) || reply.startsWith('I didn’t catch a change'))
        track('unmatched', { text: said.slice(0, 120), where: reply.startsWith('I didn’t') ? 'during' : 'before' });
    const safety = reply.match(/(care|safety)_alert = Alert\("(warning|danger)"/);
    if (safety)
        track('safety', { when: safety[1] === 'care' ? 'before' : 'during', level: safety[2] === 'danger' ? 'urgent' : 'pain' });
    const title = reply.match(/intro_title = Text\("([^"]+)"/);
    if (title && reply.includes('root = Screens([])'))
        track('session_loaded', { title: title[1] });
    if (reply.includes('offer_note = Alert('))
        track('offer', { ask: classifyAsk(said) });
    if (/^switch to /i.test(said) && reply.startsWith('Done:'))
        track('adjusted', { to: said.slice(10).toLowerCase() });
    if (reply.includes('finish_title = Text("Let’s leave it there.'))
        track('session_finished', { reason: 'safety' });
    else if (reply.includes('finish_title = Text("That’s enough for now.'))
        track('session_finished', { reason: 'stopped' });
}
function classifyAsk(said) { const t = said.toLowerCase(); return /easy|harder|more/.test(t) ? 'harder' : /gentl|easier|intense|less|slow/.test(t) ? 'easier' : /stop|done|end/.test(t) ? 'stop' : 'switch'; }
/** Once a day, if someone finished a session on an earlier day, note that they came back. */
export function noteReturn() {
    const day = (t) => new Date(t).toDateString(), today = day(Date.now()), log = events();
    if (log.some(e => e.type === 'returned' && day(e.t) === today))
        return;
    if (log.some(e => e.type === 'session_finished' && day(e.t) !== today))
        track('returned');
}
