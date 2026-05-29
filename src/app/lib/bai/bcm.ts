/**
 * Bankable Capital Marketplace (BCM)
 *
 * Lender-facing API plug-in network. Lenders subscribe to receive
 * pre-qualified, pre-packaged borrower deal flow.
 *
 * Powers Outcome 3 inversion (lenders find Bankable clients).
 *
 * Per Blueprint v1.8 §XII Part 13 + §XV.
 */

export type MarketplaceTier = 'lender_insight' | 'lender_match' | 'lender_plug_in';

export interface MarketplaceLenderProfile {
  lender_id: string;
  subscription_tier: MarketplaceTier;
  credit_box: Record<string, unknown>;
  geographic_scope: string[];
  industry_appetite_naics: string[];
  active: boolean;
}

export interface BorrowerCohort {
  cohort_id: string;
  matching_criteria: Record<string, unknown>;
  applicant_count_anonymous: number;
  opt_in_available_count: number;
  generated_at: string;
}

export async function listSubscribingLenders(): Promise<MarketplaceLenderProfile[]> {
  // v0 stub. Phase 2: read from marketplace.lenders schema with subscription status.
  return [
    { lender_id: 'stub-001', subscription_tier: 'lender_match',
      credit_box: { min_fico: 680, min_revenue_annual: 250000 },
      geographic_scope: ['NY', 'CT', 'NJ'], industry_appetite_naics: ['722511', '722513'], active: true },
  ];
}

export async function generateCohortForLender(lender_id: string): Promise<BorrowerCohort> {
  return {
    cohort_id: `cohort-${Date.now()}-${lender_id}`,
    matching_criteria: { min_bankability_score: 76, geo: ['NY','CT','NJ'] },
    applicant_count_anonymous: 14,
    opt_in_available_count: 5,
    generated_at: new Date().toISOString(),
  };
}
