// ════════════════════════════════════════════════════════════════════════════════
// FundReady™ — Capital Sequencing Engine  v1.0
//
// Pure function. No side effects. No storage reads. No UI.
// Returns the single best first capital product for a given profile.
//
// Architecture note:
//   This is a preference/sequencing layer on top of the existing eligibility
//   engine. It does NOT replicate qualification logic — it applies a capital
//   strategy preference ordering after basic eligibility signals are checked.
//   For full program eligibility, use loanRequirementsMap.ts getApplyReadiness().
//
// v1 output is intentionally narrow. See BestFirstMove type.
// Rates, "protectedBy" advice, and prescriptive copy are deferred to v2.
// ════════════════════════════════════════════════════════════════════════════════

import { UnifiedAnswers, CREDIT_SCORE_MIDPOINTS } from '../pages/business-assessment/types';

// ── Output type ───────────────────────────────────────────────────────────────

export interface BestFirstMove {
  /** Display name, e.g. "Business Credit Line" */
  product: string;
  /** App route, e.g. "/app/access-funding/business-credit-line" */
  route: string;
  /** Trust-safe reasoning — uses "may", "typically", "lenders look for" framing */
  reasoning: string;
  /** What opens up after this product — forward momentum framing */
  nextAfter: string;
  /** What dimension is limiting this user's options, if any */
  blockedBy?: 'character' | 'capacity' | 'compliance' | 'none';
}

// ── Internal helpers (pure) ───────────────────────────────────────────────────

const REVENUE_MIDPOINTS: Record<string, number> = {
  over_100k: 125_000,
  '40k_100k': 70_000,
  '15k_40k': 27_500,
  '5k_15k': 10_000,
  under_5k: 2_500,
};

function monthlyRevenue(answers: UnifiedAnswers): number {
  return REVENUE_MIDPOINTS[answers.monthlyRevenue || ''] ?? 0;
}

function compositeCredit(answers: UnifiedAnswers): number {
  const scores = [
    CREDIT_SCORE_MIDPOINTS[answers.experian || ''] ?? 0,
    CREDIT_SCORE_MIDPOINTS[answers.transunion || ''] ?? 0,
    CREDIT_SCORE_MIDPOINTS[answers.equifax || ''] ?? 0,
  ].filter(s => s > 0).sort((a, b) => a - b);
  if (scores.length === 0) return 0;
  return scores[Math.floor(scores.length / 2)];
}

function businessAgeMonths(answers: UnifiedAnswers): number {
  const sd = answers.startDate;
  if (!sd || !sd.year) return 0;
  const now = new Date();
  return (
    (now.getFullYear() - sd.year) * 12 + (now.getMonth() - (sd.month - 1))
  );
}

function hasDedicatedBank(answers: UnifiedAnswers): boolean {
  return answers.bankAccount === 'dedicated';
}

function hasEquipmentAsset(answers: UnifiedAnswers): boolean {
  return (
    !!answers.equipmentValue &&
    answers.equipmentValue !== 'none' &&
    answers.equipmentValue !== ''
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Returns the single best first capital product for a given assessment profile.
 *
 * Waterfall logic (highest-quality product that the profile can likely reach):
 *   1. SBA 7(a)             — SBSS ≥ 160, EIN, 24+ months
 *   2. Business Credit Line — $40K+/mo revenue, dedicated bank, 12+ months, credit ≥ 600
 *   3. Equipment Financing  — equipment asset exists, credit ≥ 580, 12+ months
 *   4. Revenue-Based Loan   — $15K+/mo, dedicated bank, 6+ months
 *   5. Working Capital Loan — $10K+/mo, dedicated bank
 *   6. Business Credit Cards — fallback (always eligible, builds SBSS)
 *
 * Returns null if answers are incomplete (no revenue, no credit data).
 */
export function computeBestFirstMove(
  answers: UnifiedAnswers,
  _fundScore: number,
  bankableScore: number,
): BestFirstMove | null {
  // Guard: require minimal data to produce a useful result
  if (!answers.monthlyRevenue || !answers.entityType) return null;

  const rev = monthlyRevenue(answers);
  const credit = compositeCredit(answers);
  const ageMonths = businessAgeMonths(answers);
  const hasBank = hasDedicatedBank(answers);
  const hasEIN = !!answers.hasEIN;

  // 1 ─ SBA 7(a) ─────────────────────────────────────────────────────────────
  // Best terms available. Requires bankable SBSS, EIN, and 2-year track record.
  if (bankableScore >= 160 && hasEIN && ageMonths >= 24) {
    return {
      product: 'SBA 7(a) Loan',
      route: '/app/access-funding/sba-business-loan',
      reasoning:
        'Your business credit profile and operating history may meet SBA baseline requirements — typically the best terms available to small businesses.',
      nextAfter:
        'After establishing an SBA relationship, a conventional bank line of credit often becomes accessible at competitive rates.',
      blockedBy: 'none',
    };
  }

  // 2 ─ Business Credit Line ─────────────────────────────────────────────────
  // Builds SBSS while providing revolving access. Best credit-building path.
  if (rev >= 40_000 && hasBank && ageMonths >= 12 && credit >= 600) {
    return {
      product: 'Business Credit Line',
      route: '/app/access-funding/business-credit-line',
      reasoning:
        'Your monthly revenue and dedicated business banking history may meet the baseline requirements for a revolving credit line.',
      nextAfter:
        'Six months of on-time payments on a credit line typically strengthens your business credit profile and may open access to term loans at better rates.',
      blockedBy: credit < 600 ? 'character' : 'none',
    };
  }

  // 3 ─ Equipment Financing ──────────────────────────────────────────────────
  // Asset-backed — lower credit threshold because collateral reduces lender risk.
  if (hasEquipmentAsset(answers) && credit >= 580 && ageMonths >= 12) {
    return {
      product: 'Equipment Financing',
      route: '/app/access-funding/equipment-financing',
      reasoning:
        'Equipment you own or plan to purchase may serve as collateral, which lenders use to offset credit risk — often allowing approval at a lower credit threshold.',
      nextAfter:
        'Consistent equipment loan payments can strengthen your business credit profile and may unlock working capital products.',
      blockedBy: 'none',
    };
  }

  // 4 ─ Revenue-Based Loan ───────────────────────────────────────────────────
  // Evaluates cash flow, not credit score — useful when credit is still building.
  if (rev >= 15_000 && hasBank && ageMonths >= 6) {
    return {
      product: 'Revenue-Based Loan',
      route: '/app/access-funding/revenue-based-loan',
      reasoning:
        'Revenue-based products evaluate your monthly cash flow, not credit scores alone — your revenue history may qualify you while you continue building your credit profile.',
      nextAfter:
        'A track record of on-time payments on a revenue-based product may help you qualify for a business term loan with better terms.',
      blockedBy: credit < 580 ? 'character' : 'none',
    };
  }

  // 5 ─ Working Capital Loan ─────────────────────────────────────────────────
  // Entry-level product — lower revenue threshold, shorter history acceptable.
  if (rev >= 10_000 && hasBank) {
    return {
      product: 'Working Capital Loan',
      route: '/app/access-funding/working-capital-loans',
      reasoning:
        'Working capital loans evaluate recent business cash flow and have lower entry requirements than traditional term loans.',
      nextAfter:
        'Building 6–12 months of repayment history on a working capital product typically opens access to credit lines and term loans.',
      blockedBy:
        ageMonths < 6 ? 'compliance'
        : credit < 580 ? 'character'
        : 'none',
    };
  }

  // 6 ─ Business Credit Cards (fallback) ────────────────────────────────────
  // Most accessible first product. Reports to business bureaus — builds SBSS.
  return {
    product: 'Business Credit Cards',
    route: '/app/access-funding/business-credit-cards',
    reasoning:
      'Business credit cards are among the most accessible first products and report to business credit bureaus — helping build your SBSS profile as you use them.',
    nextAfter:
      'After 6–12 months of consistent on-time payments, your business credit profile may qualify for a credit line or working capital loan.',
    blockedBy: 'none',
  };
}
