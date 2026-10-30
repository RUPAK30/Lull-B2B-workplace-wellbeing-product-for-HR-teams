// The Insights screen: product numbers from this device's private log, or from a clearly
// labelled synthetic sample. Plain DOM bars; every chart has a table view.
import { el, button } from './dom.js?v=mvvcpoop';
import { summarize } from '../shared/insights.js?v=mvvcpoop';
import { EXPERIMENTS } from './analytics.js?v=mvvcpoop';
import { teamReport, teamSample } from '../shared/team.js?v=mvvcpoop';
const P = (x) => `${Math.round(x * 100)}%`;
const ROUTES = { quick: 'Quick pick on home', typed: 'Typed a need on home', onboarding: 'Full welcome', again: 'Same as last time' };
const FEELINGS = { lighter: 'Lighter', same: 'About the same', 'not-for-me': 'Not for me' };
const WHEN = { before: 'Before a reset', during: 'During a reset' };
const label = (map) => (c) => ({ ...c, label: map[c.label] ?? c.label });
function card(title, note, wide = false) {
    const n = el('section', '', 'ins-card' + (wide ? ' wide' : ''));
    n.append(el('h3', title));
    if (note)
        n.append(el('p', note, 'ins-note'));
    return n;
}
function table(headers, rows) {
    const d = el('details', '', 'ins-table'), t = el('table'), head = el('tr');
    d.append(el('summary', 'Show as table'));
    for (const h of headers)
        head.append(el('th', h));
    t.append(head);
    for (const r of rows) {
        const tr = el('tr');
        for (const c of r)
            tr.append(el('td', String(c)));
        t.append(tr);
    }
    d.append(t);
    return d;
}
function bars(rows, max) {
    const top = max ?? Math.max(1, ...rows.map(r => r.n)), wrap = el('div', '', 'ins-bars');
    for (const r of rows) {
        const row = el('div', '', 'bar-row'), track = el('div', '', 'bar-track'), fill = el('div', '', 'bar-fill' + (r.series ? ' ' + r.series : ''));
        const text = `${r.label}: ${r.display ?? r.n}${r.note ? ' · ' + r.note : ''}`;
        row.title = text;
        row.setAttribute('aria-label', text);
        row.tabIndex = 0;
        fill.style.width = `${Math.max(r.n > 0 ? 2 : 0, (r.n / top) * 100)}%`;
        track.append(fill);
        const value = el('span', '', 'bar-value');
        value.append(el('strong', r.display ?? String(r.n)), ...(r.note ? [el('span', ' · ' + r.note)] : []));
        row.append(el('span', r.label, 'bar-label'), track, value);
        wrap.append(row);
    }
    return wrap;
}
function tile(value, name, detail) { const t = el('div', '', 'ins-tile'); t.append(el('strong', value), el('span', name, 'ins-tile-name'), el('span', detail, 'ins-tile-detail')); return t; }
const empty = (text) => el('p', text, 'ins-empty');
export function renderInsights(root, o) {
    root.replaceChildren();
    const head = el('header', '', 'ins-head'), title = el('div', '', 'ins-title');
    title.append(el('h2', o.source === 'team' ? 'Team view' : 'Insights'), el('p', o.source === 'team'
        ? 'Synthetic sample: a made-up 64-person company over six weeks. This is what an employer would see. Not real usage.'
        : o.source === 'sample'
            ? 'Synthetic sample: 160 made-up people over four weeks, generated to show how this screen reads. Not real usage.'
            : 'Your activity on this device only. Nothing here has left this browser.', 'ins-source'));
    const switcher = el('div', '', 'segmented ins-switch');
    switcher.setAttribute('role', 'radiogroup');
    switcher.setAttribute('aria-label', 'Data source');
    for (const [value, text] of [['device', 'This device'], ['sample', 'Sample data'], ['team', 'Team (sample)']]) {
        const l = el('label'), r = el('input');
        r.type = 'radio';
        r.name = 'ins-source';
        r.value = value;
        r.checked = o.source === value;
        r.addEventListener('change', () => o.onSource(value));
        l.append(r, document.createTextNode(' ' + text));
        switcher.append(l);
    }
    const actions = el('div', '', 'ins-actions');
    actions.append(button('Export JSON', o.onExport, 'ghost'));
    if (o.source === 'device')
        actions.append(button('Clear log', o.onClear, 'ghost'));
    const close = button('Close', o.onClose, 'primary');
    close.id = 'close-insights';
    actions.append(close);
    head.append(title, switcher, actions);
    const body = el('div', '', 'ins-body');
    root.append(head, body);
    if (o.source === 'team') {
        renderTeam(body);
        return;
    }
    const s = summarize(o.events);
    if (s.visits < 2 && o.source === 'device')
        body.append(empty('Not much here yet. Use Sukoon for a few resets, or switch to the sample to see how this screen reads.'));
    const tiles = el('div', '', 'ins-tiles');
    tiles.append(tile(String(s.visits), 'Visits', `${s.sessions} ${s.sessions === 1 ? 'reset' : 'resets'} chosen`), tile(P(s.finishRate), 'Reach the end', 'of visits where a reset was chosen'), tile(s.medianFirstMove === null ? '–' : `${Math.round(s.medianFirstMove)} s`, 'To first step', 'median, from reset shown to first timer'), tile(P(s.returnRate), 'Come back', `${s.returners} of ${s.finishers} who finished came back another day`), tile(P(s.askedRate), 'Ask for a change', `${P(s.adjustedShare)} of those accepted the offer`), tile(String(s.safety.reduce((a, c) => a + c.n, 0)), 'Safety stops', 'pain, injury or dizziness reported'));
    body.append(tiles);
    const grid = el('div', '', 'ins-grid');
    const funnel = card('Where people drop off', 'Each step counts visits. The note shows how many carried on from the step before.', true);
    funnel.append(bars(s.funnel.map((f, i) => ({ ...f, note: i ? `${P(f.n / Math.max(1, s.funnel[i - 1].n))} of previous` : undefined }))), table(['Step', 'Visits', 'Of previous'], s.funnel.map((f, i) => [f.label, f.n, i ? P(f.n / Math.max(1, s.funnel[i - 1].n)) : '–'])));
    const needs = card('What people asked for', 'What Sukoon heard in typed needs. One request can contain more than one.');
    needs.append(s.needs.length ? bars(s.needs) : empty('No typed needs yet.'), table(['Need', 'Times'], s.needs.map(n => [n.label, n.n])));
    const routes = card('How people start', 'Which door they came in through on each visit.');
    const r = s.routes.map(label(ROUTES));
    routes.append(r.length ? bars(r) : empty('No starts yet.'), table(['Route', 'Visits'], r.map(x => [x.label, x.n])));
    const feelings = card('How it felt afterwards', 'The optional one-tap question at the end. Self-reported, so read it as a signal, not proof.');
    const f = s.feelings.map(label(FEELINGS)), totalFelt = f.reduce((a, c) => a + c.n, 0);
    feelings.append(f.length ? bars(f.map(x => ({ ...x, note: P(x.n / totalFelt) }))) : empty('Nobody has answered yet.'), table(['Answer', 'Count'], f.map(x => [x.label, x.n])));
    const gaps = card('Requests we couldn’t serve', 'Typed requests Sukoon didn’t understand. This is the raw input for the backlog.');
    if (s.unmatched.length) {
        const list = el('ol', '', 'ins-gaps');
        for (const g of s.unmatched.slice(0, 8)) {
            const li = el('li');
            li.append(el('span', `“${g.label}”`), el('strong', `×${g.n}`));
            list.append(li);
        }
        gaps.append(list);
    }
    else
        gaps.append(empty('Nothing unmatched yet.'));
    const safety = card('Safety stops', 'Every time someone reported pain, injury or dizziness. These should stay rare, and every one should end safely.');
    const sf = s.safety.map(label(WHEN));
    safety.append(sf.length ? bars(sf) : empty('None recorded.'), table(['When', 'Count'], sf.map(x => [x.label, x.n])));
    grid.append(funnel, needs, routes, feelings, gaps, safety);
    for (const result of s.experiments) {
        const exp = EXPERIMENTS.find(e => e.id === result.id);
        const c = card(`Experiment: ${exp.name}`, exp.hypothesis, true);
        const legend = el('div', '', 'ins-legend');
        for (const [k, name] of [['a', `A · ${exp.variants.A}`], ['b', `B · ${exp.variants.B}`]]) {
            const item = el('span', '', 'legend-item');
            item.append(el('span', '', 'swatch ' + k), document.createTextNode(name));
            legend.append(item);
        }
        c.append(el('p', `Measured by: ${exp.metric}.`, 'ins-metric'), legend, bars([
            { label: `A · ${exp.variants.A}`, n: result.a.rate, display: P(result.a.rate), note: `${result.a.hits} of ${result.a.n}`, series: 'a' },
            { label: `B · ${exp.variants.B}`, n: result.b.rate, display: P(result.b.rate), note: `${result.b.hits} of ${result.b.n}`, series: 'b' },
        ], 1), el('p', `Difference: ${result.diff >= 0 ? '+' : ''}${Math.round(result.diff * 100)} points (95% range ${Math.round(result.low * 100)} to ${Math.round(result.high * 100)}). ${result.verdict}`, 'ins-verdict'), table(['Variant', 'Visits', 'Hits', 'Rate'], [['A · ' + exp.variants.A, result.a.n, result.a.hits, P(result.a.rate)], ['B · ' + exp.variants.B, result.b.n, result.b.hits, P(result.b.rate)]]));
        grid.append(c);
    }
    body.append(grid, el('p', 'Definitions: a visit is one time the app is opened; a reset is one plan shown; “reach the end” means pressing Finish on the closing screen. Timers measure time on the page, not exercise.', 'ins-foot'));
}
/** What an employer sees: company and team totals only, with small groups hidden. */
export const teamExport = () => { const t = teamSample(); return teamReport(t.events, t.people, t.start, t.weeks); };
function renderTeam(body) {
    const r = teamExport();
    if (r.tooSmall) {
        body.append(empty(`Team reporting starts at ${r.minGroup} people, so no one can be singled out.`));
        return;
    }
    const rule = el('section', '', 'ins-rule');
    rule.append(el('h3', 'What this view never shows'), el('p', `Names, individual sessions, anything people typed, or who reported pain. Teams with fewer than ${r.minGroup} people are hidden. When only one team is small, one more is hidden too, so the small one can’t be worked out by subtraction.`));
    body.append(rule);
    const tiles = el('div', '', 'ins-tiles');
    tiles.append(tile(`${r.everActive} of ${r.headcount}`, 'Have tried it', `${P(r.activeShare)} of the team, at least one reset`), tile(r.perWeek.toFixed(1), 'Sessions a week', 'finished, per person active that week'), tile(`${Math.round(r.minutes / 60)} h`, 'Guided time', 'timer time on finished sessions, not proof of exercise'), tile(`${r.stayed} of ${r.triedEarly}`, 'Still using it', 'tried it in weeks 1–3 and used it again in weeks 5–6'), tile(P(r.lighterShare), 'Felt lighter', `of ${r.feelingAnswers} optional answers after a session`));
    body.append(tiles);
    const grid = el('div', '', 'ins-grid');
    const weekly = card('People active each week', 'Someone counts as active if they started at least one step that week. Expect it to settle lower once the novelty wears off.', true);
    weekly.append(bars(r.weekly), table(['Week', 'Active people'], r.weekly.map(w => [w.label, w.n])));
    const teams = card('By team', `Totals for teams of ${r.minGroup} or more people.`, true);
    const list = el('div', '', 'team-rows');
    const headRow = el('div', '', 'team-row team-head');
    headRow.append(el('span', 'Team'), el('span', 'People'), el('span', 'Have tried it'), el('span', 'Sessions a week'), el('span', 'Guided time'));
    list.append(headRow);
    for (const t of r.byTeam) {
        const row = el('div', '', 'team-row' + (t.hidden ? ' hidden-row' : ''));
        if (t.hidden)
            row.append(el('span', t.team), el('span', t.reason, 'team-hidden'));
        else
            row.append(el('span', t.team), el('span', String(t.people)), el('span', P(t.activeShare)), el('span', t.perWeek.toFixed(1)), el('span', `${Math.round(t.minutes / 60)} h`));
        list.append(row);
    }
    teams.append(list);
    const when = card('When people take a break', 'Finished resets by time of day. Useful for deciding when a gentle reminder would help most.');
    when.append(bars(r.when), table(['Time', 'Sessions'], r.when.map(w => [w.label, w.n])));
    const needs = card('What people asked for', 'Company-wide totals of the needs Sukoon recognised. What people actually typed is never shown here.');
    needs.append(bars(r.needs), table(['Need', 'Times'], r.needs.map(n => [n.label, n.n])));
    grid.append(weekly, teams, when, needs);
    body.append(grid, el('p', 'This sample is made up, so it shows how the report reads, not how a real team would use Sukoon. In a real pilot these totals would come from people who opted in, combined across devices before anyone sees them.', 'ins-foot'));
}
