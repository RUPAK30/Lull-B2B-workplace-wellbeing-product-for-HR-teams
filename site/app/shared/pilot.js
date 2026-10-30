// Team pilots. When Sukoon is opened from a team's pilot link (?team=sales), a handful of anonymous
// counts may leave the device so HR can see team totals. This file is the whole contract: the
// allow-list below is the only thing that can be sent, and it never includes who, what was typed,
// or anything about pain or safety. It also builds the opt-in reminder the employee sets for
// themselves, so coming back is their choice, on their own calendar or Slack.
import { RESETS, fromTitle } from './resets.js';
/** Team codes are short, lower-case and plain, so they can't carry anything personal. */
export function cleanTeam(raw) {
    const team = (raw ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24);
    return team || null;
}
/**
 * Maps a local activity event to the anonymous pilot event it may be sent as, or null.
 * Safety, unmatched requests, needs, adjustments and timers are never sent: who reported pain
 * stays private, and nothing a person typed ever leaves the device.
 */
export function pilotEvent(type, data) {
    switch (type) {
        case 'session_loaded': return 'session-started';
        case 'session_finished': return data?.reason === 'finished' ? 'session-finished' : null;
        case 'returned': return 'came-back';
        case 'reminder_set': return 'reminder-set';
        case 'opened_from_reminder': return 'opened-from-reminder';
        case 'team_reset': return 'team-reset-joined';
        // Feelings, needs and anything typed stay on the device. Only the counts above leave.
        default: return null;
    }
}
/** The count path for one anonymous event: the team and the event, nothing else. */
export const pilotPath = (team, event) => `pilot/${team}/${event}`;
export const WEEKDAYS = 'MO,TU,WE,TH,FR';
const pad = (n) => String(n).padStart(2, '0');
/** Parses "15:40" into hours and minutes, falling back to 3:40 pm. */
export function parseTime(value) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    const h = match ? Number(match[1]) : 15, m = match ? Number(match[2]) : 40;
    return h < 24 && m < 60 ? { h, m } : { h: 15, m: 40 };
}
/** The next weekday (from `from`) at the chosen time, as a floating local time like 20261027T154000. */
export function nextStart(time, from) {
    const { h, m } = parseTime(time), d = new Date(from.getFullYear(), from.getMonth(), from.getDate(), h, m);
    if (d <= from)
        d.setDate(d.getDate() + 1);
    while (d.getDay() === 0 || d.getDay() === 6)
        d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
}
const plusMinutes = (stamp, minutes) => {
    const h = Number(stamp.slice(9, 11)), m = Number(stamp.slice(11, 13)) + minutes;
    return `${stamp.slice(0, 9)}${pad(h + Math.floor(m / 60))}${pad(m % 60)}00`;
};
const TITLE = 'Sukoon: 2:30 reset';
const details = (link) => `A short guided movement break. Open Sukoon: ${link}\nSkip any day you like. Sukoon won't follow up.`;
/** A recurring weekday event in iCalendar format, for Outlook, Apple Calendar or Google import. */
export function reminderIcs(time, link, from, uid) {
    const start = nextStart(time, from), stamp = from.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, m => '\\' + m);
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lull//Reset reminder//EN', 'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`,
        `DTSTART:${start}`, `DTEND:${plusMinutes(start, 5)}`, `RRULE:FREQ=WEEKLY;BYDAY=${WEEKDAYS}`, `SUMMARY:${esc(TITLE)}`,
        `DESCRIPTION:${esc(details(link))}`, `URL:${link}`, 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}
/** A Google Calendar "add event" link for the same recurring weekday reminder. */
export function reminderGoogle(time, link, from, zone) {
    const start = nextStart(time, from);
    const q = new URLSearchParams({ action: 'TEMPLATE', text: TITLE, details: details(link), dates: `${start}/${plusMinutes(start, 5)}`, recur: `RRULE:FREQ=WEEKLY;BYDAY=${WEEKDAYS}`, ctz: zone });
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
/** Slack's own /remind command: no app to install, and the reminder belongs to the person. */
export function reminderSlack(time, link) {
    const { h, m } = parseTime(time), hour = h % 12 || 12;
    return `/remind me "Take a 2:30 Sukoon reset: ${link}" every weekday at ${hour}:${pad(m)}${h < 12 ? 'am' : 'pm'}`;
}
export function parseReset(raw) {
    const match = new RegExp(`^(${RESETS.join('|')})-(seated|standing)$`).exec((raw ?? '').trim().toLowerCase());
    return match ? { reset: match[1], posture: match[2] } : null;
}
/** The text a manager pastes into a recurring meeting invite. */
export const teamResetInvite = (link) => `Last 3 minutes: Sukoon team reset. Open this together and press Start: ${link}`;
/** Reads a session's own title (e.g. "Calm down · Seated") back into a reset code, or null. */
export function resetFromTitle(title) {
    const found = fromTitle(title);
    return found ? `${found.reset}-${found.posture}` : null;
}
