# BANKABLE IQ™ Engineering Spec Patch v1.0 → v1.1 + Autonomous Fleet Bootstrap Rider

**Patch issued:** May 28, 2026
**Authority:** Blueprint v1.8 (corporate constitution)
**Founder approvals locked:**
- [x] Rename codebase to align with Blueprint v1.8 vocabulary.
- [x] Migrate codebase from Vite to Next.js 14.
- [x] Update marketing site to v1.8 vocabulary.
- [ ] Open question: Blueprint v1.9 contents (spec references v1.9 but v1.8 is current public). Patch assumes v1.8 is canonical until v1.9 surfaces.

---

## PART 1. ENGINEERING SPEC v1.0 → v1.1 PATCH

This patch overrides specific sections of the existing engineering spec. The fleet's `bot-architect` and `bot-docs` agents apply the changes in their first cycle after the bootstrap PR merges.

### Patch 1.1 — Document metadata

```diff
- BANKABLE IQ™ Master Engineering Build Specification v1.0
+ BANKABLE IQ™ Master Engineering Build Specification v1.1 (Blueprint v1.8-aligned)

- Companion to: BANKABLE™ Internal Corporate Blueprint v1.9
+ Companion to: BANKABLE™ Internal Corporate Blueprint v1.8 (active)
```

### Patch 1.2 — Score model (§3.7.2 and everywhere referenced)

```diff
- Bankability Score 0-100, Readiness Index 0-1000
+ Bankability Score (0-100) — single composite, matches Blueprint v1.8 §16 Compass
+ Bankable Credit Position Score (0-100) — credit-side companion, added per Blueprint v1.8 §17 Module 4
```

Drop all references to 0-1000 Readiness Index. The Bankability Score is the single 0-100 number that flows through every UI surface, every API response envelope, every report.

### Patch 1.3 — Eligibility tier model (§3.7.2 envelope + §4 schemas)

```diff
- eligibility_tier: 'pre-qualified' | 'likely-qualified' | 'not-pre-qualified'
+ maturity_level: 'foundation' | 'organized' | 'optimized' | 'lender_ready' | 'compounding_capital'
+   thresholds: 0-40 / 41-60 / 61-75 / 76-85 / 86-100
+   bankable_threshold: 76 (Lender-Ready)
```

### Patch 1.4 — Customer outcomes (§3.8, §3.9, §6)

```diff
- Capital Today / Bankability Built / Institutional Access (informal)
+ The Bankable Capital Promise™ — 3 Outcomes (per Blueprint v1.8 §XV):
+   1. Capital Today™ (Score 0-60) — bridge/non-bank funding match
+   2. Bankability Built™ (Score 41-85) — Goal-Backwards Build-Out
+   3. Institutional Capital Access™ (Score 76-100) — SBA/bank/CRE + Capital Marketplace inversion
```

### Patch 1.5 — Assessment names (§3.1)

```diff
- 50-field MVP intake; full diagnostic later
+ Two-tier assessment per Blueprint v1.8 §10:
+   The Bankability Compass™ — 8 questions, 60 seconds, free, top-of-funnel
+   The Bankability Wheel™ Diagnostic — full diagnostic (estimate 25-33 questions post-signup, one bucket per Focus Area)
```

### Patch 1.6 — AI module naming (§3.3, §12.5)

```diff
- BAI Adaptive Intelligence (catch-all)
+ Three distinct layers per Blueprint v1.8 §17 + §XII Part 13:
+   Module 3: AI Readiness Coaching System™ (customer-facing coach)
+   Module 7: BAI Adaptive Intelligence Engine™ (personalization layer)
+     Sub-systems: BLIN, BII, BMS, BPFS, Adaptive Wheel, Adaptive Coaching
+   AI Intelligence Suite (auto-generation: Compass Summaries, Lender Memos, Action Plans, Credit Position Memos)
```

The legacy codebase term FORGE™ is retired as a customer-facing brand. If engineering wants to keep `lib/forge/` as an internal code module name, that is permitted; no UI string says FORGE.

### Patch 1.7 — Schema count and layering (§4.1)

```diff
- 35 PostgreSQL schemas
+ 35 PostgreSQL schemas per Blueprint v1.8 §34:
+   1-25: readiness schemas
+   26-30: credit schemas (NEW v1.6 era)
+   31-35: BAI-powered schemas (NEW v1.8 era)
+     31 lender_intelligence_realtime (BLIN)
+     32 industry_benchmarks (BII)
+     33 macro_market_indicators (BMS)
+     34 predicted_funding_outcomes (BPFS)
+     35 personalization_features (ML feature store)
```

### Patch 1.8 — Architectural layers (§2.1)

```diff
- Modular monolith (4 conceptual layers: Presentation / API Gateway / Application / Data)
+ 12-Layer Architecture per Blueprint v1.8 §XII Part 2:
+   12. Adaptive Intelligence Layer (BAI wraps all others)
+   11. Infrastructure Layer (B2B EDO licensing, lender plug-in, API endgame)
+   10. Outcome & Telemetry Layer
+    9. Network Layer (Capital Council)
+    8. Data Layer (35 schemas)
+    7. Intelligence Layer (AI Suite, AI Coach, Packaging Engine)
+    6. Pipeline Layer (4-stage Capital Readiness Pipeline)
+    5. Engagement Layer (Ambitions Tracker, Sprint, Tools, Frameworks, Briefings, Workshops, Maturity Levels, Outcome Tracker)
+    4. Module Layer (6 named modules + Workspace + Command Center)
+    3. Score Layer (Bankability Score + Credit Position Score + Maturity Levels)
+    2. Visual Layer (the Bankability Wheel)
+    1. Brand & Positioning Layer (Institutional Readiness Operating System)
```

### Patch 1.9 — Module names (§3.1 through §3.9)

```diff
- Module 1 Diagnostic Engine
+ Module 1 Institutional Readiness Diagnostic Engine™

- Module 2 Compliance Engine
+ Module 2 Institutional Compliance & Lender Alignment Engine™

- Module 3 AI Coaching System
+ Module 3 AI Readiness Coaching System™

- Module 4 Credit Intelligence Engine
+ Module 4 Credit Intelligence Engine™ + Financial Capacity Infrastructure™

- Module 5 Document Vault
+ Module 5 Secure Institutional Readiness Vault™

- Module 6 Pathway Engine
+ Module 6 Strategic Capital Pathway Engine™

- Module 7 BAI
+ Module 7 Bankable Adaptive Intelligence Engine™ (BAI) — NEW v1.8

+ Module 8 Institutional Readiness Workspace™ (client front door)
+ Module 9 Capital Readiness Advisor Command Center™ (advisor front door)
```

### Patch 1.10 — Tech stack (§1.2, §7.1, §11.1)

```diff
- Frontend: Next.js 14 (App Router) + React 18 + TypeScript
+ Frontend: Next.js 14 (App Router) + React 18 + TypeScript + TailwindCSS + shadcn/ui
+   NOTE: existing codebase uses Vite + React Router. Bootstrap rider Migration A handles the move.
```

All other tech stack lines align with Blueprint v1.8 Part 10. No change required.

### Patch 1.11 — Capital Readiness Pipeline (NEW §3.10)

Add new spec section §3.10:

```
§3.10 — The 4-Stage Bankable Capital Readiness Pipeline™

Stage 1: Bankability Activation™ (Day 1)
  Cold lead -> Bankability Compass -> Score reveal -> Avatar segmentation -> CCA assignment -> 72-hour Activation Protocol

Stage 2: Institutional Readiness Build-Out™ (Weeks 1-8)
  Wheel Diagnostic -> 30-60-90 Sprint -> Credit Intelligence activation -> HUSLFi Plaid wiring -> HUSLConnect growth install if needed

Stage 3: Lender-Ready Package Assembly™ (Weeks 6-8)
  Vault opens -> auto-populated docs -> lender match -> Projection Builder -> AI lender memo -> pre-application Credit Position validation

Stage 4: Capital Deployment & Lifetime Compounding™ (Funding + Lifetime)
  AI-Powered Capital Packaging Engine submission -> negotiation -> close -> funded outcome feeds Lender Match Engine -> renewal cycle prep at loan midpoint -> Founder-to-Advisor Pathway conversion
```

### Patch 1.12 — Capital Marketplace (NEW §5.7)

Add new spec section §5.7:

```
§5.7 — Bankable Capital Marketplace™ (BCM) — Lender-Facing API

Three subscription tiers for capital providers (per Blueprint v1.8 §XV):
  Lender Insight Tier ($5K-$25K/yr) — read-only BPFS + Credit Position access for opt-in borrowers
  Lender Match Tier ($25K-$100K/yr) — ranked deal flow with BPFS approval probability
  Lender Plug-In Tier ($100K-$500K/yr + outcome bonuses) — full API integration

OAuth 2.0 client credentials flow. Rate-limited per partner. CROA/FCRA/ECOA disclosures at every borrower boundary.
```

### Patch 1.13 — Pricing tiers (§17 cost model)

The spec's cost model assumed 3 tiers. Blueprint v1.8 §23 locks 5 tiers:

```diff
- Client Starter $0 / Client Pro $49 / Advisor Solo $199
+ Capital Connector $7 -> $49 / Bankable Member $97 / CCA $197 / Agency Starter $497 / CCO Pro $997 / Enterprise $2,997
+   Add-ons: Tax Pro $97, Credit Pro $97 (NEW v1.6 era)
+   Special: Founding Member $97 locked for life (first 20 seats only)
```

Spec §17.2 cost run-rate model updates to reflect the 5-tier revenue mix.

### Patch 1.14 — Founders (cover + §1.1)

```diff
- Founders: Kevin Murphy & Michael Hopkins
+ Founders: Kevin Murphy (The Capital Readiness Architect) & Michael Hopkins (Co-Founder)
+   Per Blueprint v1.8 §03 Brand Architecture
```

### Patch 1.15 — Companion documents required (§18.4)

Per Blueprint v1.8 §51, the eight companion operational documents are non-negotiable for investor defensibility:

1. Bankable Service Operations Manual
2. Bankable People™ Sub-Brand Launch Spec
3. Bankable Governance Charter
4. Bankable Service Catalog (Customer-Facing)
5. Bankable Quality Operations Manual
6. Bankable Regulatory & Jurisdictional Architecture
7. Bankable Financial Operations Model
8. Bankable IQ™ Credit Intelligence Engine Operational Spec

The fleet's `bot-docs` agent treats each as a tracked deliverable.

---

## PART 2. AUTONOMOUS FLEET BOOTSTRAP RIDER

This rider replaces the prior bootstrap riders in Playbook v2.1, v2.2, v2.3. Append it verbatim to the v2.1 bootstrap prompt when you start a Claude Code session.

```
APPEND TO BOOTSTRAP PROMPT (v1.8 alignment rider):

The autonomous fleet adopts the existing Bankable-IQ-Fintech codebase
(github.com/Fundabl-Fintech/Bankable-IQ-Fintech) as the foundation of
the new monorepo. Authoritative strategic document: Blueprint v1.8
(saved at docs/blueprint/v1.8-canonical.md). Authoritative engineering
document: Spec v1.1 (the patched version above). Brand assets locked
at Figma file y3wOnWeFZqJVUH8xi2MoLZ (BANKABLE IQ Brand v1).

The fleet's first SIX PRs after bootstrap are sequenced as follows.
Each PR is opened by the named agent and reviewed by bot-reviewer.

PR #2 (bot-platform): Adopt existing repo as `apps/web` of the new
  monorepo. Preserve git history. Layer the autonomous fleet's
  control plane (.github/workflows, .github/agents, services/,
  packages/) on top. Add tenant_id NOT NULL UUID column to every
  existing table with a default-tenant backfill migration. Enable
  multi-tenant RLS on all tables. Add the 25 missing schemas to reach
  the full 35 (the existing 10 SQL files cover roughly 5 of the
  blueprint's 35 schemas; add the other 30).

PR #3 (bot-frontend + bot-platform): Migrate apps/web from Vite to
  Next.js 14 App Router. Move src/main.tsx + RouterProvider to the
  App Router file-based routing equivalent. Move src/app/pages/* to
  apps/web/app/(client)/*. Move auth pages to apps/web/app/(auth)/*.
  Move admin pages to apps/web/app/(admin)/*. Preserve every page's
  functional code. The migration is structural, not logical.

PR #4 (bot-architect + bot-frontend): Brand vocabulary alignment to
  Blueprint v1.8.
  - Rename FundScore -> Bankability Score everywhere (UI strings,
    TS constants, SQL column fund_score -> bankability_score with a
    rescale migration 0-160 -> 0-100 using linear scale).
  - Rename FundReady -> Bankability Compass + Bankability Wheel
    Diagnostic. Split the existing 33-question assessment into the
    8-question Compass (cold traffic / pre-signup) + the 20-question
    Wheel Diagnostic (post-signup, one bucket per Focus Area).
  - Replace customer-facing FORGE strings with AI Readiness Coaching
    System. Keep lib/forge/ as internal code module name; no UI
    string says FORGE.
  - Rename eligibility_tier (pre-qualified / likely-qualified /
    not-pre-qualified) to maturity_level (foundation / organized /
    optimized / lender_ready / compounding_capital). Thresholds:
    0-40 / 41-60 / 61-75 / 76-85 / 86-100. Bankable threshold = 76.
  - Replace marketing Goal 01/02/03 labels with Capital Today /
    Bankability Built / Institutional Capital Access (the v1.8
    3 Outcomes).
  - Rename pages: Dashboard remains; AICoach.tsx -> CoachPage.tsx
    pointing at AI Readiness Coaching System Module 3.

PR #5 (bot-frontend + bot-design): Restyle apps/web/app/page.tsx
  (the marketing landing page ported from existing LandingPage.tsx)
  to use the BANKABLE IQ Brand v1 design tokens from Figma file
  y3wOnWeFZqJVUH8xi2MoLZ. Replace bright green CTA color #34D399
  with brand cyan/cobalt from the Figma tokens. Replace static
  wordmarks with the real BankableIQ logo image fills already
  embedded in the Figma file. Apply v1.8 vocabulary to all marketing
  copy strings.

PR #6 (bot-bai): Build BAI Module 7 v0 scaffolding. Six sub-system
  service stubs: blin-svc, bii-svc, bms-svc, bpfs-svc, plus
  adaptive-wheel and adaptive-coaching as bai-svc modules. Schema
  31-35 created. Each sub-system returns deterministic placeholder
  payloads for now; ML models come in Phase 2 per spec v1.1.
  Capital Access Matrix endpoint, Goal-Backwards Build-Out endpoint,
  and Bankable Capital Marketplace partner OAuth flow stubbed.

PR #7 (bot-coaching + bot-bai): Plug Anthropic Claude into the
  existing FORGE chat scaffold. The lib/forge/chat-responses.ts
  becomes a thin wrapper around the AI Readiness Coaching System
  invoking Claude with the guardrails from lib/ai/guardrails.ts.
  Preserve the existing chat structure. Replace mock responses with
  real Claude streaming SSE per Spec §3.3.

PR #8 onward: standard fleet operating model from Playbook v2.1.
  The orchestrator generates issues from Spec v1.1 sections not yet
  built. Per spec sequence: Module 1 Diagnostic v0, Module 5 Vault
  upgrade, Module 4 Credit Intelligence Engine, Module 2 Compliance
  Engine, Module 6 Pathway Engine (Temporal), Module 7 BAI full
  implementation, Module 8 Workspace, Module 9 Command Center,
  Capital Marketplace lender API, observability, security baselines,
  cost monitor, docs/runbooks.

Compliance brake: any PR touching packages/compliance-rules/** or
  files tagged compliance-sensitive requires a literal
  `compliance-officer-approved` comment from Kevin Murphy or the
  designated Compliance Officer of record.

Promote brake: integration -> main requires literal
  `promote-to-prod` comment on the release PR.

Budget cap: ANTHROPIC_BUDGET_HARD_CAP = $3,000 monthly. Tunable.

Concurrency cap: FLEET_CONCURRENCY = 6. Ceiling 12. Floor 2.

Bot-design's first task on Block 2: extend the Figma file with the
v1.8 strategic visualizations per the Companion v2.3 Block 2 brief
plus the new sections being added today: the 7 Cs, the 4 Domains
× 5 Focus Areas Wheel, the 5 Maturity Levels staircase, the 3
Outcomes story, the 4-Stage Pipeline, the 12-Layer Architecture
exhibit, the BAI 6 sub-systems map.

END OF v1.8 BOOTSTRAP RIDER.
```

---

## PART 3. EXECUTION ORDER FOR YOU AS OPERATOR

Once the bootstrap PR merges and these six PRs have flowed through:

1. Read the merged docs/blueprint/v1.8-canonical.md (the fleet copies your pasted blueprint there).
2. Review PR #4 (the rename pass) carefully. This is the brand-defining merge.
3. Review PR #5 (the marketing restyle). This is what the public sees.
4. Approve compliance-sensitive PRs as they arrive with `compliance-officer-approved`.
5. When the dashboard shows the release-candidate banner, comment `promote-to-prod` on the release PR.

You operate the same daily loop from Companion v2.2 PART H. The fleet does the rest.

---

## PART 4. WHAT HAPPENS TO THE EARLIER PLAYBOOKS

The earlier playbooks remain valid, scoped as follows:

| Document | Status |
|----------|--------|
| Playbook v1 (linear single-driver) | Fallback only. Not used. |
| Playbook v2.1 (22-agent autonomous fleet) | Core engine. v1.8 rider above supersedes its bootstrap prompt. |
| Operator Companion v2.2 (Console, Demos, Decisions, Archeologist, Backup, +5 agents = 27 total) | Active. The Console renders all v1.8 constructs. |
| Visual Foundation Sprint v2.3 | Active. Extended with new Block 2 brief in the Figma extension work tracked separately. |
| Migration Report v2 (existing codebase analysis) | Superseded by this patch. The patch IS the migration plan now. |
| Reconciliation Analysis v1.8-aware | Locks the alignment thesis. This patch is its execution. |

---

End of Spec Patch v1.1 + Bootstrap Rider
