# Sukoon

A seated 2:30 movement reset for HR teams and the founder still doing HR at 30–250 person companies in India (250 is the ceiling). One link per team, no app, no roster, no accounts. Every Friday: one line per team — how many started, how many finished — and never who.

[Site](https://lull-hr.vercel.app/) · [Workspace](https://lull-hr.vercel.app/workspace) · [Pricing](https://lull-hr.vercel.app/pilot) · [Security](https://lull-hr.vercel.app/trust) · [Changes](https://lull-hr.vercel.app/changes)

> The domain is still `lull-hr.vercel.app` and the contact is still a personal inbox. Both are listed as open items in [`/trust#status`](site/trust.html) rather than hidden.

## The position

Sukoon has no customers. That is stated on the site, not hidden from it. The first six team pilots are free, the report at week 6 is written so it can recommend stopping, and every certification we do not hold is listed on the status page.

Privacy is a peer of price, not a footer link. No employee personal data is collected or stored, so there is no employee record to protect, export or delete under the DPDP Act — no field exists to put one in. The homepage shows what HR sees, what it never sees, and the two teams it refuses to show.

## The ask

Not a demo request. Three mailto chips — **yes**, **no**, **already have one** — each opening a pre-filled subject. One word is a complete reply. The deeper question ("what is the one thing that makes this a no?") sits once, at the foot.

## Site map

| Path | What it is |
| --- | --- |
| `/` | One screen: why/how/when, the six-team demo, who-sees-what, the Friday email, and the one-word ask |
| `/workspace` | Demo admin surface: teams, seats, hidden rows, Friday digest, six-week history, week-6 report |
| `/pilot` | The offer, the six weeks, **the launch kit** (copyable messages), price, procurement, internal memo, pre-mortem, FAQ |
| `/trust` | Data map, the ten-starter rule, roles, subprocessors, retention, DPA summary, employee notice, status table |
| `/report` | Print-ready company week-6 report for the same six-team sample: 92 starters, 75 finished, ₹176 a starter, a recommendation, and two teams the report refuses to show |
| `/safety` | Red flags, when not to use it, review status, what the evidence does and does not support |
| `/changes` | Dated decisions with reasons, plus what is not built yet |
| `/privacy`, `/terms` | Founder drafts, marked as drafts |

## The product

- **One link.** No download, no account, no password, no HRIS, no SSO.
- **2:30, seated, in work clothes.** Four moves: neck, shoulders, chest, breath.
- **The ten-starter rule.** A team appears only at ten starters, and the next-smallest team is hidden with it, so a small team cannot be recovered by subtraction.
- **Six anonymous counts per team per week.** Session started, session finished, came back, reminder set, opened from reminder, team reset joined — the allow-list in `src/shared/pilot.ts`. The workspace shows four of them per team: starts, finishes, returns, and cost per starter. No person-level row exists in the schema.

## The app

`src/` is the product. `scripts/site-app.mjs` copies a Mock-mode build into `site/app/` so the demo on the marketing site is the real interface, not a video.

```bash
npm run build        # typecheck + build
npm run site:app     # rebuild the demo into site/app
npm test             # build + test suite
npm start            # local server on 127.0.0.1 (Mock mode)
```

Preview the marketing site with any static server rooted at `site/` (the pages use `.html` paths locally; Vercel `cleanUrls` strips them in production).

## What is deliberately not here

- **No manager view.** A manager view would make the ten-starter rule decorative.
- **No voice input.** The browser speech API sends audio to Google, which would break "nothing leaves this page". A local model is the only honest version.
- **No chatbot, cookie banner, dark-mode toggle, or mega-menu.**
- **No aggregated team "brand" assets we have not earned** — no customer logos, no badges, no certification marks.

## Privacy

Aggregate page counts only (GoatCounter, cookieless, no persistent IP). The app stores session state in the browser and, in a pilot, sends six team-level events. Events are allow-listed in `src/shared/pilot.ts`. Nothing about pain, mood, or typed text is ever counted, and safety stops are never reported.

## Status

`site/trust.html#status` is the single source of truth for what exists. It is updated whenever reality changes, including when a row gets worse. `site/changes.html` is the dated record of what changed and why.
