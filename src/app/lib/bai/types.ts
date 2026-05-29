/**
 * BAI — Bankable Adaptive Intelligence Engine types
 *
 * Module 7 of BANKABLE IQ per Blueprint v1.8 §XII Part 13.
 *
 * 6 sub-systems + 3 BAI-powered systems.
 * v0 returns deterministic placeholders. ML models land in Phase 2.
 */

import type { MaturityLevel } from '../vocabulary';

export type Outcome = 'capital_today' | 'bankability_built' | 'institutional_access';

export interface BankabilityEnvelope {
  /** UUID of the org (business) the envelope describes */
  org_id: string;
  /** UUID of the readiness assessment that anchors this envelope */
  assessment_id: string;
  /** Composite Bankability Score 0-100 */
  bankability_score: number;
  /** 5-stage Maturity Level */
  maturity_level: MaturityLevel;
  /** Per-outcome eligibility and ranking */
  outcomes: Record<Outcome, OutcomeEvaluation>;
  /** Top recommendation right now */
  next_best_action: NextBestAction;
  /** Compliance trail — disclosures rendered + consents recorded */
  compliance_envelope: {
    consents: string[];
    disclosures_rendered: string[];
  };
  /** When this envelope was computed */
  evaluated_at: string;
}

export interface OutcomeEvaluation {
  eligible: boolean;
  score: number;            // 0..1 confidence for this outcome
  matches?: LenderMatch[];  // populated for capital_today and institutional_access
  plan_id?: string;         // populated for bankability_built
  gating_factors?: string[];// populated when eligible = false
}

export interface LenderMatch {
  lender_product_id: string;
  lender_name: string;
  product_name: string;
  approval_probability: number;
  expected_apr_low?: number;
  expected_apr_high?: number;
  expected_amount?: number;
  expected_term_months?: number;
  rank: number;
}

export interface NextBestAction {
  action_type: 'upload_doc' | 'pay_down' | 'open_tradeline' | 'connect_plaid' | 'schedule_advisor' | 'apply_lender' | 'complete_compass';
  focus_area?: number; // 1..20
  description: string;
  expected_score_lift?: number;
}

export interface CapitalAccessMatrixEntry {
  product_type: string;
  product_subtype?: string;
  capital_range_low: number;
  capital_range_high: number;
  approval_probability: number;
  outcome: Outcome;
  reason: string;
}

export interface GoalBackwardsPlan {
  plan_id: string;
  goal: {
    outcome: Outcome;
    target_amount: number;
    target_timeline_days: number;
  };
  current_state: {
    bankability_score: number;
    maturity_level: MaturityLevel;
  };
  required_state: {
    bankability_score: number;
    maturity_level: MaturityLevel;
  };
  gap_set: string[];
  steps: PlanStep[];
}

export interface PlanStep {
  bucket: 'day_30' | 'day_60' | 'day_90';
  owner: 'client' | 'advisor' | 'system';
  action: string;
  expected_lift?: number;
}
