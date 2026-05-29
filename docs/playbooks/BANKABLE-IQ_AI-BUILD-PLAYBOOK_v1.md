# BANKABLE IQ — AI Build Execution Playbook v1.0

**Companion to:** BANKABLE IQ Master Engineering Build Spec v1.0
**Purpose:** Convert the engineering spec into a chronological, copy-paste-ready execution plan that a non-engineer founder can run by orchestrating Claude Design (Figma + visual UI) and Claude Code (terminal coding agent), deploying to Vercel through GitHub.
**Founders:** Kevin Murphy and Michael Hopkins
**Output:** A live, multi-tenant SaaS platform running on Vercel (frontend) + AWS (backend) + the full vendor stack.

---

## TABLE OF CONTENTS

1. How to use this playbook
2. Accounts and credentials to provision (Day 1 stack)
3. Phase 0 — Workspace and operational setup
4. Phase 1 — Brand and design system (Claude Design)
5. Phase 2 — GitHub monorepo bootstrap (Claude Code)
6. Phase 3 — Vercel deploy of the empty frontend
7. Phase 4 — Auth, identity, and tenant model
8. Phase 5 — Database (Supabase / Postgres) + 35-schema rollout
9. Phase 6 — Module 1: Diagnostic Engine
10. Phase 7 — Module 5: Document Vault
11. Phase 8 — Module 4: Credit Intelligence
12. Phase 9 — Module 2: Compliance Engine
13. Phase 10 — Module 7: BAI + BPFS v0
14. Phase 11 — Module 8: Capital Marketplace
15. Phase 12 — Module 6: Pathway Engine
16. Phase 13 — Module 3: AI Coaching System (Claude)
17. Phase 14 — Advisor Command Center
18. Phase 15 — Billing (Stripe), notifications, webhooks
19. Phase 16 — Integrations (Plaid, bureaus, accounting, IRS/SOS)
20. Phase 17 — CI/CD via GitHub Actions
21. Phase 18 — Observability, security, compliance hardening
22. Phase 19 — Load test, accessibility audit, beta cutover
23. The Master Prompt Library (copy/paste blocks for every phase)
24. Daily operating cadence (you + AI)

---

## 1. HOW TO USE THIS PLAYBOOK

You are the operator. Two AI partners do the work:

- **Claude Design** runs inside Figma via the Figma MCP / Figma Make. It produces brand tokens, components, screens, and exports specs. You drive it from chat.
- **Claude Code** runs in a terminal in your repo. It writes code, runs commands, opens pull requests, and deploys. You drive it from a CLI session.

The pattern is identical every phase:

1. Read the **Goal** for the phase.
2. Open Claude Design first, paste the **Design Prompt**, review output.
3. Open Claude Code in your repo, paste the **Code Prompt**, watch it work.
4. Run the **Verification** steps. Commit. Push. Vercel preview deploys automatically.
5. Move to the next phase.

Every prompt below is written to be pasted verbatim. Replace tokens like `{{TENANT_DOMAIN}}` or `{{STRIPE_TEST_KEY}}` with your real values before sending.

---

## 2. ACCOUNTS TO PROVISION FIRST (DAY 1 STACK)

Create these accounts in this order. Save credentials in 1Password or Bitwarden.

| # | Vendor | Purpose | Plan to start | Notes |
|---|--------|---------|---------------|-------|
| 1 | GitHub | Source of truth | Team ($4/user/mo) | Org name: `bankableiq` |
| 2 | Vercel | Frontend hosting + previews | Pro ($20/mo) | Link to GitHub org |
| 3 | Cloudflare | DNS, WAF, DDoS, CDN | Free + Pro $20/mo | Move `getbankable.io` here |
| 4 | Anthropic Console | Claude API (coaching, packaging) | Pay-as-you-go | Set monthly cap = $500 to start |
| 5 | Supabase | Postgres + Auth + Storage (fastest MVP path) | Pro ($25/mo) | Replaces RDS+Auth0+S3 until scale |
| 6 | Upstash | Redis serverless | Pay-as-you-go | Cache + rate limit |
| 7 | Pinecone | Vector DB (RAG) | Starter ($70/mo) | Per-tenant namespaces |
| 8 | Stripe | Subscriptions + Connect (advisor payouts) | Standard | Activate Connect early |
| 9 | Plaid | Bank + cash flow | Development free, Production approval needed | Apply on day 1 |
| 10 | Twilio + SendGrid | SMS + email | Pay-as-you-go | Buy a 1-800 |
| 11 | AWS | S3 (vault), KMS, Textract, Lambda for heavy jobs | Standard | One root + one Org account |
| 12 | Sentry | Error tracking | Team ($26/mo) | Frontend + backend |
| 13 | Datadog | Logs, metrics, RUM (Phase 18) | Defer until staging | Free tier first |
| 14 | LaunchDarkly or Hypertune | Feature flags | Free tier | Toggle phases live |
| 15 | Linear or GitHub Projects | Sprint board | Free | Mirror the 12-week plan |
| 16 | Figma | Design files | Professional ($15/editor) | Enable Figma Make + MCP |
| 17 | DocuSign | E-sign client engagement + CROA disclosures | API plan | Required for CROA |
| 18 | Experian / Equifax / TransUnion / D&B | Credit bureau APIs | Apply early, 4-12 week onboarding | Start week 1 |
| 19 | IRS Tax Guard or Canopy | IRS transcript pulls | Per-pull pricing | Optional Phase 2 |
| 20 | Snowflake | Warehouse | Defer to Phase 18 | $0 until Phase 2 |

---

## 3. PHASE 0 — WORKSPACE AND OPERATIONAL SETUP

**Goal:** Working repo, Vercel project linked, Claude Code running, secrets vault active. Time: 1 day.

### 3.1 Local environment

Install on your machine:

```
- Node.js 20 LTS
- pnpm (corepack enable && corepack prepare pnpm@latest --activate)
- Python 3.12 + uv (pip install uv)
- Docker Desktop
- gh CLI (GitHub) + vercel CLI + supabase CLI
- Claude Code CLI: npm i -g @anthropic-ai/claude-code
```

### 3.2 GitHub org + repo

In `gh` CLI:

```bash
gh auth login
gh repo create bankableiq/bankable-platform --private --clone
cd bankable-platform
```

### 3.3 Claude Code session

From inside the repo:

```bash
claude
```

Paste this **first Claude Code prompt** to set the project tone:

> You are now my engineering co-pilot for the BANKABLE IQ platform. The full engineering spec is in `docs/spec/engineering-spec.html` (I will add it next commit). All work follows that spec exactly. Output mode: explain briefly, then act. Default to creating files, running commands, and opening pull requests. Stop only when blocked. Use TypeScript everywhere on the JS side and Python 3.12 with FastAPI + Pydantic v2 on the Python side. Conventions: pnpm workspaces, Turborepo, Conventional Commits, trunk-based development. Confirm by listing what you will scaffold in the next 10 minutes.

### 3.4 Drop the spec into the repo

```bash
mkdir -p docs/spec
cp ~/Downloads/engineering-spec.html docs/spec/
git add . && git commit -m "docs: add master engineering spec v1.0"
git push -u origin main
```

---

## 4. PHASE 1 — BRAND AND DESIGN SYSTEM (CLAUDE DESIGN)

**Goal:** Figma file containing brand tokens, color/typography variables, the full shadcn-styled primitive set, and the first 6 production screens.

### 4.1 Create the Figma file

Open Figma. New design file: `BANKABLE IQ — Design System v1`.

### 4.2 Claude Design Prompt A — Foundations

Paste in Claude Design (Figma MCP):

> Build the BANKABLE IQ design system foundations in this file. Brand: institutional fintech, trust-coded, navy + cyan accent.
>
> Create Figma Variables collections:
> - **Color/Brand**: `navy/950 #050E2B`, `navy/900 #0A1845`, `navy/700 #142B66`, `cyan/500 #00AEEF`, `cyan/400 #7DD3FC`, `blue/600 #137DC5`, `success/500 #51CF66`, `warning/500 #FFB347`, `danger/500 #FF6B6B`, `violet/400 #B197FC`, `grey/400 #8B9BBF`, `grey/600 #5A6A8E`, `surface/0 #FFFFFF`, `surface/950 #061128`.
> - **Typography**: families = Sora (display), Plus Jakarta Sans (body), Playfair Display Italic (accent), JetBrains Mono (code). Sizes 11/12/14/16/18/20/24/30/36/48/60.
> - **Spacing**: 4/8/12/16/20/24/32/40/48/64/96.
> - **Radius**: 4/6/8/12/16/100.
> - **Light + Dark modes** (dark is default — navy/950 background).
>
> Build base components using shadcn/ui conventions, all variable-bound, all with hover/focus/disabled/error states:
> Button (primary/secondary/ghost/destructive, 3 sizes), Input, Textarea, Select, Checkbox, Radio, Switch, Tabs, Badge, Tag, Avatar, Tooltip, Toast, Dialog/Modal, Drawer, Card, Stat Card, Score Ring (0-100 and 0-1000), Progress, Stepper, Table (with stack-on-mobile pattern), Empty State, Skeleton, Top Nav, Sidebar Nav, Mobile App Bar.
>
> Confirm by listing the variable collection names + component count when done.

### 4.3 Claude Design Prompt B — Screens

> Build these 6 production screens at 1440px desktop + 390px mobile, using only the components and variables just created. No hardcoded values.
>
> 1. **Public Sign-In** — split layout, brand left, form right, MFA hint.
> 2. **Client Dashboard** — header, Readiness Index hero (0-1000 ring), 3 outcome cards (Capital Today / Bankability Built / Institutional Access), next-best-action card, BPFS gauge, recent activity.
> 3. **Diagnostic Intake** — section progress (10 sections), branching question pattern, file upload inline, save-and-resume CTA.
> 4. **Vault** — grid view, classification chips, retention badges, drop zone, document detail drawer with OCR preview.
> 5. **Pathway** — goal header, timeline of steps with owners/dues/blockers, checkpoint chips.
> 6. **Advisor Command Center** — caseload table (filter by stage/score/BPFS delta), bulk action bar, right panel queue.
>
> Then run Code Connect: map every component to its shadcn counterpart name (`Button → components/ui/button.tsx`, etc.) so Claude Code can implement straight from the file.

### 4.4 Export tokens

Export the Variables collection as JSON via the Figma Tokens plugin or MCP `get_variable_defs`. Save to `packages/design-tokens/tokens.json`.

---

## 5. PHASE 2 — GITHUB MONOREPO BOOTSTRAP (CLAUDE CODE)

**Goal:** Turborepo monorepo with Next.js app, services scaffolded, design tokens wired, Vercel preview live.

### 5.1 Claude Code Prompt — Scaffold the monorepo

Paste in Claude Code:

> Scaffold a Turborepo monorepo named `bankable-platform` with pnpm workspaces. Structure:
>
> ```
> apps/
>   web/              Next.js 14 App Router, TypeScript, RSC, Tailwind, shadcn/ui
>   api/              Node 20 Fastify gateway, tRPC, OpenAPI 3.1
>   ml/               Python 3.12 FastAPI service (Pydantic v2) for BAI/BPFS/coaching
> services/
>   auth-svc/         Node Fastify
>   diagnostic-svc/   Python FastAPI
>   compliance-svc/   Node Fastify
>   vault-svc/        Node Fastify + Python OCR sidecar
>   credit-svc/       Python FastAPI
>   coaching-svc/     Python FastAPI
>   pathway-svc/      Node Fastify + Temporal worker
>   bai-svc/          Python FastAPI
>   blin-svc/         Python FastAPI
>   bii-svc/          Python FastAPI
>   bms-svc/          Python FastAPI
>   bpfs-svc/         Python FastAPI
>   marketplace-svc/  Node Fastify
>   billing-svc/      Node Fastify
> packages/
>   design-tokens/    Tokens JSON + Tailwind preset
>   ui/               shadcn primitives (matched to Figma Code Connect)
>   db/               Drizzle schemas + migrations (35 schemas, one folder each)
>   sdk/              Typed client SDK generated from OpenAPI
>   compliance-rules/ YAML rule packs (CROA, FCRA, ECOA, GLBA, state)
>   events/           Zod schemas for the event bus (versioned)
>   config/           Env loader + zod validation + secrets contracts
>   testing/          Test utilities, Playwright config, k6 scripts
> infra/
>   github/           Actions workflows
>   vercel/           vercel.json per app
>   supabase/         migrations + seed
>   aws/              CDK stacks for S3, KMS, Textract, SQS, EventBridge
> docs/
>   spec/             engineering-spec.html (already there)
>   adr/              architecture decision records
>   runbooks/
> ```
>
> Set up: ESLint (next + node), Prettier, Vitest, Playwright, Pytest, Ruff, Mypy, Husky pre-commit, Commitlint (Conventional Commits), Changesets, Renovate. Install Tailwind preset from `packages/design-tokens/tokens.json` into `apps/web`. Install shadcn primitives into `packages/ui` matching the Figma Code Connect names. Create a public landing page in `apps/web/app/page.tsx` that renders the brand wordmark only. Open a PR titled `chore: bootstrap monorepo`. After I approve, merge to main.

### 5.2 Verification

```bash
pnpm dev          # web on :3000, api on :4000, ml on :8000
pnpm test         # all green
pnpm lint         # zero errors
```

---

## 6. PHASE 3 — VERCEL DEPLOY

**Goal:** `app.getbankable.io` resolves through Cloudflare to Vercel.

### 6.1 Connect

```bash
vercel link        # link apps/web
vercel git connect
```

### 6.2 Claude Code Prompt — Vercel config

> Add `vercel.json` at the repo root and inside `apps/web` to: enable Edge runtime for `/api/auth/*`, ISR for marketing routes, build with `pnpm turbo run build --filter=web`, install with `pnpm install --frozen-lockfile`, output `apps/web/.next`. Add environment variable references for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_PUBLISHABLE_KEY`, `PLAID_PUBLIC_KEY`. Document the full env matrix in `docs/runbooks/env.md`. Open a PR.

### 6.3 DNS

In Cloudflare, point `app.getbankable.io` (CNAME, proxied = grey cloud) to `cname.vercel-dns.com`. In Vercel project → Domains, add `app.getbankable.io`. Wait for cert.

---

## 7. PHASE 4 — AUTH, IDENTITY, AND TENANT MODEL

**Goal:** Supabase Auth wired, RBAC roles, multi-tenant `tenant_id` enforced via RLS.

### 7.1 Claude Code Prompt — Auth

> Wire Supabase Auth into `apps/web` with email + magic link + Google SSO + MFA (TOTP). Create the `identity` schema in `packages/db/identity` per §4.2.1 of the spec: tables `tenants`, `users`, `memberships`, `roles`, `sessions`. Implement RLS policies enforcing `app.tenant_id`. Roles: `client`, `advisor`, `advisor_admin`, `compliance_officer`, `lender_user`, `platform_admin`. Build:
> - `app/(auth)/sign-in/page.tsx`
> - `app/(auth)/sign-up/page.tsx`
> - `app/(auth)/verify/page.tsx`
> - `lib/auth/server.ts` (server helpers)
> - `lib/auth/with-tenant.ts` (RLS session variable setter)
> - Middleware that protects `(app)/*` routes and redirects unauthenticated to sign-in.
>
> Use the Figma sign-in screen one-to-one (Code Connect names match). Tests: vitest unit on role guards, Playwright e2e for sign-up → MFA → first-login.

### 7.2 Verification

Create the first tenant + user manually in Supabase Studio. Sign in. Confirm RLS prevents cross-tenant reads using a SQL probe.

---

## 8. PHASE 5 — DATABASE (35 SCHEMAS)

**Goal:** All 35 schemas from spec §4.1 created via Drizzle migrations.

### 8.1 Claude Code Prompt — Schemas

> Implement all 35 schemas from §4.1 of the engineering spec as Drizzle ORM definitions in `packages/db/<schema>/schema.ts` with one migration per schema. For each table include: `id UUID PK default gen_random_uuid()`, `tenant_id UUID NOT NULL`, `created_at`, `updated_at`, RLS enabled, and a policy keyed off `current_setting('app.tenant_id')`. Implement the DDL examples in §4.2 verbatim:
> - `identity.users`
> - `readiness.snapshots`
> - `compliance.audit_log` with hash-chain trigger
> - `bpfs.predictions`
>
> Add `pgcrypto`, `citext`, `pg_trgm`, `uuid-ossp` extensions. Generate the data lifecycle policies from §4.4 as scheduled Supabase cron jobs. Run `pnpm db:migrate`. Verify with `pnpm db:status`. Open PR `feat(db): 35-schema baseline`.

### 8.2 Verification

```bash
pnpm db:test           # rls-isolation harness must pass
```

---

## 9. PHASE 6 — MODULE 1: DIAGNOSTIC ENGINE

**Goal:** 50-field MVP intake, deterministic factor calculator, snapshot writer, Readiness Index 0-1000.

### 9.1 Claude Design Prompt

> Refine the Diagnostic Intake screen with the 10 sections: Business Identity, Ownership, Financials, Cash Flow, Credit Position, Documentation, Operations, Compliance, Growth Plan, Capital Goal. Add branching indicators, inline doc upload, save+resume, mobile flow. Export Code Connect.

### 9.2 Claude Code Prompt

> Build Module 1 per §3.1. Stack: form state in XState (`@xstate/react`), validation Zod, persistence tRPC mutation `diagnostic.upsert`. Implement:
> - `services/diagnostic-svc` (Python FastAPI) with `/score` endpoint that runs the factor calculator (rules-based v0, 800-factor placeholder JSON in `packages/compliance-rules/factors-v0.json`).
> - Snapshot writer to `readiness.snapshots` immutable + S3 lineage copy.
> - Gap ranker stub using BPFS delta = 0 for now (v0).
> - Frontend route `app/(app)/diagnostic/page.tsx` matching Figma exactly.
> - Emit `diagnostic.snapshot.created` to the event bus stub (Inngest for now).
> - Tests: unit on calculator, Playwright e2e on full intake + snapshot view.
>
> PR: `feat(module-1): diagnostic engine v0`.

---

## 10. PHASE 7 — MODULE 5: DOCUMENT VAULT

### 10.1 Claude Design Prompt

> Finalize Vault screens: grid + list toggle, classification chips (8 doc types), retention badges, drop zone, upload progress, document detail drawer with OCR preview tab.

### 10.2 Claude Code Prompt

> Build `vault-svc` per §3.5. Pipeline: Upload → ClamAV → MIME check → KMS encrypt → S3 PUT (presigned URL flow from `apps/web`) → AWS Textract OCR → layout parser → field extractor → classifier (8 MVP types: formation, EIN letter, P&L, balance sheet, tax return, bank statement, ID, ownership) → index into Pinecone tenant namespace → emit `vault.document.processed`. Use AWS CDK in `infra/aws/vault-stack.ts` to provision S3 bucket with SSE-KMS, per-tenant CMK alias, Object Lock for tax + signed contracts. Frontend: `app/(app)/vault/*` matching Figma. Idempotency keys required on all POSTs. PR: `feat(module-5): vault v0`.

---

## 11. PHASE 8 — MODULE 4: CREDIT INTELLIGENCE

### 11.1 Claude Code Prompt

> Build `credit-svc` per §3.4. MVP scope: one personal bureau (Experian Connect sandbox) + one business source (D&B Direct+ sandbox). Implement:
> - Vendor abstraction layer `services/credit-svc/adapters/{experian,dnb}.py`.
> - Consent flow recorded in `compliance.audit_log` (call compliance-svc before pull).
> - Soft pull default, hard pull only at lender app time (config flag).
> - Cache to Redis with TTLs from §3.4.1.
> - Merged credit profile endpoint `GET /v1/credit/profile`.
> - Dispute filing stub.
> Frontend: credit tab inside `app/(app)/dashboard/credit/page.tsx` showing FICO + PAYDEX, hide raw SSN, redact in logs. PR: `feat(module-4): credit v0`.

---

## 12. PHASE 9 — MODULE 2: COMPLIANCE ENGINE

### 12.1 Claude Code Prompt

> Build `compliance-svc` per §3.2 as a non-bypassable middleware layer. Implement:
> - Rule pack loader from `packages/compliance-rules/*.yaml` (signed via cosign at commit time).
> - Pre-action gate API: `POST /v1/compliance/check` returns allow/deny + required disclosures.
> - Disclosure renderer that injects HTML blocks into UI by component id.
> - Adverse action notice generator (ECOA template).
> - Dispute letter generator (FCRA template).
> - Hash-chained `audit_log` writer; daily Merkle root checkpoint job.
> - YAML rule pack v0 covering CROA contract requirement, 3-day cancellation, no advance fees, FCRA permissible purpose, ECOA notice triggers.
> - Wire compliance gate into every credit, marketing, lender match, and document share flow already built.
> PR: `feat(module-2): compliance engine v0`.

---

## 13. PHASE 10 — MODULE 7: BAI + BPFS V0

### 13.1 Claude Code Prompt

> Build `bai-svc`, `bpfs-svc`, `blin-svc` stubs per §3.7 and §12.1. MVP:
> - `POST /v1/bai/evaluate` accepts `snapshot_id`, returns the Decision Output Envelope from §3.7.2 exactly.
> - BPFS v0 is rules-based (no ML yet): a deterministic Python module scoring approval probability from factor weights in `packages/compliance-rules/bpfs-v0.json`. Output `approval_prob`, `expected_apr`, `expected_amount`, `expected_term_months`. Store every prediction in `bpfs.predictions` with SHAP placeholder.
> - BLIN v0: static YAML catalog of 10 launch lenders in `packages/compliance-rules/lenders-v0.yaml` with credit-box criteria; match function returns ranked list.
> - BII + BMS: stubbed constants for MVP.
> - Wire `bai.envelope.created` event emission.
> Frontend: BAI envelope rendered as 3 outcome cards on the dashboard (matches Figma). PR: `feat(module-7): bai + bpfs v0`.

---

## 14. PHASE 11 — MODULE 8: CAPITAL MARKETPLACE

### 14.1 Claude Code Prompt

> Build `marketplace-svc` per §3 + §5.5. MVP: lender catalog (read from BLIN), match endpoint returning top 5-10 lenders per applicant, one-click apply flow that bundles vault docs + diagnostic snapshot + credit pull into a signed package, manual handoff (email + secure link) for launch lenders without API. Partner API for Phase 2. Frontend: `app/(app)/marketplace/page.tsx` shortlist + apply CTA. Compliance gate before submission. PR: `feat(module-8): marketplace v0`.

---

## 15. PHASE 12 — MODULE 6: PATHWAY ENGINE

### 15.1 Claude Code Prompt

> Build `pathway-svc` per §3.6. MVP without Temporal (linear Postgres state machine in `pathway` schema). Generate pathway from goal: input = target outcome + amount + timeline + current snapshot, output = ordered Steps[]. Each Step has owner (client/advisor/system), due, blockers, dependencies. Checkpoint job re-evaluates every 7 days. Frontend: `app/(app)/pathway/page.tsx` timeline matching Figma. Phase 2 will migrate to Temporal. PR: `feat(module-6): pathway v0`.

---

## 16. PHASE 13 — MODULE 3: AI COACHING SYSTEM (CLAUDE)

### 16.1 Claude Code Prompt

> Build `coaching-svc` per §3.3 and §12.5. Stack: Anthropic Claude (production model, set in env var `ANTHROPIC_MODEL`), Pinecone retrieval over the client's vault + knowledge graph namespace, streaming SSE to the frontend. Prompt architecture exactly as §3.3.1:
> - System prompt (signed, stored in `packages/compliance-rules/coaching-system.md`, hash recorded in audit log).
> - Client context pack: top-k=8 chunks from `vault-chunks` + latest snapshot summary + active pathway.
> - Compliance guardrails: forbidden topics (legal advice, guaranteed approvals, specific APR promises), required disclaimers injected.
> - User turn → Claude → schema validator → compliance scan → render.
> - Golden-set eval harness in `packages/testing/coaching-golden/` runs on every prompt change.
> Frontend: `app/(app)/coach/page.tsx` chat UI with streaming. PR: `feat(module-3): coaching v0`.

---

## 17. PHASE 14 — ADVISOR COMMAND CENTER

### 17.1 Claude Design Prompt

> Refine Advisor Command Center: caseload table (filter by stage/score/last-touch/BPFS delta), right-rail next-best-action queue, bulk action bar (send nudge, request docs, trigger match), per-client drawer with score trajectory chart, revenue tab with gross/net per client + Stripe Connect payout state.

### 17.2 Claude Code Prompt

> Build `app/(advisor)/*` gated to roles `advisor` and `advisor_admin`. Implement caseload tRPC queries with cursor pagination, bulk actions, NBA queue powered by BAI `next_best_action`, revenue dashboard reading from `billing-svc`. PR: `feat(ui): advisor command center v0`.

---

## 18. PHASE 15 — BILLING, NOTIFICATIONS, WEBHOOKS

### 18.1 Claude Code Prompt

> Build `billing-svc` integrating Stripe Subscriptions + Stripe Connect for advisor payouts. Plans (config in `packages/config/plans.ts`):
> - Client Starter $0
> - Client Pro $49/mo
> - Advisor Solo $199/mo + 15% rev share
> - Advisor Team $499/mo + 20% rev share
> - Lender Plug-In $2,500/mo + per-deal fee
>
> Implement Stripe Checkout, Customer Portal, webhook handler (`/webhooks/stripe`) with signature verification, idempotent processing into `billing` schema, emit `billing.subscription.changed`. Build `notification-svc` (lightweight Node) wrapping SendGrid (email) + Twilio (SMS) with template registry in `packages/compliance-rules/notifications/*.mjml`. PR: `feat(billing+notify): v0`.

---

## 19. PHASE 16 — EXTERNAL INTEGRATIONS

### 19.1 Claude Code Prompt — Plaid

> Integrate Plaid per §9.1. Server-side `link_token` creation, client Plaid Link, public-token → access-token exchange server-side only, store in `integration` schema with KMS-wrapped tokens. Webhooks for `TRANSACTIONS_REMOVED` and `SYNC_UPDATES_AVAILABLE`. Normalize transactions into `accounting` schema cash-flow signals consumed by Diagnostic.

### 19.2 Claude Code Prompt — Accounting

> Integrate QuickBooks Online + Xero per §9.6 via OAuth 2.0. Pull chart of accounts, P&L, balance sheet, AR/AP aging on 24-hour cadence + on webhook. Feed Diagnostic.

### 19.3 Claude Code Prompt — IRS / SOS (Phase 2 placeholder)

> Stub `tax-svc` endpoints `POST /v1/tax/transcripts/request` returning queued status. Real provider integration (Tax Guard or Canopy) in Phase 2.

---

## 20. PHASE 17 — CI/CD VIA GITHUB ACTIONS

### 20.1 Claude Code Prompt

> Implement the CI/CD pipeline from §11.2 in `.github/workflows/`. Workflows:
> - `ci.yml`: on PR — lint (eslint, ruff, sqlfluff), unit (vitest, pytest), type (tsc, mypy), SAST (Semgrep + CodeQL), SCA (Snyk), build images, push to GHCR with immutable tags, deploy preview to Vercel + ephemeral Supabase branch.
> - `e2e.yml`: Playwright + API contract (Pact + Schemathesis) against preview.
> - `staging.yml`: on push to `main` — auto-deploy services to AWS ECS staging via Vercel + AWS CDK.
> - `prod.yml`: manual approval, canary 10% → 50% → 100%, auto-rollback on SLO breach (Datadog API check).
> - `nightly.yml`: load (k6), DAST (ZAP), accessibility (axe-core).
> Cache pnpm, uv, Turborepo. Concurrency groups. PR: `ci: pipeline v1`.

---

## 21. PHASE 18 — OBSERVABILITY, SECURITY, COMPLIANCE HARDENING

### 21.1 Claude Code Prompt

> Wire observability per §11.3. Instrument every Node and Python service with OpenTelemetry → Datadog APM, structured JSON logs with PII scrubbing at the agent, Sentry for errors (frontend + backend), Datadog RUM in `apps/web`, Datadog Synthetics on critical paths every 1 min, PagerDuty integration for SEV-1/2. Implement SLO tracking dashboards as Datadog Monitors-as-Code in `infra/datadog/`. Add OWASP ASVS L2 baseline checks; L3 in `compliance-svc` and `credit-svc`. Add GitGuardian + GitHub secret scanning push protection. Schedule annual pen test placeholder runbook. PR: `feat(observability): full stack`.

---

## 22. PHASE 19 — LOAD TEST, ACCESSIBILITY, BETA CUTOVER

### 22.1 Claude Code Prompt

> Run the readiness gate from §14 + §16.2 week 12. Execute k6 load against staging at Year-1 capacity (500 QPS, 2k concurrent), Playwright on top 25 journeys, axe-core WCAG 2.2 AA on every client-facing page, golden-set eval on coaching prompts, compliance rule-pack regression suite, DR drill (failover us-east-1 → us-west-2). Produce a `docs/runbooks/beta-cutover.md` with the go/no-go checklist signed off by Compliance Officer, Security, and Platform leads. Open `prod.yml` deploy with canary.

---

## 23. THE MASTER PROMPT LIBRARY

These are the reusable prompt templates. Save them as `.md` files in `docs/prompts/`.

### 23.1 The "Build a Module" prompt template

> You are building Module {{N}} of the BANKABLE IQ platform. Read §3.{{N}}, §4 schemas owned by `{{svc-name}}`, and §5 endpoints prefixed `/v1/{{module}}/`. Implement v0 scope per §16.1. Required: Drizzle migrations, Fastify/FastAPI service, OpenAPI 3.1 published, typed SDK in `packages/sdk`, Zod event schemas in `packages/events`, RLS-enforced multi-tenant, compliance gate calls where applicable, unit + integration + Playwright tests, Storybook for any new components, idempotency keys on POSTs, feature flag wrapping the route. When complete, open a PR titled `feat(module-{{N}}): {{name}} v0` with a summary linking to the relevant spec sections and the test report.

### 23.2 The "Build a Screen" prompt template (Claude Design)

> Build the {{Screen}} screen at 1440 desktop + 390 mobile in the BANKABLE IQ Design System v1 file. Use only variable-bound components from the system. Match brand: navy 950 base, cyan 500 accent, dark mode primary. Include all states: empty, loading, error, success, disabled. Add Code Connect mappings so Claude Code can implement it 1:1. Output the Figma node ID and a screenshot.

### 23.3 The "Integration" prompt template

> Add an integration with {{vendor}} for {{purpose}}. Follow §9 of the spec. Required: OAuth or API key flow stored in `integration` schema with KMS-wrapped secrets, webhook signature verification + replay protection, idempotency, retry with exponential backoff + dead-letter, observability spans, rate limiting matching vendor docs, secrets scoped to least privilege, runbook in `docs/runbooks/{{vendor}}.md`, contract tests against vendor sandbox. PR: `feat(integration): {{vendor}}`.

### 23.4 The "Compliance Change" prompt template

> Update rule pack {{path}} for {{regulation}}. Required: YAML edits with diff comments, signed by Compliance Officer (cosign), golden-set tests added or updated, audit log entry on deploy, no code change required (hot reload only), changelog entry in `docs/compliance/CHANGELOG.md`. PR: `compliance: {{summary}}`.

### 23.5 The "Bug fix" prompt template

> Reproduce the bug in a failing test first. Fix the smallest code change that makes it pass. Add regression test. Update relevant ADR if architectural. Conventional commit `fix({{scope}}): {{summary}}`.

---

## 24. DAILY OPERATING CADENCE

This is how you run the build week to week.

### Morning (30 min)

1. Open Linear → review yesterday's PRs + today's sprint cards.
2. Open Claude Code → paste: `Summarize git log since 24h, open PRs awaiting review, failing CI checks, and the top 3 risks before standup. Then list today's planned cards from the sprint and the prompts I should send to start each.`
3. Approve overnight Renovate / Dependabot PRs that pass CI.

### Midday — Build blocks

For each sprint card:

1. Open the matching prompt template from `docs/prompts/`.
2. Fill `{{tokens}}`.
3. Paste into Claude Code (or Claude Design first if a screen is required).
4. Review the diff. Comment in plain English. Approve or push back.
5. Merge when CI is green.

### End of day (15 min)

1. Claude Code: `Generate a 5-line standup post for tomorrow: shipped, in-progress, blocked.`
2. Push to Slack / Linear comment.
3. Confirm staging deploy is green via Datadog dashboard.

### Weekly

- Friday — Claude Code runs the SOC 2 evidence collector (`pnpm compliance:evidence`) and uploads to Drata / Vanta.
- Friday — Claude Code runs `pnpm cost:report` to summarize the week's AWS + Vercel + Anthropic + Pinecone burn.
- Monday — Update spec version if scope changed. Re-run Claude Design's Code Connect sync if components moved.

---

## SCOPE-TO-PHASE MAP (MASTER INDEX)

| Spec § | Topic | Phase | Driver | Output |
|--------|-------|-------|--------|--------|
| §1 Foundation | Read | Phase 0 | You | Context |
| §2 Architecture | Decomposition | Phase 2 | Claude Code | Monorepo + 14 services |
| §3.1 Module 1 | Diagnostic | Phase 6 | Both | Intake + scoring |
| §3.2 Module 2 | Compliance | Phase 9 | Claude Code | Gate + audit log |
| §3.3 Module 3 | AI Coaching | Phase 13 | Claude Code | RAG + Claude |
| §3.4 Module 4 | Credit | Phase 8 | Claude Code | Bureau adapters |
| §3.5 Module 5 | Vault | Phase 7 | Both | S3 + OCR + Pinecone |
| §3.6 Module 6 | Pathway | Phase 12 | Claude Code | State machine |
| §3.7 Module 7 | BAI | Phase 10 | Claude Code | Envelope API |
| §3.8 Workspace | Client UI | Phases 6-13 | Claude Design + Code | Next.js routes |
| §3.9 Command Center | Advisor UI | Phase 14 | Both | Caseload + queue |
| §4 Database | 35 schemas | Phase 5 | Claude Code | Drizzle migrations |
| §5 API | REST + tRPC | Phases 2-15 | Claude Code | OpenAPI |
| §6 Flows | Journeys | Phases 6-14 | Both | XState flows |
| §7 Frontend | Next.js | Phase 2 + ongoing | Both | apps/web |
| §8 Backend | Services | Phase 2 + ongoing | Claude Code | services/* |
| §9 Integrations | Plaid, bureaus | Phases 8, 16 | Claude Code | integration schema |
| §10 Auth + Sec | RBAC + RLS | Phases 4, 18 | Claude Code | Policies + audits |
| §11 Infra | AWS + Vercel + CDN | Phases 3, 17, 18 | Claude Code | CDK + Vercel |
| §12 AI/ML | BPFS v0 | Phase 10 + Phase 2 future | Claude Code | bpfs-svc |
| §13 Perf + Scale | SLOs | Phase 18 | Claude Code | Datadog SLOs |
| §14 QA | Test pyramid | Phases 17, 19 | Claude Code | CI workflows |
| §15 Release | Canary | Phase 17 | Claude Code | prod.yml |
| §16 MVP | 12-week plan | Phases 1-19 | You + both | Beta cutover |
| §17 Cost | Run rate | Daily cadence | You + Claude Code | Weekly report |

---

## END STATE AFTER 12 WEEKS

- `app.getbankable.io` live on Vercel, CDN'd through Cloudflare.
- 14 services running on AWS ECS Fargate behind the API gateway.
- Supabase Postgres with all 35 schemas, RLS enforced.
- Anthropic Claude coaching live with golden-set guardrails.
- Stripe subs + Connect payouts working.
- Plaid + 1 personal bureau + 1 business bureau + QuickBooks + Xero connected.
- 10 launch lenders in BLIN catalog.
- 12 paying beta advisors, 100 invited beta clients.
- SOC 2 Type I evidence collection running, Type II target Phase 3.
- CI/CD trunk-based with canary deploys and auto-rollback.
- Full observability via Datadog + Sentry + PagerDuty.

This document is the bridge between strategy (the spec) and execution. Run it phase by phase. The AI does the typing. You make the calls.

— End of Playbook v1.0
