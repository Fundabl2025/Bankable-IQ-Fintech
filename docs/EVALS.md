# EVALS.md
# Target-state evaluation framework. Use as testing guidance, not a mandate to rewrite current tests.

## Purpose
Source of truth for: product output testing, AI output testing, scoring explanation quality,
UX/copy consistency checks, regression testing expectations, acceptance criteria for high-risk flows.

Goal: make Claude-assisted development safer, faster, and more repeatable.

---

## Eval Philosophy

1. Test what users actually experience — not just code paths
2. Test trust, not just correctness — a technically valid output can still be confusing or unsafe
3. Deterministic logic first, AI second — test structured logic independently from AI wording
4. Regressions must be visible — when prompts, scoring, or UX patterns change, compare outputs fast

---

## Eval Categories

### 1. Domain logic evals
Tests for: scoring state transitions, gap ranking order, recommendation sequencing,
capital-path eligibility staging, module unlock logic, subscription gating logic

Example questions:
- Does a completed assessment always create a FundScore record?
- Does an unresolved prerequisite block dependent recommendations?
- Does module completion update progression state correctly?

### 2. Scoring explanation evals
Tests for: clarity, rationale completeness, non-guarantee language, confidence language

Pass criteria — every score explanation must:
- explain what the score means
- identify strengths and blockers
- provide next steps
- avoid guaranteed language
- match actual readiness state

### 3. Recommendation evals
Tests for: relevance, actionability, correct sequencing, dependency logic

Pass criteria — every recommendation must:
- be tied to a real gap or readiness state
- explain why it matters
- not contradict previous recommendations
- not promise outcomes it cannot support

### 4. Copy evals
Tests for: tone consistency, trustworthiness, clarity, non-robotic style, non-shaming language

Fail conditions:
- hype-heavy
- manipulative
- vague
- unsupported approval language
- fear-first messaging without resolution

### 5. UX flow evals
Tests for: next step clarity, progress visibility, state continuity, low-friction progression

Checkpoints:
- visitor to assessment start
- assessment completion to score reveal
- score reveal to module start
- module completion to upgrade moment

### 6. Security and policy evals
Tests for: no browser-side service-role, correct auth gating, RLS compliance,
no banned phrases in AI output, no unsupported legal/compliance claims

### 7. Analytics evals
Tests for: critical events emitted, correct event payload shape, attribution fields present

Critical events to validate:
assessment_started, assessment_completed, fundscore_generated, score_revealed,
module_started, module_completed, recommendation_completed, upgrade_started, subscription_changed

---

## Core Persona Fixtures

### persona_fixture_1: first_time_strategic_applicant
Profile: never applied, bootstrapped, moderate revenue, incomplete readiness, anxious
Expected: educational but encouraging, no repair-oriented tone, emphasis on getting it right first time

### persona_fixture_2: denied_but_viable_owner
Profile: prior denial, strong potential, some fixable blockers
Expected: diagnostic language, recovery framing, practical next steps

### persona_fixture_3: growth_operator
Profile: existing revenue, wants stronger capital products, partially prepared
Expected: graduation framing, emphasis on sequencing toward better capital

### persona_fixture_4: underserved_founder
Profile: limited system familiarity, needs trust and clarity, potentially overwhelmed
Expected: plain language, non-judgmental, strong guidance cues

### persona_fixture_5: advisor_channel_partner
Profile: helping clients, wants structured credible outputs
Expected: clear summaries, partner-usable guidance, no consumer-only assumptions

---

## Golden Output Files (target location: /fixtures/golden/)

Maintain golden examples for:
- score reveal summary
- gap explanation set
- recommendation list
- onboarding copy
- upgrade modal copy
- FAQ answer
- partner summary view

Use these to compare after prompt or logic changes.

---

## Prompt Eval Rules

Every production prompt should have:
- prompt key
- prompt version
- purpose
- required inputs
- forbidden claims
- example good output
- example bad output

Prompt eval checks:
- output matches current product state
- no banned guarantee language
- no invented lender facts
- rationale present
- tone matches project standards

---

## Banned Language Checks

Flag automatically:
- guaranteed approval
- guaranteed funding
- lender will approve
- instant funding success
- everyone gets approved
- secret lender trick
- beat the bank
- unsupported exact percentages
- unsupported causal certainty
- legal/tax claims without basis

---

## Manual Review Required For

- new scoring versions
- new recommendation framework versions
- major landing page rewrites
- subscription offer changes
- prompt changes affecting score or compliance explanations
- partner-facing workflow launches

---

## Regression Test Triggers

Run relevant evals when any of the following change:
- scoring logic
- prompt files
- recommendation ordering logic
- module unlock logic
- CTA copy framework
- authentication/authorization logic
- event payload schemas

---

## Acceptance Criteria Template

For any major feature, confirm:
1. domain correctness — logic works
2. user clarity — outputs are understandable
3. trust safety — no unsafe claims introduced
4. analytics coverage — events are emitted
5. security posture — access is correctly restricted

A feature is not complete unless all 5 criteria pass.

---

## Suggested Directory Structure (target)

/docs/evals/
/fixtures/assessments/
/fixtures/golden/
/fixtures/prompts/
/prompts/forge/
/tests/domain/
/tests/integration/
/tests/prompt/
/tests/security/

---

## Non-Negotiables

- no AI prompt changes without regression review
- no scoring change without fixture re-run
- no high-risk copy launch without trust review
- no feature marked done without analytics and security checks
