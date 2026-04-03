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

// ── Dashboard instrumentation events (added with analytics workstream) ────────

/** Dashboard mounted with assessment data (fires once per page visit, ref-guarded). */
type DashboardViewedEvent = {
  event_name: 'dashboard_viewed';
  payload: {
    has_assessment: boolean;   // false when user has never completed the scan
    fund_score: number;        // 0–1000 FundScore at time of view
    active_stage: number;      // 1 | 2 | 3 — current capital journey stage
    blocker_count: number;     // hard blockers present at view time
  };
};

/** NextBestMoveCard rendered with a live top blocker (fires once on mount). */
type NextBestMoveViewedEvent = {
  event_name: 'next_best_move_viewed';
  payload: {
    blocker_title: string;     // human-readable blocker name — no PII
    blocker_severity: string;  // 'hard_blocker' | 'suppressor'
    fico_impact: number;       // estimated score points if resolved
  };
};

/** ProgressMarkerCard stage tracker rendered (fires once on mount). */
type ProgressStageViewedEvent = {
  event_name: 'progress_stage_viewed';
  payload: {
    active_stage: number;      // 1 | 2 | 3
  };
};

/** Capital Access section of FollowOnBlockersCard rendered (fires once on mount). */
type CapitalAccessViewedEvent = {
  event_name: 'capital_access_viewed';
  payload: {
    pre_qual_count: number;    // number of pre-qualified programs at view time
    pipeline_total: number;    // total active funding applications
  };
};

/** User clicked "Fix This Now" on the top blocker in NextBestMoveCard. */
type TopBlockerCtaClickedEvent = {
  event_name: 'top_blocker_cta_clicked';
  payload: {
    blocker_title: string;     // top blocker name
    blocker_category: string;  // e.g. 'personal_credit' | 'business_profile'
    fico_impact: number;       // estimated score points
  };
};

/** User clicked a secondary blocker row ("Next after that") in NextBestMoveCard. */
type NextAfterThatClickedEvent = {
  event_name: 'next_after_that_clicked';
  payload: {
    blocker_title: string;
    blocker_category: string;
    position: number;          // 1-indexed position in the secondary blocker list
  };
};

/** User clicked the primary CTA on an active stage in ProgressMarkerCard. */
type ProgressStageCtaClickedEvent = {
  event_name: 'progress_stage_cta_clicked';
  payload: {
    stage: number;             // 1 | 2 | 3
    cta_label: string;         // e.g. 'Apply Now' | 'Start Compliance' | 'Upgrade to Unlock'
    membership_locked: boolean; // true when stage is gated behind a paid tier
  };
};

/** User clicked a featured program tile in the Capital Access section. */
type FeaturedProgramClickedEvent = {
  event_name: 'featured_program_clicked';
  payload: {
    program_path: string;      // e.g. '/app/access-funding/business-credit-line'
    is_pre_qual: boolean;      // whether user was pre-qualified for this product
  };
};

/** User opened the Capital Trajectory accordion (not on close). */
type TrajectoryAccordionOpenedEvent = {
  event_name: 'trajectory_accordion_opened';
  payload: Record<string, never>;
};

/** User clicked "Full Report →" in DashboardHeader. */
type FullReportClickedEvent = {
  event_name: 'full_report_clicked';
  payload: Record<string, never>;
};

/** User clicked any "My Progress" navigation point on the dashboard. */
type MyProgressClickedEvent = {
  event_name: 'my_progress_clicked';
  payload: {
    source: string;            // 'header' | 'readiness_card' | 'blockers_section' | 'breakdown_card'
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
  | DashboardViewedEvent
  | NextBestMoveViewedEvent
  | ProgressStageViewedEvent
  | CapitalAccessViewedEvent
  | TopBlockerCtaClickedEvent
  | NextAfterThatClickedEvent
  | ProgressStageCtaClickedEvent
  | FeaturedProgramClickedEvent
  | TrajectoryAccordionOpenedEvent
  | FullReportClickedEvent
  | MyProgressClickedEvent
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
