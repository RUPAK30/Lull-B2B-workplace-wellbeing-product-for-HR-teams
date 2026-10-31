# Sukoon

**Your standup has a start time. Give it an ending.**

Sukoon is the last 2½ minutes of a meeting a team already holds. A team lead pastes one line into the standup invite. As the meeting ends, everyone opens the link and starts a guided, seated movement break at the same second, in English, Hindi, Hinglish or Marathi. On Friday the lead gets one line: how many days it ran. HR's whole involvement is one yes and one invoice; there is nothing to run.

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

1. **Once:** the lead creates the team link (`/start`): team name, standup end time, which break. Out comes one invite line, a Google Calendar link, an Outlook `.ics`, a WhatsApp share and a QR code.
2. **Daily:** the link carries a wall-clock start (`?at=HHMM`). Everyone who opens it sees the same countdown and begins together. The link hosts it, not a person. `?start=1` starts at once.
3. **During:** four guided steps, seated and camera-off friendly. Typing "slower", "stop" or "मान आखडली" works mid-session, and pain in any language stops it.
4. **Friday:** one line to the lead, such as "ran 4 of 5 days, 9 people on average", and never names. A team appears only when 10 or more took part.
5. **Anytime:** individuals can still open the app and pick a break for how they feel.

## Privacy by design

- **No employee personal data.** There are no names, emails, device IDs or session records, and nothing to export or delete under the DPDP Act.
- **The under-10 rule.** A team appears only when at least 10 people took part. The next-smallest team is hidden too, so a hidden team cannot be worked out by subtraction.
- **Weekly, never daily.** One person's day of leave cannot reveal who usually takes part.
- **Aggregated, not "anonymous".** Sukoon deliberately does not claim anonymity; small-number suppression is what protects the group.
- **The only data that leaves a device** is six allow-listed team counts (`src/shared/pilot.ts`). What people type, how they feel, and every safety stop stay on the device.

## Language and understanding

- **Four input languages:** English, Hinglish, and Hindi and Marathi in Devanagari or Roman script.
- **Three display languages:** the full app runs in English, हिंदी or मराठी, more than 300 lines each. It switches automatically when someone types in Devanagari, and offers a one-tap switch for Roman Hinglish or Marathi.
- **About 900 phrases understood without AI,** covering how people feel, pain and emergencies, and mid-session requests ("slower", "stop", "I'm on a call", "how long?").
- **Optional AI layer.** A company can switch on a model such as Claude with its own API key and a written opt-in. Safety always stays on fixed rules; a model never decides whether someone is safe.

## Site map

| Path | Audience | What it is |
|---|---|---|
| `/` | Team leads, HR | The pitch: the close, how it works, and HR's "nothing to run" |
| `/start` | Team leads | Invite generator: one line, Google/Outlook/WhatsApp, QR |
| `/app/` | Employees | The break: shared start from a team link, or pick for how you feel |
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
| `src/server` | The engine: five breaks, safety rules, language understanding (`lull.ts`), offline responder (`mock.ts`), optional AI providers |
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
