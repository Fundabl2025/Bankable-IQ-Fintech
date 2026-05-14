# PHASE 1 IMPLEMENTATION PLAN
# Zero-risk and low-risk improvements only.
# No schema rewrites. No auth rewrites. No route reorganizations. No breaking output changes.
# Every item is additive or purely subtractive from the client bundle.

Generated from: Architecture Compatibility Audit (docs/ARCHITECTURE.md, SCORING.md, SECURITY.md, EVALS.md)

---

## Guiding Rule for This Phase

If a change could silently alter a user's score, break an existing page, change a stored value,
or require a database migration — it is not in this phase.

Every item below either:
- Adds a new file that does not affect existing behavior
- Adds metadata to an existing object without changing logic
- Removes something dangerous from the client bundle (security)
- Creates infrastructure that no-ops when not configured

---

## Items Overview

| # | Item | Risk | Type | Primary File |
|---|---|---|---|---|
| 1 | Remove hardcoded Bolt API token from client bundle | LOW | Security — remove dangerous fallback | FundingApplicationModal.tsx + new /api/bolt-proxy |
| 2 | Add SCORING_VERSION constant to engine | ZERO | Additive metadata | engine.ts + types.ts |
| 3 | Add scoring_version + score_generated_at to Supabase upsert | ZERO | Additive DB fields | data-adapter.ts |
| 4 | Create logEvent() helper with Supabase no-op fallback | ZERO | New file, additive only | /lib/analytics/events.ts |
| 5 | Instrument 4 critical product events | ZERO | Additive only, no behavior change | 4 existing files |
| 6 | Externalize FORGE prompt templates to /prompts/forge/ | ZERO | Structural refactor, no logic change | AICoach.tsx |
| 7 | Create persona fixtures for regression testing | ZERO | New files, test data only | /fixtures/assessments/ |
| 8 | Add FORGE output guardrail (banned-phrase check) | ZERO | Post-render filter, never blocks valid output | AICoach.tsx or new guardrails.ts |

---

## Item 1 — Remove Hardcoded Bolt API Token

**Risk: LOW**
**Why this phase:** This is the only item here with any production impact. It is still low-risk
because: the ENV var is already expected to be set in production; the fallback is the only
dangerous part. Removing the fallback with a server proxy is additive server + subtractive client.

**The problem:**
`src/app/components/FundingApplicationModal.tsx` line 17–18:
```ts
const BOLT_BROKER_TOKEN =
  (import.meta as any).env?.VITE_BOLT_BROKER_TOKEN ?? '[REDACTED — token rotated per WO-1]';
```
The hardcoded fallback `'[REDACTED]'` shipped in the production JS bundle.
Any user can read it from browser DevTools or the network tab.

**The fix:**

Step 1 — Create `api/bolt-proxy.ts` (Vercel serverless function):
```ts
// api/bolt-proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.BOLT_BROKER_TOKEN;
  if (!token) return res.status(500).json({ error: 'Broker token not configured' });

  const upstream = await fetch('https://api.fundedbybolt.com/api/v1' + (req.query.path ?? ''), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ ...req.body, brokerToken: token }),
  });

  const data = await upstream.json();
  return res.status(upstream.status).json(data);
}
```

Step 2 — In `FundingApplicationModal.tsx`, remove the token constant and the hardcoded fallback.
Replace direct calls to `BOLT_API_BASE` with calls to `/api/bolt-proxy?path=/...`
Remove `brokerToken` from the request payload (the proxy adds it server-side).

Step 3 — Add `BOLT_BROKER_TOKEN` (no `VITE_` prefix — server-only) to Vercel environment variables.
Remove `VITE_BOLT_BROKER_TOKEN` from any `.env` files and Vercel project settings.

**Acceptance criteria:**
- No token string appears anywhere in the compiled client JS bundle
- Bolt API calls still work end-to-end in production
- Demo mode still works (proxy handles requests regardless of user auth state)
- `VITE_BOLT_BROKER_TOKEN` variable removed from all `.env` files

**What does NOT change:**
- The modal UI — unchanged
- The request payload fields — unchanged except brokerToken moves server-side
- The funding application flow — functionally identical to users

---

## Item 2 — Add SCORING_VERSION to Engine

**Risk: ZERO**
**Why this phase:** Pure additive constant + optional field. No weight, threshold, or band changes.
All existing callers of `computeScore()` continue to work unchanged — the new field is optional
in the type and existing destructuring is unaffected.

**The problem:**
`engine.ts` has no version marker. If scoring weights or logic ever change, there is no way to
know which users' stored scores were computed under which rules.

**The fix:**

In `src/app/pages/business-assessment/engine.ts`, add at the top (after imports):
```ts
// ── Scoring version — increment when weights, thresholds, or bands change ────
export const SCORING_VERSION = 'v1.0';
```

In `src/app/pages/business-assessment/types.ts`, add to `ScoreResult`:
```ts
export interface ScoreResult {
  score: number;
  dimAvg: Record<'P' | 'B' | 'F' | 'C' | 'S' | 'N', number>;
  bankableScore: number;
  napScore: number;
  scoringVersion: string;   // ← ADD THIS
  generatedAt: string;      // ← ADD THIS (ISO timestamp)
}
```

In `engine.ts`, in the `computeScore()` return value, add:
```ts
  scoringVersion: SCORING_VERSION,
  generatedAt: new Date().toISOString(),
```

**Acceptance criteria:**
- `computeScore(data).scoringVersion` returns `'v1.0'`
- `computeScore(data).generatedAt` returns a valid ISO timestamp
- All existing callers of `computeScore()` compile and run without changes
- No score values change

**What does NOT change:**
- Any weight, threshold, band label, or score value
- Any page that renders score output
- The localStorage schema (scoringVersion is just in the object)

---

## Item 3 — Add scoring_version + score_generated_at to Supabase Upsert

**Risk: ZERO**
**Why this phase:** The upsert in `data-adapter.ts` already has error handling that swallows
failures and falls back to localStorage. If these columns don't yet exist in the DB, the upsert
will silently fail and the localStorage save (which already happened) is unaffected.
When the columns are eventually added to the DB schema, the values will start persisting
automatically with no further code change.

**The problem:**
The current upsert in `data-adapter.ts` line 57 writes `fund_score`, `bankable_score`,
and `updated_at` but no version metadata. There is no way to know which scoring version
produced a stored score record.

**The fix:**

In `src/app/lib/data-adapter.ts`, update the assessment upsert to include:
```ts
import { SCORING_VERSION } from '../pages/business-assessment/engine';

// In the upsert payload on line 57:
{
  user_id: user.id,
  assessment_data: value,
  fund_score,
  bankable_score,
  scoring_version: SCORING_VERSION,           // ← ADD
  score_generated_at: new Date().toISOString(), // ← ADD
  updated_at: new Date().toISOString()
}
```

Apply the same addition to the second upsert path (around line 143) where assessment data
is saved during the migration flow.

**Acceptance criteria:**
- When a user completes an assessment, the Supabase upsert payload includes `scoring_version: 'v1.0'`
- If the Supabase columns don't exist, the error is silently swallowed (existing behavior)
- localStorage save is unaffected
- No change to score values or user-visible output

---

## Item 4 — Create logEvent() Helper

**Risk: ZERO**
**Why this phase:** New file. No existing file changes. The function no-ops silently when
Supabase is not configured (same pattern as `data-adapter.ts`). Zero impact if the
`event_logs` table doesn't exist yet.

**The problem:**
There is no product event tracking anywhere in the codebase. The 9 critical events from
EVALS.md are all absent. Without them, there is no visibility into where users drop off,
which persona converts, or whether readiness explanations increase completion.

**The fix:**

Create `src/app/lib/analytics/events.ts`:
```ts
// ── Product Event Logger ──────────────────────────────────────────────────────
// Writes to Supabase event_logs when configured. Silently no-ops otherwise.
// Never throws. Never blocks the calling workflow.

import { supabase, isSupabaseConfigured } from '../supabase/client';
import { getCurrentUser } from '../supabase/client';

export interface ProductEvent {
  event_name: string;
  business_id?: string;
  assessment_id?: string;
  payload?: Record<string, unknown>;
}

export async function logEvent(event: ProductEvent): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const user = await getCurrentUser();
    await supabase.from('event_logs').insert({
      actor_profile_id: user?.id ?? null,
      event_name: event.event_name,
      event_payload: event.payload ?? {},
      occurred_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal — event logging must never break the product
  }
}
```

**Acceptance criteria:**
- `logEvent({ event_name: 'test' })` does not throw in any environment
- When Supabase is configured and `event_logs` table exists, a row is inserted
- When Supabase is not configured, function returns silently
- No existing file is modified

---

## Item 5 — Instrument 4 Critical Product Events

**Risk: ZERO**
**Why this phase:** `logEvent()` is a fire-and-forget call added to 4 existing files.
It is wrapped in no-op error handling. Each call is a single line appended after
existing logic. No existing behavior changes.

**The 4 events to add (highest signal value from EVALS.md):**

### Event 1: assessment_completed
File: `src/app/pages/business-assessment/Results.tsx` (or wherever score reveal triggers)
Add after the score is computed and displayed:
```ts
import { logEvent } from '../lib/analytics/events';
// After score computation:
logEvent({ event_name: 'assessment_completed', payload: { scoring_version: result.scoringVersion, fund_score: result.score } });
```

### Event 2: fundscore_generated
File: `src/app/lib/data-adapter.ts`
Add inside the `unified_assessment` upsert success path:
```ts
import { logEvent } from './analytics/events';
// After successful upsert:
logEvent({ event_name: 'fundscore_generated', payload: { fund_score, scoring_version: SCORING_VERSION } });
```

### Event 3: module_completed
File: `src/app/components/ComplianceModulePage.tsx`
Add inside the `allDone` block (already exists at ~line 339):
```ts
import { logEvent } from '../lib/analytics/events';
// Inside the allDone block:
logEvent({ event_name: 'module_completed', payload: { module_id: moduleId } });
```

### Event 4: upgrade_started
File: wherever the upgrade modal opens (LenderCompliance.tsx and OptimizeReporting.tsx)
Add when `setShowUpgrade(true)` is called:
```ts
import { logEvent } from '../lib/analytics/events';
// When upgrade modal opens:
logEvent({ event_name: 'upgrade_started', payload: { source: 'lender_compliance' } }); // or 'optimize_reporting'
```

**Acceptance criteria:**
- Each of the 4 events fires at the correct moment
- None of the 4 events throws or disrupts the existing user flow
- If Supabase is not configured, all 4 silently no-op

---

## Item 6 — Externalize FORGE Prompt Templates

**Risk: ZERO**
**Why this phase:** This is purely structural. The same strings move from inline template
literals in AICoach.tsx to imported constants in /prompts/forge/ files.
No logic changes. No output changes. No behavior changes.

**The problem:**
All FORGE response templates are inline template literals in `AICoach.tsx`. There is no
way to version them, test them independently, or check them for banned phrases without
reading hundreds of lines of component code. EVALS.md requires prompt_key, prompt_version,
and forbidden_claims metadata per prompt.

**The fix:**

Step 1 — Create `/prompts/forge/` directory with one file per major template:

```
/prompts/forge/
  roadmap-stage-1.ts     ← Stage 1 narrative + items
  roadmap-stage-2.ts     ← Stage 2 narrative + items
  roadmap-stage-3.ts     ← Stage 3 narrative + items
  chat-greeting.ts       ← Initial greeting template
  chat-responses.ts      ← Response template map by intent
  metadata.ts            ← Prompt registry with versions
```

Step 2 — Each file exports:
```ts
export const PROMPT_KEY = 'roadmap-stage-1';
export const PROMPT_VERSION = 'v1.0';
export const FORBIDDEN_CLAIMS = [
  'guaranteed approval',
  'lender will approve',
  'ensures funding',
];
export const template = (ctx: CoachContext): string => `...same string as inline...`;
```

Step 3 — Import from AICoach.tsx instead of defining inline:
```ts
import { template as stage1Template } from '../../prompts/forge/roadmap-stage-1';
```

**Acceptance criteria:**
- AICoach.tsx output is character-for-character identical before and after
- No user-visible change in FORGE responses
- Prompt files have PROMPT_KEY, PROMPT_VERSION, FORBIDDEN_CLAIMS exports
- Prompt files are independently readable and testable

---

## Item 7 — Create Persona Assessment Fixtures

**Risk: ZERO**
**Why this phase:** New files only. No production code touched. These are JSON files
used for manual and automated regression testing of the scoring engine.

**The problem:**
There are no fixtures for the 5 EVALS.md personas. When `engine.ts` changes, there
is no baseline to compare outputs against. Regressions are invisible.

**The fix:**

Create `/fixtures/assessments/` with 5 files:

```
/fixtures/assessments/
  persona-1-first-time-strategic.json      ← Never applied, bootstrapped, moderate revenue
  persona-2-denied-but-viable.json         ← Prior denial, fixable blockers
  persona-3-growth-operator.json           ← Existing revenue, wants stronger capital
  persona-4-underserved-founder.json       ← Limited system familiarity, needs trust
  persona-5-advisor-partner.json           ← Helping clients, wants structured outputs
```

Each fixture contains:
- Full `UnifiedAnswers`-compatible JSON (matches the shape of DEMO_ASSESSMENT_DATA in demoData.ts)
- A `_meta` block with: persona_name, expected_score_range, expected_band, expected_readiness_state
- Can be run through `computeScore()` at any time to verify output hasn't changed

Use DEMO_ASSESSMENT_DATA from `demoData.ts` as the template for the JSON shape.

**Acceptance criteria:**
- 5 fixture files exist in `/fixtures/assessments/`
- Each passes TypeScript type validation when imported as `UnifiedAnswers`
- Each has a `_meta` block with expected score range
- Running `computeScore(fixture)` on each produces a score within the expected range
- No production files modified

---

## Item 8 — Add FORGE Output Guardrail

**Risk: ZERO**
**Why this phase:** Post-render filter. Only triggers if a banned phrase appears in output
(which should never happen with the current deterministic templates). When it does trigger,
it logs a warning and strips the phrase — it never blocks or throws.

**The problem:**
FORGE chat responses and roadmap narratives have no output validation. If template logic
ever produces a banned phrase (e.g., after a prompt change), there is no catch.
EVALS.md and COPY.md both define explicit banned language.

**The fix:**

Create `src/app/lib/ai/guardrails.ts`:
```ts
// ── FORGE Output Guardrails ───────────────────────────────────────────────────
// Post-render filter. Never blocks output — only logs warnings and strips phrases.

const BANNED_PHRASES = [
  'guaranteed approval',
  'guaranteed funding',
  'lender will approve',
  'ensures funding',
  'instant funding success',
  'everyone gets approved',
  'secret lender hack',
  'beat the bank',
  'get money fast no matter what',
  'this changes everything forever',
];

export function checkForgeOutput(text: string, context?: string): string {
  let cleaned = text;
  let flagged = false;

  for (const phrase of BANNED_PHRASES) {
    if (cleaned.toLowerCase().includes(phrase.toLowerCase())) {
      console.warn(`[FORGE guardrail] Banned phrase detected: "${phrase}"`, { context });
      cleaned = cleaned.replace(new RegExp(phrase, 'gi'), '[removed]');
      flagged = true;
    }
  }

  if (flagged) {
    console.error('[FORGE guardrail] Output contained banned phrase(s). Review prompt template.');
  }

  return cleaned;
}
```

In `AICoach.tsx`, wrap FORGE response strings before setting state:
```ts
import { checkForgeOutput } from '../lib/ai/guardrails';
// Before setMessages() or setRoadmap():
const safeText = checkForgeOutput(responseText, `module: ${moduleId}`);
```

**Acceptance criteria:**
- A string containing "guaranteed approval" is returned with that phrase replaced by "[removed]"
- A string with no banned phrases is returned unchanged
- A console.warn fires when a banned phrase is found
- No user-visible change in current FORGE output (current templates contain no banned phrases)
- Function never throws

---

## Sequencing

Execute in this order to respect dependencies:

```
1. Item 2 (SCORING_VERSION)          ← Item 3 imports from it
2. Item 3 (data-adapter upsert)      ← Depends on Item 2
3. Item 4 (logEvent helper)          ← Item 5 depends on it
4. Item 5 (instrument 4 events)      ← Depends on Item 4
5. Item 8 (FORGE guardrail)          ← Standalone, no deps
6. Item 6 (externalize prompts)      ← After guardrail, so guardrail can be wired in
7. Item 7 (persona fixtures)         ← Standalone, no deps
8. Item 1 (Bolt token removal)       ← Last, separate deployment concern
```

---

## What Is Explicitly NOT in This Phase

These items from the audit are deferred to Phase 2 or later:

| Item | Why deferred |
|---|---|
| Supabase schema migration files | Schema work — Phase 2 |
| Auth guard on RootLayout | Auth flow change — Phase 2 |
| Move membership tier server-side | Auth + schema change — Phase 3 |
| Assessment data normalization | Schema rewrite — Phase 3 |
| RLS policy additions | Schema + auth — Phase 3 |
| Next.js migration | Platform rewrite — Phase 4 |
| event_logs table creation | Schema — must precede Phase 2 event persistence |

Note on admin portal: `LenderPortal.tsx` already queries the `admin_roles` table
via `useAuth()` and renders an access-denied state if the user is not an admin.
This was already implemented correctly — no change needed.

---

## Definition of Done for Phase 1

Phase 1 is complete when:
- [ ] Item 1: No token string in compiled client bundle; Bolt API calls functional
- [ ] Item 2: `computeScore(data).scoringVersion === 'v1.0'`
- [ ] Item 3: Supabase upsert payload includes `scoring_version` and `score_generated_at`
- [ ] Item 4: `logEvent({ event_name: 'test' })` silently no-ops in all environments
- [ ] Item 5: All 4 events fire correctly in a manual walkthrough of each flow
- [ ] Item 6: AICoach output unchanged; prompt files exist with version metadata
- [ ] Item 7: 5 fixture files exist; each produces a score in the expected range
- [ ] Item 8: `checkForgeOutput('guaranteed approval')` returns `'[removed]'`
