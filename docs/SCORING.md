# SCORING.md
# Target-state scoring reference. Do not change scoring logic to match this without explicit approval.
# Current scoring lives in src/app/pages/business-assessment/engine.ts and related files.

## Purpose
Source of truth for: FundScore intent, scoring boundaries, interpretation rules,
readiness categorization, recommendation generation inputs, explanation rules,
guardrails for scoring language.

---

## Core Scoring Principle

FundScore is a readiness indicator. It is NOT:
- a credit score
- an underwriting decision
- an approval guarantee
- a lender commitment

FundScore helps users understand how prepared their business appears based on structured readiness signals.

---

## What FundScore Should Do

✓ Simplify a complex readiness profile into a single understandable number
✓ Help users understand where they stand
✓ Motivate action
✓ Support staged progression
✓ Guide product timing
✓ Make gaps visible
✓ Improve decision quality before applying

✗ Must NOT create false certainty
✗ Must NOT imply access to all products
✗ Must NOT substitute for lender underwriting
✗ Must NOT hide the reasons behind outcomes

---

## Score Model

### Public-facing score
Currently implemented: 0–1000 scale (FundScore) with bankable score parallel metric
Target: preserve current range — it is already positioned

### Internal category model
Recommended readiness categories:
- business legitimacy and setup
- compliance readiness
- financial visibility
- cash flow strength
- credit positioning
- banking stability
- documentation readiness
- capital timing and fit

User-facing explanations should group signals into these understandable categories.
Platform evaluates 17 lender-relevant signals (per product positioning) — internal signal detail
should not overwhelm users. Group them.

---

## Readiness States (platform states, not lender promises)

unknown → initial_access_ready → partially_ready → progressing → bankable_candidate → advanced_capital_ready

---

## Score Band Labels

Good options:
- weak / emerging / progressing / strong / advanced
- not ready yet / building readiness / improving quickly / near bankable / strong profile

Labels must feel: clear, motivating, non-shaming, accurate
Avoid: humiliation, overconfidence

---

## Gap Ranking Model

Each gap ranked by combination of:
- severity
- confidence
- likely impact on readiness
- dependency order
- user effort required
- time-to-improvement

Output fields: impact_rank, effort_level, urgency_level, dependency_flag, explanation

---

## Recommendation Generation Rules

Generated from: structured assessment results, readiness gaps, progression state,
product timing logic, dependency logic, subscription context

Must always include:
- what to do
- why it matters
- what it may unlock
- whether it is urgent
- whether it depends on another step first

---

## Capital Path Logic

Capital Path must:
✓ Represent likely current product suitability
✓ Represent likely future product suitability if improvements are made
✓ Stage progression over time

Capital Path must NOT:
✗ Guarantee approval
✗ Imply lender commitment
✗ Hide uncertainty
✗ Recommend products without readiness rationale

---

## Explanation Rules

### Every score explanation must answer
1. What does this score mean?
2. What helped the score?
3. What is holding it back?
4. What should be done next?
5. What could improve if action is taken?

### Every gap explanation must answer
1. What is this gap?
2. Why do lenders care?
3. What can the user do about it?
4. How soon should it be addressed?

### Every recommendation must answer
1. Why is this being recommended now?
2. What does it help improve?
3. What might it unlock next?

---

## Confidence and Uncertainty

Every scoring output should support a confidence concept:
- high confidence / moderate confidence / limited confidence

Limited confidence triggers:
- incomplete assessment
- missing data
- contradictory answers
- outdated profile
- insufficient business history

When confidence is limited, the system must say so clearly.

---

## Allowed vs Disallowed Language

### Allowed
indicates, suggests, may improve, may strengthen, appears to, can help,
based on your assessment, likely next step

### Disallowed
guarantees, proves approval, ensures funding, lender will approve,
exact outcome prediction, absolute certainty

---

## Scoring Versioning

Every score output must store:
- scoring_version
- generation timestamp
- source assessment id
- explanation snapshot where appropriate

Any change to signal weighting, band logic, recommendation sequencing, or gap ranking rules
requires a scoring version change and ADR entry.

---

## AI and Scoring Boundary

AI MAY:
- explain scores
- summarize structured results
- improve readability
- personalize guidance wording

AI MAY NOT:
- invent scores
- modify structured score outputs without orchestration approval
- invent thresholds as facts
- override deterministic rules silently

---

## Non-Negotiables

- score must remain interpretable
- score must not replace lender underwriting
- every recommendation must have rationale
- every major scoring change must be versioned
- public copy must not overstate certainty

---

## Version History

### v1.1 (2026-04-02)
**Type:** Scoring correction — expanded question participation

`calculatePartialScore()` was corrected from `new Array(14)` to `new Array(23)`.
Questions Q_R15–Q_R23 (utilization depth, negative items, bankruptcy, collections,
tax liens, business credit, inquiries, avg daily balance, NSF events, monthly
revenue) now fully participate in scoring. Previously these 9 answers were
silently dropped from the partial-score calculation. Full-assessment scoring
via `computeScore()` was unaffected — the bug only occurred in the partial-score
path used during live assessment display.

All fixture readinessAnswers extended to 23 elements. demoData.ts extended to 23
elements. Question model: 10 foundation + 23 readiness = 33 total.

### v1.0 (initial)
Initial 6-dimension scoring engine. FundScore 0–1000, SBSS proxy, NAP score.
Partial-score path incorrectly initialized to 14 elements (bug, corrected in v1.1).
