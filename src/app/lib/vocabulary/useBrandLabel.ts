/**
 * useBrandLabel — convenience hook for components migrating to v1.8 vocabulary.
 *
 * Usage:
 *   const { score, assessment, ai, maturity } = useBrandLabel();
 *   return <h1>{score.bankability.name}: {value}</h1>;
 *   //         "Bankability Score: 78"
 */
import {
  SCORE_LABELS,
  ASSESSMENT_LABELS,
  AI_LABELS,
  MATURITY_LEVELS,
  OUTCOMES,
  maturityLevelForScore,
} from './index';

export function useBrandLabel() {
  return {
    score: SCORE_LABELS,
    assessment: ASSESSMENT_LABELS,
    ai: AI_LABELS,
    maturity: MATURITY_LEVELS,
    outcomes: OUTCOMES,
    helpers: {
      maturityFromScore: maturityLevelForScore,
    },
  } as const;
}
