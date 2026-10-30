// The browser side of a team pilot. Only active when Sukoon was opened from a pilot link, only
// sends what shared/pilot.ts allows, and records every send on this device so the person can
// see exactly what left ("What leaves this device" in Settings). The local app's CSP blocks
// these requests, so they only ever leave the hosted pilot copy.
import { cleanTeam, parseReset, pilotEvent, pilotPath, resetFromTitle } from '../shared/pilot.js?v=mvve4uw9';
const TEAM = 'sw.pilot.team', COUNT = 'sw.pilot.count', SENT = 'sw.pilot.sent', LIMIT = 50;
// On the hosted site, counts go through our own domain so ad blockers don't drop them.
const ENDPOINT = typeof location !== 'undefined' && location.hostname.endsWith('vercel.app') ? '/gc/count' : 'https://lull.goatcounter.com/count';
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
const params = new URLSearchParams(location.search);
if (params.has('team')) {
    const t = cleanTeam(params.get('team'));
    if (t)
        store.set(TEAM, t);
    else
        store.del(TEAM);
}
/** The pilot team this device belongs to, or null outside a pilot. */
export const pilotTeam = cleanTeam(store.get(TEAM));
export const openedFromReminder = params.get('from') === 'reminder';
/** A team reset link (?reset=unknot-seated) starts that reset straight away. */
export const teamReset = parseReset(params.get('reset'));
/** A homepage taster (?taster=1) opens the seated neck-and-shoulder reset, so a buyer feels it in under a minute. */
export const taster = params.get('taster') === '1';
/** The person can stop their sessions being counted at any time. */
export const pilotCounting = {
    get on() { return pilotTeam !== null && store.get(COUNT) !== 'off'; },
    set on(value) { store.set(COUNT, value ? 'on' : 'off'); },
};
export function sentLog() { try {
    return JSON.parse(store.get(SENT) ?? '[]');
}
catch {
    return [];
} }
/** Forgets this device's record of what was sent (the counts already sent can't be recalled). */
export function clearSent() { store.del(SENT); }
/** Sends one anonymous count if this event is on the allow-list. No cookies, no device id. */
export function sendPilot(type, data) {
    if (!pilotTeam || !pilotCounting.on)
        return;
    const event = pilotEvent(type, data);
    if (!event)
        return;
    const url = `${ENDPOINT}?p=${encodeURIComponent(pilotPath(pilotTeam, event))}&t=${encodeURIComponent(event)}&e=true&rnd=${Math.random().toString(36).slice(2, 8)}`;
    fetch(url, { mode: 'no-cors', credentials: 'omit', keepalive: true, referrerPolicy: 'no-referrer' }).catch(() => { });
    const log = sentLog();
    log.push({ t: Date.now(), team: pilotTeam, event });
    store.set(SENT, JSON.stringify(log.slice(-LIMIT)));
}
/** The link a reminder opens: this app, marked as coming from the reminder, with the team kept. */
export function reminderLink() {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('from', 'reminder');
    if (pilotTeam)
        url.searchParams.set('team', pilotTeam);
    return url.toString();
}
/** A team reset link for a meeting invite: one known session, the team kept, nothing else. */
export function teamResetLink(reset = 'unknot-seated') {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('reset', reset);
    if (pilotTeam)
        url.searchParams.set('team', pilotTeam);
    return url.toString();
}
/** Remembers the session someone last started, so a reminder can offer it in one tap. */
const USUAL = 'sw.usual';
export function noteUsual(title) { const code = resetFromTitle(String(title ?? '')); if (code)
    store.set(USUAL, code); }
export const usualReset = () => parseReset(store.get(USUAL));
