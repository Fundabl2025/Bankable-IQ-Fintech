# ARCHITECTURE.md
# Target-state architecture reference. Do not rewrite working code to match this unless explicitly instructed.
# Compare existing implementation first. Identify gaps. Recommend incremental changes only.

## Purpose
Defines application architecture for FundReady / FORGE.
Source of truth for: system boundaries, application layers, service responsibilities,
user-state architecture, orchestration rules, AI integration boundaries.

---

## Architectural Principles

1. State-driven product — all logic driven by explicit user, profile, and progression states
2. Database as source of truth — canonical records live in Supabase Postgres
3. Explainable intelligence — FORGE outputs must be auditable and constrained
4. Trust-first system design — privacy, clarity, deterministic workflows, observable behavior
5. Thin UI, strong domain layer — business logic not in page components
6. Human override always possible — coach/premium workflows support review and override

---

## Platform Stack

### Frontend and orchestration
- React + TypeScript + Vite (current) / Next.js App Router (target)
- Vercel CI/CD
- Server Components where practical (target)
- Route Handlers for controlled service boundaries (target)

### Backend platform
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Supabase Realtime only where meaningful
- Supabase Edge Functions for isolated secure workflows

### AI layer
- Claude Code for development
- FORGE runtime logic mediated through app-side orchestration
- AI prompts and outputs must be versioned and testable

---

## Application Layers

### 1. Presentation layer
Location: /app, /components
Responsibilities: render views, capture actions, show progress, display recommendations
Must NOT contain: scoring rules, eligibility logic, partner routing, authorization logic, prompt construction

### 2. Application orchestration layer
Location: /app/api, /lib/actions, /lib/orchestration
Responsibilities: handle request flows, validate input, call domain services, invoke AI safely, coordinate writes

### 3. Domain layer
Location: /lib/domain
Responsibilities: define product concepts, manage progression rules, compute readiness summaries,
assemble recommendation logic, enforce state transitions
Examples: assessment, readiness, scoring, progression, recommendation, upgrade domains

### 4. Data access layer
Location: /lib/db, /lib/repositories
Responsibilities: read/write DB records, encapsulate query logic, isolate persistence concerns

### 5. AI layer
Location: /lib/ai, /prompts
Responsibilities: generate explanations, summarize findings, personalize coaching within constraints
Must NOT: invent lender thresholds as fact, determine product approval, bypass domain rules,
write directly to critical tables without orchestration approval

### 6. Analytics / audit layer
Location: /lib/analytics, /lib/audit
Responsibilities: emit event logs, record critical product actions, support debugging and funnel measurement

---

## Core Product State Model

### User states
anonymous_visitor → registered_user → subscribed_virtual → subscribed_live
advisor_managed_user, admin_user, coach_user, partner_user

### Assessment states
not_started → in_progress → completed → expired → archived

### Readiness states
unknown → initial_access_ready → partially_ready → progressing → bankable_candidate → advanced_capital_ready

### Progression states
pre_assessment → assessed → score_revealed → roadmap_generated → module_progress_started
→ module_progress_active → module_progress_complete → application_timing_ready → advanced_capital_unlocked

### Subscription states
free → virtual → live (+ canceled, past_due, paused)

---

## Core Domain Objects
- User: identity and access subject
- Business Profile: core business identity record
- Assessment: versioned readiness questionnaire submission
- FundScore: top-level readiness summary
- Readiness Profile: structured interpretation of readiness categories and gaps
- Gap Item: issue, blocker, or missing signal
- Recommendation: next-step suggestion tied to rationale and impact
- Compliance Module: readiness-improvement unit
- Capital Path: staged map of likely capital pathways
- Coaching Session: human or AI guidance interaction
- Partner Referral: association between user and partner/channel
- Event Log: immutable product event stream

---

## AI Integration Rules

### Allowed
- explain score outputs
- summarize readiness gaps
- generate coaching language
- personalize roadmap presentation
- suggest ordered next steps from structured inputs
- answer user questions about platform state

### Disallowed
- direct scoring authority
- autonomous DB mutation of critical records
- unsupported legal/compliance claims
- unsupported approval predictions
- unsupported lender threshold claims
- replacing audit logs or deterministic state transitions

---

## Recommended Repository Structure (target state)

/docs/                    ← architecture, product, security, adr, evals
/prompts/forge/           ← FORGE prompt files
/schemas/                 ← API, domain, event schemas
/fixtures/                ← assessment, scoring, copy test fixtures
/app/(marketing)/         ← acquisition, SEO, landing pages
/app/(product)/           ← assessment, dashboard, modules, roadmap, coaching
/app/(ops)/               ← support tooling, coaching, partner mgmt, audit views
/lib/ai/                  ← AI orchestration layer
/lib/analytics/           ← product event tracking
/lib/audit/               ← audit trail
/lib/auth/                ← auth helpers
/lib/db/                  ← data access layer
/lib/domain/              ← business logic
/lib/scoring/             ← scoring engine
/lib/validation/          ← input validation

---

## Vercel / Supabase Responsibility Split

### Vercel owns
- frontend rendering
- server actions / route handlers
- auth-aware orchestration
- score explanation rendering
- AI interaction orchestration
- cron entrypoints
- observability and deployment environments

### Supabase owns
- Postgres source of truth
- Auth
- RLS and authorization
- Storage
- Realtime where useful
- Edge functions for secure isolated workflows

---

## Non-Negotiables
- no business logic in page components
- no silent AI-generated critical state changes
- no admin-only data exposed to standard users
- no scoring without version metadata
- no recommendations without rationale
- no partner routing without auditability
