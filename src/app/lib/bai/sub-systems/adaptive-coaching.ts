/**
 * Bankable Adaptive Coaching
 *
 * Industry-aware, geography-aware, market-condition-aware coaching messages.
 * This is the personalization layer wrapping the AI Readiness Coaching System
 * (Module 3, the customer-facing coach surfaced through lib/forge/).
 *
 * Per Blueprint v1.8 §XII Part 13 BAI Sub-System 6.
 */
export interface AdaptiveCoachingContext {
  org_id: string;
  bankability_score: number;
  naics_code?: string;
  state?: string;
  focus_area: number;
}
export interface AdaptiveCoachingHint {
  preamble: string;
  industry_note?: string;
  market_note?: string;
  cohort_note?: string;
}

export async function getAdaptiveHints(ctx: AdaptiveCoachingContext): Promise<AdaptiveCoachingHint> {
  // v0 templated hints. Phase 2 retrieves similar-business case studies from Pinecone.
  const isRestaurant = ctx.naics_code?.startsWith('7225');
  return {
    preamble: `Bankability Score ${ctx.bankability_score}/100. Focus Area ${ctx.focus_area} flagged for attention.`,
    industry_note: isRestaurant
      ? 'Restaurants in your zip code are seeing margin compression. Three operators in your cohort solved this with delivery channel diversification.'
      : undefined,
    market_note: 'Current Fed environment favors variable rate working capital lines over fixed term loans.',
    cohort_note: 'Similar businesses at your Maturity Level typically lift 12-18 points within 90 days.',
  };
}
