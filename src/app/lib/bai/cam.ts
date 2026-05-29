/**
 * Capital Access Matrix (CAM)
 *
 * Maps Maturity Level × Industry × Geography × Market Conditions to
 * available capital products with predicted approval probability.
 *
 * Powers Outcomes 1 (Capital Today) and 3 (Institutional Access).
 *
 * Per Blueprint v1.8 §XII Part 13.
 */
import type { CapitalAccessMatrixEntry, Outcome } from './types';
import type { MaturityLevel } from '../vocabulary';

export interface CamQuery {
  maturity_level: MaturityLevel;
  bankability_score: number;
  naics_code?: string;
  state?: string;
  amount: number;
}

const FOUNDATION_AND_ORGANIZED: CapitalAccessMatrixEntry[] = [
  { product_type: 'revenue_based_financing', capital_range_low: 25_000,  capital_range_high: 250_000, approval_probability: 0.78, outcome: 'capital_today', reason: 'No bankable threshold required. Revenue-backed.' },
  { product_type: 'invoice_factoring',       capital_range_low: 10_000,  capital_range_high: 500_000, approval_probability: 0.84, outcome: 'capital_today', reason: 'Backed by AR. No personal credit barrier.' },
  { product_type: 'merchant_cash_advance',   capital_range_low: 10_000,  capital_range_high: 250_000, approval_probability: 0.90, outcome: 'capital_today', reason: 'Bridge while you build bankability.' },
  { product_type: 'business_credit_card',    capital_range_low: 5_000,   capital_range_high: 50_000,  approval_probability: 0.70, outcome: 'capital_today', reason: 'Low-friction line. Builds tradelines.' },
  { product_type: 'equipment_financing',     capital_range_low: 10_000,  capital_range_high: 500_000, approval_probability: 0.72, outcome: 'capital_today', reason: 'Equipment is collateral. Scoring less aggressive.' },
];
const LENDER_READY_AND_ABOVE: CapitalAccessMatrixEntry[] = [
  { product_type: 'sba_7a',           capital_range_low: 50_000,  capital_range_high: 5_000_000, approval_probability: 0.62, outcome: 'institutional_access', reason: 'Full SBA 7(a) eligibility. 9-12% APR, 10-year term.' },
  { product_type: 'sba_504',          capital_range_low: 250_000, capital_range_high: 5_500_000, approval_probability: 0.55, outcome: 'institutional_access', reason: 'Real estate or major equipment.' },
  { product_type: 'bank_loc',         capital_range_low: 100_000, capital_range_high: 1_000_000, approval_probability: 0.58, outcome: 'institutional_access', reason: 'Traditional bank line of credit.' },
  { product_type: 'cre_financing',    capital_range_low: 500_000, capital_range_high: 10_000_000, approval_probability: 0.50, outcome: 'institutional_access', reason: 'Commercial real estate.' },
];

export async function queryCapitalAccessMatrix(q: CamQuery): Promise<CapitalAccessMatrixEntry[]> {
  const pool = q.bankability_score >= 76 ? [...FOUNDATION_AND_ORGANIZED, ...LENDER_READY_AND_ABOVE] : FOUNDATION_AND_ORGANIZED;
  return pool
    .filter(e => q.amount >= e.capital_range_low && q.amount <= e.capital_range_high)
    .sort((a, b) => b.approval_probability - a.approval_probability);
}
