# Viraam

**Your standup has a start time. Give it an ending.**

Viraam is the last 2½ minutes of a meeting a team already holds. A team lead pastes one line into the standup invite. As the meeting ends, everyone opens the link and starts the same 2½-minute close at the same second: stand if you can, move, rest the eyes, and finish "When this ends, I'll first…", in English, हिंदी or मराठी. On Friday the lead gets one line: how many days it ran. HR's whole involvement is one yes and one invoice; there is nothing to run.

[Live product](https://lull-hr.vercel.app/) · [Create a team link](https://lull-hr.vercel.app/start) · [Try the 2½ minutes](https://lull-hr.vercel.app/app/?reset=unknot-seated&start=1) · [Pilot & pricing](https://lull-hr.vercel.app/pilot) · [Trust & data](https://lull-hr.vercel.app/trust) · [Product case study](https://lull-hr.vercel.app/pm)

> **Status:** pre-revenue and pilot-ready. The first six teams run free. All figures on the site are sample data from a fictional company, and every page says so.

---

## Why "the close"

| Finding | Consequence |
|---|---|
| Break reminders already ship free inside Microsoft 365 (Viva Insights), and they are private to each person by design | A personal reminder is not a product. A **team's shared** moment, with a record the lead can forward, is. |
| Links dropped in a channel depend on memory and fade after week one | Attach the break to the **standup that already happens daily**. The meeting is the reminder. |
| Per-seat pricing put a timer at par with complete HR software | **₹1,499 per team a month**: less than a team lunch, one invoice, no seats. |
| HR teams are overloaded with admin | No rollout, no accounts, no chasing, no dashboard. Unused teams stop by themselves. |
| Meetings overrun anyway | It does not add 2½ minutes to the day; it takes them out of the overrun. |

## How it works

1. **Once:** the lead creates the team link at `/start` (team name and standup end time). Out comes one invite line, a Google Calendar link, an Outlook `.ics`, a WhatsApp share and a QR code.
2. **Daily:** the link carries a wall-clock start (`/close/?team=…&at=HHMM`). Everyone who opens it sees the same countdown and starts at the same second; anyone late joins at the right step. The link hosts it, not a person.
3. **The close, 2:30, no taps:**

| Time | Phase | On screen | Evidence |
|---|---|---|---|
| 0:00–0:20 | Stand · breathe | "Stand up if you can", one slow sigh | Active > passive seated breaks (systematic review, 2022) |
| 0:20–1:20 | Neck · shoulders · wrists | 20 seconds each, small | Micro-break meta-analysis (Albulescu et al., 2022) |
| 1:20–1:40 | Eyes | Look across the room, blink slowly | 20-20-20 study (Aston University) |
| 1:40–2:20 | Plan | "When this ends, I'll first…" (never stored) | If-then plans, 94 tests, d = .65 (Gollwitzer & Sheeran, 2006) |
| 2:20–2:30 | Done | "Back at 10:15." · "Leaving with:" card | — |

4. **Safety:** "Something hurts" stops it for that person, says to rest, and points to 112 for red flags.
5. **Friday:** one line to the lead: how many days it ran, never who. A team appears only when 10 or more took part.

The promise is deliberately narrow: less fatigue, rested eyes, and a clear first step. No productivity or pain-relief claims (see `/safety`).

## Privacy by design

- **No employee personal data.** There are no names, emails, device IDs or session records, and nothing to export or delete under the DPDP Act.
- **The under-10 rule.** A team appears only when at least 10 people took part. The next-smallest team is hidden too, so a hidden team cannot be worked out by subtraction.
- **Weekly, never daily.** One person's day of leave cannot reveal who usually takes part.
- **Aggregated, not "anonymous".** Viraam deliberately does not claim anonymity; small-number suppression is what protects the group.
- **The only data that leaves a device** is six allow-listed team counts (`src/shared/pilot.ts`). What people type, how they feel, and every safety stop stay on the device.

## Language

- **The close runs in English, हिंदी or मराठी,** switchable at any time; the brand reads viraam ⇄ विराम.
- **The earlier individual app** (in `src/`, kept as history) understood about 900 phrases across English, Hinglish, Hindi and Marathi without AI, with an optional AI layer; safety always stayed on fixed rules. The close itself needs no typing to understand.

## Site map

| Path | Audience | What it is |
|---|---|---|
| `/` | Team leads, HR | The pitch: the close, how it works, and HR's "nothing to run" |
| `/start` | Team leads | Invite generator: one line, Google/Outlook/WhatsApp, QR |
| `/close/` | Employees | The close: shared countdown and the 2½-minute timeline, in English, Hindi and Marathi |
| `/workspace` | HR | HR dashboard: teams, seats, hidden teams, Friday email, six-week history, invoice |
| `/report` | HR, Finance | Week-6 report, print-ready as a one-page A4 PDF |
| `/pilot` | HR, Procurement | The offer, the six weeks, launch kit, pricing, procurement, FAQ |
| `/trust` | HR, IT, Legal | Data map, under-10 rule, roles, subprocessors, retention, DPA summary, status |
| `/safety` | Everyone | Red flags, when not to use it, review status, what the evidence supports |
| `/pm` | Product managers | Case study: problem, bets with kill criteria, metrics, what was not built, iteration log |
| `/changes` | Everyone | Dated decisions and the reasons behind them |

## Running it locally

```bash
npm install
npm test             # typecheck, build and run the test suite
npm start            # the app on 127.0.0.1, offline mode (no AI)
npm run site:app     # rebuild the hosted demo into site/app
```

Serve `site/` with any static server to preview the marketing site. In production, Vercel strips the `.html` extensions.

## Repository

| Folder | Contents |
|---|---|
| `site/close/` | The close (current product): one self-contained page, no AI, no accounts |
| `src/server` | The earlier individual-break engine (v1–v4), kept as history: five breaks, safety rules, language understanding (`lull.ts`), offline responder (`mock.ts`), optional AI providers |
| `src/web` | The employee app, translations (`i18n.ts`, `i18n-strings.ts`), reminders, pilot counting |
| `src/shared` | Contracts, the screen document model, pilot allow-list, team insights |
| `site/` | The marketing site, HR dashboard, report, trust, safety and pilot pages, plus the hosted app |
| `tests/` | ~100 automated tests: safety in every language, flows, translations, pilot rules, site syntax |
| `docs/` | BRD, case study, one-pager and pilot proposal as PDFs with their HTML sources; earlier versions in `docs/archive` |

## Deliberately not built

- **A manager or individual view.** It would break trust, and with it adoption.
- **Leaderboards, streaks or badges.** They inflate early numbers and make the data less honest.
- **SSO, HRIS sync or roster upload.** Each adds an IT approval; one link needs none.
- **AI by default.** Typed text would leave the device. It is offered as an opt-in instead.
- **Voice input.** Browser speech APIs send audio to third parties.
- **Slack or Teams apps, HRMS integrations, an admin console.** Each needs admin consent or a security review, which is exactly the burden the product removes.

## Honest status

`site/trust.html#status` is the single source of truth for what exists, including what does not exist yet: no paying customers, no lawyer-reviewed MSA, and a native-speaker review of the Hindi and Marathi safety screens still due. `site/changes.html` records every change and why it was made.

---

Built by **Rupak Ghanpathi**, product, research, safety design and build. The project was previously named *Lull* (see `/changes` for why it was renamed); some file and repository names still carry that history.
