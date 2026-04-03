# PROJECT_PREFLIGHT.md
# Mandatory preflight process for every non-trivial FundReady task.
# Claude must complete this before answering, building, designing, editing, refactoring,
# or recommending anything that affects the FundReady platform.

---

## Purpose

This file defines the mandatory preflight process Claude must follow before taking action on
any non-trivial FundReady task.

The goal is to prevent drift, preserve trust, and keep all work aligned with the existing
product, architecture, scoring, UX, copy, analytics, and monetization systems.

---

## Core rule

**No non-trivial task may begin until the preflight is complete.**

A non-trivial task includes anything that affects:
- user experience
- copy or messaging
- product logic
- reports
- dashboard behavior
- scoring
- AI behavior
- analytics
- upgrade/gating
- architecture
- persistence
- admin or operations surfaces

---

## Required preflight checklist

Before starting any non-trivial task, Claude must identify and review each of the following:

---

### 1. Governing docs

Which source-of-truth files apply to this task:

| Doc | Apply if... |
|-----|-------------|
| `CLAUDE.md` | Always |
| `PROJECT_GOVERNANCE.md` | Always |
| `PROJECT_PREFLIGHT.md` | Always (this file) |
| `PRODUCT.md` | Product logic, UX, personas, user states |
| `COPY.md` | Any copy, messaging, labels, CTA text |
| `ARCHITECTURE.md` | System design, routing, component boundaries |
| `DB.md` | Schema, persistence, Supabase, localStorage |
| `SCORING.md` | Score computation, thresholds, interpretation |
| `SECURITY.md` | Auth, permissions, data handling |
| `EVALS.md` | AI behavior, FORGE prompts, model outputs |
| `PERSONAS.md` | User persona specifics (if present) |
| `FLOWS.md` | Onboarding, journey, conversion flows (if present) |
| `API.md` | External integrations (if present) |
| CreditPath docs | Any CreditPath module work (if present) |
| Relevant ADRs | Architecture decision records for the affected area |
| Founder/persona docs | Behavioral principles, operating profile docs |

---

### 2. Personas affected

Which user types are impacted by this task:

- First-Time Strategic Applicant
- Denied but Viable Owner
- Growth-Oriented Operator
- Overlooked or Underserved Founder
- Advisor / Channel Partner
- Lender / Capital Ecosystem Partner
- Any additional domain-specific persona if relevant

---

### 3. User states affected

Which product states are impacted:

- `visitor`
- `assessment_started`
- `assessment_completed`
- `score_revealed`
- `roadmap_generated`
- `module_progress_active`
- `bankable_candidate`
- `application_ready`
- `upgraded_virtual`
- `upgraded_live`
- `advisor_managed`
- `partner_referred`
- Any CreditPath states if relevant

---

### 4. System surfaces affected

Which product surfaces are touched:

- Landing page / marketing
- Assessment (foundation + readiness)
- Dashboard (FundScore, SBSS, capital roadmap, goals)
- Goals (01, 02, 03)
- FundScore surfaces
- Bankable / SBSS surfaces
- Status Reports (Bankable Status, Estimated Funding, Business FICO, Personal Credit)
- Compliance modules (Lender Compliance)
- Capital Path / Access Funding
- FORGE AI (Coach, prompt registry, intent routing)
- Upgrade / paywall / membership gates
- Settings / admin / ops
- Analytics / eventing
- CreditPath surfaces if present

---

### 5. Logic and data affected

Which underlying systems are touched:

- `computeScore()` in `engine.ts`
- `computeExtendedResults()` in `engine.ts`
- `evaluateProducts()` in `productEligibility.ts`
- `computeBankableItems()` in `engine.ts`
- Capital estimate logic (funding range, median calc)
- Bankable items / SBSS logic
- Recommendation logic
- Persistence (localStorage, Supabase)
- localStorage / Supabase adapters
- Typed analytics events
- Reports output
- AI prompt/response behavior (FORGE)

---

### 6. Trust and messaging implications

Which trust/copy rules apply:

- Clarity before complexity
- Trust before conversion
- Momentum before depth
- Guidance before judgment
- Visible progress at all times
- No overpromising
- No guarantee language
- No shame-based framing
- No manipulative pressure
- Estimate language clearly framed as estimates
- Approval vs. estimate distinction maintained

---

### 7. Risk implications

Determine whether the task has any of:

| Dimension | None | Possible | Direct |
|-----------|------|----------|--------|
| Scoring / versioning impact | | | |
| Historical data interpretation impact | | | |
| Monetization / gating impact | | | |
| Analytics / eval impact | | | |
| Security / compliance impact | | | |

---

## Required preflight output

Claude must begin each non-trivial task with this block:

```
#### Preflight
- Task:
- Relevant docs reviewed:
- Affected personas:
- Affected user states:
- Affected surfaces:
- Affected logic/data:
- Trust/copy implications:
- Scoring/versioning impact: none | possible | direct
- Monetization/gating impact: none | possible | direct
- Analytics/eval impact: none | possible | direct
- Security/compliance impact: none | possible | direct
- Risk level: zero | low | medium | high
- Recommended posture: proceed | verify first | versioned | do not proceed yet
```

---

## Risk classification

### Zero
Docs-only, comments-only, or isolated non-behavioral cleanup.
No user-facing change, no logic change, no schema impact.
Examples: updating a comment, renaming a non-exported constant, fixing a typo in a doc file.

### Low
Additive, backward-compatible work. No scoring semantic change. No meaningful production-risk surface.
Examples: adding an analytics event, improving a label, adding a diagnostic log, correcting a UI typo.

### Medium
Visible product behavior change, logic interpretation change, scoring-adjacent work, or changes
requiring strong verification before shipping.
Examples: changing Goal 02 metric display, updating bankable item logic, modifying AI response,
changing upgrade timing, new report behavior, additive persistence.

### High
Scoring semantics, thresholds, historical interpretation, schema-sensitive migrations, auth
changes, or cross-system logic rewrites.
Examples: changing SBSS threshold, modifying computeScore() weights, altering fundingRange calc,
schema migration, major monetization architecture change.

---

## Harmony rule

Every task must be checked for alignment with:

- FundReady's product thesis (capital-readiness platform, not lead gen)
- The lender-readiness progression model (01 → 02 → 03)
- The behavioral fintech architect principles (Fogg · Zhuo · Elon · Chase Hughes)
- One-engine / one-source-of-truth architecture
- Dashboard / Reports / Compliance / FORGE consistency
- Monetization timing (trust first, conversion second)
- Trust and emotional safety
- Analytics coverage
- Security and compliance guardrails

If the task affects one area but may create drift in another, Claude must say so
explicitly before proceeding.

---

## Implementation rule

Claude must prefer:
- Extending existing logic over creating parallel logic
- Reusing current domain outputs (`computeExtendedResults`, `evaluateProducts`, etc.)
- Reusing typed event patterns
- Reusing current scoring/versioning structures
- Reusing current report and dashboard surfaces
- Additive changes over replacements

Claude must avoid:
- Parallel logic or duplicate constants/labels
- Copy drift from `COPY.md` standards
- Disconnected upgrade states
- Hidden logic in UI components
- AI replacing deterministic engine logic
- Second sources of truth

---

## Stop conditions

Claude must stop and not proceed if:

- The relevant source-of-truth file has not been inspected
- The task may affect scoring/history and no versioning posture is defined
- The task introduces a second source of truth
- The task creates cross-surface drift with no resolution plan
- The trust risk is unclear
- The live system and local code may be out of sync and that matters to the task
- The task contradicts the platform's product thesis or governance principles

When stopped, Claude must identify what needs to be inspected or clarified, and only then continue.
