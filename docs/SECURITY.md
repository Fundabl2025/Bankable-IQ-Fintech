# SECURITY.md
# Target-state security reference. Do not change auth, RLS, or access patterns without explicit approval.
# Audit current implementation first.

## Purpose
Source of truth for: access control philosophy, data classification, auth expectations,
secrets handling, admin boundaries, audit requirements, AI and data safety.

Not legal advice. Operational baseline for secure system design.

---

## Security Philosophy

1. Least privilege by default — every user, service, workflow gets minimum required access
2. Protect trust, not just infrastructure — security design must preserve user confidence
3. RLS-first data access — Supabase RLS is the baseline for user-facing data
4. Service-role isolation — service-role credentials never exposed to browsers or clients
5. Audit critical actions — privileged/high-impact actions must be traceable
6. AI is not trusted by default — AI outputs untrusted until constrained, validated, logged

---

## Data Classification

### Class A: Public
Marketing pages, public FAQs, intentionally published documentation

### Class B: User-private
Account profile, business profile, saved progress, subscription status

### Class C: Sensitive business data
Assessment answers, readiness details, gap analysis, recommendations,
coaching notes, partner notes

### Class D: Restricted internal
Scoring internals, prompt internals, override notes, operational metadata, internal dashboards

### Class E: Secrets / service-only
Provider API keys, service-role keys, webhook signing secrets, admin bootstrap tokens

---

## Authentication

Use Supabase Auth as primary authentication system.

Requirements:
- authenticated product access for all non-public pages
- secure session handling
- role-aware access checks
- explicit org/partner relationship checks where needed

Identity model:
- one auth user → one profile
- profile role does not replace row-level authorization
- role AND ownership checks must both be enforced

---

## Authorization

Access determined by:
- authenticated identity
- ownership of record
- explicit business association
- explicit partner/coach assignment
- admin privileges where applicable

Core rules:
- standard users access only their own businesses and records
- coaches access only assigned businesses
- partners access only explicitly linked businesses or partner views
- admins access via controlled internal surfaces only

Enforcement: RLS at DB layer + server-side auth checks at orchestration layer.
UI must not be relied upon for security.

---

## RLS Requirements

All user-facing tables must have RLS enabled.

Minimum covered tables: profiles, businesses, business_profiles, assessments, fundscores,
readiness_profiles, readiness_gaps, recommendations, business_module_progress, capital_paths,
subscriptions, coaching_sessions, business_partner_links

Admin-only or restricted tables (no direct client exposure):
audit_logs, internal prompt configs, system settings, internal scoring config

---

## Secrets Handling

Rules:
- secrets only in environment variables or managed secret stores
- no secrets in client bundles
- no secrets in logs
- no secrets in fixtures committed to repo
- rotate secrets on exposure suspicion

Separate secrets for: local, preview, production

The Supabase service-role key is backend-only. Never expose to browser.

---

## PII and Sensitive Data

- collect only what is needed
- avoid storing unnecessary highly sensitive data
- redact when full detail is not required
- limit AI exposure to minimum necessary context
- if AI input/output snapshots stored: redact sensitive detail, restrict access to internal roles

---

## Audit Requirements

Required for:
- admin overrides
- partner assignments
- coach access changes
- manual score or recommendation overrides
- data export actions
- prompt/policy changes affecting user output

Must NOT log: secrets, full raw provider tokens, raw sensitive payloads without control

---

## Webhooks and External Integrations

- verify webhook signatures
- process idempotently
- record receipt and outcome
- fail closed when verification fails
- billing truth must reconcile through verified provider events (not front-end success screens)

---

## AI Security Rules

Input minimization: send minimum necessary structured context to AI.

Prompts must NOT request or imply:
- guarantees
- unsupported compliance guidance
- invented lender rules
- fabricated user history

High-impact outputs should be checked for:
- banned phrases
- unsupported claims
- missing rationale
- incorrect state references

---

## Admin Surface Security

- separate route group for ops/admin
- explicit role checks
- audit logging
- no client-side-only admin gating
- dangerous actions behind confirmation flows

High-risk actions requiring logging + confirmation:
score override, recommendation suppression, partner reassignment, business merge/archive,
prompt publish, scoring version publish

---

## Secure Development Rules for Claude Code

Claude-generated code MUST:
- respect RLS assumptions
- avoid client-side secret access
- use typed validation on inputs
- avoid broad admin shortcuts
- avoid logging sensitive values
- separate public and restricted routes clearly

Claude MUST NOT generate:
- browser-exposed service-role usage
- admin bypass utilities without clear restriction
- fake security checks implemented only in UI
- copy that overstates data protection guarantees

---

## Non-Negotiables

- RLS on all user-facing tables
- no service-role in client code
- audit logging for privileged actions
- explicit authz checks on server-side actions
- minimal AI exposure of sensitive data
- no trust-undermining shortcuts for speed
