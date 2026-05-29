# Vocabulary Rename Plan (Blueprint v1.8 Alignment)

## State after this PR

- New canonical column `bankability_score` (0-100) lives alongside legacy `fund_score` (0-160).
- New canonical column `maturity_level` (5-stage enum) lives alongside legacy `eligibility_tier` (3-tier enum).
- A trigger keeps `bankability_score` in sync when `fund_score` is updated.
- `src/app/lib/vocabulary/index.ts` defines every canonical Blueprint v1.8 string.
- `useBrandLabel()` hook lets components pull labels easily.
- Existing UI strings (145 FundScore, 22 FundReady, 42 FORGE, 6 eligibility_tier) are UNCHANGED in this PR.

## State after bot-frontend completes the rename

Per the autonomous fleet rider, `bot-frontend` opens progressive PRs replacing UI strings file-by-file. The dependency rules:

| Layer | Action |
|-------|--------|
| Database columns | Both old and new exist. Application reads from new, writes to both during transition. |
| TypeScript types | Define both during transition. Switch to v1.8 types over time. |
| React components | Replace `FundScore` text with `useBrandLabel().score.bankability.name`. |
| Marketing copy | Replace any `FORGE` / `FundScore` / `FundReady` text with v1.8 strings. |
| URL routes | Keep stable. SEO is preserved. Internal labels are what changes. |
| Code module names (`lib/forge/`, etc.) | Keep. Internal-only. |

## Why this approach

Replacing 145 string instances in a single PR is unreviewable and likely to break dynamic references. Instead, this PR establishes the truth (canonical vocabulary file + canonical schema columns) and lets the fleet migrate UI strings progressively. Each bot-frontend PR is reviewable in 5 minutes and the live app never breaks.

## Suggested first batch for bot-frontend

The 10 highest-visibility UI surfaces should migrate first:

1. `src/app/pages/Dashboard.tsx` — main score display
2. `src/app/pages/LandingPage.tsx` — marketing hero (also PR #6)
3. `src/app/pages/business-assessment/Results.tsx` — assessment results
4. `src/app/components/FicoWidget.tsx` — score widget
5. `src/app/components/TopNav.tsx` — navigation
6. `src/app/components/Sidebar.tsx` — sidebar labels
7. `src/app/components/UnifiedProgressBar.tsx` — progress display
8. `src/app/pages/AICoach.tsx` — coach UI (FORGE → AI Readiness Coaching System)
9. `src/app/pages/MyProgress.tsx` — progress page
10. `src/app/pages/admin/LenderPortal.tsx` — admin labels

After those 10, the remaining ~100 string references are mostly in deeper page surfaces and can be migrated as those pages migrate to Next.js.

## Acceptance: "vocabulary alignment complete"

- [ ] All 145 `FundScore` UI references replaced with `Bankability Score`
- [ ] All 22 `FundReady` references replaced with `Bankability Compass` or `Bankability Wheel Diagnostic`
- [ ] All 42 customer-facing `FORGE` references replaced with `AI Readiness Coaching System`
- [ ] All 6 `eligibility_tier` references in code switched to `maturity_level` reads
- [ ] Marketing site shows Bankability Score / 100, not FundScore / 160
- [ ] After UI migration is complete, separate PR drops legacy SQL columns:
  - `business_profiles.fund_score`
  - `business_profiles.eligibility_tier`
  - The sync trigger

## Stays internal (no rename needed)

- `src/app/lib/forge/` directory name — internal code module, no UI reference
- Function names like `getForgeGreeting()` — refactored when the file moves
- Component file names — renamed in the Next.js migration PRs
