/**
 * BANKABLE IQ Brand Vocabulary v1.8
 *
 * The canonical customer-facing terminology per Blueprint v1.8.
 * Always import labels from this file. Never hardcode customer-facing strings.
 *
 * Internal engineering can continue to use legacy code module names
 * (lib/forge/, fund_score column, eligibility_tier enum, etc.) as long as
 * no UI string says them.
 */

// ----------------------------------------------------------------------------
// Scores
// ----------------------------------------------------------------------------
export const SCORE_LABELS = {
  bankability: {
    name: 'Bankability Score',
    range: '0-100',
    threshold: 76, // Lender-Ready Maturity Level
    description: 'Composite institutional readiness score',
  },
  creditPosition: {
    name: 'Bankable Credit Position Score',
    range: '0-100',
    description: 'Credit-side companion to the Bankability Score',
  },
} as const;

// Legacy → canonical scale rescaler
export function rescaleFundScoreToBankability(fundScore: number): number {
  // Legacy FundScore was 0-160. Bankability Score is 0-100. Linear rescale.
  return Math.round((fundScore * 100) / 160);
}

// ----------------------------------------------------------------------------
// Assessments
// ----------------------------------------------------------------------------
export const ASSESSMENT_LABELS = {
  compass: {
    name: 'Bankability Compass',
    description: 'Free 60-second 8-question lead-generation assessment',
    questionCount: 8,
    durationSeconds: 60,
  },
  wheelDiagnostic: {
    name: 'Bankability Wheel Diagnostic',
    description: 'Full diagnostic across 4 Domains and 20 Focus Areas',
    questionCount: 33, // Existing 10 Foundation + 23 Readiness; re-bucketed in PR #N+
  },
} as const;

// ----------------------------------------------------------------------------
// AI naming layers (Blueprint v1.8 §17)
// ----------------------------------------------------------------------------
export const AI_LABELS = {
  customerFacing: 'AI Readiness Coaching System',
  intelligenceSuite: 'AI Intelligence Suite',
  adaptiveCoaching: 'Bankable Adaptive Coaching',
  // Internal-only legacy code module name; never shown in UI:
  _internalCodeModule: 'FORGE',
} as const;

// ----------------------------------------------------------------------------
// Maturity Levels (Blueprint v1.8 §XIII)
// ----------------------------------------------------------------------------
export type MaturityLevel =
  | 'foundation'
  | 'organized'
  | 'optimized'
  | 'lender_ready'
  | 'compounding_capital';

export const MATURITY_LEVELS: Record<MaturityLevel, {
  display: string;
  scoreMin: number;
  scoreMax: number;
  activeOutcome: 'capital_today' | 'bankability_built' | 'institutional_access';
  color: string;
}> = {
  foundation:           { display: 'Foundation',            scoreMin: 0,  scoreMax: 40,  activeOutcome: 'capital_today',         color: '#B197FC' },
  organized:            { display: 'Organized',             scoreMin: 41, scoreMax: 60,  activeOutcome: 'capital_today',         color: '#137DC5' },
  optimized:            { display: 'Optimized',             scoreMin: 61, scoreMax: 75,  activeOutcome: 'bankability_built',     color: '#7DD3FC' },
  lender_ready:         { display: 'Lender-Ready',          scoreMin: 76, scoreMax: 85,  activeOutcome: 'bankability_built',     color: '#00AEEF' },
  compounding_capital:  { display: 'Compounding Capital',   scoreMin: 86, scoreMax: 100, activeOutcome: 'institutional_access',  color: '#51CF66' },
};

export function maturityLevelForScore(bankabilityScore: number): MaturityLevel {
  if (bankabilityScore <= 40)  return 'foundation';
  if (bankabilityScore <= 60)  return 'organized';
  if (bankabilityScore <= 75)  return 'optimized';
  if (bankabilityScore <= 85)  return 'lender_ready';
  return 'compounding_capital';
}

// Legacy eligibility_tier → v1.8 maturity_level mapping
// (same mapping as in scripts/015_v1.8_vocabulary_alignment.sql)
export function mapLegacyEligibilityTier(
  tier: 'pre-qualified' | 'likely-qualified' | 'not-pre-qualified'
): MaturityLevel {
  switch (tier) {
    case 'pre-qualified':     return 'lender_ready';
    case 'likely-qualified':  return 'optimized';
    case 'not-pre-qualified': return 'foundation';
  }
}

// ----------------------------------------------------------------------------
// The 3 Outcomes (Blueprint v1.8 §XV — The Bankable Capital Promise)
// ----------------------------------------------------------------------------
export const OUTCOMES = {
  capital_today: {
    short: 'Capital Today',
    tagline: 'Initial capital access — even before you are bankable.',
    scoreRange: '0-60',
    description: 'Non-bank funding match for clients in Foundation and Organized maturity.',
  },
  bankability_built: {
    short: 'Bankability Built',
    tagline: 'Step-by-step transformation to lender-trusted, institutionally bankable.',
    scoreRange: '41-85',
    description: 'Core Bankable methodology with Goal-Backwards Build-Out.',
  },
  institutional_access: {
    short: 'Institutional Capital Access',
    tagline: 'Larger loans, lower rates, longer terms — and lenders come find you.',
    scoreRange: '76-100',
    description: 'SBA, traditional bank, CRE, USDA, plus Capital Marketplace inversion.',
  },
} as const;

// ----------------------------------------------------------------------------
// Backward-compatible aliases for incremental migration
// ----------------------------------------------------------------------------
/** @deprecated Use SCORE_LABELS.bankability.name */
export const FUND_SCORE_LABEL = SCORE_LABELS.bankability.name;
/** @deprecated Use ASSESSMENT_LABELS.compass.name + .wheelDiagnostic.name */
export const FUND_READY_LABEL = ASSESSMENT_LABELS.wheelDiagnostic.name;
/** @deprecated Use AI_LABELS.customerFacing */
export const FORGE_DISPLAY_LABEL = AI_LABELS.customerFacing;
