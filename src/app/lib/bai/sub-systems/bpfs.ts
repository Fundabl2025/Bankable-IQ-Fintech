/**
 * BPFS — Bankable Predictive Funding Score
 *
 * Per-business, per-lender, per-product approval probability.
 *
 * Per Blueprint v1.8 §XII Part 13 BAI Sub-System 4.
 */
export interface FundingPredictionInput {
  org_id: string;
  assessment_id: string;
  lender_product_id: string;
  bankability_score: number;
  credit_position_score?: number;
}
export interface FundingPrediction {
  approval_probability: number;
  expected_apr_low?: number;
  expected_apr_high?: number;
  expected_amount?: number;
  expected_term_months?: number;
  model_version: 'v0-rules';
  shap_top_factors: string[];
}

export async function predictFundingOutcome(input: FundingPredictionInput): Promise<FundingPrediction> {
  // v0 rules-based stub. Phase 2 trains XGBoost on funded outcome history.
  const score = input.bankability_score;
  const credit = input.credit_position_score ?? 60;
  const prob = Math.min(0.95, Math.max(0.05, (score * 0.7 + credit * 0.3) / 100));
  return {
    approval_probability: Number(prob.toFixed(4)),
    expected_apr_low:  score >= 76 ? 0.085 : 0.18,
    expected_apr_high: score >= 76 ? 0.105 : 0.32,
    expected_amount:   score >= 76 ? 250_000 : 75_000,
    expected_term_months: score >= 76 ? 84 : 24,
    model_version: 'v0-rules',
    shap_top_factors: [
      'bankability_score',
      'credit_position_score',
      'time_in_business_months',
      'banking_behavior_score',
    ],
  };
}
