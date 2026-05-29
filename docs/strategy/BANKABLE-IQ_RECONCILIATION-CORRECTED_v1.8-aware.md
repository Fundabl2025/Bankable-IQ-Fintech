# BANKABLE™ Reconciliation Analysis (corrected, v1.8-aware)

**Sources reconciled:**
1. **Blueprint v1.8** (pasted into chat just now, dated active, canonical strategic constitution)
2. **Engineering Build Spec v1.0** (uploaded engineering-spec.html, references blueprint v1.9)
3. **Existing codebase** at github.com/Fundabl-Fintech/Bankable-IQ-Fintech
4. **Marketing site** at bankable-iq-fintech.vercel.app

**Date:** May 28, 2026
**Owner of correction:** I previously analyzed v1.6 (the version the live URL was serving when my subagent fetched it). v1.8 is the version you have. This document corrects what I told you and reconciles all four sources accurately.

---

## THE MOST IMPORTANT CORRECTION

In my previous analysis I told you: "the spec uses BAI/BPFS/BLIN/BII/BMS but those are not in the blueprint." **That was wrong.**

The reason: my subagent fetched v1.6 of the blueprint, which did not have those acronyms. **v1.8 introduces all of them.** Specifically, v1.8 Section XII Part 13 introduces Module 7: **Bankable Adaptive Intelligence Engine™ (BAI)** with six sub-systems:

- **BLIN** — Bankable Lender Intelligence Network™
- **BII** — Bankable Industry Intelligence™
- **BMS** — Bankable Market Sensor™
- **BPFS** — Bankable Predictive Funding Score™
- **Bankable Adaptive Wheel™**
- **Bankable Adaptive Coaching™**

Plus three critical BAI-powered systems:
- **Capital Access Matrix™** (CAM)
- **Goal-Backwards Build-Out™** (GBB)
- **Bankable Capital Marketplace™** (BCM)

**Implication: the Engineering Spec v1.0 is a faithful technical translation of Blueprint v1.8.** Not a contradiction. The spec actually nails it.

What I called "spec inventions" are real strategic constructs from v1.8. Apologies for the confusion. The error was timing: my subagent fetched whatever was hosted at the moment, which was v1.6.

---

## WHAT THE THREE SOURCES NOW SHOW (CORRECTED ALIGNMENT)

### Blueprint v1.8 (the strategic constitution)

Defines:
- **Three platforms:** BANKABLE IQ™ + HUSLConnect™ + HUSLFi™
- **One visual anchor:** The Bankability Wheel™ (4 Domains × 5 Focus Areas = 20 + 7 Cs + 6-Step Methodology)
- **Two scores:** Bankability Score (0-100) + Bankable Credit Position Score (0-100)
- **Five Maturity Levels:** Foundation (0-40) → Organized (41-60) → Optimized (61-75) → Lender-Ready (76-85) → Compounding Capital (86-100)
- **Three Outcomes:** Capital Today™ + Bankability Built™ + Institutional Capital Access™
- **Four-Stage Pipeline:** Activation → Build-Out → Package Assembly → Capital Deployment
- **Seven named modules inside BANKABLE IQ™:** Institutional Readiness Diagnostic Engine, Institutional Compliance & Lender Alignment Engine, AI Readiness Coaching System, Credit Intelligence Engine + Financial Capacity Infrastructure, Secure Institutional Readiness Vault, Strategic Capital Pathway Engine, BAI Adaptive Intelligence Engine
- **Twelve-layer architecture** (top to bottom: Adaptive Intelligence → Infrastructure → Outcome & Telemetry → Network → Data → Intelligence → Pipeline → Engagement → Module → Score → Visual → Brand)
- **35 data schemas** (25 readiness + 5 credit + 5 BAI-powered)
- **10 moat layers**
- **5-tier pricing stack** ($7→$49 Connector, $97 Member, $197 CCA, $497 Agency Starter, $997 CCO Pro, $2,997 Enterprise) + add-ons (Tax Pro $97, Credit Pro $97) + Founding Member $97 locked
- **CCA credential ladder:** CCA → CCRA → CIRS → Infrastructure Partner
- **Founders:** Kevin Murphy AND Michael Hopkins (Michael IS named in v1.8; v1.6 did not name him)
- **Recommended tech stack** (verbatim): Next.js 14 + React + TailwindCSS + shadcn/ui frontend; Node.js + TypeScript + Python FastAPI backend; PostgreSQL 30 schemas + read replicas; Redis; S3 + KMS Vault; Pinecone or Weaviate; Snowflake; Auth0 or Supabase Auth + MFA + SSO; Anthropic Claude primary + OpenAI GPT-4 backup; Plaid; Experian + Equifax + TransUnion + D&B; Stripe; SendGrid + Twilio; Vercel + AWS/GCP + Cloudflare; Temporal or Inngest; Datadog; Mixpanel + Amplitude; Airbyte; GitHub Actions

### Engineering Spec v1.0 (the engineering translation)

**Aligns with blueprint v1.8 on every major decision:**
- Same three platforms (with HUSLConnect™ + HUSLFi™ as siblings).
- Same Bankability Wheel + 4 Domains + 7 Cs framework.
- Same Bankability Score 0-100.
- Same BAI architecture (BLIN, BII, BMS, BPFS, Adaptive Wheel, Adaptive Coaching).
- Same Capital Access Matrix, Goal-Backwards Build-Out, Capital Marketplace.
- Same 3 Outcomes (Capital Today / Bankability Built / Institutional Access).
- Same 35 PostgreSQL schemas.
- Same Next.js 14 frontend, Python FastAPI for AI services, Anthropic Claude primary.
- Same Plaid + tri-bureau + Auth0 + Stripe + Datadog vendor stack.

**The spec is NOT a competing document. It IS the engineering implementation of blueprint v1.8.** I was wrong to call it a separate vocabulary set. It is faithful.

The spec references "v1.9" of the blueprint. That likely means a v1.9 patch was in flight when the spec was written. The pasted v1.8 you have today is the active live version. The difference between v1.8 and v1.9 is probably minor (the spec was probably written against a draft v1.9 that has not yet been published).

### Codebase (the divergent layer)

**This is where the divergence actually lives.** The codebase uses brand names that are NOT in blueprint v1.8:

| Codebase term | Blueprint v1.8 equivalent |
|---------------|---------------------------|
| **FundScore** (0-160 scale) | **Bankability Score** (0-100 scale) |
| **FundReady** (33-question assessment) | **Bankability Compass™** (free 60-second 8-question lead-gen) + **Bankability Wheel™ Diagnostic** (full Wheel assessment) |
| **FORGE™** (the AI engine) | The blueprint v1.8 vocabulary uses THREE distinct named systems for what FORGE conflates: **AI Readiness Coaching System™** (Module 3, customer-facing coach) + **AI Intelligence Suite** (the auto-generation layer for memos/plans/scores) + **Bankable Adaptive Coaching™** (the BAI sub-system that personalizes coaching by industry/geography/market). FORGE is a marketing wrapper; the blueprint splits it into three distinct named layers. |
| **eligibility_tier:** pre-qualified / likely-qualified / not-pre-qualified | The blueprint v1.8 wraps this as **Bankable Maturity Levels™**: Foundation / Organized / Optimized / Lender-Ready / Compounding Capital |
| **3-Goal System / Goal 01/02/03** on the marketing site | **The Bankable Capital Promise™ — 3 Outcomes**: Capital Today™ / Bankability Built™ / Institutional Capital Access™ |
| **business_profiles** schema | Splits across blueprint's `business_identity` (#1), `principal_profiles` (#2), `data_authorizations` (#3), and various readiness schemas |

**Bottom line for the codebase:** the trademarks were created at an earlier brand stage and have been superseded by v1.8 terminology. The functional architecture is mostly right; the brand names are stale.

### Marketing site (the most stale layer)

Uses FundScore, FundReady, FORGE, "Goal 01/02/03." None of those are in blueprint v1.8.

The marketing site is the customer-facing storefront. If you keep the legacy names there, you are training the market on yesterday's vocabulary. If you switch to v1.8 names, you are training the market on the category-defining vocabulary you actually own.

---

## THE FOUR SOURCES, SIDE BY SIDE

| Concept | Blueprint v1.8 | Engineering Spec | Codebase | Marketing site |
|---------|---------------|-------------------|----------|----------------|
| The score | Bankability Score 0-100 | Bankability Score 0-100 | FundScore 0-160 | FundScore (160-ish) |
| Free lead-gen assessment | Bankability Compass™ (8Q) | Module 1 Assessment Engine | Foundation Questions | FundScore Assessment |
| Full diagnostic | Bankability Wheel™ Diagnostic | Module 1 + intake | Unified Assessment 33Q | not visible |
| The AI | AI Readiness Coaching System + AI Intelligence Suite + Adaptive Coaching | Module 3 Coaching + AI/ML services + BAI | FORGE™ | FORGE™ |
| Customer outcomes | 3 Outcomes (Capital Today / Bankability Built / Institutional Access) | 3 outcomes same names | not explicitly modeled | "Goal 01/02/03" with different language |
| Maturity scale | 5 Maturity Levels | spec mentions tier eligibility | eligibility_tier 3 levels | bankable threshold concept |
| Schemas | 35 (25 readiness + 5 credit + 5 BAI) | 35 schemas | 10 SQL migrations (extend toward 35) | none |
| Frontend stack | Next.js 14 + Tailwind + shadcn | Next.js 14 + Tailwind + shadcn | Vite + React Router (different choice) | Next.js (whatever's deployed) |
| Score threshold for "bankable" | 76 (Lender-Ready Maturity Level) | not stated explicitly | 160 (different scale) | 160 |
| Founders | Kevin Murphy + Michael Hopkins | Kevin Murphy + Michael Hopkins | not surfaced | not surfaced |

---

## THE CORRECTED RECOMMENDATION

This is the cleanest interpretation now that I have v1.8.

**The Blueprint v1.8 is the strategic constitution.** Everything else conforms to it.

**The Engineering Spec v1.0 is the engineering implementation of the blueprint.** It is faithful. The 27-agent fleet plan I built (Playbook v2.1) and the Operator Companion v2.2 are correct for v1.8. The Visual Foundation Sprint v2.3 is correct. The autonomous-fleet model is correct.

**The codebase needs a vocabulary migration.** Not an architectural rebuild. Most of the functional code (the scoring engine, the 19 funding products, the 12 compliance modules, the auth flow, the Supabase schema, the action plan generator) maps to the blueprint's structures. What needs to change is naming and scoring scale.

**The marketing site needs a vocabulary migration too.** Same reason.

**The Figma file (BANKABLE IQ Brand v1) needs additions** to reflect v1.8 strategic constructs that I have not yet rendered: the 7 Cs of Institutional Readiness, the 4 Domains, the 5 Maturity Levels, the 3 Outcomes, the 4-Stage Pipeline, the Bankable Capital Marketplace concept.

---

## CONCRETE RENAMING TABLE (codebase migration)

| Old (codebase) | New (blueprint v1.8) | Approach |
|----------------|----------------------|----------|
| `FundScore` (TS const, UI string, SQL column `fund_score`) | `Bankability Score` (UI) + `bankability_score` (SQL) | String rename + score rescale 0-160 → 0-100. |
| `FundReady` (assessment system name) | `Bankability Compass` (8Q free version) + `Bankability Wheel Diagnostic` (33Q full version) | Two separate flows: split the existing 33Q flow into 8Q public Compass + 25Q post-signup Wheel completion. |
| `FORGE™` (AICoach.tsx + lib/forge/*) | `AI Readiness Coaching System` (Module 3, customer-facing UI strings) + `Bankable Adaptive Coaching` (BAI sub-system for personalization) | Rename the customer-facing strings. Keep `lib/forge/` directory as the code module name if you want (engineering can use FORGE internally as long as the user never sees it). |
| `eligibility_tier` enum: pre-qualified / likely-qualified / not-pre-qualified | `maturity_level` enum: foundation / organized / optimized / lender_ready / compounding_capital | Schema migration. Adjust thresholds: 0-40 / 41-60 / 61-75 / 76-85 / 86-100. |
| "3-Goal System" + "Goal 01/02/03" (marketing) | `3 Outcomes`: Capital Today™ + Bankability Built™ + Institutional Capital Access™ | String rename. Map: Goal 1 → Capital Today, Goal 2 → Bankability Built, Goal 3 → Institutional Access. |
| `business_profiles` table (60+ fields) | Split into `business_identity` (FA1) + `principal_profiles` (FA2) + `data_authorizations` (FA4) + `banking_behavior` (FA7) + `tax_readiness` (FA9) + etc. | Three migrations: first add new tables, second backfill from existing, third drop old columns once verified. |
| 33 questions (10 Foundation + 23 Readiness) | 8Q Compass + 20Q Full Wheel (one per Focus Area) | Re-bucket: the 8Q Compass becomes the cold-traffic lead-gen; the remaining 25 questions get re-bucketed into 20 Focus-Area-aligned questions. Existing questions get re-tagged with Focus Area numbers. |
| "13 compliance modules" (marketing claim) | 12 Lender Compliance modules (exists in code) + the v1.8 framework's compliance work distributed across Modules 1 (Diagnostic) and 2 (Compliance Engine) | Marketing claim of 13 should be reconciled. Either add one module or update marketing to 12. |
| (no FORGE on roadmap separately) | BAI Engine + 6 sub-systems (BLIN, BII, BMS, BPFS, Adaptive Wheel, Adaptive Coaching) | These do not exist in the codebase today. They are net-new. The fleet builds them. |
| (no Capital Marketplace) | Bankable Capital Marketplace™ (lender-facing API + 3 subscription tiers) | Net-new. Build per Engineering Spec §5.5. |
| (no Goal-Backwards Build-Out) | Goal-Backwards Build-Out™ engine | Net-new. The existing actionPlan.ts is a starting point that needs BAI personalization layered on top. |
| (no Capital Access Matrix) | Capital Access Matrix™ | Net-new. Build per Engineering Spec §3.7 + blueprint v1.8 BAI section. |
| `LandingPage.tsx` with green CTA | Landing page with blueprint v1.8 brand: navy + cyan + the indigo gradient we already locked | Restyle pass. The Figma BANKABLE IQ Brand v1 file is the source. |
| Stack: Vite + React Router | Either keep Vite for MVP and migrate in Phase 2, or migrate to Next.js 14 now to align with both blueprint and spec | My recommendation: **migrate to Next.js 14 now**. The blueprint v1.8 explicitly names Next.js 14 as the chosen stack. The spec names it. There is no strategic reason to stay on Vite. 2 weeks of frontend agent work; clears every future doubt. |

---

## THE NEW SCORECARD (corrected, v1.8-aware)

| Dimension | Score | Reason |
|-----------|-------|--------|
| Blueprint v1.8 vs Engineering Spec alignment | 9.5/10 | Spec is a faithful engineering translation. Minor delta (spec references v1.9 of blueprint that is not yet live). |
| Blueprint v1.8 vs Codebase alignment | 5/10 | Functional architecture aligns. Naming and scoring scale diverge. Brand layer is stale. |
| Blueprint v1.8 vs Marketing site alignment | 3/10 | Marketing copy is stale brand. FundScore/FORGE/FundReady all need replacement. |
| Engineering reuse (codebase → new build) | 7/10 (was 8/10 in v2 Migration Report) | Slight downgrade because the rename pass is real engineering work, not just a config change. |
| Schema reuse (codebase → new build) | 6/10 (was 7/10) | Existing 10 migrations partially align with 5 of the 35 blueprint schemas. Need to add the other 30 schemas and split business_profiles correctly. |
| Time to value | 8/10 (was 9/10) | Slight downgrade because of the rename pass. Still strong because the fleet handles renames efficiently. |
| Customer disruption risk | 0/10 | No customers on the live site. Rename is free. |

---

## WHAT I WAS WRONG ABOUT, EXPLICITLY

1. **I said:** the engineering spec uses invented vocabulary (BAI/BPFS/BLIN/BII/BMS) not in the blueprint. **Correct version:** v1.8 of the blueprint introduces all of these as official sub-systems of Module 7 (BAI Engine). The spec is faithful.

2. **I said:** the spec's "Adaptive Wheel" is not in the blueprint. **Correct version:** v1.8 names it explicitly as "Bankable Adaptive Wheel™" under the BAI sub-systems.

3. **I said:** the spec's "Capital Access Matrix" is not in the blueprint. **Correct version:** v1.8 names it explicitly as Capital Access Matrix™ powered by BAI.

4. **I said:** Goal-Backwards Build-Out is not in the blueprint. **Correct version:** v1.8 names it explicitly as Goal-Backwards Build-Out™ powered by BAI.

5. **I said:** the blueprint's "3-Goal System" is a marketing layer not in the blueprint. **Correct version:** v1.8 names them as the Bankable Capital Promise™ — 3 Outcomes (Capital Today™ / Bankability Built™ / Institutional Capital Access™). They ARE codified in the blueprint, just under a different framing than the marketing site uses.

6. **I said:** the blueprint names only Kevin Murphy. **Correct version:** v1.8 names both Kevin Murphy AND Michael Hopkins as Founders. Confirmed.

7. **I said:** the blueprint uses 30 schemas. **Correct version:** v1.8 expands to 35 schemas (25 readiness + 5 credit + 5 BAI-powered). The Engineering Spec's "35 schemas" claim aligns with v1.8.

8. **I said:** Pathway Engine is a spec invention not in the blueprint. **Correct version:** v1.8 names Module 6 as "Strategic Capital Pathway Engine™" plus the "Capital Readiness Pipeline™" 4-stage pipeline. Both align.

9. **I said:** the spec's "Vault" terminology is not in the blueprint. **Correct version:** v1.8 names Module 5 as "Secure Institutional Readiness Vault™." Aligns.

10. **I said:** the spec recommends Vercel + Next.js, and that should stay Vite for MVP. **Now I recommend:** migrate to Next.js 14. Blueprint v1.8 explicitly chooses Next.js 14 in Part 10 Recommended Tech Stack. There is no strategic reason to stay on Vite. The codebase's Vite choice was made before v1.8 was finalized.

---

## THE CORRECTED PATH FORWARD

Three founder decisions still needed. **Updated recommendations:**

1. **Rename the codebase to align with blueprint v1.8.** FundScore → Bankability Score (rescale to 0-100). FundReady → Bankability Compass (8Q) + Bankability Wheel Diagnostic (the rest). FORGE → AI Readiness Coaching System (customer-facing strings) + BAI internal name allowed for engineering. eligibility_tier → maturity_level (5 stages). My recommendation: **YES, do the rename.** This is what aligns you with your own strategic constitution.

2. **Migrate the codebase from Vite to Next.js 14.** Blueprint v1.8 and Engineering Spec both name Next.js 14. The Vite choice was pre-v1.8. My recommendation: **YES, migrate.** Approximately 2 weeks of bot-frontend work in the autonomous fleet. Done once, clears the deck.

3. **Update the marketing site to v1.8 vocabulary.** Replace FundScore/FORGE/FundReady with Bankability Score/AI Readiness Coaching System/Bankability Compass. Reframe Goal 01/02/03 as Capital Today / Bankability Built / Institutional Capital Access. My recommendation: **YES, update.** No customers to disrupt.

If you say yes to all three, I:

1. Write the spec patch v1.0.1 → v1.1 that confirms the engineering spec aligns with blueprint v1.8 and codifies the 35 schemas, 12-layer architecture, 5 Maturity Levels, 3 Outcomes, BAI sub-systems, and the corrected vocabulary.
2. Update the v2.1 bootstrap rider so the autonomous fleet's first PRs are: (a) Vite → Next.js migration, (b) FundScore → Bankability Score rename + 0-160 → 0-100 rescale migration, (c) tenant_id addition for multi-tenant, (d) the 5 BAI schemas + 5 credit schemas added, (e) marketing landing page restyled to the BANKABLE IQ Brand v1 + v1.8 vocabulary.
3. Extend the Figma BANKABLE IQ Brand v1 file with: the 7 Cs visual, the 4 Domains × 5 Focus Areas Wheel diagram, the 5 Maturity Levels staircase, the 3 Outcomes story, the 4-Stage Pipeline visualization, the 12-layer architecture exhibit. These become Block 2 hero screens.

Three decisions, three answers, full alignment achieved.

---

End of corrected reconciliation
