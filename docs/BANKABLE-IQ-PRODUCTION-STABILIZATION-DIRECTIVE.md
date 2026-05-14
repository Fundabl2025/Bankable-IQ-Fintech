# BANKABLE-IQ-PRODUCTION-STABILIZATION-DIRECTIVE.md

**Engineer's Production Stabilization Directive — Bankable IQ Software Platform**

- **Status:** ACTIVE — Living document, updated on each work order close
- **Compiled:** 2026-05-14
- **Authority:** Director 13 (Kevin Murphy) — final approval on all work orders
- **Engineering authority:** Director 17 — sacred-rule enforcement, `computeScore()` guardian
- **Compliance authority:** Director 11 — banned-phrase enforcement
- **Launch target:** 2026-05-29 (15 days from compile date)

**Pairs with:**
- `docs/BANKABLE-IQ-ENGINEERS-PDR.md` — full engineering reference (source of truth)
- `audits/2026-05-08-vite-production-readiness.md` — original audit findings
- `audits/2026-05-08-vite-remediation-roadmap.md` — sequenced remediation

---

## 1. Purpose

This directive is the single authoritative task list for the production stabilization sprint between now and the 2026-05-29 launch of the 500-member Founding Cohort of Capital Advisors.

The PDR (`docs/BANKABLE-IQ-ENGINEERS-PDR.md`) defines the architecture and rules of the system. This directive operationalizes that architecture by translating the P0 and elevated-P1 audit findings into eight discrete, prioritized, acceptance-criteria-gated work orders.

**When this document conflicts with the PDR, the PDR wins on architecture. This directive wins on priority and sequencing.**

Every work order must be closed — merged to `main`, verified in production, and this document updated — before launch. No partial closes. No "good enough." No deferring to post-launch unless explicitly marked `[DEFERRED — POST-LAUNCH]` and approved by Director 13.

---

## 2. Non-Negotiable Engineering Rules

These rules apply to every work order, every PR, and every commit in this repo. They are not suggestions. Violations block merge.

### 2.1 Scoring engine rules (Director 17)
1. **`computeScore()` in `engine.ts` is sacred.** No change without: (a) Director 17 review noted in the commit message and (b) all 21 golden test cases passing. No exceptions.
2. **One source of truth for scoring.** Never compute the score a different way for a different surface. If you want a different view, transform the canonical output. Do not fork the math.
3. **`SCORING_VERSION` must be bumped** on any algorithm change. Current version: `v1.1`.
4. **Golden test failures are signals, not problems to fix by adjusting expected values.** If a golden case fails, the code is wrong. Fix the code.

### 2.2 Compliance rules (Director 11)
5. **No banned phrase ships.** The full list lives in `src/app/lib/ai/guardrails.ts:GLOBAL_FORBIDDEN_CLAIMS`. Key examples:
   - "qualify" without a modifier
   - "guaranteed approval" / "we'll get you funded" / "100% approval" / "instant funding"
   - "pre-approved" without "not"
   - Income claims without disclaimer
   - "CLARION AI" (retired product name)
   - `fundreadyai.com` (retired domain)
   - "FundReady" / "FundScore" in any customer-facing string
   - "FORGE" in any customer-facing string
6. **AI explanations are never definitive financial advice.** This must be encoded in the AI Coach system prompt, not just enforced at runtime.
7. **Bankable IQ is an information and education service.** It is not a lender, broker, credit repair organization, or financial advisor. No copy may imply otherwise.

### 2.3 Data and security rules (Director 17 + Director 11)
8. **No secrets in source.** No API tokens, credentials, or private keys in any file tracked by git — including documentation files.
9. **BOLT_BROKER_TOKEN is server-side only.** It must never appear in client bundle, env vars accessible to the browser, or any tracked file.
10. **LocalStorage holds no PII after account creation.** Anonymous intake data may live in LocalStorage during the intake flow. On successful authentication, the data must be migrated to Supabase and the LocalStorage entry must be cleared.
11. **Supabase RLS must be active before any multi-tenant user data is written.** No advisors can see client data that is not assigned to them. No business owner can see another owner's data.

### 2.4 PR process rules
12. **No PR merges without this checklist passing** (see Section 6).
13. **No self-merges.** Every PR requires at minimum one review pass.
14. **No force-push to `main`.** Vercel auto-deploys on push; a force-push can deploy broken state silently.
15. **This document must be updated** when a work order closes. The change log entry (Section 7) is part of the merge commit.

---

## 3. Priority Order

Work orders are sequenced by blast radius and dependency. **Do not begin WO-N+1 until WO-N is merged to `main` unless the dependency note explicitly permits parallelism.**

| Order | Work Order | Category | Launch-blocking? | Est. effort |
|-------|-----------|---------|-----------------|-------------|
| **1** | WO-1: Secret rotation + history scrub | Security | **YES — do today** | 2–4 hours |
| **2** | WO-2: Brand + domain string sweep | Compliance | **YES** | 4–8 hours |
| **3** | WO-3: Banned phrase purge | Compliance | **YES** | 2–4 hours |
| **4** | WO-4: Three-layer scoring fix | Architecture | **YES (elevated from P1)** | 1–2 days |
| **5** | WO-5: Automated test suite + 21 golden cases | Quality | **YES** | 2–3 days |
| **6** | WO-6: Supabase RLS + data isolation | Security | **YES (elevated from Sprint 4)** | 1–2 days |
| **7** | WO-7: Intake completion (36 → 47 questions) | Product | **YES** | 3–5 days |
| **8** | WO-8: GHL webhook integration | Integration | Preferred (workaround documented) | 2–3 days |

**WO-1 through WO-3 can run in parallel if multiple engineers are available.**
**WO-4 must complete before WO-5 (golden tests validate the corrected scoring output).**
**WO-6 can run in parallel with WO-4 and WO-5.**
**WO-7 can start after WO-5 closes (tests must be in place before adding new questions).**
**WO-8 is independent and can run in parallel with any other work order.**

---

## 4. Work Orders

---

### WO-1: Secret Rotation + Repository History Scrub

**Priority:** P0 — Do immediately. This is not a pre-launch task. It is an active security incident.

**Owner:** Kevin Murphy (Director 13) — token rotation requires credential access only Kevin holds. Engineer supports the git history scrub.

**Background:**
`BOLT_BROKER_TOKEN` was committed to the public repository and also baked into a `dist/` bundle that was committed before `.gitignore` was corrected (closed P0-2). The token is therefore in git history even though the files are now gitignored. Anyone who cloned or forked the repo, or who has the bundle cached by a git hosting service, holds a live copy of this credential. This is an active breach under GLBA Safeguards Rule (16 CFR Part 314), which requires prompt remediation.

**Tasks:**

1. **Kevin: Rotate the BOLT_BROKER_TOKEN immediately** via the Bolt partner dashboard. The old token must be fully revoked — rotation alone (issuing a new token without revoking the old one) does not close the incident.

2. **Kevin: Contact Bolt and request an audit of API calls** made with the old token since the date of the commit that introduced it. Look for calls with unexpected IP addresses, payloads, or timing.

3. **Engineer: Scrub git history** using `git filter-repo` (preferred) or `BFG Repo Cleaner` to remove all commits that contain the token string. Steps:
   ```bash
   # Install git-filter-repo
   pip install git-filter-repo

   # Scrub the token from all history
   git filter-repo --replace-text <(echo "BOLT_BROKER_TOKEN_VALUE==>REDACTED")

   # Force-push all branches (coordinate with team — this rewrites history)
   git push origin --force --all
   git push origin --force --tags
   ```
   > Director 13 must approve the force-push. All team members must re-clone after the scrub. Any local copies with the old history must be discarded.

4. **Engineer: Add `detect-secrets` pre-commit hook** to prevent recurrence:
   ```bash
   pip install detect-secrets
   detect-secrets scan > .secrets.baseline
   # Add to .pre-commit-config.yaml
   ```

5. **Engineer: Audit all documentation files** for any other credentials, tokens, or keys. Remove any found. Confirmed: `docs/PHASE_1_PLAN.md` contains the token in plaintext — this file must be scrubbed or deleted as part of this work order.

6. **Engineer: Update `.env.example`** to confirm `BOLT_BROKER_TOKEN` is listed as a required server-side env var with no example value (just a placeholder like `your-bolt-token-here`).

7. **Engineer: Verify Vercel production environment** has the new token set under `BOLT_BROKER_TOKEN` in the Vercel project settings before any new deploy.

**Acceptance criteria:**
- [ ] Old token is revoked in Bolt partner dashboard (Kevin confirms)
- [ ] Bolt audit log reviewed; any unauthorized calls documented
- [ ] `git log -S "OLD_TOKEN_STRING" --all` returns zero results
- [ ] `detect-secrets scan` returns clean baseline
- [ ] `docs/PHASE_1_PLAN.md` contains no credentials
- [ ] Vercel production env has new token set
- [ ] `api/bolt-proxy.ts` tested end-to-end with new token before merge to `main`

---

### WO-2: Brand + Domain String Sweep

**Priority:** P0 — Addresses P0-4 (retired domain), P0-5 (retired branding), P1-6 (placeholder title)

**Owner:** Engineer (Director 11 review on all customer-facing strings before merge)

**Background:**
The platform has been renamed. Retired identifiers that remain in source create legal entity confusion, compliance disclosure failures, and brand incoherence. Every customer-facing string using the retired identity is a compliance violation per Director 11 rules.

**Banned identifiers to remove from all files:**
- `fundreadyai.com` — retired domain, must not appear anywhere in source
- `FundReady` — retired product name (customer-facing; operator-layer carve-out for `FundScore` in advisor-only views — see PDR §9.1)
- `FundScore` — retired customer-facing name (operator-layer carve-out applies only to advisor-specific components)
- `FORGE` — retired product name
- `CLARION AI` — retired product name
- `support@fundreadyai.com` — retired email; replace with `support@getfundabl.com`

**Tasks:**

1. **Run full-codebase search** for all banned identifiers:
   ```bash
   grep -rn "fundreadyai\|FundReady\|FundScore\|FORGE\|CLARION" \
     --include="*.ts" --include="*.tsx" --include="*.html" \
     --include="*.md" --include="*.json" --include="*.env*" \
     src/ app/ public/ docs/ api/ .
   ```

2. **Replace all instances** using the correct current identifiers:
   | Replace | With |
   |---------|------|
   | `support@fundreadyai.com` | `support@getfundabl.com` |
   | `fundreadyai.com` | `bankableiq.io` (or correct production domain) |
   | `FundReady` (customer-facing) | `Bankable IQ` |
   | `FundScore` (customer-facing) | `Bankable Score` (Note: `FundScore` may remain in advisor-only operator-layer components — confirm with Director 11 before removing) |
   | `FORGE` | Remove entirely or replace with `AI Coach` per context |
   | `CLARION AI` | Remove entirely |

3. **Fix `index.html` `<title>`** — currently `"SaaS Financing System"` (P1-6):
   ```html
   <title>Bankable IQ — Capital Readiness Platform</title>
   ```

4. **Fix `<meta>` description and OG tags** in `index.html` if they reference retired branding.

5. **Update any hardcoded sender addresses** in email templates, auth flows, or support references.

6. **Director 11 review** — submit a diff of all changed customer-facing strings for compliance sign-off before merge.

**Acceptance criteria:**
- [ ] `grep -rn "fundreadyai" .` returns zero results (excluding `.git/`)
- [ ] `grep -rn "FundReady\|FORGE\|CLARION" src/ app/ public/` returns zero results
- [ ] `grep -rn "SaaS Financing System" .` returns zero results
- [ ] `index.html` title is "Bankable IQ — Capital Readiness Platform" (or Director 13-approved equivalent)
- [ ] All support email addresses point to `support@getfundabl.com`
- [ ] Director 11 sign-off on diff of customer-facing string changes in commit message

---

### WO-3: Banned Phrase Purge

**Priority:** P0 — Addresses P0-6 ("You qualify for capital") and P0-7 ("guaranteed approval" / "instant funding")

**Owner:** Engineer (Director 11 review required before merge)

**Background:**
Definitive creditworthiness claims by a non-lender are a violation of FTC Act Section 5 (deceptive practices) and create FCRA exposure. These strings are live in the current build and are visible to end users. This is not cosmetic debt — it is regulatory exposure.

**Known violation locations:**
- `Results.tsx` — "You qualify for capital" (P0-6)
- Various components — "qualify for X products" (P0-6)
- `docs/PHASE_1_PLAN.md` — "guaranteed approval" / "instant funding" (P0-7, also contains credentials — see WO-1)

**Tasks:**

1. **Full scan** for all banned phrases defined in `GLOBAL_FORBIDDEN_CLAIMS`:
   ```bash
   # Key terms to scan (add all from guardrails.ts)
   grep -rn "qualify for\|guaranteed approval\|instant funding\|we'll get you funded\|100% approval\|pre-approved\|You qualify" \
     src/ app/ public/ docs/ --include="*.ts" --include="*.tsx" --include="*.html" --include="*.md"
   ```

2. **Rewrite all flagged strings** using compliant alternatives:
   | Banned phrase | Compliant replacement |
   |--------------|----------------------|
   | "You qualify for capital" | "Based on your profile, you may be eligible for these capital options" |
   | "qualify for X products" | "may be a match for X products based on your score" |
   | "guaranteed approval" | Remove entirely; no guarantee language permitted |
   | "instant funding" | Remove entirely or replace with factual timeframe if known |
   | "pre-approved" | "not pre-approved" or remove entirely |

3. **Add CI lint step** that blocks any PR that introduces banned phrases:
   ```bash
   # Script: scripts/check-banned-phrases.sh
   # Runs against staged files on pre-commit and in CI pipeline
   ```
   Wire this into `.github/workflows/` (or Vercel CI equivalent) so the gate runs on every PR, not just locally.

4. **Verify `guardrails.ts:GLOBAL_FORBIDDEN_CLAIMS`** is current and complete. If any banned phrase found in the scan is not already in the list, add it. Do not remove any existing entry.

5. **Director 11 review** on all replacement copy before merge.

**Acceptance criteria:**
- [ ] All phrases in `GLOBAL_FORBIDDEN_CLAIMS` return zero results from `grep -rn` across `src/`, `app/`, `public/`, `docs/`
- [ ] Replacement copy reviewed and approved by Director 11 (noted in commit message)
- [ ] CI/pre-commit banned-phrase gate is active and blocking on example of a banned phrase
- [ ] `Results.tsx` renders without any banned language — verified in browser at `/business-assessment/results`

---

### WO-4: Three-Layer Scoring Fix

**Priority:** Elevated from P1-2 to pre-launch required. Trust issue — Capital Advisors will see the wrong score range on day one if not fixed.

**Owner:** Engineer (Director 17 review required; golden tests must pass — see WO-5)

**Background:**
The PDR specifies three scoring layers: Bankable Score 0-100 (client-facing), FundScore 0-1000 (operator-facing), SBSS 0-300 (lender-facing). The canonical transform is `bankableScore = round(fundScore / 10)`.

Currently, `bankableScore` in `ScoreResult` holds the 0-300 SBSS value — the variable name is lying. All 15 call sites that read `bankableScore` are displaying lender-domain data to clients and advisors who expect a 0-100 readiness score. This is a product trust failure on the first day a Capital Advisor opens a client file.

Additionally, `src/app/utils/businessData.ts:calculateFicoSBSS()` uses entirely different math (`return 80 + completedPoints`) — a Director 17 "no second source of truth" violation. `AICoach.tsx` reads via `engine.ts`; `BusinessFICO.tsx` reads via `businessData.ts` — they show different numbers for the same client.

**Tasks:**

1. **In `engine.ts`, implement the 0-100 Bankable Score transform:**
   ```typescript
   // In computeScore() return value:
   const fundScore = calculateFundScore(data);         // 0-1000
   const sbssScore = calculateSBSSScore(data);         // 0-300
   const bankableScore = Math.round(fundScore / 10);   // 0-100 canonical transform

   return {
     fundScore,
     sbssScore,
     bankableScore,  // NOW correctly 0-100
     band: getBand(bankableScore),
     scoringVersion: SCORING_VERSION,
     componentBreakdown: { ... }
   };
   ```
   > **Director 17 review required in commit message. `SCORING_VERSION` must bump to `v1.2`.**

2. **Audit all 15 call sites** to confirm each is using the correct layer for its audience:
   - Customer-facing surfaces (`Results.tsx`, `Dashboard.tsx`, `GettingStarted.tsx`, `CreditPath.tsx`, `MyProgress.tsx`) → display `bankableScore` (0-100)
   - Advisor-facing surfaces (`StatusReports.tsx`, `AICoach.tsx`) → may display `fundScore` (0-1000) with label "FundScore" in operator context only
   - Lender-facing artifacts → display `sbssScore` (0-300) with label "FICO SBSS"

3. **Deprecate `calculateFicoSBSS()` in `businessData.ts`:**
   ```typescript
   /** @deprecated Use engine.ts:computeScore().sbssScore instead. Sprint 0.6 removal. */
   export function calculateFicoSBSS(): number {
     throw new Error(
       'calculateFicoSBSS() is deprecated. Use computeScore().sbssScore from engine.ts.'
     );
   }
   ```
   Then redirect all callers (`BusinessFICO.tsx`) to the canonical engine output. Confirm zero runtime calls remain before removing the function entirely.

4. **Verify score band logic** — `getBand()` must be calibrated for the 0-100 range, not the 0-300 range:
   | Band | 0-100 range |
   |------|------------|
   | Not Bankable | 0–19 |
   | Emerging | 20–39 |
   | Conditionally Bankable | 40–59 |
   | Bankable | 60–79 |
   | Highly Bankable | 80–100 |
   > Confirm these thresholds with Director 17 before implementing. Do not assume — ask.

5. **Update all UI labels** that display the score to show the correct range indicator (e.g., "47 / 100" not "47 / 300").

**Acceptance criteria:**
- [ ] `computeScore()` returns `bankableScore` in range [0, 100] for all valid inputs
- [ ] `computeScore()` returns `sbssScore` in range [0, 300] for all valid inputs
- [ ] `computeScore()` returns `fundScore` in range [0, 1000] for all valid inputs
- [ ] `SCORING_VERSION` bumped to `v1.2` (or as Director 17 directs)
- [ ] `calculateFicoSBSS()` in `businessData.ts` throws on call; zero live callers remain
- [ ] All 15 call sites audited; each uses the correct scoring layer for its audience
- [ ] `Results.tsx` shows score in "X / 100" format in browser
- [ ] Director 17 review noted in commit message
- [ ] All 21 golden test cases pass (depends on WO-5 — coordinate)

---

### WO-5: Automated Test Suite + 21 Golden Scoring Cases

**Priority:** P0 — The sacred rule "golden tests must pass before any engine change" is currently unenforceable. This work order makes it enforceable.

**Owner:** Engineer

**Background:**
Zero automated tests exist. The scoring engine has a spec for 21 golden test cases (`bankable-iq/build/scoring-normalization-spec.md`) but the tests are not written. Until they are, every change to `computeScore()` — including the changes in WO-4 — is done blind. The "golden tests must pass" rule is a promise with no enforcement mechanism.

This work order must be coordinated with WO-4: the scoring fix in WO-4 changes what the correct output is. Write the golden cases to validate the corrected output, not the current (broken) output.

**Tasks:**

1. **Install Vitest and testing library:**
   ```bash
   pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom
   ```

2. **Create `vitest.config.ts`:**
   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';
   import { resolve } from 'path';

   export default defineConfig({
     plugins: [react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./src/test/setup.ts'],
       globals: true,
     },
     resolve: {
       alias: {
         '@': resolve(__dirname, './src'),
       },
     },
   });
   ```

3. **Add npm/pnpm scripts to `package.json`:**
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:ui": "vitest --ui",
   "test:coverage": "vitest run --coverage"
   ```

4. **Write all 21 golden scoring test cases** in `src/test/scoring/golden-cases.test.ts`.

   Each case format:
   ```typescript
   it('GOLDEN-{N}: {description}', () => {
     const input: UnifiedAnswers = { /* fixed inputs */ };
     const result = computeScore(input);
     expect(result.bankableScore).toBe(/* exact expected value */);
     expect(result.sbssScore).toBe(/* exact expected value */);
     expect(result.fundScore).toBe(/* exact expected value */);
     expect(result.band).toBe(/* exact expected band */);
     expect(result.scoringVersion).toBe('v1.2');
   });
   ```

   **Required coverage (21 cases):**
   - 5 client profile boundary conditions (Starter / Emerging / Constrained / Growth / Scale)
   - 6 stage transition boundaries (Foundation→Stabilization, Stabilization→Activation, Activation→Expansion, Expansion→Optimization, Optimization→Institutional, edge at max)
   - 5 capital pathway routing validations (Starter / Credit Recovery / Growth / Scale / Investor pathway trigger conditions)
   - 5 edge cases:
     - All inputs at minimum (floor)
     - All inputs at maximum (ceiling)
     - Missing business credit data (no EIN, no bureaus)
     - Conflicting answers (high personal credit + high-risk entity + no business history)
     - NAP failure (name/address/phone inconsistency)

   > Pull the exact input fixtures and expected values from `bankable-iq/build/scoring-normalization-spec.md`. If that file is not in this repo, request it from Director 17 before writing the tests.

5. **Write smoke tests for critical path components:**
   - `Results.tsx` renders without crashing given a valid `ScoreResult`
   - `computeScore()` does not throw on any input in `scripts/eval-scoring.ts` fixtures
   - `guardrails.ts:checkForgeOutput()` blocks all strings in `GLOBAL_FORBIDDEN_CLAIMS`

6. **Wire tests into CI** — tests must run on every PR and block merge on failure. Add to Vercel build command or GitHub Actions:
   ```yaml
   - name: Run tests
     run: pnpm test
   ```

**Acceptance criteria:**
- [ ] `pnpm test` runs without configuration errors
- [ ] All 21 golden cases exist and pass
- [ ] Golden cases cover all 5 profile boundaries, 6 stage transitions, 5 pathway routings, 5 edge cases
- [ ] `computeScore()` returns `scoringVersion: 'v1.2'` (or current version) on all 21 cases
- [ ] Smoke test for `Results.tsx` passes
- [ ] Smoke test for `guardrails.ts` blocked-phrase enforcement passes
- [ ] CI pipeline runs `pnpm test` on every PR and blocks merge on failure
- [ ] Zero golden cases have their expected values adjusted to make them pass — if a case fails, fix the code

---

### WO-6: Supabase Row-Level Security + Data Isolation

**Priority:** Pre-launch required. Elevated from Sprint 4.1. Any multi-tenant user data written before RLS is active is exposed to cross-user reads.

**Owner:** Engineer (Director 17 review on all policy SQL)

**Background:**
Supabase Row-Level Security (RLS) is not currently enabled. In the current state, any authenticated Supabase session can query any row in any table — a Business Owner could read another Business Owner's tri-bureau credit scores and business financials. With the founding cohort of 500 Capital Advisors each managing multiple clients, the cross-tenant exposure is severe and violates GLBA data isolation requirements.

Additionally, anonymous intake data stored in LocalStorage must be cleared on successful migration to Supabase to avoid PII persisting without access controls in the browser.

**Tasks:**

1. **Enable RLS on all tables** in Supabase dashboard (or via migration):
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;
   ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   ```

2. **Write RLS policies for each table and role:**

   ```sql
   -- Business owners can only read/write their own rows
   CREATE POLICY "owner_self_access" ON intake_responses
     FOR ALL USING (auth.uid() = user_id);

   CREATE POLICY "owner_self_scores" ON score_history
     FOR ALL USING (auth.uid() = user_id);

   -- Capital advisors can read rows for their assigned clients
   CREATE POLICY "advisor_client_read" ON intake_responses
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM advisor_client_assignments
         WHERE advisor_id = auth.uid()
         AND client_id = intake_responses.user_id
       )
     );

   -- Platform admins bypass RLS (use service role key, never anon key)
   -- Service role key is server-side only — never in client bundle
   ```

3. **Verify the Supabase client init** uses the anon key (client-side) and service role key (server-side only) correctly. The service role key must never appear in `NEXT_PUBLIC_*` or `VITE_*` env vars.

4. **Test RLS policies:**
   - Log in as User A; attempt to query User B's `intake_responses` → must return empty, not error
   - Log in as an advisor; query their assigned client's data → must return data
   - Log in as an advisor; query an unassigned client's data → must return empty

5. **Fix LocalStorage PII handling** on auth state change:
   ```typescript
   // In the auth success handler (wherever signup/login completes):
   async function onAuthSuccess(user: User, pendingAnswers: UnifiedAnswers | null) {
     if (pendingAnswers) {
       await saveIntakeToSupabase(user.id, pendingAnswers);
       localStorage.removeItem('bankable_iq_intake');  // clear after migration
     }
   }
   ```

6. **Supabase silent-stub fallback fix (P1-5):** Add startup assertion in `src/app/lib/supabase/`:
   ```typescript
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

   if (!supabaseUrl || !supabaseKey) {
     throw new Error(
       'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
     );
   }
   ```
   This converts silent data loss into a loud startup crash — far preferable in a data-capture app.

**Acceptance criteria:**
- [ ] RLS is enabled on all four tables: `users`, `intake_responses`, `score_history`, `documents`
- [ ] Cross-user read test passes (User A cannot read User B's rows via anon key)
- [ ] Advisor read test passes (advisor can read assigned client's rows)
- [ ] LocalStorage cleared on successful auth + Supabase migration (verified in DevTools)
- [ ] Supabase client init throws on missing env vars (tested by removing vars in local dev)
- [ ] Service role key confirmed absent from all `VITE_*` / `NEXT_PUBLIC_*` vars
- [ ] Director 17 review on RLS policy SQL noted in commit message

---

### WO-7: Intake Completion — 36 → 47 Questions + Declarative Branching + Zod Validation

**Priority:** P0 — The spec is 47 questions. The product is 36. Advisors selling the assessment to founding cohort clients expect the full diagnostic.

**Owner:** Engineer — but **question spec must be locked by Director 13 before a single line of code is written for new questions.**

**Background:**
The intake (`UnifiedAssessment.tsx`) currently has 36 of the 47 specified questions. Missing questions likely cover the last 30% of data that Plaid will eventually fill (Q30–Q46). Conditional logic is ad-hoc if-statements with no typed registry and no Zod schemas — adding 11 more questions to this structure without first introducing a declarative pattern is a regression risk for the scoring engine.

**Prerequisite (Director 13 action):**
> The 47-question spec must be provided in writing and signed off by Director 13 before Sprint 0.8 code begins. Specifically: which 11 questions are missing, what type each is (text / number / select / file), what conditional logic controls their display, and what `UnifiedAnswers` keys they map to. **Do not write intake code without this spec.**

**Tasks:**

1. **Document the existing 36 questions** in a typed registry (`src/app/pages/business-assessment/question-registry.ts`):
   ```typescript
   export interface QuestionDef {
     id: string;                              // e.g. "Q3", "personalCredit.experian"
     type: 'text' | 'number' | 'select' | 'multiselect' | 'scale' | 'file';
     label: string;
     required: boolean;
     unifiedAnswersKey: keyof UnifiedAnswers; // maps to scoring input
     showIf?: (answers: Partial<UnifiedAnswers>) => boolean;
     validate?: ZodSchema;
   }

   export const QUESTIONS: QuestionDef[] = [ /* all 47 */ ];
   ```

2. **Add Zod schemas** for each question type:
   ```typescript
   import { z } from 'zod';

   export const creditScoreSchema = z.number().int().min(300).max(850);
   export const monthlyRevenueSchema = z.number().min(0);
   export const entityTypeSchema = z.enum(['LLC', 'CCorp', 'SCorp', 'SoleProp', 'Partnership']);
   // ... etc
   ```

3. **Refactor `UnifiedAssessment.tsx`** to drive from `QUESTIONS` registry instead of hard-coded JSX per question. Each question renders based on its `QuestionDef`.

4. **Add the 11 missing questions** (per the signed spec from Director 13) using the new registry pattern. Each new question must have:
   - A `QuestionDef` entry in `QUESTIONS`
   - A Zod schema for validation
   - A mapping to `UnifiedAnswers`
   - A golden test case update if the question affects scoring

5. **Replace ad-hoc if-statements** with the `showIf` function on each `QuestionDef`.

6. **Update `UnifiedAnswers` interface** in `engine.ts` if new questions introduce new fields. Director 17 review required if `UnifiedAnswers` changes affect scoring.

7. **Manual QA pass:** Run through the full 47-question intake end-to-end in browser. Verify score is computed and displayed correctly after all 47 answers.

**Acceptance criteria:**
- [ ] Director 13 has provided and signed off the 47-question spec in writing (prerequisite — blocks code start)
- [ ] `QUESTIONS` registry contains all 47 questions with typed `QuestionDef` entries
- [ ] Zod validation schemas exist for all question types
- [ ] `UnifiedAssessment.tsx` renders from `QUESTIONS` registry, not hard-coded JSX
- [ ] All conditional branching is expressed via `showIf` functions, not ad-hoc if-statements
- [ ] Intake completes successfully for all 5 client profile personas (per `scripts/eval-scoring.ts` fixtures)
- [ ] All 21 golden tests still pass after `UnifiedAnswers` changes (if any)
- [ ] Manual end-to-end test: 47-question intake → score display on Results page verified in browser

---

### WO-8: GHL Webhook Integration

**Priority:** Preferred pre-launch. If it slips, manual CRM data entry is the documented workaround for founding cohort week 1.

**Owner:** Engineer (Director 21 for GHL field mapping; Director 13 for workaround authorization)

**Background:**
Intake data does not currently flow to GoHighLevel. Capital Advisors manage client relationships in GHL. Without the webhook, advisor-side CRM data is either manually entered or absent. The 89 custom fields — including Bankable Score, Capital Readiness Phase, Persona Type, and 30+ Q-prefixed intake answers — are the data layer advisors work from. For the founding cohort launch, this integration is the difference between a smooth advisor experience and a manual-entry burden.

**Documented workaround if WO-8 slips:** Director 13 approves a manual export process: after each intake submission, ops team manually creates or updates the GHL contact using the Supabase data. This is viable for up to ~50 contacts/week.

**Tasks:**

1. **Create GHL webhook service** in `src/app/lib/ghl/webhook.ts`:
   ```typescript
   export async function syncIntakeToGHL(
     answers: UnifiedAnswers,
     scoreResult: ScoreResult,
     user: { email: string; firstName: string; lastName: string; phone?: string }
   ): Promise<void> {
     const payload = {
       locationId: import.meta.env.VITE_GHL_LOCATION_ID,
       firstName: user.firstName,
       lastName: user.lastName,
       email: user.email,
       phone: user.phone,
       customFields: buildGHLCustomFields(answers, scoreResult),
     };

     const response = await fetch(
       'https://services.leadconnectorhq.com/contacts/',
       {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${import.meta.env.VITE_GHL_PIT_TOKEN}`,
           Version: '2021-07-28',
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(payload),
       }
     );

     if (!response.ok) {
       // Log error; do NOT fail the intake flow on GHL error
       console.error('GHL sync failed:', await response.text());
     }
   }
   ```
   > **Note:** GHL sync failure must not block the user's intake flow. The Supabase save is the authoritative record; GHL is the CRM mirror.

2. **Build `buildGHLCustomFields()`** mapping the 89 custom fields (see `ghl-inventory/custom-fields.txt`):
   ```typescript
   function buildGHLCustomFields(
     answers: UnifiedAnswers,
     score: ScoreResult
   ): Record<string, string | number> {
     return {
       'Bankable Score': score.bankableScore,
       'Capital Readiness Phase': score.band,
       'Persona Type': derivePersonaType(score),
       'Capital Tier': deriveCapitalTier(score),
       // Q-prefixed intake fields...
       'Q3': answers.businessProfile.state,
       'Q4': answers.businessProfile.entityType,
       // ... all 89 fields per ghl-inventory/custom-fields.txt
     };
   }
   ```

3. **Wire `syncIntakeToGHL()`** into the intake submission flow after Supabase save:
   ```typescript
   // In intake submission handler:
   await saveToSupabase(user.id, answers, scoreResult);  // authoritative
   syncIntakeToGHL(answers, scoreResult, user);           // fire-and-forget, non-blocking
   ```

4. **Add env vars** to `.env.example` and Vercel project settings:
   ```
   VITE_GHL_LOCATION_ID=your-location-id
   VITE_GHL_PIT_TOKEN=your-pit-token
   ```
   > GHL PIT token is not as sensitive as `BOLT_BROKER_TOKEN` (it's customer-facing CRM, not financial underwriting) but should still not be committed to source. Store in Vercel env vars.

5. **Test with a real intake submission** in staging:
   - Complete full intake → verify GHL contact created/updated with correct field values
   - Verify Bankable Score field matches `computeScore()` output
   - Verify Capital Readiness Phase matches the score band

6. **Document the manual workaround** in `docs/OPS-RUNBOOK.md` (create if not exists):
   > If GHL webhook is down or not yet deployed: export Supabase `intake_responses` table to CSV; import to GHL via bulk contact import with field mapping.

**Acceptance criteria:**
- [ ] `syncIntakeToGHL()` fires after every successful intake submission
- [ ] GHL contact is created or updated with correct Bankable Score, band, persona, and all Q-prefixed fields
- [ ] GHL sync failure does NOT block the user's intake completion or Supabase save
- [ ] All 89 custom fields mapped (or subset confirmed with Director 21 as in-scope for launch)
- [ ] Env vars documented in `.env.example`
- [ ] Manual workaround documented in ops runbook
- [ ] End-to-end test: intake → Supabase save → GHL contact verified in GHL UI

---

## 5. Acceptance Criteria (Summary)

A work order is **closed** when all of the following are true:

1. All line-item acceptance criteria in the work order are checked off
2. A PR has been opened with this directive's checklist (Section 6) completed
3. The PR has been reviewed by the required reviewer(s)
4. The PR is merged to `main`
5. The Vercel deployment succeeds (no build errors, no failed tests)
6. The change log entry in Section 7 of this document is written and committed
7. For WO-4 and WO-5: all 21 golden tests pass in CI

**No partial closes.** If five of seven line items are done and the PR is merged, the work order is still open.

---

## 6. PR Review Checklist

Every PR that closes (or partially contributes to) a work order must pass this checklist before merge. The opening engineer marks each item. The reviewing engineer verifies.

```
## PR Checklist

### Source cleanliness
- [ ] `grep -rn "fundreadyai\|FundReady\|FORGE\|CLARION" src/ app/ public/` → zero results
- [ ] No banned phrases from GLOBAL_FORBIDDEN_CLAIMS present in any changed file
- [ ] No secrets, tokens, or credentials in any changed file
- [ ] `detect-secrets scan` baseline is clean

### Scoring integrity
- [ ] `computeScore()` in engine.ts was NOT changed in this PR
      — OR Director 17 review is noted in this commit message
      — OR this is WO-4 and the change is intentional + Director 17 has reviewed
- [ ] No new source of truth for scoring introduced
- [ ] `SCORING_VERSION` bumped if algorithm changed
- [ ] All 21 golden test cases pass (`pnpm test` output attached or CI link included)

### Compliance
- [ ] No customer-facing copy was changed without Director 11 review
      — OR this is WO-3 and Director 11 sign-off is noted in commit message
- [ ] AI Coach output paths still route through guardrails.ts:checkForgeOutput()
- [ ] No new env vars introduced without updating .env.example and docs

### Data + security
- [ ] No PII in URLs or query parameters
- [ ] No service role Supabase key in any VITE_* or NEXT_PUBLIC_* var
- [ ] LocalStorage cleared on auth success if intake data was pending
- [ ] No new API integrations that bypass api/bolt-proxy.ts pattern for financial data

### Build + deploy
- [ ] `pnpm build` succeeds locally
- [ ] `pnpm preview` renders the changed surface without console errors
- [ ] vercel.json was NOT changed — OR Director 17 review is noted in commit message
- [ ] api/bolt-proxy.ts was NOT changed — OR Director 17 review is noted in commit message

### This directive
- [ ] If a work order was closed by this PR: the change log in Section 7 of this
      document is updated and committed as part of this PR
```

---

## 7. Change Log

*Updated by the engineer who closes each work order. Include: WO number, date closed, commit hash, brief summary of what was done, and who reviewed.*

---

| Date | WO | Commit | Summary | Reviewer |
|------|----|--------|---------|---------|
| 2026-05-14 | — | — | Directive created from PDR review and three-team audit analysis | Director 13 |

---

*End of directive. The latest committed version of this file is the source of truth. When the system evolves, update this document — do not create a parallel document.*
