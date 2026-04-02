# FundReady™ — Changelog

---

## v1.1 — Scoring Correction Release
**Date:** 2026-04-02
**Type:** Scoring behavior correction (not a weight or band change)

### What changed
`calculatePartialScore()` in `engine.ts` was initializing the readiness answer
array with `new Array(14)` instead of `new Array(23)`. This caused questions
Q_R15–Q_R23 (indices 13–22) to score as `undefined` on every partial-score
calculation, silently omitting 9 readiness inputs from live scoring.

The full 23-question readiness model was already implemented and stored correctly
in assessment data — the bug was only in the partial-score initializer used during
live assessment display.

### Impact
- All 5 dimension buckets (P, B, F, C, S, N) now receive contributions from the
  full 23-question readiness set
- Score outputs may differ slightly from pre-fix v1.0 scores
- Affected questions: Q_R15 (negative items), Q_R16 (bankruptcy), Q_R17
  (collections), Q_R18 (tax liens), Q_R19 (business credit), Q_R20 (inquiries),
  Q_R21 (avg daily balance), Q_R22 (NSF events), Q_R23 (monthly revenue)
- Score band shifts: LOW RISK — deltas are ±5–20 points; band boundaries are
  50–100 points apart

### Files changed
- `src/app/pages/business-assessment/engine.ts` — `new Array(14)` → `new Array(23)`; version bump to 'v1.1'
- `src/app/pages/business-assessment/questions.ts` — comment corrected to "23 questions"
- `src/app/utils/demoData.ts` — readinessAnswers extended from 13 to 23 elements
- `fixtures/assessments/persona-1-first-time-strategic.json` — 13 → 23 elements
- `fixtures/assessments/persona-2-denied-but-viable.json` — 13 → 23 elements
- `fixtures/assessments/persona-3-growth-operator.json` — 13 → 23 elements
- `fixtures/assessments/persona-4-underserved-founder.json` — 13 → 23 elements
- `fixtures/assessments/persona-5-advisor-partner.json` — 13 → 23 elements

### Score isolation
Scores stored in Supabase under `scoring_version = 'v1.0'` were generated before
this fix. Scores generated post-deploy will carry `scoring_version = 'v1.1'`.
The two cohorts can be queried separately. No recalculation of historical scores
is required, but historical v1.0 scores should not be directly compared to
post-fix scores without accounting for the version difference.

---

## v1.0 — Initial Release
**Type:** Initial scoring engine

- 6-dimension scoring model: Personal (P), Business (B), Financial (F), Compliance (C), Stability (S), File (N)
- FundScore 0–1000 scale
- SBSS proxy score (0–300 scale)
- NAP completeness score
- 10 foundation questions + 23 readiness questions (33 total)
- Score versioning and generation timestamps stored to Supabase
- Analytics events: `fundscore_generated`, `assessment_completed`
