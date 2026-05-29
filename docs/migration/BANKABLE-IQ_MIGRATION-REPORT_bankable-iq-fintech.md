# Migration Report: bankable-iq-fintech.vercel.app

**Source:** Existing Vercel deployment at https://bankable-iq-fintech.vercel.app
**Target:** BANKABLE IQ Master Engineering Build Spec v1.0 + Autonomous Build Fleet v2.1/v2.2
**Author:** Master Developer/Designer review, applying the Archeologist Protocol from Operator Companion v2.2 Part D
**Date:** May 28, 2026
**Status:** Initial findings from live deployment. Code-level review pending GitHub repo URL.

---

## EXECUTIVE SUMMARY (plain English)

The existing Vercel deployment is **a single-page marketing site, not a product**. It is well-written, brand-coherent, and contains a remarkably mature product narrative (FundScore, FORGE AI, 3-Goal System, 13 compliance modules, three pricing tiers). But every sub-route redirects back to the homepage. There is no assessment, no authentication, no dashboard, no AI coaching, no marketplace.

This is actually good news. It means three things:

1. The product positioning is locked. The story you tell investors and customers is already proven on the landing page.
2. The brand trademarks are real and need to be carried into the new build verbatim: **FundScore**, **FORGE**, **FundReady**.
3. The engineering work is entirely ahead of you. Nothing in the existing deployment conflicts with the 27-agent fleet plan because there is no product engineering yet.

The classification of the existing project is therefore mostly **KEEP for marketing surface** and **MIGRATE-TERMINOLOGY-INTO-SPEC** for the brand trademarks that the spec did not yet account for.

---

## WHAT EXISTS (INVENTORY)

### URL surface
- One page: the homepage.
- Visible nav: How It Works, Pricing, Sign In, Get Your FundScore CTA.
- All nav links are in-page anchor scrolls, not real routes.

### Content sections (in order)
1. Hero: "You built the business. The system never told you the rules."
2. Live preview card mockup: FORGE™ Capital Readiness Profile, FICO SBSS 270/300, capital paths.
3. Hidden Problem section: $300B denied, 33M businesses, 76% preventable.
4. FORGE™ AI explainer: 17 lender signals, 12 behavioral signals, gap ranking, 30/60/90 roadmap.
5. The 3-Goal System: Goal 1 ($5K-$250K), Goal 2 ($50K-$500K), Goal 3 ($500K-$5M).
6. 4-step process: FundScore Assessment, See Profile, Get Capital Path, Unlock Larger Capital.
7. The "1% Stat" section: less than 1% bankable, 13 modules, 60-90 days.
8. Membership tiers: Free, Virtual Coached $97/mo, Live Coached $297/mo.
9. FAQ accordion.
10. Final CTA + footer: "© 2026 Bankable Business Solutions"

### Visual + brand
- Header logo: lowercase "Bankable" wordmark, blue gradient (matches the file you uploaded to Figma).
- Primary CTA color: bright green (#34D399 approximately). NOT the cyan/navy we have in the engineering spec design tokens.
- Body type: appears to be a rounded geometric sans (matches the BankableIQ wordmark style).
- Background: light/white with deep navy hero card insets. Light-mode-first design.

### Stack signals from deployment metadata
- Vercel-hosted Next.js (client-rendered, page returns shell).
- Production URL `bankable-iq-fintech.vercel.app`.
- Vercel build settings observed from dashboard you shared: Node 24.x, Turbo build, Fluid Compute, Skew Protection enabled, Cold Start Prevention enabled.
- Branch: `main`, latest commit `8df1921 chore: trigger Vercel deployment after repo reconnect`.

---

## TERMINOLOGY ALIGNMENT GAP (CRITICAL)

This is the most important finding. The existing brand uses trademarks and naming that the engineering spec v1.0 did not account for. The spec must adopt these or the brand splits in half.

| Existing brand term | Spec v1.0 term | Recommendation |
|---------------------|----------------|----------------|
| **FundScore** | Bankability Score (0-100) | **KEEP FundScore.** Customer-facing trademark. Spec's internal "Bankability Score" becomes the engineering name of the same thing. UI surface always says FundScore. |
| **FORGE™** (Funding Optimization & Readiness Guidance Engine) | BAI (Bankable Adaptive Intelligence Engine) | **KEEP FORGE.** Customer-facing trademark. Replace all "BAI" external references with "FORGE". Keep BAI as the optional internal engineering subsystem code if useful, but every UI string and customer email says FORGE. |
| **FundReady™** | Not in spec | **ADOPT.** Probably the badge/status name for a business that has passed the bankability threshold. Confirm with founders. |
| **17 lender signals** | 30 readiness domains | **REDUCE SCOPE.** The customer story is 17, not 30. The spec was over-engineered. MVP ships 17 signals. The remaining 13 domains move to Phase 2 or get folded into the existing 17. |
| **13 compliance modules** | Multi-state compliance rule packs | **CARRY OVER.** The 13 modules become the v1 compliance curriculum. Compliance rule packs in the spec are the engineering layer underneath. Two different things, both kept. |
| **3-Goal System** (Goal 1 / 2 / 3) | Capital Today / Bankability Built / Institutional Capital Access | **ALIGN NAMES.** Use the existing customer-facing names: "Goal 01: Get Your FundScore & Access Initial Capital", "Goal 02: Become Bankable", "Goal 03: Full Capital Stack". Map them to the spec's three outcomes internally. |
| **FICO SBSS 270/300** | Not surfaced in spec | **ADD.** SBSS scoring is mentioned in spec §3.4 but not foregrounded. It IS the headline customer score in the existing brand. Make it a first-class hero element. |
| **30/60/90 roadmap** | Pathway Engine output | **ALIGN.** Pathway Engine output IS the 30/60/90 roadmap. Map naming. |
| **24 question assessment** | Module 1 Diagnostic Engine, 50 fields MVP | **RESOLVE.** 24-question marketing claim vs 50-field MVP intake. Either trim the intake to ~24 high-leverage questions for the public assessment, or differentiate the public quick assessment (24Q FundScore preview) from the full intake (50+ fields after signup). Recommend the latter. |

---

## FILE-BY-FILE CLASSIFICATION

Since the live site is a single page and the actual source code is on GitHub (not yet shared), the file-level table here is conservative. The full table fills in once you give me the GitHub URL.

| Surface | Spec area | Tag | Effort | Notes |
|---------|-----------|-----|--------|-------|
| Marketing landing page (the whole single-page site) | Public marketing surface | **KEEP** | 2-4h port to new monorepo `apps/web/app/page.tsx` | Copy verbatim. Restyle to use the BANKABLE IQ Brand v1 Figma tokens. Keep all trademark phrasing. |
| Hero "You built the business" headline + subhead | Public marketing | **KEEP** | included above | This is the brand voice. Strong. |
| FORGE™ Capital Readiness Profile preview card | Public marketing | **ADAPT** | 4-6h | Re-render with real BankableIQ logo and Figma brand tokens. Animate it. Make it the visible artifact. |
| 3-Goal System cards | Public marketing | **KEEP** | included above | Wording is locked. Visual restyle to brand. |
| Membership tier pricing UI ($0/$97/$297) | Public marketing + Billing v0 | **KEEP marketing copy + ADAPT to Stripe** | 6-8h | Wording stays. Stripe Checkout wiring needs to be built per Playbook v1 Phase 15. |
| FAQ accordion | Public marketing | **KEEP** | 2h | Verbatim port. |
| Footer copyright "Bankable Business Solutions" | Branding | **KEEP** | trivial | Confirms parent company name. Use in legal pages. |
| Header "Bankable" wordmark | Brand | **KEEP** | (already in Figma) | Already pulled into BANKABLE IQ Brand v1 file. |
| Green CTA button color #34D399ish | Brand | **DEPRECATE** | 1h | The current green clashes with the engineering spec's navy + cyan palette. Replace site-wide with brand/cyan/500 or a new accent token. Decision needed from founder. |
| Sign In page | Auth | **DEPRECATE** | n/a | Does not exist functionally. Build fresh per Playbook v1 Phase 4. |
| Assessment flow | Module 1 Diagnostic | **DEPRECATE** | n/a | Does not exist. Build fresh, but trim MVP intake to 24 questions to match the marketing promise of "10 minutes." |
| All other product surfaces (Dashboard, Vault, Coach, Marketplace, Pathway, Advisor Center, etc.) | Modules 1-7, 8, 9 | **BUILD FRESH** | per fleet plan | None exist. Entire engineering surface ahead of you. |

---

## SCHEMA MAPPING

Nothing to migrate at the database level. The current site has no backend. No customer accounts, no data, no schema. Clean slate.

What this means for the fleet: zero legacy data migration work. The 35-schema rollout in Playbook v1 Phase 5 builds against an empty namespace.

---

## INTEGRATION MAPPING

| Legacy integration | New service | Action |
|-------------------|-------------|--------|
| None observed on live site (no API calls visible in network requests) | All integrations from Spec §9 | **BUILD FRESH** |
| Marketing tracking pixels (if any) | Spec analytics | Confirm via GitHub repo what is wired. Likely Google Analytics / Posthog / Plausible. Carry over the tracking strategy. |

---

## UI MAPPING

| Legacy screen | New screen | Action |
|---------------|------------|--------|
| Marketing landing page | `apps/web/app/page.tsx` (public marketing home) | **KEEP copy + ADAPT styling to brand tokens** |
| Live preview FORGE card on landing page | Hero asset on `apps/web/app/page.tsx`, plus future demo entry point | **KEEP concept + REBUILD against Spec §3.7.2 envelope shape** |
| Membership pricing section | `apps/web/app/pricing/page.tsx` (real route) + Stripe Checkout | **KEEP copy + BUILD real route** |
| FAQ accordion | `apps/web/app/page.tsx#faq` | **KEEP** |
| Footer | Global layout | **KEEP** |
| All product screens (Dashboard, Vault, Coach, Pathway, Marketplace, Advisor Center, Compliance Audit, Lender Portal, Admin) | Spec §3.8, §3.9, plus Block 2 of v2.3 Visual Foundation Sprint | **BUILD FRESH** from Figma 12 hero screens. |

---

## DATA MIGRATION PLAN

None required. Zero customer data exists.

---

## RECOMMENDED ORDER OF WORK

1. **Founder decision on trademark adoption.** You confirm whether the spec absorbs FundScore, FORGE, FundReady as the customer-facing names. (5 minutes of your time. I will draft the change to the spec.)
2. **Spec patch.** I write a v1.0.1 patch to the engineering spec adopting the trademark terms throughout. Fleet's `bot-architect` and `bot-docs` agents process it on next Orchestrator cycle.
3. **Brand decision on green CTA.** You decide whether to keep the bright green accent from the live site or move to cyan/violet from the new Figma brand. Recommend: drop the green for cyan/cobalt to match the institutional fintech positioning the wordmark already has.
4. **Marketing copy port.** Lift the entire landing page copy verbatim into `apps/web/app/page.tsx` in the new monorepo on bootstrap. Restyle with Figma brand tokens. This becomes the public marketing surface immediately.
5. **Wire the Vercel project to the new repo.** Once the new monorepo is bootstrapped (Playbook v2.1 PR #1), point `bankable-iq-fintech.vercel.app` at the new repo. The marketing site keeps its URL but gets the new design system. No customers are confused.
6. **Build the product behind the marketing.** Per Playbook v2.1 + v2.2 fleet plan. 27 agents. Continuous. 

---

## IMPLICATIONS FOR THE BUILD FLEET (v2.1 + v2.2)

The Migration Report changes a small number of things in the fleet plan. None of them are blockers.

| Change | Where it lands | Effect |
|--------|----------------|--------|
| Adopt FundScore as the customer-facing score name | `bot-architect` opens an ADR; `bot-frontend` renames UI strings; `bot-bai` renames internal exports | One short PR, fleet handles |
| Adopt FORGE as the customer-facing AI name | Same as above. `bot-coaching` and `bot-bai` apply | One short PR |
| Trim MVP intake from 50 to ~24 questions for the public assessment | `bot-diagnostic` opens an issue for v0 scope reduction | Faster MVP |
| Add SBSS scoring as first-class hero on dashboard | `bot-frontend` issue for dashboard hero refinement | Already aligned with spec §3.4 |
| Port the existing marketing landing page verbatim | First `bot-frontend` issue after bootstrap | Day-one marketing live |
| Keep the existing Vercel project URL + GitHub repo connection | `bot-platform` reconfigures Vercel project to point at the new monorepo | Single configuration step in bootstrap |

---

## SUNSET PLAN

The existing single-page Vercel deployment is replaced by the new monorepo's `apps/web` build on the same Vercel project. Same URL. Same DNS. The footer copyright remains "Bankable Business Solutions." Old git branch `main` (commit `8df1921`) gets archived as `legacy/marketing-only-2026-05` for traceability.

No customer impact. There are no customers yet on the live site.

---

## WHAT I STILL NEED FROM YOU

1. **GitHub repo URL.** I have only seen the deployed surface. For full code-level Archeologist classification (the package.json, the Tailwind config, the component structure, any hidden auth scaffolding) I need read access to the GitHub repo. Drop the URL in chat and I run the deep pass.
2. **Trademark adoption decision.** Confirm: should the new build adopt FundScore + FORGE + FundReady as the customer-facing names, with the spec's BAI / Bankability Score / Pathway Engine names becoming internal engineering names only?
3. **Green vs cyan CTA color call.** Keep the bright green accent from the current site, or move to the cyan/cobalt from the new Figma brand v1?

Once you give me those three answers, I can finalize the spec patch and the fleet's bootstrap rider so the migration is built into the first PR.

---

## SCORE: HOW WELL DOES THE EXISTING PROJECT FIT THE NEW SCOPE?

| Dimension | Score | Reason |
|-----------|-------|--------|
| Brand alignment | 9/10 | Wordmark, voice, story are mature. Only the CTA color needs reconciliation. |
| Product narrative | 10/10 | The 3-Goal System, FORGE, FundScore are clear, sellable, and customer-tested in copy. |
| Engineering reuse | 1/10 | Marketing page only. Almost nothing to reuse in code. |
| Schema reuse | 0/10 | No backend. |
| Time to value | 9/10 | Marketing copy ports in hours. The fleet builds the product behind it. |
| Customer disruption risk | 0/10 | No customers on the live site to disrupt. |

**Overall: this is the cleanest possible Archeologist case.** Take the brand and the copy. Build the product fresh. Same URL. No data migration. No legacy customers. The new fleet inherits a polished marketing voice and ships a real product behind it.

End of Migration Report
