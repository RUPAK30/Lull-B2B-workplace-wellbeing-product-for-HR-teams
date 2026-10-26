const WEEK = 7 * 86400000;
export function teamReport(events, people, start, weeks, minGroup = 10) {
    if (people.length < minGroup)
        return { tooSmall: true, minGroup, headcount: people.length };
    const week = (t) => Math.floor((t - start) / WEEK);
    const finished = events.filter(e => e.type === 'session_finished' && e.data?.reason === 'finished');
    const started = events.filter(e => e.type === 'timer_started');
    const activeIn = (w, members) => new Set(started.filter(e => week(e.t) === w && (!members || members.has(e.user))).map(e => e.user));
    const perWeekFor = (members) => {
        const rates = Array.from({ length: weeks }, (_, w) => { const active = activeIn(w, members).size, done = finished.filter(e => week(e.t) === w && (!members || members.has(e.user))).length; return active ? done / active : null; }).filter((v) => v !== null);
        return rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
    };
    const minutesFor = (members) => Math.round(finished.filter(e => !members || members.has(e.user)).reduce((a, e) => a + Number(e.data?.minutes ?? 0), 0));
    const everActive = new Set(started.map(e => e.user));
    const teams = [...new Set(people.map(p => p.team))];
    const sizes = new Map(teams.map(t => [t, people.filter(p => p.team === t).length]));
    const small = teams.filter(t => sizes.get(t) < minGroup);
    // One hidden group alone could be recovered by subtraction, so hide the next smallest too.
    const alsoHidden = small.length === 1 ? teams.filter(t => !small.includes(t)).sort((a, b) => sizes.get(a) - sizes.get(b)).slice(0, 1) : [];
    const byTeam = teams.sort((a, b) => sizes.get(b) - sizes.get(a)).map(team => {
        if (small.includes(team))
            return { team, hidden: true, reason: `Fewer than ${minGroup} people` };
        if (alsoHidden.includes(team))
            return { team, hidden: true, reason: 'Hidden so a smaller team can’t be worked out by subtraction' };
        const members = new Set(people.filter(p => p.team === team).map(p => p.user));
        return { team, hidden: false, people: members.size, activeShare: [...members].filter(u => everActive.has(u)).length / members.size, perWeek: perWeekFor(members), minutes: minutesFor(members) };
    });
    const firstHalf = new Set(started.filter(e => week(e.t) < Math.ceil(weeks / 2)).map(e => e.user));
    const lastTwo = new Set(started.filter(e => week(e.t) >= weeks - 2).map(e => e.user));
    const stayed = [...firstHalf].filter(u => lastTwo.has(u)).length;
    const felt = events.filter(e => e.type === 'feeling'), lighter = felt.filter(e => e.data?.value === 'lighter').length;
    const hourOf = (t) => new Date(t).getUTCHours();
    const slots = [['Before 11am', h => h < 11], ['11am to 2pm', h => h >= 11 && h < 14], ['2pm to 5pm', h => h >= 14 && h < 17], ['After 5pm', h => h >= 17]];
    const when = slots.map(([label, test]) => ({ label, n: finished.filter(e => test(hourOf(e.t))).length }));
    const needs = new Map();
    for (const e of events)
        if (e.type === 'need' && Array.isArray(e.data?.kinds))
            for (const k of e.data.kinds)
                needs.set(k, (needs.get(k) ?? 0) + 1);
    return {
        tooSmall: false, minGroup, headcount: people.length,
        everActive: everActive.size, activeShare: everActive.size / people.length,
        perWeek: perWeekFor(), minutes: minutesFor(),
        stayed, triedEarly: firstHalf.size, lighterShare: felt.length ? lighter / felt.length : 0, feelingAnswers: felt.length,
        weekly: Array.from({ length: weeks }, (_, w) => ({ label: `Week ${w + 1}`, n: activeIn(w).size })),
        when, needs: [...needs].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 5),
        byTeam,
    };
}
/** A made-up 64-person company over six weeks, so the employer view can be shown honestly. */
export function teamSample(seed = 11) {
    let s = seed >>> 0;
    const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    const pick = (pairs) => { let r = rand(), acc = 0; for (const [v, w] of pairs) {
        acc += w;
        if (r < acc)
            return v;
    } return pairs[pairs.length - 1][0]; };
    const start = Date.UTC(2026, 7, 31), weeks = 6, day = 86400000;
    const shape = [['Engineering', 24], ['Sales', 14], ['Product & Design', 11], ['Customer support', 8], ['People & Ops', 7]];
    const people = shape.flatMap(([team, n]) => Array.from({ length: n }, (_, i) => ({ user: `team-${team.slice(0, 3).toLowerCase()}-${i}`, team })));
    const novelty = [1.35, 1.1, 1, 0.92, 0.88, 0.9];
    const kinds = [['a lot of sitting', .34], ['not much time', .26], ['some stiffness', .14], ['low energy', .14], ['wanting something calm', .12]];
    const events = [];
    for (const p of people) {
        const keen = rand() < 0.22 ? 0 : 0.08 + rand() * 0.42; // some people never try it
        const quits = rand() < 0.4 ? 1 + Math.floor(rand() * 4) : weeks; // and some drift away
        for (let d = 0; d < weeks * 7; d++) {
            if (d % 7 >= 5 || Math.floor(d / 7) >= quits || rand() > keen * novelty[Math.floor(d / 7)])
                continue;
            const hour = pick([[9, .08], [10, .1], [11, .12], [12, .1], [13, .1], [14, .16], [15, .16], [16, .1], [17, .05], [18, .03]]);
            let t = start + d * day + hour * 3600000 + Math.floor(rand() * 3000000);
            const visit = `${p.user}-d${d}`, run = visit + '-r';
            const push = (type, data, r) => { events.push({ t, type, user: p.user, visit, run: r, data }); t += 20000 + Math.floor(rand() * 40000); };
            push('visit');
            if (rand() < 0.4)
                push('need', { kinds: [pick(kinds)] });
            push('session_loaded', {}, run);
            if (rand() > 0.9)
                continue;
            push('timer_started', {}, run);
            if (rand() > 0.78)
                continue;
            push('session_finished', { reason: 'finished', minutes: pick([[2.5, .3], [2.67, .3], [4, .25], [6, .15]]) }, run);
            if (rand() < 0.45)
                push('feeling', { value: pick([['lighter', .6], ['same', .32], ['not-for-me', .08]]) }, run);
        }
    }
    return { people, events, start, weeks };
}
