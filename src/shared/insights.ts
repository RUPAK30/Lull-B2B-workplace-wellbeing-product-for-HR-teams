// Turns the activity log into the numbers on the Insights screen. Pure functions, so the
// definitions are testable and the same for real activity and for the synthetic sample.
export type InsightEvent = { t: number; type: string; user: string; visit: string; run?: string; data?: Record<string, unknown> };
export type Count = { label: string; n: number };
export type ExperimentResult = { id: string; a: { n: number; hits: number; rate: number }; b: { n: number; hits: number; rate: number }; diff: number; low: number; high: number; verdict: string };

const groupBy = <T>(items: T[], key: (item: T) => string | undefined) => {
  const map = new Map<string, T[]>(); for (const item of items) { const k = key(item); if (k === undefined) continue; map.set(k, [...(map.get(k) ?? []), item]); } return map;
};
const tally = (labels: string[]): Count[] => { const m = new Map<string, number>(); for (const l of labels) m.set(l, (m.get(l) ?? 0) + 1); return [...m].map(([label, n]) => ({ label, n })).sort((x, y) => y.n - x.n); };
export const median = (values: number[]) => { if (!values.length) return null; const s = [...values].sort((a, b) => a - b), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export const pct = (part: number, whole: number) => whole ? part / whole : 0;

/** Difference in two proportions with a 95% interval (normal approximation). */
export function compare(aHits: number, aN: number, bHits: number, bN: number) {
  const pa = pct(aHits, aN), pb = pct(bHits, bN), diff = pa - pb;
  const se = Math.sqrt((aN ? pa * (1 - pa) / aN : 0) + (bN ? pb * (1 - pb) / bN : 0)), margin = 1.96 * se;
  const enough = aN >= 30 && bN >= 30;
  const verdict = !enough ? 'Too few visits to say anything yet.' : diff - margin > 0 ? 'A is ahead, and the gap is bigger than chance would explain.' : diff + margin < 0 ? 'B is ahead, and the gap is bigger than chance would explain.' : 'No clear difference yet. Keep it running.';
  return { diff, low: diff - margin, high: diff + margin, verdict };
}

export function summarize(events: InsightEvent[]) {
  const visits = groupBy(events, e => e.visit), runs = groupBy(events, e => e.run);
  const has = (list: InsightEvent[], type: string, test?: (e: InsightEvent) => boolean) => list.some(e => e.type === type && (!test || test(e)));
  const visitList = [...visits.values()];
  const chose = visitList.filter(v => has(v, 'session_loaded'));
  const started = visitList.filter(v => has(v, 'timer_started'));
  const finished = visitList.filter(v => has(v, 'session_finished', e => e.data?.reason === 'finished'));
  const funnel: Count[] = [
    { label: 'Opened Lull', n: visitList.length },
    { label: 'Chose a session', n: chose.length },
    { label: 'Started the first movement', n: started.length },
    { label: 'Reached the end', n: finished.length },
  ];
  // Time from a session appearing to its first timer starting.
  const firstMove = [...runs.values()].map(r => { const load = r.find(e => e.type === 'session_loaded'), go = r.find(e => e.type === 'timer_started'); return load && go ? (go.t - load.t) / 1000 : null; }).filter((v): v is number => v !== null);
  const finishers = new Set(events.filter(e => e.type === 'session_finished' && e.data?.reason === 'finished').map(e => e.user));
  const returners = new Set(events.filter(e => e.type === 'returned' && finishers.has(e.user)).map(e => e.user));
  const runList = [...runs.values()];
  const asked = runList.filter(r => has(r, 'offer')), adjusted = runList.filter(r => has(r, 'adjusted'));
  const of = (type: string, field: string) => events.filter(e => e.type === type).flatMap(e => { const v = e.data?.[field]; return Array.isArray(v) ? v.map(String) : v === undefined ? [] : [String(v)]; });
  const unmatched = tally(of('unmatched', 'text').map(t => t.toLowerCase().trim()));
  const experiments: ExperimentResult[] = ['home-quick', 'ready-default'].map(id => {
    const exposed = (variant: string) => visitList.filter(v => v.some(e => e.type === 'exposure' && e.data?.exp === id && e.data?.variant === variant));
    const metric = (vs: InsightEvent[][]) => id === 'home-quick'
      ? { n: vs.length, hits: vs.filter(v => has(v, 'timer_started')).length }
      : { n: vs.filter(v => has(v, 'timer_started')).length, hits: vs.filter(v => has(v, 'timer_started') && has(v, 'session_finished', e => e.data?.reason === 'finished')).length };
    const a = metric(exposed('A')), b = metric(exposed('B')), c = compare(a.hits, a.n, b.hits, b.n);
    return { id, a: { ...a, rate: pct(a.hits, a.n) }, b: { ...b, rate: pct(b.hits, b.n) }, ...c };
  });
  return {
    visits: visitList.length, sessions: runList.filter(r => has(r, 'session_loaded')).length, funnel,
    finishRate: pct(finished.length, chose.length), medianFirstMove: median(firstMove),
    returnRate: pct(returners.size, finishers.size), finishers: finishers.size, returners: returners.size,
    askedRate: pct(asked.length, runList.length), adjustedShare: pct(adjusted.length, asked.length),
    safety: tally(of('safety', 'when')), needs: tally(of('need', 'kinds')), routes: tally(of('entry', 'route')),
    feelings: tally(of('feeling', 'value')), unmatched, experiments,
  };
}
export type Summary = ReturnType<typeof summarize>;

/** A synthetic sample: made-up people over four weeks, so the dashboard can be read and demoed. */
export function sampleEvents(seed = 7): InsightEvent[] {
  let s = seed >>> 0; const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const pick = <T>(pairs: [T, number][]) => { let r = rand(), acc = 0; for (const [v, w] of pairs) { acc += w; if (r < acc) return v; } return pairs[pairs.length - 1][0]; };
  const out: InsightEvent[] = [], start = Date.UTC(2026, 8, 1, 7), day = 86400000;
  const kinds: [string, number][] = [['a lot of sitting', .3], ['not much time', .24], ['low energy', .16], ['some stiffness', .1], ['wanting something calm', .08], ['not sure where to start', .07], ['wanting more energy', .05]];
  const unclear = ['my wrists ache from typing', 'something for my eyes after screens', 'yoga please', 'a cooldown after my run', 'can i do this lying in bed', 'my wrists ache from typing', 'something for tight jaw', 'yoga please', 'my wrists ache from typing'];
  for (let u = 0; u < 160; u++) {
    const user = 'sample-' + u, quick = rand() < 0.5 ? 'A' : 'B', ready = rand() < 0.5 ? 'A' : 'B';
    const days = new Set<number>(); const visitsPlanned = 1 + Math.floor(rand() * rand() * 7);
    let finishedBefore = false;
    for (let k = 0; k < visitsPlanned; k++) days.add(Math.floor(rand() * 28));
    for (const d of [...days].sort((a, b) => a - b)) {
      let t = start + d * day + Math.floor(rand() * 12 * 3600000); const visit = `${user}-v${d}`, push = (type: string, data?: Record<string, unknown>, run?: string) => { out.push({ t, type, user, visit, run, data }); t += 1000 + Math.floor(rand() * 4000); };
      push('visit'); push('exposure', { exp: 'home-quick', variant: quick }); push('exposure', { exp: 'ready-default', variant: ready });
      if (finishedBefore) push('returned');
      const route = quick === 'A' ? pick<string>([['quick', .42], ['typed', .27], ['onboarding', .24], ['again', .07]]) : pick<string>([['onboarding', .68], ['typed', .32]]);
      push('entry', { route });
      if (route === 'typed') { if (rand() < 0.09) { push('unmatched', { text: unclear[Math.floor(rand() * unclear.length)], where: 'before' }); continue; } if (rand() < 0.02) { push('safety', { when: 'before', level: 'pain' }); continue; } push('need', { kinds: [pick(kinds)] }); }
      const chooseRate = quick === 'A' ? 0.84 : 0.71;
      if (rand() > chooseRate) continue;
      const run = `${visit}-r`; push('session_loaded', { title: 'sample' }, run);
      t += (route === 'onboarding' ? 14000 : 6000) + Math.floor(rand() * 26000);
      if (rand() > (quick === 'A' ? 0.9 : 0.86)) continue;
      push('timer_started', {}, run);
      if (rand() < 0.17) { push('offer', { ask: pick<string>([['harder', .45], ['easier', .35], ['switch', .12], ['stop', .08]]) }, run); if (rand() < 0.62) push('adjusted', { to: 'steady' }, run); }
      if (rand() < 0.012) { push('safety', { when: 'during', level: rand() < 0.15 ? 'urgent' : 'pain' }, run); push('session_finished', { reason: 'safety' }, run); continue; }
      if (rand() > (ready === 'A' ? 0.74 : 0.69)) { if (rand() < 0.3) push('session_finished', { reason: 'stopped' }, run); continue; }
      push('timer_done', { early: rand() < 0.2 }, run); push('session_finished', { reason: 'finished' }, run); finishedBefore = true;
      if (rand() < 0.62) push('feeling', { value: pick<string>([['lighter', .57], ['same', .34], ['not-for-me', .09]]) }, run);
    }
  }
  return out;
}
