# ENGINEERING.md — FundReady Engineering Operating Standard

> Read this before touching any code. This is the engineering standing brief, parallel to CLAUDE.md.

---

## Core Architecture Principle

**One assessment → one engine → many surfaces.**

There is one scoring engine (`engine.ts`). There is one assessment schema (`types.ts`). There is one eligibility engine (`loanRequirementsMap.ts`). Every dashboard, report, CreditPath surface, Access Funding page, and FORGE recommendation draws from these — never duplicates them.

Violation of this principle is the single most dangerous thing that can happen to this codebase.

---

## Deterministic First, AI Second

The platform computes readiness, scores, eligibility, and next-best-action via deterministic logic. AI (FORGE) explains, personalizes, and coaches — but never replaces the deterministic engine.

**Rule:** If a feature can be implemented with pure logic, it must be. AI is added on top — never underneath.

---

## The Four Non-Negotiables

1. **No second source of truth.** No duplicate scoring logic. No duplicate eligibility logic. No duplicate labels. One place per concept.
2. **No blind builds.** Read the governing file before writing code. The CLAUDE.md key files table is canonical.
3. **No assessment schema expansion without migration review.** Adding a new field to `UnifiedAnswers` requires a versioning posture. See `MIGRATIONS.md`.
4. **No trust-affecting changes without a preflight.** If a change could affect score display, readiness state, bankable status, capital estimates, or any user-facing claim — run the CLAUDE.md preflight first.

---

## Code Ownership Map

| Domain | Owner File(s) | What Must Not Be Duplicated |
|--------|--------------|----------------------------|
| Scoring | `engine.ts`, `types.ts` | `computeScore()`, `computeExtendedResults()`, scoring constants |
| Eligibility | `loanRequirementsMap.ts`, `fundingEligibility.ts` | `evaluateApplyReadiness()`, program route map |
| Capital Products | `fundingRequirements.ts`, `productEligibility.ts` | Program definitions, `evaluateProducts()` |
| Business Profile | `businessData.ts` | Profile sync, derived fields |
| CreditPath | `creditBlockers.ts`, `CreditPath.tsx` | Blocker categories, capacity/character logic |
| Compliance | `LenderCompliance.tsx`, `getAllAuditItems()` | Audit items, compliance scoring |
| Membership | `membership.ts` | Tier values, gate logic |
| Design Pattern | `LenderCompliance.tsx` | Row-based layout, header/counter/chevron pattern |

---

## Platform Layers (do not cross them)

```
Layer 1 — Assessment Input
  UnifiedAssessment.tsx, FoundationQuestions.tsx, types.ts

Layer 2 — Engine / Domain Logic
  engine.ts, creditBlockers.ts, loanRequirementsMap.ts,
  fundingRequirements.ts, productEligibility.ts

Layer 3 — Business Profile / Persistence
  businessData.ts, localStorage, Supabase sync (roadmap)

Layer 4 — Surfaces
  Dashboard, CreditPath, AccessFunding programs, Reports,
  Results.tsx, GettingStarted.tsx

Layer 5 — AI Explanation Layer
  FORGE prompts, report generators, coaching explanations
```

Data flows down. Layer 4 reads from Layer 2–3. Layer 5 reads from Layer 2–4. Layer 4 and 5 **never** write their own logic that belongs in Layer 2.

---

## Routing and Component Standards

- All pages are lazy-loaded via `LazyComponent` wrapper in `routes.tsx`
- Named exports only: `.then(m => ({ default: m.ComponentName }))`
- New programs must be registered in: routes, `fundingRequirements.ts`, `fundingEligibility.ts`, `loanRequirementsMap.ts`, `CapitalAccessMap.tsx`
- Membership tier: always `useState` + `membershipUpdated` event listener. **Never read statically.**

---

## Design System Rule

`LenderCompliance.tsx` is the master design pattern. All new pages must match:
- Row-based task lists
- Section headers with counters (X of Y)
- `+pts` reward signals
- Chevron on every actionable row
- Sidebar: MY TOOLS for analysis tools; primary nav for core journeys

**No isolated card dashboards that feel like a different app.** Consistency equals trust.

---

## localStorage Keys (canonical)

| Key | Value |
|-----|-------|
| `unified_assessment` | `UnifiedAnswers` object |
| `fundready_membership_tier` | `'free' \| 'virtual' \| 'live'` |
| `business_profile` | business profile sync data |
| `fundready_scan_data` | bureau scan results |

---

## Event Listeners (canonical)

| Event | Fires When |
|-------|-----------|
| `businessDataUpdated` | Business profile changes |
| `scanDataUpdated` | Bureau scan updates |
| `membershipUpdated` | Membership tier changes |
| `fundscoreUpdated` | FundScore recalculated |

---

## TypeScript and Safety Rules

- No `any` types in scoring or eligibility logic
- All new assessment fields must be added to `UnifiedAnswers` in `types.ts` first
- Never hardcode score thresholds outside `engine.ts` constants
- Content constants (FICO 160, PAYDEX 80, etc.) live in `engine.ts` or named constants — never in component JSX

---

## What Not to Build

- Features that duplicate existing engine logic
- AI explanations that contradict deterministic output
- Second routing systems
- Custom state management when localStorage + events already work
- "Quick wins" that create architecture debt

---

*See also: TESTING.md · RELEASES.md · OBSERVABILITY.md · INCIDENTS.md · MIGRATIONS.md*
