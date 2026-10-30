// "Make it a habit": the person picks a time and puts a recurring reminder on their own calendar
// or in Slack. Sukoon never schedules or sends reminders itself, so skipping a day costs nothing.
import { reminderGoogle, reminderIcs, reminderSlack, teamResetInvite } from '../shared/pilot.js?v=mvve2ps1';
import { el, button } from './dom.js?v=mvve2ps1';
import { track } from './analytics.js?v=mvve2ps1';
import { reminderLink, teamResetLink } from './pilot.js?v=mvve2ps1';
const TIME = 'sw.reminder.time', SET = 'sw.reminder.set';
const saved = () => { try {
    return localStorage.getItem(TIME) ?? '15:30';
}
catch {
    return '15:30';
} };
const save = (value) => { try {
    localStorage.setItem(TIME, value);
}
catch { /* storage blocked */ } };
/** The reminder card shown after a finished session and in Settings. */
export function reminderCard(compact = false) {
    const n = el('section', '', 'reminder' + (compact ? ' compact' : ''));
    if (!compact)
        n.append(el('p', 'Make it a habit', 'reminder-q'), el('p', 'Pick a time and add it to your own calendar or Slack. Skip any day you like: Sukoon won’t follow up.', 'micro'));
    const row = el('div', '', 'row reminder-time'), label = el('label', 'Weekdays at'), input = el('input');
    input.type = 'time';
    input.id = compact ? 'reminder-time-settings' : 'reminder-time';
    input.value = saved();
    label.htmlFor = input.id;
    input.addEventListener('change', () => save(input.value));
    row.append(label, input);
    const done = el('p', '', 'micro reminder-done');
    done.setAttribute('role', 'status');
    // A person who adds the reminder to both Slack and a calendar still counts as one opt-in.
    const set = (via, note) => {
        save(input.value);
        done.textContent = note;
        let first = true;
        try {
            first = localStorage.getItem(SET) === null;
            localStorage.setItem(SET, via);
        }
        catch { /* storage blocked */ }
        if (first)
            track('reminder_set', { via });
    };
    const google = el('a', 'Google Calendar', 'button');
    google.target = '_blank';
    google.rel = 'noopener';
    google.addEventListener('click', () => { google.href = reminderGoogle(input.value, reminderLink(), new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone); set('google', 'Opened Google Calendar. Save the event there, and it’s yours.'); });
    google.href = reminderGoogle(input.value, reminderLink(), new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone);
    const ics = button('Outlook or Apple (.ics)', () => {
        const blob = new Blob([reminderIcs(input.value, reminderLink(), new Date(), `lull-reset-${Date.now()}@lull`)], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob), a = el('a');
        a.href = url;
        a.download = 'lull-reset.ics';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        set('ics', 'Downloaded. Open the file to add it to your calendar.');
    });
    const slack = button('Copy Slack reminder', () => {
        const text = reminderSlack(input.value, reminderLink());
        const copied = () => set('slack', 'Copied. Paste it into any Slack message box and press Enter.');
        if (navigator.clipboard)
            navigator.clipboard.writeText(text).then(copied, () => { done.textContent = text; });
        else {
            done.textContent = text;
            set('slack', text);
        }
    });
    const actions = el('div', '', 'row reminder-actions');
    actions.append(google, ics, slack);
    // Team reset: the same 3 minutes together, as the last item of a recurring meeting.
    const together = el('div', '', 'reminder-together');
    together.append(el('p', 'Or do it together: paste this into a recurring meeting invite, and end it with a 2½-minute break together.', 'micro'), button('Copy team break invite', () => {
        const text = teamResetInvite(teamResetLink());
        const copied = () => { done.textContent = 'Copied. Paste it into your stand-up or team meeting invite.'; track('team_reset_shared'); };
        if (navigator.clipboard)
            navigator.clipboard.writeText(text).then(copied, () => { done.textContent = text; });
        else
            done.textContent = text;
    }));
    n.append(row, actions, together, done);
    return n;
}
