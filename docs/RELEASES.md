# RELEASES.md — Bankable IQ Release Management

> Every production deploy is a trust event. Treat it accordingly.

---

## Release Pipeline

```
Local branch → GitHub push → Vercel auto-deploy → bankableiq.io
```

Branch: `main` auto-deploys to production via Vercel CI/CD.
GitHub repo: `Fundabl-Fintech/Bankable-IQ-Fintech`

---

## Release Classification

| Class | Description | Required Before Ship |
|-------|-------------|---------------------|
| **Patch** | Copy fixes, style tweaks, non-logic UI changes | Smoke test |
| **Feature** | New pages, new tools, new components | Smoke test + affected area test |
| **Engine** | Scoring, eligibility, readiness logic changes | Full engine unit tests + smoke |
| **Schema** | `UnifiedAnswers` or Supabase schema changes | Migration review (see MIGRATIONS.md) + engine tests + smoke |
| **Breaking** | Route changes, auth changes, data persistence changes | Full regression + staged rollout plan |

---

## Pre-Deploy Checklist

Run this before every push to `main`:

### Always
- [ ] TypeScript build passes (`npm run build` with zero type errors)
- [ ] No console errors in local dev run
- [ ] No hardcoded test values or `TODO: remove` comments

### For engine/schema changes
- [ ] Scoring version reviewed — does this change require a version bump? (see MIGRATIONS.md)
- [ ] Existing `UnifiedAnswers` in localStorage remain backward-compatible
- [ ] No new duplicate logic introduced

### For copy/trust changes
- [ ] No guarantee language
- [ ] No exact outcome promises
- [ ] Compliance Architect lens applied

### For new pages/routes
- [ ] Added to `routes.tsx` as lazy component
- [ ] Accessible from sidebar or navigation
- [ ] Matches LenderCompliance.tsx design pattern

---

## Post-Deploy Smoke Test

After every deploy to production, run the smoke test checklist from TESTING.md:

- [ ] Assessment completes without error
- [ ] FundScore displays on Results page
- [ ] CreditPath loads correctly
- [ ] Access Funding page loads correctly
- [ ] Dashboard reflects business profile
- [ ] Getting Started renders 3 goals
- [ ] No 404s in primary nav

**If any smoke test fails:** document in INCIDENTS.md, revert or hotfix within 1 hour.

---

## Versioning and Scoring Changes

Scoring changes require explicit version tracking. See MIGRATIONS.md for the scoring version protocol.

**Never ship a scoring change without:**
1. Bumping the scoring version constant in `engine.ts`
2. Documenting what changed and why in the changelog
3. Confirming that existing stored results remain interpretable

---

## Hotfix Protocol

When production has a critical defect (wrong score, broken route, trust-affecting bug):

1. Document in INCIDENTS.md — time, nature, affected surfaces
2. Create hotfix branch, apply minimal targeted fix
3. Run smoke test locally
4. Push — Vercel auto-deploys
5. Verify fix live on bankableiq.io
6. Close incident in INCIDENTS.md with resolution

---

## Feature Flags

The platform uses feature flags for monetization gating:

| Flag | Location | Current State |
|------|----------|--------------|
| `PAYMENT_GATES_ENABLED` | `membership.ts` | `false` (disabled) |

**Do not enable `PAYMENT_GATES_ENABLED` without:**
- Confirming Supabase payment table is live
- Confirming upgrade flow is tested end-to-end
- Confirming free tier still functions with gates enabled

---

## Changelog Practice

Every non-trivial release should have a brief entry in `CHANGELOG.md`:

```
## [date] — Release class
- What changed
- Why it changed
- Scoring version: unchanged | bumped to vX.Y
```

---

*See also: ENGINEERING.md · TESTING.md · OBSERVABILITY.md · INCIDENTS.md · MIGRATIONS.md*
