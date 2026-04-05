# TESTING.md — FundReady Testing Standards

> Every change that touches scoring, eligibility, readiness signals, or trust-affecting copy requires test coverage before shipping.

---

## Testing Philosophy

**Deterministic logic must be provably correct.** The scoring engine, eligibility engine, and readiness logic are the trust core of the platform. A wrong score or wrong eligibility result is not a UI bug — it is a trust failure. These must be tested deterministically.

**AI explanations are tested for tone, not exact output.** FORGE outputs are evaluated against behavioral benchmarks (calm, non-judgmental, accurate framing), not character-exact matching.

**Trust-affecting surfaces require smoke tests after every deploy.** See RELEASES.md.

---

## Test Categories

### 1. Engine Unit Tests (required)

Cover `engine.ts` computations:

- `computeScore()` — test across score bands (0–199, 200–399, 400–599, 600–799, 800–1000)
- `computeExtendedResults()` — test each output field
- DSCR calculation — below/at/above 1.25x boundary
- DTI calculation — below/at/above 43% boundary
- Bankable status transitions — what inputs cause status changes
- Capacity blocker triggers — all 4 blocker categories
- FundScore → product eligibility mapping

**Required test fixture pattern:**

```typescript
// fixtures/assessmentFixtures.ts
export const STRONG_PROFILE: UnifiedAnswers = { ... }
export const WEAK_PROFILE: UnifiedAnswers = { ... }
export const BORDERLINE_PROFILE: UnifiedAnswers = { ... }
export const DENIED_PROFILE: UnifiedAnswers = { ... }
```

### 2. Eligibility Unit Tests (required)

Cover `loanRequirementsMap.ts` and `productEligibility.ts`:

- Each program's `evaluateApplyReadiness()` — test "ready", "not ready", and "borderline" states
- `evaluateProducts()` — test product unlock at FundScore boundaries
- Program route map — no duplicate routes, no missing registrations

### 3. Integration Tests (required for scoring changes)

- Full assessment flow: input → score → results display
- Profile sync: assessment save → `businessData.ts` sync → dashboard reflects update
- Membership gate: free/virtual/live tier changes → correct pages unlock/lock
- CreditPath blockers: assessment answers → correct blockers surface

### 4. Smoke Tests (required after every deploy)

Run after every production deployment. See RELEASES.md for trigger.

Manual checklist:
- [ ] Assessment completes without console error
- [ ] FundScore displays on Results page
- [ ] CreditPath loads with at least one blocker or "all clear"
- [ ] Access Funding page loads with at least one program
- [ ] Dashboard loads with business profile data
- [ ] Getting Started renders all 3 goals
- [ ] No broken routes (404s) in primary nav

### 5. Behavioral / Copy Tests (spot-check)

After any copy or UX change:
- [ ] No guarantee language ("you will get", "guaranteed approval", "minimum $X")
- [ ] No exact outcome promises
- [ ] Score displays show "estimate" or equivalent qualifier
- [ ] Readiness language uses "may", "typically", "lenders look for" framing

---

## Test Fixtures Location

```
/fixtures/
  assessmentFixtures.ts     — UnifiedAnswers test profiles
  scoringFixtures.ts        — expected score outputs per profile
  eligibilityFixtures.ts    — expected program readiness per profile
```

---

## What Triggers a Required Test Run

| Change Type | Tests Required |
|-------------|---------------|
| `engine.ts` changes | Engine unit tests + integration |
| `types.ts` schema change | Engine unit tests + migration review |
| `loanRequirementsMap.ts` | Eligibility unit tests |
| `fundingRequirements.ts` | Eligibility unit tests + smoke |
| Score display / Results page | Smoke + behavioral copy check |
| Membership gate changes | Integration tests |
| Any deploy to production | Full smoke test checklist |

---

## What Not to Test

- Component rendering for non-logic UI (styling, spacing)
- AI-generated text exact match
- Third-party library internals
- Build-time type errors (TypeScript catches these at compile)

---

## Known Gap (to fix)

As of the current build, there is no automated test suite. The smoke test checklist above is the current operational baseline. Automated unit tests for `engine.ts` and `loanRequirementsMap.ts` are Phase 1 priority before monetization activation.

---

*See also: ENGINEERING.md · RELEASES.md · OBSERVABILITY.md*
