# Lull: workplace wellbeing, built for HR teams

> A product concept by **Rupak Ghanpathi**. Lull turns an AI-guided wellbeing app into something a company can pilot, measure and buy.

**Live page:** [add your GitHub Pages link] · **Demo video:** [add your unlisted video link]

---

## The problem

HR teams are asked to support employee wellbeing, but most tools are hard to roll out, see little repeat use, and give HR either no data or data that feels like surveillance. That makes them hard to justify at renewal.

## What Lull does

Lull is the B2B layer on top of **Stillwater**, my AI-guided movement companion. Employees describe how they feel in their own words and get one short guided session. HR gets a pilot they can run and a privacy-safe view of whether it's working.

## Product decisions

| Decision | Why |
| --- | --- |
| **Team totals only; teams under 10 hidden** | HR sees adoption, never an individual |
| **6-week pilot with KPIs agreed up front** | The buyer knows what "success" means before day one |
| **12 prioritised requirements** | A clear V1, with the rest deliberately left for later |
| **Safety rules the AI can't override** | The AI interprets free text; fixed rules decide when to stop |

## Pilot success criteria

- At least **50%** of invited employees try it
- At least **1 in 3** return weekly
- **2 of 10** HR leads convert to a paid pilot

## What's in this repository

- **Landing page** for HR buyers, with a pilot request form
- **Safety page** explaining how the product handles sensitive messages
- **Pilot proposal** with indicative pricing of **₹60–120 per user per month**

Usage tracking was designed with a funnel drop-off view and two A/B tests, using sample data until a real pilot runs.

## Built on Stillwater

- Onboarding cut from **6 screens to 2 questions**
- On a **44-message test set** (written by me, not real users), correct interpretation rose from **13/44 to 44/44** and missed safety cases from **10/16 to 0**

## How it was built

Built solo with AI-assisted development: **Claude Code (CLI) in VS Code**.

---

*Lull is a concept and portfolio project, not a commercial service. Figures are from my own test set and sample data, not real users.*
