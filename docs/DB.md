# DB.md
# Target-state database reference. Do not run migrations to match this without explicit approval.
# Audit existing schema first. Propose changes incrementally.

## Purpose
Source of truth for: core tables, table purposes, relationships, access expectations,
naming conventions, audit and event design, RLS assumptions.

---

## Database Philosophy

1. Postgres is the source of truth
2. Separate transactional data from derived views and cached projections
3. Prefer explicit relational structures — use JSONB only where flexibility clearly wins
4. Every critical record needs provenance (created_by, updated_by, version metadata)
5. Auditability matters — product actions affecting readiness, recommendations, partner routing, or subscriptions must be traceable

---

## Naming Conventions

- Table names: plural_snake_case
- Columns: snake_case
- Primary keys: id as UUID
- Foreign keys: <related_table_singular>_id
- Timestamps: created_at, updated_at
- Soft delete: archived_at or deleted_at
- Status fields: prefer enums or constrained text
- Version fields: scoring_version, prompt_version, logic_version, schema_version

---

## Core Tables (target state)

### profiles
Maps to Supabase Auth users. One profile per authenticated user.
Key fields: id, auth_user_id, email, full_name, phone, role, onboarding_state, created_at, updated_at
Roles: user, admin, coach, partner, advisor

### businesses
Business entity associated with a user.
Key fields: id, owner_profile_id, legal_name, dba_name, entity_type, ein_last4, industry,
state_of_incorporation, years_in_business, annual_revenue_band, employee_count_band,
website_url, status, created_at, updated_at

### business_profiles
Expanded business readiness profile.
Key fields: id, business_id, business_stage, primary_need, prior_funding_experience,
denied_before, bookkeeping_status, tax_filing_status, bank_account_status,
revenue_consistency_status, compliance_status, profile_completeness, created_at, updated_at

### assessments
Versioned readiness assessment records.
Key fields: id, business_id, profile_id, assessment_type, status, started_at, submitted_at,
completed_at, schema_version, scoring_version, raw_answer_payload, normalized_answer_payload

Status values: not_started, in_progress, completed, archived

### fundscores
Top-level assessment output.
Key fields: id, assessment_id, business_id, score_value, score_band, readiness_state,
bankable_status_indicator, scoring_version, explanation_snapshot, generated_at

Notes: historical scores must remain queryable; one assessment → one canonical FundScore

### readiness_profiles
Structured readiness category summary.
Key fields: id, assessment_id, business_id, scoring_version, profile_state, category_scores,
strengths_summary, weaknesses_summary, readiness_summary, confidence_label

### readiness_gaps
Ranked blocker/gap records — must be queryable, not trapped inside JSON.
Key fields: id, business_id, assessment_id, gap_code, gap_title, gap_category, severity,
impact_rank, rationale, status, recommended_action_type, resolved_at

Status: open, in_progress, resolved, dismissed

### recommendations
Action recommendations tied to gaps.
Key fields: id, business_id, assessment_id, readiness_gap_id, recommendation_type, title,
description, rationale, priority_rank, expected_impact_label, state, source_type,
logic_version, prompt_version, completed_at

Source type: rules, ai_assisted, human_override
State: active, completed, hidden, superseded

### compliance_modules
Master catalog of readiness modules (static/semi-static).
Key fields: id, module_code, title, description, category, order_hint,
prerequisite_module_codes, active

### business_module_progress
Per-business module progression.
Key fields: id, business_id, compliance_module_id, state, completion_percent,
started_at, completed_at, last_activity_at, coach_assigned_profile_id

State: locked, unlocked, started, blocked, completed

### capital_paths
Capital pathway projections (guidance only, not lender approval).
Key fields: id, business_id, assessment_id, path_state, current_capital_band,
projected_next_capital_band, eligible_product_types, future_product_types,
roadmap_snapshot, logic_version

### subscriptions
Billing and plan state.
Key fields: id, profile_id, business_id, provider, provider_customer_id,
provider_subscription_id, plan_code, status, current_period_start, current_period_end, canceled_at

Plan: free, virtual, live

### coaching_sessions
Human or AI coaching interactions.
Key fields: id, business_id, profile_id, coach_profile_id, session_type, session_state,
session_summary, action_items, occurred_at

Session type: ai, live, async_human

### partner_organizations
Advisors, lenders, community partners, channels.
Key fields: id, name, partner_type, status, contact_email, metadata

Partner type: advisor, lender, community, affiliate

### business_partner_links
Business ↔ partner association.
Key fields: id, business_id, partner_organization_id, relationship_type, source, attached_at, detached_at

### ai_generations
AI output metadata and snapshots (use carefully for privacy).
Key fields: id, business_id, assessment_id, generation_type, prompt_key, prompt_version,
model_name, input_snapshot, output_snapshot, safety_status, created_at

### event_logs
Immutable product event stream. Append-only.
Key fields: id, actor_profile_id, business_id, assessment_id, event_name, event_payload,
occurred_at, request_id, created_at

### audit_logs
Immutable audit trail for high-risk actions. Append-only.
Key fields: id, actor_profile_id, target_table, target_id, action, before_snapshot,
after_snapshot, reason, occurred_at, created_at

Examples: admin override, recommendation override, partner re-assignment, coach status override

---

## Key Relationships

- profiles 1:n businesses
- businesses 1:n assessments
- assessments 1:1 fundscores
- assessments 1:1 readiness_profiles
- assessments 1:n readiness_gaps
- readiness_gaps 1:n recommendations
- businesses 1:n business_module_progress
- compliance_modules 1:n business_module_progress
- businesses 1:n capital_paths
- profiles 1:n subscriptions
- businesses n:n partner_organizations via business_partner_links

---

## Data Classification

- Public: marketing content, public docs
- User-private: account profile, business profile, saved progress, subscription status
- Sensitive: assessment answers, readiness details, gap analysis, recommendations, coaching notes
- Admin-restricted: audit logs, internal scoring metadata, override notes
- Service-only: provider tokens, system keys, internal sync metadata

---

## RLS Requirements

All user-facing tables must have RLS enabled.
A user may read/write only records associated with their own profile_id or explicitly owned businesses.
Coach/advisor access must be explicitly granted.
Admin access must be auditable.
Service-role limited to secure backend operations only.

Tables requiring RLS: profiles, businesses, business_profiles, assessments, fundscores,
readiness_profiles, readiness_gaps, recommendations, business_module_progress, capital_paths,
subscriptions, coaching_sessions, business_partner_links

---

## Indexing Guidance (high-priority)

businesses.owner_profile_id, assessments.business_id, assessments.status,
fundscores.assessment_id, readiness_gaps.business_id, readiness_gaps.status,
recommendations.business_id, recommendations.state, business_module_progress.business_id,
subscriptions.profile_id, event_logs.business_id, event_logs.occurred_at

---

## Migration Guidance

- additive migrations by default
- no destructive changes without ADR
- preserve historical scoring outputs
- treat event_logs and audit_logs as append-only
- no deletion of historical score records without explicit archival strategy

---

## Non-Negotiables

- RLS on all user-facing tables
- no direct client access to admin-only tables
- no mutable audit history
- no opaque critical logic trapped only in JSON blobs
- no deletion of historical score records without archival policy
