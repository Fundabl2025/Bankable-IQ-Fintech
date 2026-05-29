/**
 * Goal-Backwards Build-Out (GBB)
 *
 * Designs the readiness sprint BASED ON the destination capital instrument,
 * not generic readiness. Powers Outcome 2 (Bankability Built).
 *
 * Per Blueprint v1.8 §XII Part 13.
 */
import type { GoalBackwardsPlan, Outcome } from './types';
import { maturityLevelForScore } from '../vocabulary';

export interface GbbQuery {
  org_id: string;
  current_bankability_score: number;
  outcome: Outcome;
  target_amount: number;
  target_timeline_days: number;
}

export async function buildGoalBackwardsPlan(q: GbbQuery): Promise<GoalBackwardsPlan> {
  const requiredScore = q.outcome === 'institutional_access' ? 78 : q.outcome === 'bankability_built' ? 70 : 45;
  const gap = Math.max(0, requiredScore - q.current_bankability_score);

  return {
    plan_id: `gbb-${Date.now()}-${q.org_id.slice(0, 8)}`,
    goal: {
      outcome: q.outcome,
      target_amount: q.target_amount,
      target_timeline_days: q.target_timeline_days,
    },
    current_state: {
      bankability_score: q.current_bankability_score,
      maturity_level: maturityLevelForScore(q.current_bankability_score),
    },
    required_state: {
      bankability_score: requiredScore,
      maturity_level: maturityLevelForScore(requiredScore),
    },
    gap_set: gap > 30 ? ['credit_position', 'banking_behavior', 'documentation', 'cash_flow_intelligence'] :
             gap > 10 ? ['documentation', 'tax_posture'] : [],
    steps: [
      { bucket: 'day_30', owner: 'client',  action: 'Pull tri-bureau credit report. Identify utilization > 30% accounts.', expected_lift: 4 },
      { bucket: 'day_30', owner: 'system',  action: 'Connect Plaid to live financial telemetry.', expected_lift: 3 },
      { bucket: 'day_60', owner: 'advisor', action: 'Open two net-30 vendor tradelines.', expected_lift: 6 },
      { bucket: 'day_60', owner: 'client',  action: 'Submit P&L + balance sheet + 6 months of bank statements to Vault.', expected_lift: 5 },
      { bucket: 'day_90', owner: 'advisor', action: 'CLI round on two existing revolving accounts.', expected_lift: 4 },
      { bucket: 'day_90', owner: 'system',  action: 'Pre-validate Credit Position against top 3 lender matches.', expected_lift: 0 },
    ],
  };
}
