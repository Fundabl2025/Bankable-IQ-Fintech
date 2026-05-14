# BANKABLE-IQ-ENGINEERS-PDR.md
**Engineer's Product Design Requirements — Bankable IQ Software Platform**

- **Date compiled:** 2026-05-12
- **Compiled by:** agent-bankableiq + agent-orchestrator (Director 17 engineering authority + Director 13 final approval)
- **Audience:** Engineers (current Bankable IQ devs, future hires, contractors), agent-bankableiq, agent-tests, agent-reviewer
- **Status:** v1.0. Living document — updated as the system evolves.

**Pairs with:**
- `BANKABLE-IQ-FEATURE-INVENTORY.md` — feature status snapshot
- `BANKABLE-IQ-ROADMAP.md` — 6-sprint forward plan
- `SCORING-ARCHITECTURE.md` — the three-layer scoring spec
- `audits/2026-05-08-vite-production-readiness.md` — current technical state (9 P0 + 7 P1 + 6 P2)
- `audits/2026-05-08-vite-remediation-roadmap.md` — sequenced remediation
- `brand-assets/BANKABLE-OPERATING-MODEL.md` — business context

---

## 1. Executive Summary

Bankable IQ is a React/Vite SPA deployed on Vercel that diagnoses a small business's "bankability" (loan-readiness in the eyes of institutional lenders), prepares it through staged operational improvements, and routes it through a series of capital products to grow from foundation to institutional-grade access.

**Codebase:** ~250 TypeScript/TSX files in `src/`, ~50 lender-compliance modules under `/app/lender-compliance/*`, ~50+ funding product modules under `/app/access-funding/*`, plus auth, dashboard, intake, and shared library code. One serverless function (`api/bolt-proxy.ts`) on Vercel.

**Key engine:** `src/app/pages/business-assessment/engine.ts` — `computeScore()` is the single canonical scoring function. ~1,000 lines. 15 call sites. **Director 17 sacred rule: do not modify without explicit review noted in commit message + golden test suite passing.**

**Data layer:** Supabase for auth + persistence. GoHighLevel (GHL) for CRM, contact lifecycle, and 89 custom fields capturing intake + advisor + financial data. Stripe billing lives in GHL, not in the Vite app.

**Critical state:** 9 P0 production blockers as of May 8 audit; 2 closed (`dist/`, `node_modules/` untracked), 7 remaining including secret rotation (P0-1) and brand sweep (P0-3 through P0-7).

**Launch target: 2026-05-29**, 500-member Founding Cohort of Capital Advisors.

---

## 2. Business Context

### 2.1 The Core Thesis
Less than 1% of US small businesses are "bankable" — able to walk into a bank and qualify for institutional capital on standard terms. Bankable IQ codifies underwriting logic into software:
- The **Bankable Score™** (the measurement)
- The **Bankable Decision Engine™** (the routing — partially built)
- The **Bankable Playbook System™** (the prescription — partially built)
- The advisor curriculum (the human layer — under construction)

### 2.2 What the Platform Replaces
1. The single-expert dependency
2. The "stack and pray" application strategy
3. The advisor-recruitment churn loop

### 2.3 Who Uses It
| Audience | Role |
|----------|------|
| Business Owners | Run the assessment, see Bankable Score, get Capital Growth Plan |
| Capital Advisors | Guide owners; manage 20-30 clients simultaneously |
| Capital Hub Leaders | Manage a hub of advisors; revenue-share economics |

---

## 3. Architecture Overview

### 3.1 High-Level Diagram
```
CLIENT (BROWSER) — Vite SPA, React, TypeScript
       │
  ┌────┼────────────────────┐
  │    │                    │
Supabase  api/bolt-proxy.ts   Future: Plaid + Anthropic + Stripe + GHL hook
Auth+Data  (Vercel serverless)
               │
           Bolt API (underwriting partner)
```

### 3.2 Routing Layer (`src/app/routes.tsx`)
| Route | Purpose | Auth Required |
|-------|---------|--------------|
| `/` | Landing page | No |
| `/business-assessment` | Unified intake | No |
| `/business-assessment/results` | Post-intake results + score + pathway | No (anonymous-friendly) |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Auth flows | No |
| `/app/*` | Logged-in surfaces | Yes (AuthRequired wrapper) |
| `/app/access-funding/*` | 50+ funding product modules | Yes |
| `/app/lender-compliance/*` | 50+ compliance modules | Yes |
| `*` (catch-all) | Redirect to `/` | — |

### 3.3 Build & Deploy
- Build tool: Vite (`vite.config.ts`)
- Deploy target: Vercel SPA mode
- Cache strategy: `vercel.json` sets `no-cache, no-store, must-revalidate` on every non-asset response
- One serverless function: `api/bolt-proxy.ts`
- Vite config aliases `NEXT_PUBLIC_*` → `VITE_*` for forward-compatibility with planned Next.js migration (Sprint 3)

### 3.4 Environment Variables
| Variable | Where used | Required |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` | Supabase client init | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY` | Supabase client init | Yes |
| `BOLT_BROKER_TOKEN` | `api/bolt-proxy.ts` (server-only) | Yes |
| `PLAID_CLIENT_ID` + `PLAID_SECRET` + `PLAID_ENV` | (planned, Sprint 1+2) | future |
| `ANTHROPIC_API_KEY` | (planned, Sprint 2) | future |
| `GHL_PIT_TOKEN` + `GHL_LOCATION_ID` | (planned, webhook integration) | future |

> **Security note (P0-1):** `BOLT_BROKER_TOKEN` was leaked in a public docs file AND baked into a stale dist/ bundle. P0-2 and P0-3 are closed. P0-1 (token rotation) **remains pending Kevin's action.**

---

## 4. Core Engine — Scoring

### 4.1 Single Source of Truth
`src/app/pages/business-assessment/engine.ts` (~1,000 lines)

```typescript
export function computeScore(data: UnifiedAnswers): ScoreResult
export function computeExtendedResults(data: UnifiedAnswers): ExtendedResults
export function getBand(score: number): ScoreBand
export function calculatePartialScore(data: Partial<UnifiedAnswers>): number
export const SCORING_VERSION: string  // currently 'v1.1'
```

### 4.2 Three-Layer Scoring Architecture
| Layer | Range | Audience | Purpose |
|-------|-------|---------|---------|
| Client (Bankable Score™) | 0-100 | Business owner | Single intuitive number |
| Operator (FundScore) | 0-1000 | Capital Advisor | Granular operator-grade detail |
| Lender (FICO SBSS) | 0-300 | Banker-facing artifacts | Aligns with institutional underwriting |

**Canonical transform:** `bankableScore = round(fundScore / 10)`

> **⚠️ P1-2 (audit finding):** The 0-100 transform is NOT yet implemented. `bankableScore` variable currently holds the 0-300 SBSS value. Fix in Sprint 0.5.

### 4.3 The 4 Weighted Components of SBSS Proxy
```
Personal Credit         35%
Business Financials     30%
Business Profile        20%
Business Credit         15%
─────────────────────────
Total                   100%
```
> Weights are based on the canonical SBSS algorithm. **NOT to be changed without Director 10 + Director 17 review.**

### 4.4 Internal Helpers
- `calculateNAPScore` — Name/Address/Phone consistency check
- `computeSBSSSections` — section-by-section breakdown for operator view

### 4.5 Call Sites (15 — must coordinate any refactor)
`Sidebar.tsx`, `ComplianceModulePage.tsx`, `TopNav.tsx`, `fundingEligibility.ts`, `Results.tsx`, `MyProgress.tsx`, `Finances.tsx`, `StatusReports.tsx`, `AICoach.tsx`, `DenialDiagnosis.tsx`, `GettingStarted.tsx`, `creditBlockers.ts`, `CreditPath.tsx`, `Dashboard.tsx`, `_archive/...`

### 4.6 Second Source of Truth — CRITICAL P1-2 Violation
`src/app/utils/businessData.ts` has a separate function:
```typescript
function calculateFicoSBSS(): number {
  return 80 + completedPoints  // DIFFERENT math from engine.ts
}
```
**Resolution (Sprint 0.6):** Deprecate `calculateFicoSBSS()`, redirect all callers to `engine.ts`.

### 4.7 Scoring Engine Sacred Rules (Non-Negotiable)
1. No casual changes to `computeScore()`. Every change requires Director 17 review in commit message.
2. No new source of truth. Never compute score a different way for a different surface.
3. **21 golden test cases must pass.** Spec in `bankable-iq/build/scoring-normalization-spec.md`.
4. Failing a golden case is a hard stop — never adjust expected value to make it pass.
5. `SCORING_VERSION` must be bumped on any algorithm change.

---

## 5. Data Model

### 5.1 Storage Tiers
| Tier | What's stored | Where |
|------|--------------|-------|
| Anonymous session | In-progress intake answers | LocalStorage |
| Authenticated user | Saved intake, score history, documents | Supabase (Postgres) |
| CRM-side | Contact lifecycle, scoring summaries, advisor relationships | GoHighLevel (89 custom fields) |
| Audit/operational | Build artifacts, audit reports | Fundabl-OS/ (private docs) |

### 5.2 Key TypeScript Types
```typescript
interface UnifiedAnswers {
  personalCredit: {
    experian: number; equifax: number; transunion: number
    bankruptcy: boolean; judgmentsLiensChargeoffs: boolean
  }
  businessFinancials: {
    monthlyRevenue: number; monthlyCashFlow: number
    fundingNeeded: number; debtObligations: string
  }
  businessProfile: {
    entityType: 'LLC' | 'CCorp' | 'SCorp' | 'SoleProp' | 'Partnership'
    yearsInBusiness: number; industry: string; state: string
    napConsistency: NAPCheckResult
  }
  businessCredit: {
    hasEIN: boolean; napScore: number; creditBureaus: BureauProfile[]
  }
}

interface ScoreResult {
  fundScore: number       // 0-1000 (operator)
  sbssScore: number       // 0-300 (lender)
  bankableScore: number   // 0-100 (client — Sprint 0 adds this)
  band: 'Not Bankable' | 'Emerging' | 'Conditionally' | 'Bankable' | 'Highly Bankable'
  scoringVersion: string
  componentBreakdown: {
    personalCredit: number; businessFinancials: number
    businessProfile: number; businessCredit: number
  }
}
```

### 5.3 GHL Custom Fields (89 total)
See `ghl-inventory/custom-fields.txt` (73 existing) + `ghl-inventory/new-fields-2026-05-12.txt` (16 new).

Critical fields: Bankable Score, Capital Readiness Phase, Persona Type, Capital Tier, Membership Tier, 30+ Q-prefixed intake fields (Q3–Q29).

### 5.4 Data Flow on Intake Submission
1. User completes intake → `UnifiedAnswers` object
2. `computeScore(answers)` → `ScoreResult`
3. Supabase save: write answers + score to user's row
4. *(PLANNED Sprint 0.9)* Webhook → GHL contact create/update
5. *(PLANNED Sprint 0.10)* Capital Growth Plan PDF rendered via `@react-pdf/renderer`

---

## 6. Component Inventory

### 6.1 Funding Product Modules (50+, `/app/access-funding/*`)
Each reads `ScoreResult` from context, checks eligibility, renders product details, opens `FundingApplicationModal.tsx` if eligible.

Built: `AccessFundingMain`, `AccountsReceivableFinance`, `BridgeLoans`, `BusinessCreditCards`, `BusinessCreditLine`, `BusinessFICO`, `BusinessTermLoan`, `ConstructionLoans`, `CreditUnionLoans`, `DSCRLoans`, `EquipmentFinancing` (+ 40+ more)

### 6.2 Compliance Modules (50+, `/app/lender-compliance/*`)
`ComplianceModulePage`, `BuildingCredit`, `CapitalAccessMap`, `CapitalGlossary`, `DenialDiagnosis`, `DocumentCollection`, `EntityFilings`, `EstimatedFunding` (+ 40+ more). Each renders score-aware guidance.

### 6.3 Logged-In Surfaces (`/app/*`)
`Dashboard.tsx`, `MyProgress.tsx`, `Finances.tsx`, `StatusReports.tsx`, `CreditPath.tsx`, `GettingStarted.tsx`, `AICoach.tsx`, `Phones411.tsx`

### 6.4 Intake (`/business-assessment`)
- `UnifiedAssessment.tsx` — 36 questions (target 47)
- Ad-hoc conditional logic (Sprint 0.8 fixes to declarative)
- Component-level validation only (Sprint 0.8 fixes with zod)

### 6.5 Results (`/business-assessment/results`)
- `Results.tsx` — post-intake reveal
- Shows: Bankable Score (currently 0-300, will be 0-100 in Sprint 0.5), tier, pathway, top 5 gaps
- **⚠️ Contains banned phrase "You qualify for capital" (P0-6 — fix Sprint 0.4)**

---

## 7. Integrations

| Integration | Status | Notes |
|------------|--------|-------|
| Supabase | Live | Auth + persistence. P1-5: silent-stub fallback risk |
| Bolt broker API | Live | `api/bolt-proxy.ts`. P0-1: token needs rotation |
| Plaid | Not built | Sprint 1.1 (sandbox) → Sprint 2.1 (production) |
| Anthropic API / AI Coach | Templated only | Live API planned Sprint 2.2; model `claude-sonnet-4-5` |
| GoHighLevel | Not integrated | Webhook planned Sprint 0.9 |
| Stripe | N/A | Lives in GHL, not Vite. In-app billing Sprint 5.4 |
| HUSL FI | Out of scope | Permanent Rule lock 2026-05-06 |

---

## 8. Auth & Access Control

### 8.1 Auth Flow
- Anonymous intake → signup/login required to save progress
- Supabase auth + Supabase-managed sessions
- `AuthRequired` wrapper gates all `/app/*` routes

### 8.2 Multi-Tenant Model (4 tiers)
| Tier | Role | Permissions |
|------|------|------------|
| Platform Admin (Superadmin) | Kevin + ops | Full platform access |
| Capital Hub Leader (Agency) | Agency owner | Their hub's advisors + clients |
| Capital Advisor (Accountant) | Individual advisor | Their assigned clients only |
| Business Owner (Consumer) | End customer | Their own data only |

> Internal role names still use legacy names. Sprint 3.4 refreshes to external names.

### 8.3 Permissions Matrix
Currently ad-hoc per page. Formal RBAC matrix planned Sprint 4.1.

---

## 9. Compliance Enforcement

### 9.1 The Compliance Posture
Bankable IQ is an **information and education service**. It is NOT a lender, broker, credit repair organization, or financial advisor.

### 9.2 Banned Phrases (Director 11 Permanent Rules)
- No "qualify" without a modifier
- No "guaranteed approval" / "we'll get you funded" / "100% approval" / "instant funding"
- No "pre-approved" without "not"
- Income claims always disclaimed
- Estimates labeled as estimates
- AI explanations never definitive financial advice
- No "CLARION AI" (retired product name)
- No `fundreadyai.com` (retired domain)
- No "FundReady" / "FundScore" in customer-facing copy

### 9.3 Enforcement Layers
| Layer | What it does | Where |
|-------|-------------|-------|
| Pre-commit gate | Blocks commits with banned phrases | Fundabl-OS/local-agent-rig/ |
| Runtime sanitizer | Filters AI Coach output | `src/app/lib/ai/guardrails.ts:checkForgeOutput()` |
| `GLOBAL_FORBIDDEN_CLAIMS` | Static phrase list | `src/app/lib/ai/guardrails.ts` |

### 9.4 Known Current Violations (Sprint 0 fixes)
| Location | Violation | Severity |
|----------|----------|---------|
| `Results.tsx` | "You qualify for capital" | P0 |
| Various components | "qualify for X products" | P0 |
| `docs/PHASE_1_PLAN.md` | Bolt token in plaintext + "guaranteed approval" / "instant funding" | P0 |
| Most UI strings | "FundReady" / "FundScore" branding | P0 |
| Hardcoded sender | `support@fundreadyai.com` | P0 |

---

## 10. Testing Strategy

### 10.1 Current State
**Zero automated tests.** No Vitest, Jest, Cypress, or Playwright. Closest: `scripts/eval-scoring.ts` (5 persona fixtures).

### 10.2 Sprint 0.7 Build-Out
```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
```
Wire `vitest.config.ts` to `tsconfig.json` paths. Add `npm test` + `test:watch` scripts.

### 10.3 21 Golden Scoring Test Cases
Spec: `bankable-iq/build/scoring-normalization-spec.md`
- 5 client profile boundary conditions
- 6 stage transitions
- 5 capital pathway routings
- 5 edge cases (missing data, conflicting answers, max/min scores, NAP failures)

**Rule: If a golden test fails, never adjust the expected value. The failure is the signal.**

---

## 11. Build / Deploy / Ops

```bash
# Local dev
pnpm install
cp .env.example .env.local
pnpm dev  # serves at localhost:5173

# Build
pnpm build    # outputs to dist/ (gitignored)
pnpm preview  # serves dist/ locally
```

- Vercel auto-deploys on push to `main`
- Vercel keeps previous deploys; one-click rollback
- Sprint 1.4: Sentry or equivalent for error tracking

---

## 12. Known Technical Debt

### P0 — Must Fix Before Launch (7 remaining of 9)
| ID | Issue | Status |
|----|-------|--------|
| P0-1 | Bolt broker token leak (public source + dist bundle) | ⚠️ **Pending Kevin** |
| P0-2 | dist/ committed | ✅ Closed |
| P0-3 | node_modules/ committed | ✅ Closed |
| P0-4 | Retired `fundreadyai.com` in shipped source | 📋 Sprint 0.3 |
| P0-5 | "FundReady" / "FundScore" / "FORGE" branding pervasive | 📋 Sprint 0.3 |
| P0-6 | "You qualify for capital" banned phrase in Results | 📋 Sprint 0.4 |
| P0-7 | Hard-coded "guaranteed approval" / "instant funding" strings | 📋 Sprint 0.4 |
| P0-8 | Intake at 36 questions, spec says 47, no declarative branching | 📋 Sprint 0.8 |
| P0-9 | Zero automated tests | 📋 Sprint 0.7 |

### P1 — Fix Before Launch If Hours Allow
| ID | Issue | Status |
|----|-------|--------|
| P1-1 | Brand-color drift (~50 unique non-locked hex values) | 📋 Sprint 0.3 |
| P1-2 | Three-layer scoring missing 0-100 transform; second source of truth in `businessData.ts` | 📋 Sprint 0.5 + 0.6 |
| P1-3 | AI Coach is templated, not live API | 📋 Sprint 2.2 |
| P1-4 | No Plaid integration | 📋 Sprint 1.1 + 2.1 |
| P1-5 | Supabase silent-stub fallback risk | 📋 Sprint 1.4 |
| P1-6 | `index.html` `<title>` is "SaaS Financing System" (placeholder) | 📋 Sprint 0.3 |
| P1-7 | Both `package-lock.json` AND `pnpm-lock.yaml` committed | 📋 Sprint 0 hygiene |

### P2 — Post-Launch Polish
- `src/_archive/BusinessSuccessScan/` — old BSS code
- ~150 `*.md` files at repo root — documentation noise
- `src/imports/` ships raw prompt files into production
- Migration from `jspdf + html2canvas` to `@react-pdf/renderer`
- Snapshot tests for PDFs
- Pre-commit gate tripping on content already in source

---

## 13. Migration Strategy — Vite → Next.js (Sprint 3+)

**Why:** SSR for SEO, file-based routing, better Vercel integration, server components for compliance-sensitive operations, image optimization.

**Strategy:** Keep Vite SPA at `bankableiq.io`. Run Next.js at `staging-next.bankableiq.io` until parity confirmed. Then DNS cutover.

**What stays / moves:** TypeScript, React, Tailwind, Supabase, `engine.ts`, `api/bolt-proxy.ts` all move. `vite.config.ts` → `next.config.mjs`. React Router → Next.js file-based router (largest mechanical change).

---

## 14. Operational Concerns

- **Supabase Pro** supports ~10K active users; Team tier above that
- **Vercel:** comfortable through 100K monthly visits
- **Performance:** Score computation synchronous, <100ms. AI Coach (when live): streaming.
- **Rollback:** Vercel 1-click; Supabase point-in-time recovery on Pro plan
- **Security posture:** All API tokens server-side (after Sprint 0.1), HTTPS everywhere, no PII in URLs, no credit card data in system (Stripe via GHL), Plaid tokenized

---

## 15. Decisions Log

### Closed
| Decision | Resolution | Date |
|---------|-----------|------|
| Score naming | Bankable Score™ | 2026-05-06 |
| Stage architecture | 6 Bankable Stages™ (Foundation → Institutional) | 2026-05-06 |
| Pathway architecture | 5 Capital Pathways™ | 2026-05-06 |
| Three-layer scoring | Client 0-100 / Operator 0-1000 / Lender 0-300 | 2026-05-06 |
| Community platform | GHL Communities | 2026-05-11 |
| Plaid at launch | Sandbox at launch, production T+7 | 2026-05-12 |
| AI Coach at launch | Static at launch, live API T+7 | 2026-05-12 |
| Cohort capacity | 500-seat at $97/mo or $599/yr | 2026-05-13 |
| Launch date | **2026-05-29** | 2026-05-12 |

### Open
| ID | Decision | Owner | Priority |
|----|---------|-------|---------|
| ENG-01 | Trademark filings | Kevin + attorney | Sprint 3 |
| ENG-02 | Capital Hub Leader compensation model | Kevin | Sprint 3-4 |
| ENG-03 | Mobile app: Capacitor or React Native | Director 17 + Kevin | Sprint 5 |
| ENG-04 | Bankable Decision Engine: rule-based or LLM-routed? | Director 17 | Sprint 5 |
| ENG-05 | Multi-tenant role naming for external launch | Director 13 | Sprint 3.4 |
| ENG-06 | HUSL FI integration scope | Kevin + partner | Sprint 5.3 |

---

## 16. Quick Reference

### Where to Find Things
| Need | File |
|------|------|
| Scoring algorithm | `src/app/pages/business-assessment/engine.ts` |
| Compliance phrase blocklist | `src/app/lib/ai/guardrails.ts:GLOBAL_FORBIDDEN_CLAIMS` |
| Routes | `src/app/routes.tsx` |
| Auth flow | `src/app/lib/supabase/auth.ts` |
| AI Coach templates | `src/app/lib/forge/chat-responses.ts` |
| Bolt proxy | `api/bolt-proxy.ts` |
| Persona fixtures | `scripts/eval-scoring.ts` |
| Build config | `vite.config.ts` |
| Deploy config | `vercel.json` |

### Critical Files — NEVER Touch Without Review
| File | Reviewer required |
|------|-----------------|
| `engine.ts` | Director 17 + 21 golden tests passing |
| `businessData.ts:calculateFicoSBSS()` | Director 17 |
| `guardrails.ts:GLOBAL_FORBIDDEN_CLAIMS` | Director 11 |
| `vercel.json` | Director 17 |
| `api/bolt-proxy.ts` | Director 17 |

### Standard PR Review Checklist
- ✅ Source clean of banned phrases
- ✅ All 21 golden scoring tests pass (after Sprint 0.7)
- ✅ No new env vars without docs update
- ✅ No secrets in source
- ✅ Brand-compliant (locked palette, GillSansMTPro Medium)
- ✅ Three-layer scoring respected (no second source of truth)
- ✅ Director 17 review note in commit if `engine.ts` touched
- ✅ Director 11 review note in commit if customer-facing copy changed
- ✅ Snapshot test passes for PDF (after PDF exists)

---

## 17. Glossary
| Term | Definition |
|------|-----------|
| Bankable | A business able to qualify for institutional capital on standard terms |
| Bankable Score™ | 0-100 single-number readiness measure shown to clients |
| FundScore | 0-1000 internal operator-grade scoring detail |
| FICO SBSS | 0-300 lender-facing Small Business Scoring Service score |
| 6 Bankable Stages™ | Foundation, Stabilization, Activation, Expansion, Optimization, Institutional |
| 5 Capital Pathways™ | Starter, Credit Recovery, Growth, Scale, Investor |
| 5 Client Profiles | Starter, Emerging, Constrained, Growth, Scale |
| Capital Growth Plan | The downloadable PDF deliverable from the assessment |
| CCRA | Certified Capital Readiness Advisor |
| Income Event One (IE1) | An advisor's first revenue from a real client |
| Director 17 | Engineering-architecture / single-source-of-truth authority |
| Director 11 | Compliance / banned-phrases authority |
| Director 21 | GHL platform expertise |
| Director 13 | Kevin Murphy — project lead, final approval |

---

## 18. Contact / Governance
- **Project lead:** Kevin Murphy (Director 13) — final approval on any change
- **Engineering authority:** Director 17 — sacred-rule enforcement on `computeScore()`
- **Compliance authority:** Director 11
- **GHL platform expertise:** Director 21
- **Day-to-day engineering:** route via agent rig at `C:\Users\kevin\Desktop\ai-test\` (`start-bankableiq.ps1`)

---

## 19. Versioning
- **v1.0** — 2026-05-12 — Initial PDR compiled from audit + operating model + roadmap + scoring architecture + GHL inventory + curriculum design brief.

This document is updated whenever a sprint completes or a material decision changes.
