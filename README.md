# Sukoon

**A 2½-minute desk break your team will actually do. HR gets weekly proof. Never names.**

Sukoon is a B2B workplace-wellbeing product for HR and People teams at Indian companies of 30–250 people. HR shares one link per team. Employees take a guided, seated movement break between calls, in English, Hindi, Hinglish or Marathi. Every Friday, HR receives one email with team-level participation and cost, and never a single name.

[Live product](https://lull-hr.vercel.app/) · [Try the break](https://lull-hr.vercel.app/app/) · [HR dashboard](https://lull-hr.vercel.app/workspace) · [Pilot & pricing](https://lull-hr.vercel.app/pilot) · [Trust & data](https://lull-hr.vercel.app/trust) · [Product case study](https://lull-hr.vercel.app/pm)

> **Status:** pre-revenue and pilot-ready. The first six teams run free. All figures on the site are sample data from a fictional company, and every page says so.

---

## The problem

Companies pay for wellbeing benefits that most employees never use, and HR cannot prove usage without tracking individuals. Sukoon is designed around both halves of that problem:

| Who | What they need | How Sukoon answers |
|---|---|---|
| **Employee** | Under three minutes, seated, nothing to install, nobody watching | One link, no app or login; a guided 2½-minute break that works on a call with the camera off |
| **HR / People lead** | Proof of use, zero admin, no privacy risk under India's DPDP Act | A Friday email per team; no employee personal data is collected at all |
| **Finance** | A defensible cost and a clear stop rule | Seat-based pricing, cost per person who took part, and a week-6 report that can recommend fewer seats |

## The product, end to end

1. **One link per team.** No download, account, roster, HRIS or SSO. Setup takes about ten minutes.
2. **The break.** The employee says how they feel, by tapping or typing in any of four languages. Sukoon suggests one of five breaks: neck and shoulders, back, energy, calm, or eyes and wrists. Each is four guided steps, seated or standing.
3. **Safety first.** Pain, feeling unwell or emergency symptoms, in any language, stop the session immediately. Sukoon never suggests movement around pain, and an emergency points to 112.
4. **The Friday email.** HR sees, per team, how many people started and finished, plus the cost per person who took part.
5. **The week-6 report.** A one-page A4 PDF in the format Finance reads, including a recommendation: continue, reduce seats, or stop.

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
| `/` | HR | The pitch: product view (HR dashboard · Friday email · privacy), why/how/when, who sees what |
| `/app/` | Employees | The real 2½-minute break, running in demo mode |
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

## Honest status

`site/trust.html#status` is the single source of truth for what exists, including what does not exist yet: no paying customers, no lawyer-reviewed MSA, and a native-speaker review of the Hindi and Marathi safety screens still due. `site/changes.html` records every change and why it was made.

---

Built by **Rupak Ghanpathi**, product, research, safety design and build. The project was previously named *Lull* (see `/changes` for why it was renamed); some file and repository names still carry that history.
