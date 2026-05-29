/**
 * BAI — Bankable Adaptive Intelligence Engine
 *
 * The Module 7 top-level coordinator. Orchestrates the 6 sub-systems and
 * produces the BankabilityEnvelope that every consumer reads from.
 *
 * Per Blueprint v1.8 §XII Part 13.
 */
import { maturityLevelForScore } from '../vocabulary';
import type { BankabilityEnvelope } from './types';
import { predictFundingOutcome } from './sub-systems/bpfs';
import { queryCapitalAccessMatrix } from './cam';
import { buildGoalBackwardsPlan } from './gbb';

export * from './types';
export * as blin from './sub-systems/blin';
export * as bii  from './sub-systems/bii';
export * as bms  from './sub-systems/bms';
export * as bpfs from './sub-systems/bpfs';
export * as adaptiveWheel    from './sub-systems/adaptive-wheel';
export * as adaptiveCoaching from './sub-systems/adaptive-coaching';
export * as cam from './cam';
export * as gbb from './gbb';
export * as bcm from './bcm';

export interface EvaluateInput {
  org_id: string;
  assessment_id: string;
  bankability_score: number;
  credit_position_score?: number;
  naics_code?: string;
  state?: string;
}

/**
 * Top-level BAI evaluation. Returns the Decision Output Envelope per
 * Engineering Spec §3.7.2 (aligned with Blueprint v1.8).
 */
export async function evaluate(input: EvaluateInput): Promise<BankabilityEnvelope> {
  const ml = maturityLevelForScore(input.bankability_score);

  // Capital Today match list (only if score allows non-bankable funding)
  const capitalTodayMatches = await queryCapitalAccessMatrix({
    maturity_level: ml,
    bankability_score: input.bankability_score,
    naics_code: input.naics_code,
    state: input.state,
    amount: 100_000,
  });

  // Bankability Built: generate a plan if not already at lender-ready
  const builtPlan = input.bankability_score < 76
    ? await buildGoalBackwardsPlan({
        org_id: input.org_id,
        current_bankability_score: input.bankability_score,
        outcome: 'bankability_built',
        target_amount: 250_000,
        target_timeline_days: 180,
      })
    : null;

  // Institutional Access: BPFS prediction for top lender product (stub)
  const instPrediction = input.bankability_score >= 76
    ? await predictFundingOutcome({
        org_id: input.org_id,
        assessment_id: input.assessment_id,
        lender_product_id: 'stub-livoak-1',
        bankability_score: input.bankability_score,
        credit_position_score: input.credit_position_score,
      })
    : null;

  return {
    org_id: input.org_id,
    assessment_id: input.assessment_id,
    bankability_score: input.bankability_score,
    maturity_level: ml,
    outcomes: {
      capital_today: {
        eligible: capitalTodayMatches.length > 0,
        score: capitalTodayMatches[0]?.approval_probability ?? 0,
        matches: capitalTodayMatches.slice(0, 3).map((m, i) => ({
          lender_product_id: `stub-${m.product_type}-${i}`,
          lender_name: 'Marketplace Partner',
          product_name: m.product_type,
          approval_probability: m.approval_probability,
          rank: i + 1,
        })),
      },
      bankability_built: {
        eligible: input.bankability_score < 86,
        score: builtPlan ? Math.min(1, builtPlan.gap_set.length === 0 ? 0.95 : 0.6) : 0.95,
        plan_id: builtPlan?.plan_id,
      },
      institutional_access: {
        eligible: input.bankability_score >= 76,
        score: instPrediction?.approval_probability ?? 0,
        matches: instPrediction ? [{
          lender_product_id: 'stub-livoak-1',
          lender_name: 'Live Oak Bank',
          product_name: 'SBA 7(a)',
          approval_probability: instPrediction.approval_probability,
          expected_apr_low: instPrediction.expected_apr_low,
          expected_apr_high: instPrediction.expected_apr_high,
          expected_amount: instPrediction.expected_amount,
          expected_term_months: instPrediction.expected_term_months,
          rank: 1,
        }] : undefined,
        gating_factors: input.bankability_score < 76 ? ['bankability_score below 76 threshold'] : undefined,
      },
    },
    next_best_action: input.bankability_score < 40
      ? { action_type: 'complete_compass', description: 'Complete the full Bankability Wheel Diagnostic to unlock capital paths.', expected_score_lift: 8 }
      : input.bankability_score < 76
      ? { action_type: 'open_tradeline', focus_area: 13, description: 'Open two net-30 vendor tradelines to lift Capital Position.', expected_score_lift: 6 }
      : { action_type: 'apply_lender',  focus_area: 19, description: 'Apply to top-matched institutional lender. Pre-validation passed.', expected_score_lift: 0 },
    compliance_envelope: {
      consents: ['data_authorization_v1'],
      disclosures_rendered: ['fcra_pre_pull', 'croa_terms_v1'],
    },
    evaluated_at: new Date().toISOString(),
  };
}
