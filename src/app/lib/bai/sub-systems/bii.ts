/**
 * BII — Bankable Industry Intelligence
 *
 * 25+ industry models with seasonality, margins, working capital cycles,
 * lender appetite, common decline reasons.
 *
 * Per Blueprint v1.8 §XII Part 13 BAI Sub-System 2.
 */
export interface IndustryProfile {
  naics_code: string;
  industry_name: string;
  gross_margin_median: number;
  working_capital_cycle_days: number;
  default_rate: number;
  growth_rate: number;
  current_lender_appetite: 'hot' | 'warm' | 'cold';
  common_decline_reasons: string[];
}

const STUB_PROFILES: Record<string, IndustryProfile> = {
  '722511': { naics_code: '722511', industry_name: 'Full-Service Restaurant',
    gross_margin_median: 0.65, working_capital_cycle_days: 7, default_rate: 0.06,
    growth_rate: 0.02, current_lender_appetite: 'cold',
    common_decline_reasons: ['margin compression', 'food cost spikes', 'labor cost growth'] },
  '621111': { naics_code: '621111', industry_name: 'Office of Physicians',
    gross_margin_median: 0.55, working_capital_cycle_days: 45, default_rate: 0.01,
    growth_rate: 0.04, current_lender_appetite: 'hot',
    common_decline_reasons: ['practice age', 'partner concentration'] },
};

export async function getIndustryProfile(naics_code: string): Promise<IndustryProfile | null> {
  return STUB_PROFILES[naics_code] ?? null;
}
