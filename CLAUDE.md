# CLAUDE.md — FundReady AI Operating Manual
# Read this before every task. This is the standing brief for every session.
# Also read: PRODUCT.md (product intelligence) and COPY.md (messaging standards)

---

## PRODUCT IDENTITY
**FundReady / FORGE**

FundReady is a capital-readiness intelligence platform — not a loan broker, lead gen funnel, or education portal.
FORGE is the AI engine: readiness analyst, funding-path strategist, lender-signal interpreter, progress coach.

**Core promise:** Help businesses see how lenders see them, fix what matters most, and unlock better capital outcomes.
**North star:** We build fintech software that makes the right financial action feel clear, safe, and worth taking.

**Primary personas (in order):**
1. First-Time Strategic Applicant — never applied, wants to do it right the first time
2. Denied but Viable Owner — rejected before, needs diagnosis + recovery path
3. Growth-Oriented Operator — ready for better capital, needs the progression path
4. Underserved Founder — needs trust, literacy, and structure
5. Advisor / Channel Partner — needs a repeatable system for clients

**Market thesis:** The market is not "business loans." It is the gap between businesses that need capital and businesses that are actually lender-ready. FundReady closes that gap at scale.

---

## WHO I AM BUILDING FOR

**Kevin — The Behavioral Fintech Architect**

A first-principles fintech product leader who combines behavior design, trust-centered UX,
influence psychology, and aggressive systems thinking to build software that changes
financial behavior at scale.

One-sentence standard:
> **We build fintech software that makes the right financial action feel clear, safe, and worth taking.**

---

## PERSONA FRAMEWORK (weighted operating model)

| Layer | Source | Weight | What It Controls |
|---|---|---|---|
| Behavior Mechanics | BJ Fogg | 30% | Prompts, friction removal, momentum, habit loops |
| Product Clarity | Julie Zhuo | 25% | Every screen answers: what, why, what next, what do I get |
| Systems Thinking | Elon Musk | 25% | First principles, rebuild don't patch, aggressive ambition |
| Influence & Perception | Chase Hughes | 20% | Framing, resistance detection, emotional calibration |

---

## THE FOUR THINGS EVERY FEATURE MUST DO

1. Remove friction from money decisions
2. Increase trust fast
3. Drive the next right user action
4. Turn financial anxiety into confident progress

---

## PRODUCT DESIGN COMMANDMENTS

### Every screen must answer four questions
- What is this?
- Why does it matter?
- What should I do next?
- What happens if I do it?

### Sequence principle (Fogg)
1. Low-friction first action
2. Quick value reveal
3. Trust reinforcement
4. Guided next commitment
5. Deeper data collection only after momentum

### Writing standard
- Clear, direct, calm, credible, human, non-judgmental
- Fear of loss before action sections (one sentence, not paragraphs)
- Guide voice, not compliance interrogation voice

### Design standard (Julie Zhuo)
- Simpler hierarchy always wins
- Progress must be visible at all times
- Confidence-building UI copy
- Less cognitive overload at sensitive steps (KYC, document upload, application)

### Influence standard (Chase Hughes)
- One sentence of fear-of-loss or identity anchoring BEFORE each action section
- Detect hesitation states in the UI — if a user might feel judged, reframe
- Never manipulate; always guide
- Persuasion serves trust, not conversion metrics alone

---

## USER PSYCHOLOGY MODEL

**What users feel coming in:**
overwhelmed · skeptical · embarrassed · uncertain · hopeful but guarded · afraid of rejection

**What the platform must make them feel:**
understood · safe · informed · capable · supported · empowered · optimistic

---

## PLATFORM RULES — FUNDREADY SPECIFIC

### Design system
- **Lender Compliance is the master design pattern.** Row-based task lists, section headers,
  progress counters (X of Y), +pts reward signals, chevron on every actionable row.
- **All new pages must match this visual language.** No isolated card dashboards that feel
  like a different app. Consistency = trust.
- Sidebar: MY TOOLS section contains reporting/analysis tools. Primary nav contains core journeys.

### Data rules
- User data lives in `localStorage.unified_assessment` — never hardcode values
- Compliance progress from `getAllAuditItems()` — always live
- Listen for: `businessDataUpdated`, `scanDataUpdated`, `membershipUpdated`, `fundscoreUpdated`
- localStorage key for membership: `fundready_membership_tier` (values: 'free' | 'virtual' | 'live')

### Membership gate logic
- `free` → Goal #1 only (scan + initial funding)
- `virtual` → Goal #2 unlocked (compliance modules + Optimize Reporting)
- `live` → Goal #3 (done-for-you + live coach)
- Gate component: `<UpgradeGate />` in pages that require paid tier
- Membership tier must be in `useState` with `membershipUpdated` event listener — never read statically

### Routing pattern
- Lazy loaded via `LazyComponent` wrapper in `routes.tsx`
- Named exports only — `.then(m => ({ default: m.ComponentName }))`
- New programs: add to routes, fundingRequirements.ts, fundingEligibility.ts,
  loanRequirementsMap.ts, CapitalAccessMap.tsx

### Funding program rules
- **Additive only** on existing program pages — never remove or replace existing content
- Programs 1–19 defined in `fundingRequirements.ts`
- Apply-readiness logic in `loanRequirementsMap.ts` — one truth function drives everything
- `CapitalAccessMap.tsx` has independent `productList` with `minScore` (0–1000 FundScore scale)

### Content rules
- FICO SBSS bankable threshold: **160** (not 140)
- D&B PAYDEX: 70 = vendor credit, 80 = full strength
- Inquiry window: **6 months** (max 4 total, max 2 revolving) — not 30 days
- Debt-to-limit: 45% max per card AND aggregate; 19% optimal
- Pay tradelines **early** (D&B: 10 days early; Experian: 5–10 days early)

---

## FOUNDER DECISION FILTERS

Before shipping any feature, run it through all four:

**User filter:** Does this make the next action easier, clearer, faster, or safer?
**Trust filter:** Does this increase confidence or create doubt?
**Revenue filter:** Does this improve activation, retention, conversion, or efficiency?
**Systems filter:** Does this fit the broader user journey, or is it another isolated feature?
**Simplicity filter:** Can this be explained in one or two sentences?

---

## WHAT THE PLATFORM MUST ALWAYS DO

1. Diagnose the user's position clearly
2. Reveal the next best action
3. Reduce perceived difficulty
4. Reinforce trust at each stage
5. Create measurable progress

## WHAT THE PLATFORM MUST NEVER FEEL LIKE

- A confusing loan marketplace
- A cold compliance portal
- A generic dashboard
- A one-time transaction tool
- An experience that punishes users for not knowing enough

---

## WATCHOUTS — AVOID THESE

- Over-engineering before the user validates it
- Using persuasion in a way that feels manipulative
- Optimizing conversion while damaging trust
- Expecting users to think like operators
- Building disconnected features instead of coordinated journeys
- Reading membership tier statically (always use useState + event listener)

---

## DAILY OPERATING QUESTIONS

- Where are users getting stuck right now?
- What belief is preventing action?
- What step can be made easier today?
- What part of the experience feels unclear or unsafe?
- What system should be redesigned instead of patched?
- What action matters most this week?

---

## TECH STACK REFERENCE

- React + TypeScript + Vite
- React Router v7 (lazy loading)
- Tailwind + inline styles (inline styles = single source of truth for design system)
- Supabase (auth, profiles table, platform_config table)
- Vercel CI/CD → fundreadyai.com (GitHub push → auto-deploy)
- GitHub repo: Fundabl2025/FundablSaasfinancingsystem

---

## KEY FILES

| File | Purpose |
|---|---|
| `src/app/components/Sidebar.tsx` | Nav, MY TOOLS section, membership badge |
| `src/app/utils/loanRequirementsMap.ts` | Apply-readiness engine for all programs |
| `src/app/utils/fundingRequirements.ts` | 19 funding programs, eligibility objects |
| `src/app/utils/fundingEligibility.ts` | programRoutes, deriveFromUnifiedAssessment, PROGRAM_MAX_AMOUNT |
| `src/app/pages/CapitalAccessMap.tsx` | FundScore-based product unlock map |
| `src/app/pages/OptimizeReporting.tsx` | Bureau roadmap, paid gate, dynamic data |
| `src/app/lib/membership.ts` | getMembershipTier, canAccessGoal2, setMembershipTier |
| `src/app/pages/LenderCompliance.tsx` | Master design pattern — all new pages match this |
| `src/css/theme.css` | Design tokens, mobile responsive CSS |
