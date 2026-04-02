// ── Product Event Logger ──────────────────────────────────────────────────────
// Writes to Supabase event_logs table when configured. Silently no-ops otherwise.
// Never throws. Never blocks the calling workflow. Always fire-and-forget.
//
// T-04A: ProductEvent is now a discriminated union — event_name determines
// payload shape. Adding a new event means adding a new union member.
// Do not widen payload back to Record<string, unknown>.
//
// Usage:
//   import { logEvent } from '../lib/analytics/events';
//   logEvent({ event_name: 'module_completed', payload: { module_id: 'ein-number' } });

import { isSupabaseConfigured, supabase } from '../supabase/client';

// ── Per-event payload types ───────────────────────────────────────────────────

/** Score calculation completed after full assessment submission. */
type AssessmentCompletedEvent = {
  event_name: 'assessment_completed';
  payload: {
    scoring_version: string;   // e.g. 'v1.1' — from SCORING_VERSION constant
    fund_score: number;        // 0–1000 FundScore
    bankable_score: number;    // 0–300 SBSS proxy
  };
};

/** Assessment data saved to Supabase (may fire without full submission). */
type FundscoreGeneratedEvent = {
  event_name: 'fundscore_generated';
  payload: {
    fund_score: number;        // 0–1000 FundScore at time of save
    scoring_version: string;   // e.g. 'v1.1'
  };
};

/** User completed a compliance module (all tasks marked done). */
type ModuleCompletedEvent = {
  event_name: 'module_completed';
  payload: {
    module_id: string;         // matches complianceModules[n].id
  };
};

/** User clicked an upgrade CTA while a payment gate was active. */
type UpgradeStartedEvent = {
  event_name: 'upgrade_started';
  payload: {
    source: string;            // e.g. 'lender_compliance' | 'optimize_reporting'
  };
};

// ── Discriminated union ───────────────────────────────────────────────────────
// Each member has a unique event_name literal — TypeScript will narrow payload
// to the correct shape based on the event_name at each call site.
//
// To add a new event:
//   1. Define a new *Event type above
//   2. Add it to the ProductEvent union below
//   3. Add a logEvent call at the appropriate lifecycle point

export type ProductEvent = (
  | AssessmentCompletedEvent
  | FundscoreGeneratedEvent
  | ModuleCompletedEvent
  | UpgradeStartedEvent
) & {
  // Optional identifiers for future cross-table join queries
  business_id?: string;
  assessment_id?: string;
};

// ── Logger ────────────────────────────────────────────────────────────────────

export async function logEvent(event: ProductEvent): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('event_logs').insert({
      actor_profile_id: user?.id ?? null,
      event_name: event.event_name,
      event_payload: event.payload,
      occurred_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal — event logging must never break the product
  }
}
