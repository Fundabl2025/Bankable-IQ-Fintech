/**
 * Bankable Adaptive Wheel
 *
 * Rebalances Focus Area weights per business profile.
 *
 * Per Blueprint v1.8 §XII Part 13 BAI Sub-System 5.
 */
export interface AdaptiveWheelWeights {
  /** 1..20: weight 0..1 indicating Focus Area priority */
  focus_area_weights: Record<number, number>;
  industry_normalized_score?: number;
  reasoning: string;
}

const DEFAULT_WEIGHTS: Record<number, number> = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => [i + 1, 1.0])
);

const INDUSTRY_TILTS: Record<string, Partial<Record<number, number>>> = {
  // Restaurants — banking behavior FA 7 + cash flow FA 8 + revenue quality FA 12
  '722511': { 7: 1.6, 8: 1.6, 12: 1.4 },
  // Physicians — operational systems FA 11 + collateral FA 14
  '621111': { 11: 1.5, 14: 1.4 },
};

export async function computeAdaptiveWeights(naics_code?: string): Promise<AdaptiveWheelWeights> {
  const tilt = naics_code ? INDUSTRY_TILTS[naics_code] ?? {} : {};
  const weights = { ...DEFAULT_WEIGHTS, ...tilt };
  return {
    focus_area_weights: weights,
    reasoning: naics_code
      ? `Industry NAICS ${naics_code} tilts toward Focus Areas reflecting that industry's lender concerns.`
      : 'No industry context. Default equal-weight across 20 Focus Areas.',
  };
}
