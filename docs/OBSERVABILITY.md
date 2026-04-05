# OBSERVABILITY.md — FundReady Analytics and Observability

> You cannot improve what you cannot measure. This doc defines what the platform must track and why.

---

## Current State (as of build audit)

**External analytics: NOT IMPLEMENTED.** This is a red-status gap.

The platform has no external analytics SDK, no event instrumentation, no funnel visibility, no cohort analysis, and no way to know where users stall, what creates momentum, or what messaging converts. Every product decision is currently opinion-based, not behavior-based.

**This must be fixed before monetization is activated.**

---

## Analytics Implementation Plan

### Recommended SDK

**PostHog** — privacy-safe, self-hostable option, generous free tier, excellent funnel/cohort tools.

Alternative: Mixpanel, Amplitude. Avoid Google Analytics (PII risk with financial data).

**Privacy requirements:**
- No PII in event properties (no names, emails, phone numbers, SSNs)
- No financial account data in events
- User identifier: anonymous UUID only (not email)
- Events must be aggregate-safe — no re-identification possible

### Implementation location

Analytics client: `src/app/lib/analytics.ts`

```typescript
// Pattern — wrap SDK calls for swap-safe abstraction
export function track(event: string, properties?: Record<string, unknown>) {
  // PostHog or equivalent
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  // Anonymous traits only — no email, no name
}

export function page(name: string) {
  // Page view tracking
}
```

---

## Event Taxonomy

### Assessment Events

| Event | Properties | Why |
|-------|-----------|-----|
| `assessment_started` | `source`, `membership_tier` | Funnel entry |
| `assessment_question_answered` | `question_id`, `answer_type` | Drop-off detection |
| `assessment_completed` | `question_count`, `time_ms` | Completion rate |
| `assessment_abandoned` | `last_question_id`, `time_ms` | Where users drop |

### Results Events

| Event | Properties | Why |
|-------|-----------|-----|
| `results_viewed` | `fundscore_band`, `goal_count`, `membership_tier` | Engagement baseline |
| `goal_selected` | `goal_number`, `goal_label` | Goal preference data |
| `results_cta_clicked` | `cta_id`, `destination` | Conversion path |
| `upgrade_prompt_shown` | `prompt_location`, `tier_required` | Paywall visibility |
| `upgrade_clicked` | `from_tier`, `to_tier`, `trigger_location` | Revenue intent |

### CreditPath Events

| Event | Properties | Why |
|-------|-----------|-----|
| `creditpath_viewed` | `blocker_count`, `membership_tier` | Engagement |
| `blocker_expanded` | `blocker_category`, `blocker_id` | Priority signals |
| `dscr_estimator_used` | `result_band` (below/at/above 1.25) | Capacity tool engagement |
| `dti_estimator_used` | `result_band` | Capacity tool engagement |

### Navigation Events

| Event | Properties | Why |
|-------|-----------|-----|
| `page_viewed` | `page_name`, `membership_tier` | Usage distribution |
| `getting_started_viewed` | `goal_progress` | Onboarding funnel |
| `access_funding_viewed` | `fundscore_band` | Capital access intent |
| `program_detail_viewed` | `program_id`, `program_name`, `readiness_status` | Program interest |

### Lifecycle Events

| Event | Properties | Why |
|-------|-----------|-----|
| `return_visit` | `days_since_last`, `membership_tier` | Retention signal |
| `milestone_reached` | `milestone_id`, `milestone_label` | Progress tracking |
| `score_improved` | `previous_band`, `new_band` | Momentum signal |

---

## Funnel Definition

The primary conversion funnel FundReady must measure:

```
1. Landing page visit
2. Assessment started
3. Assessment completed (Results viewed)
4. Goal selected (commitment action)
5. CreditPath engaged (blocker viewed or expanded)
6. Return visit (day 2, day 7, day 30)
7. Upgrade click
8. Paid tier activated
```

Drop-off at each step is the primary product improvement input.

---

## Error Observability

### Client-Side Errors

Currently: browser console only (not captured).

Required: Error boundary in React that captures and logs:
- Uncaught exceptions in scoring engine
- Failed localStorage reads
- Route errors / 404s
- Component render failures

Pattern: `src/app/components/ErrorBoundary.tsx` (to be created).

### Scoring Engine Integrity

After every assessment completion, validate:
- `computeScore()` returned a defined result
- FundScore is within 0–1000 range
- At least one goal state is defined

If validation fails: capture as `scoring_error` event with context (no PII).

---

## Dashboard / KPIs

Once analytics is live, these are the primary KPIs to monitor:

| KPI | Target | Why It Matters |
|-----|--------|---------------|
| Assessment completion rate | > 70% | Core activation |
| Results → CreditPath click rate | > 40% | Platform depth |
| Day-7 return rate | > 25% | Retention foundation |
| Upgrade click rate (free → paid) | > 5% | Revenue signal |
| Score improvement rate (30d) | > 20% of active users | Platform value proof |

---

## What We Must Never Track

- Names, emails, phone numbers
- SSNs, EINs, TINs
- Credit scores (actual values — only bands)
- Bank account information
- Any field that could re-identify a user

---

*See also: ENGINEERING.md · TESTING.md · INCIDENTS.md*
