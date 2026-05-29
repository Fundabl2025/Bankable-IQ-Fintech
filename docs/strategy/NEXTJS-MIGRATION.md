# Vite → Next.js 14 Parallel Migration Plan

## Why this approach

The repo's current frontend stack is Vite + React + React Router. Blueprint v1.8 Part 10 (Recommended Tech Stack) names **Next.js 14 + Tailwind + shadcn/ui** as the target. The Spec Patch v1.1 confirms the migration.

A big-bang rewrite of 70+ pages from React Router to App Router risks breaking the live marketing site at `bankable-iq-fintech.vercel.app`. **We do not take that risk.**

Instead: Next.js is added **alongside** the existing Vite app. Both can run. The autonomous fleet's `bot-frontend` agent migrates pages one at a time via subsequent PRs, with each migration shippable independently.

## Current state

| Path | Stack | Status |
|------|-------|--------|
| `src/` | Vite + React + React Router | Active, deployed at `bankable-iq-fintech.vercel.app` |
| `apps/web-next/` | Next.js 14 App Router | Scaffolded, dormant. Run with `pnpm dev:next` on port 3001 |
| `apps/web-next/app/page.tsx` | Placeholder landing | Replaced by PR #6 (brand restyle) and progressively by migrated pages |

## Local development

```bash
# Existing Vite app (canonical, default)
pnpm dev                # http://localhost:5173

# New Next.js app (parallel)
pnpm dev:next           # http://localhost:3001
```

Both can run simultaneously without conflict.

## Vercel deployment strategy (during migration)

Vercel project remains pointed at the Vite build (`pnpm build`). The Next.js app does NOT deploy to production yet. Vercel preview builds for PRs run the Vite build. Once the Next.js app reaches feature parity (target: PR #25 or earlier per fleet velocity), Vercel switches to `pnpm build:next` and the Vite app is archived.

## Page migration order (recommended for bot-frontend)

The fleet's `bot-frontend` agent picks pages in this dependency order. Each migration is a separate PR labeled `frontend`.

| Wave | Pages | Why first |
|------|-------|-----------|
| 1 | LandingPage (the public marketing surface) | Highest visibility, validates the pattern |
| 2 | Auth flow (Login, Signup, Forgot, Reset) | Foundation for every other route |
| 3 | Dashboard, MyBusinessProfile, MyProgress, Settings | Core authenticated client surfaces |
| 4 | UnifiedAssessment, FoundationQuestions, Results | The Bankability Compass + Wheel Diagnostic |
| 5 | All 19 AccessFunding/* product pages | High volume, low complexity, easy to batch |
| 6 | All 12 LenderCompliance/* pages | Same as above |
| 7 | AICoach | Wired to Anthropic Claude per PR #7 |
| 8 | All 6 credit-path/* calculators | DSCR, DTI, Utilization, Dispute, Inquiry, Tradeline |
| 9 | All 5 StatusReports/* views | Bankable Status, FICO, Funding, Owner's, Personal |
| 10 | DocumentCollection (becomes Vault per Spec §3.5) | Schema-heavy migration |
| 11 | CapitalAccessMap, CreditPath, BuildingCredit | Capital Pathway Engine surfaces |
| 12 | TemplatesAndResources, CapitalGlossary, ResourceDetail | Static content |
| 13 | admin/LenderPortal | Becomes the basis for Marketplace partner UI |
| 14 | Newly-built advisor surfaces (Capital Readiness Advisor Command Center) | Net-new per Blueprint §17 |

## Shared dependencies

Path aliases in `apps/web-next/tsconfig.json` map back to the Vite app:

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `apps/web-next/*` (Next.js local) |
| `@app/*` | `../../src/app/*` (existing app code) |
| `@lib/*` | `../../src/app/lib/*` (existing lib including Supabase client + AuthContext + lib/forge) |
| `@components/*` | `../../src/app/components/*` (existing shadcn-style UI primitives) |

This means Next.js pages can import existing components without copying. When a page migrates fully, references are flipped from `@components/*` to local `apps/web-next/components/*` and the legacy Vite version is deleted.

## Env var contract during migration

| Variable | Old (Vite) | New (Next.js) | Both work during transition |
|----------|------------|---------------|------------------------------|
| Supabase URL | `VITE_SUPABASE_URL` | `NEXT_PUBLIC_SUPABASE_URL` | Yes, see `src/app/lib/supabase/client.ts` |
| Supabase anon key | `VITE_SUPABASE_ANON_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| Anthropic API key | not in client | server-only in Next.js | Server only |
| Plaid keys | server only | server only | Server only |

Vercel project should set BOTH the VITE_ and NEXT_PUBLIC_ versions for any client-side env during the transition window.

## Acceptance criteria for "migration complete"

The Vite app is archived (deleted from `src/` and Vercel build flipped to `pnpm build:next`) when all of these are true:

- [ ] All 70+ pages migrated to `apps/web-next/app/`
- [ ] AuthContext + Supabase client + data adapter ported (or re-implemented in Next.js patterns)
- [ ] All routes have a corresponding Next.js Server Component or Client Component
- [ ] Playwright e2e suite green against Next.js build
- [ ] Vercel preview matches Vite preview side-by-side for the gold path
- [ ] No `vite` or `react-router-dom` imports remain
- [ ] `package.json` removes Vite scripts and dependencies
- [ ] This document is updated with a "Migration complete" stamp

## Why not migrate everything in one PR

70+ pages × proper test coverage × auth context port × routing rewrite × env contract change ≈ 6-10 hours of bot-frontend work. Doing it as one PR means one giant review and one giant blast radius. Doing it as 14+ progressive PRs means each PR is reviewable in 5 minutes and the live site never breaks.

This is also how every real production app migrates between major frontend frameworks: incremental, parallel, with a kill switch (the Vite app stays runnable until the last day).
