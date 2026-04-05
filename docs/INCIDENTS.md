# INCIDENTS.md — FundReady Incident Management

> An incident is any production issue that affects user trust, score accuracy, data integrity, or platform availability.

---

## What Qualifies as an Incident

| Severity | Description | Response Time |
|----------|-------------|--------------|
| **P0 — Critical** | Wrong score displayed, wrong eligibility, broken assessment flow, data loss | Immediate — fix within 1 hour |
| **P1 — High** | Broken route (404), payment gate failure, membership tier stuck, key page down | Fix within 4 hours |
| **P2 — Medium** | Incorrect copy (guarantee language, wrong threshold), tool rendering error, non-critical feature broken | Fix within 24 hours |
| **P3 — Low** | Style regressions, minor copy issues, non-blocking UI glitches | Fix in next release |

---

## Incident Response Protocol

### Step 1 — Detect

Sources:
- User report
- Smoke test failure post-deploy
- Vercel build log error
- Browser console error caught in session

### Step 2 — Document (immediately)

Open this file. Add a new incident entry:

```markdown
## INC-[number] — [short description]
- **Date:** YYYY-MM-DD
- **Severity:** P0 / P1 / P2 / P3
- **Detected:** How was this found?
- **Affected surface:** Which page / component / engine?
- **User impact:** What could users have seen or experienced?
- **Root cause:** (fill in after investigation)
- **Fix applied:** (fill in after resolution)
- **Status:** Open / Resolved
- **Resolved:** YYYY-MM-DD HH:MM
```

### Step 3 — Contain

For P0/P1: Assess whether to revert or hotfix.
- If the defect is in a recent deploy and revert is clean: revert first, hotfix second
- If revert would lose other changes: hotfix directly

### Step 4 — Fix

Apply minimal targeted fix. Do not refactor during incident response.
Do not change anything outside the blast radius of the issue.

### Step 5 — Verify

Run smoke test checklist (TESTING.md) after fix is live.

### Step 6 — Close

Update the incident entry: root cause, fix applied, resolved timestamp.

---

## Incident Log

---

### INC-001 — Assessment sync not updating business profile
- **Date:** 2025-02-23 (approximate)
- **Severity:** P1
- **Detected:** Manual testing — business profile fields not reflecting assessment answers
- **Affected surface:** `businessData.ts` sync function
- **User impact:** Dashboard and CreditPath showed stale data after assessment completion
- **Root cause:** `syncAssessmentToBusinessProfile()` not called after assessment save
- **Fix applied:** Added sync call in `UnifiedAssessment.tsx` after assessment save
- **Status:** Resolved

---

### INC-002 — DSCR tool not integrated in CreditPath
- **Date:** 2025-02-23
- **Severity:** P2
- **Detected:** Feature audit — DSCREstimator component built but not rendered
- **Affected surface:** `CreditPath.tsx`
- **User impact:** Capacity tool existed in code but unreachable by users
- **Root cause:** Component not imported or rendered in CreditPath page
- **Fix applied:** Added DSCREstimator to CreditPath page under Capacity section
- **Status:** Resolved

---

*Add new incidents below this line.*

---

## Postmortem Practice (for P0/P1)

After every P0 or P1 incident is resolved, add a brief postmortem:

```markdown
### Postmortem: INC-[number]
**What happened:** 1-2 sentences
**Why it happened:** Root cause (technical + process)
**What prevented earlier detection:**
**What would prevent recurrence:**
**Action items:** (specific changes — code, test, process)
```

The goal of postmortems is not blame. It is to make the system harder to break in the same way twice.

---

## Trust Impact Assessment

For any incident that affects score display, eligibility, readiness state, or any user-facing financial signal:

1. Determine: what did users see that was wrong?
2. Determine: how many users were affected and for how long?
3. Determine: is any correction or communication needed?
4. If yes: draft correction language through Compliance / Trust Architect lens (calm, credible, not alarming)

---

*See also: ENGINEERING.md · RELEASES.md · TESTING.md*
