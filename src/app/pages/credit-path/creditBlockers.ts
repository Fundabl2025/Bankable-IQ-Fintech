// ════════════════════════════════════════════════════════════════════════════════
// CREDITPATH™ — Deterministic Credit Blocker Engine  v1.0
// Phase 2: Assessment-Only (Confidence Tier 1)
//
// Single source of truth for CreditPath blocker extraction, ranking, milestone
// evaluation, and progress state.
//
// Rules source: CREDITPATH_SCORING.md
// Do not duplicate this logic in components — import from here.
// Do not modify computeScore() or computeExtendedResults() — read from them.
// ════════════════════════════════════════════════════════════════════════════════

import { UnifiedAnswers, CREDIT_SCORE_MIDPOINTS, NOI_MIDPOINTS, DEBT_SERVICE_MIDPOINTS } from '../../pages/business-assessment/types';

export const CREDITPATH_VERSION = '1.0';
export const CREDITPATH_CONFIDENCE_TIER = 1 as const;
export const CREDITPATH_PROGRESS_KEY = 'creditpath_progress';

// ── Domain types ──────────────────────────────────────────────────────────────

export type BlockerCategory =
  | 'utilization'
  | 'derogatories'
  | 'bankruptcy'
  | 'inquiry_load'
  | 'thin_file'
  | 'business_credit_depth'
  | 'capacity';

export type BlockerSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface CreditBlocker {
  id: string;
  category: BlockerCategory;
  severity: BlockerSeverity;
  title: string;
  why: string;
  effort: 'low' | 'medium' | 'high';
  timeToResult: string;
  readinessImpact: string;
  capitalImpact: string;
  firstStep: string;
  disclosures: string[];
  confidenceTier: 1;
}

export interface CreditMilestone {
  id: string;
  label: string;
  description: string;
  reached: boolean;
}

export interface CreditProgressState {
  version: '1.0';
  completedActions: string[];
  viewedAt: string;
  lastUpdated: string;
  confidenceTier: 1;
}

// DTI result type — produced by DTIEstimator, passed into extractCreditBlockers
// via options. The domain layer never reads localStorage directly.
export interface DTIResult {
  monthlyIncome: number;
  monthlyDebt: number;
  dti: number;                              // 0–1 ratio (e.g. 0.38 = 38%)
  status: 'strong' | 'passing' | 'critical';
  calculatedAt: string;                     // ISO timestamp
}

// ── Internal ranking constants ────────────────────────────────────────────────

const SEVERITY_WEIGHT: Record<BlockerSeverity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const EFFORT_WEIGHT: Record<'low' | 'medium' | 'high', number> = {
  low: 3,
  medium: 2,
  high: 1,
};

const TIME_RANK: Record<string, number> = {
  '7–14 days': 1,
  '14–30 days': 2,
  '30–60 days': 3,
  '60–90 days': 4,
  '90–180 days': 5,
  '2–7 years': 6,
};

// ── Helper ────────────────────────────────────────────────────────────────────

export function getCompositeFromData(data: UnifiedAnswers): number {
  const scores = [
    CREDIT_SCORE_MIDPOINTS[data.experian || ''] ?? 0,
    CREDIT_SCORE_MIDPOINTS[data.transunion || ''] ?? 0,
    CREDIT_SCORE_MIDPOINTS[data.equifax || ''] ?? 0,
  ].filter(s => s > 0).sort((a, b) => a - b);
  if (scores.length === 0) return 0;
  return scores[Math.floor(scores.length / 2)];
}

// ── Blocker extraction ────────────────────────────────────────────────────────
// Reads UnifiedAnswers. Returns all applicable CreditBlockers.
// All readinessImpact and capitalImpact strings use estimate-safe language only.
// No "will improve," "guaranteed," or exact outcome language.

// Options type for extractCreditBlockers — page layer passes in pre-loaded results
// so the domain function stays pure (no storage reads).
export interface ExtractBlockerOptions {
  dtiResult?: DTIResult;
}

export function extractCreditBlockers(
  data: UnifiedAnswers,
  options?: ExtractBlockerOptions,
): CreditBlocker[] {
  const blockers: CreditBlocker[] = [];
  const composite = getCompositeFromData(data);

  // ── UTILIZATION ─────────────────────────────────────────────────────────────

  if (data.utilization === 'over_75') {
    blockers.push({
      id: 'utilization_critical',
      category: 'utilization',
      severity: 'critical',
      title: 'Credit Utilization is Very High',
      why: 'Utilization above 75% is one of the strongest signals lenders use to identify financial stress. It significantly suppresses your credit score and reduces approval odds across most products.',
      effort: 'medium',
      timeToResult: '30–60 days',
      readinessImpact: 'Reducing utilization to under 30% may improve your estimated credit score — individual results vary based on your full credit profile.',
      capitalImpact: 'Lower utilization may strengthen your access to standard credit products and improve rate offers.',
      firstStep: 'Identify which revolving accounts have the highest balance-to-limit ratio and prioritize paying those down first.',
      disclosures: ['Impact is estimated based on typical credit scoring patterns. Your actual results depend on your full credit profile.'],
      confidenceTier: 1,
    });
  } else if (data.utilization === '50_75') {
    blockers.push({
      id: 'utilization_high',
      category: 'utilization',
      severity: 'high',
      title: 'Credit Utilization is Elevated',
      why: 'Utilization between 50–75% signals high credit reliance and limits lender confidence. Getting to under 30% is the standard lender benchmark.',
      effort: 'medium',
      timeToResult: '30–60 days',
      readinessImpact: 'Reducing to under 30% may improve your estimated SBSS readiness profile — the exact range depends on your full credit file.',
      capitalImpact: 'Lower utilization may broaden access to standard lending products.',
      firstStep: 'Calculate your current balance-to-limit ratio across all revolving accounts and set a paydown target to reach under 30%.',
      disclosures: ['Impact is estimated based on typical credit scoring patterns. Individual results vary.'],
      confidenceTier: 1,
    });
  } else if (data.utilization === '30_50') {
    blockers.push({
      id: 'utilization_medium',
      category: 'utilization',
      severity: 'medium',
      title: 'Credit Utilization is Moderate',
      why: 'Utilization between 30–50% can still limit your credit score and lender options. The standard lender benchmark is under 30%.',
      effort: 'medium',
      timeToResult: '30–60 days',
      readinessImpact: 'Reducing to under 30% may improve your estimated credit score and SBSS readiness.',
      capitalImpact: 'May improve terms on credit products once you cross the 30% threshold.',
      firstStep: 'Review your revolving balances and set a paydown plan targeting the sub-30% range.',
      disclosures: ['These are estimates based on typical scoring behavior. Your results will vary.'],
      confidenceTier: 1,
    });
  }

  // ── BANKRUPTCY ──────────────────────────────────────────────────────────────

  if (data.hasBankruptcy === 'recent') {
    blockers.push({
      id: 'bankruptcy_recent',
      category: 'bankruptcy',
      severity: 'critical',
      title: 'Recent Bankruptcy on Record',
      why: 'A bankruptcy filed within the past 2 years is the strongest lender auto-decline signal in most credit evaluations. Most traditional and SBA lenders will not approve during this period.',
      effort: 'low',
      timeToResult: '2–7 years',
      readinessImpact: 'As the bankruptcy ages past the 2-year mark, more lender options may open. Building positive credit history now will strengthen your profile for that window.',
      capitalImpact: 'Alternative products (revenue-based, merchant advance) may still be accessible depending on business performance.',
      firstStep: 'Focus on rebuilding now: open a secured credit card, maintain zero late payments, and avoid new derogatories while the bankruptcy ages.',
      disclosures: [
        'Timeline estimates reflect common lender guidelines. Individual lender policies vary.',
        'This is not legal or financial advice. Consult a qualified advisor for bankruptcy-related decisions.',
      ],
      confidenceTier: 1,
    });
  } else if (data.hasBankruptcy === 'aging') {
    blockers.push({
      id: 'bankruptcy_aging',
      category: 'bankruptcy',
      severity: 'high',
      title: 'Aging Bankruptcy on Record',
      why: 'A bankruptcy from 2–7 years ago still suppresses lender confidence, but your window to recovery is opening. Adding consistent positive history is the priority.',
      effort: 'medium',
      timeToResult: '60–90 days',
      readinessImpact: 'Building positive tradelines now may help your estimated profile recover more quickly as the bankruptcy continues to age.',
      capitalImpact: 'Some alternative lenders may consider your application. Bank and SBA products typically require the full aging period.',
      firstStep: 'Verify the bankruptcy is being reported accurately and focus on adding new positive credit history — secured cards, vendor tradelines.',
      disclosures: [
        'Individual lender policies on aging bankruptcy vary significantly.',
        'This is not legal or financial advice.',
      ],
      confidenceTier: 1,
    });
  }

  // ── DEROGATORIES ────────────────────────────────────────────────────────────

  if (data.hasCollections === 'active') {
    blockers.push({
      id: 'collections_active',
      category: 'derogatories',
      severity: 'critical',
      title: 'Active Collections on Record',
      why: 'Active collections signal unresolved debt and are one of the most impactful negative events on a credit profile. Most lenders require resolution before approving.',
      effort: 'medium',
      timeToResult: '30–60 days',
      readinessImpact: 'Resolving active collections may meaningfully improve your credit profile — the exact range depends on the age and size of the accounts.',
      capitalImpact: 'Resolving collections is often a lender requirement before any credit-based product can be approved.',
      firstStep: 'Pull your credit report to identify each active collection. Contact the collector to negotiate a pay-for-delete or settlement agreement.',
      disclosures: [
        'Collection resolution strategies vary. Results depend on collector policies and applicable laws.',
        'This is not legal advice. Consult a credit counselor or attorney for complex collections.',
      ],
      confidenceTier: 1,
    });
  } else if (data.hasCollections === 'resolved') {
    blockers.push({
      id: 'collections_resolved',
      category: 'derogatories',
      severity: 'low',
      title: 'Resolved Collections on Record',
      why: 'Resolved collections remain on file and may still affect your score, but the impact lessens over time. Keeping your profile clean going forward is the priority.',
      effort: 'low',
      timeToResult: '90–180 days',
      readinessImpact: 'Resolved collections age out of impact over time. Adding positive history now can help your estimated score recover.',
      capitalImpact: 'Resolved collections are less likely to be a hard lender block, but may still affect rate and terms.',
      firstStep: 'Verify the resolved status is correctly reflected on all three bureaus. Dispute any inaccuracies.',
      disclosures: ['Review your official credit reports at AnnualCreditReport.com.'],
      confidenceTier: 1,
    });
  }

  if (data.hasTaxLiens && data.hasTaxLiens !== 'no') {
    const isState = data.hasTaxLiens === 'state';
    blockers.push({
      id: isState ? 'tax_lien_state' : 'tax_lien_federal',
      category: 'derogatories',
      severity: isState ? 'high' : 'critical',
      title: isState ? 'State Tax Lien on Record' : 'Federal Tax Lien on Record',
      why: isState
        ? 'A state tax lien indicates unpaid state taxes and is a significant negative on your credit profile. Lenders treat unresolved liens as a credit risk factor.'
        : 'A federal tax lien is one of the most serious negative credit events. It signals unresolved IRS debt and is an auto-decline trigger for many lenders, including most SBA programs.',
      effort: 'high',
      timeToResult: '60–90 days',
      readinessImpact: 'Resolving the lien and requesting a withdrawal may meaningfully improve your credit readiness profile.',
      capitalImpact: isState
        ? 'May limit access to bank and SBA products until resolved.'
        : 'Federal tax liens typically block SBA and conventional bank lending until resolved and formally withdrawn.',
      firstStep: isState
        ? 'Contact your state tax authority to establish a payment plan or negotiate resolution. After payment, request a lien release.'
        : 'Contact the IRS to establish a payment arrangement. After resolution, request an IRS Certificate of Lien Release or Withdrawal (Form 12277).',
      disclosures: [
        'Tax lien resolution is a complex legal and financial matter. Consult a tax attorney or enrolled agent.',
        'This is not legal or tax advice.',
      ],
      confidenceTier: 1,
    });
  }

  if (data.hasJudgments) {
    blockers.push({
      id: 'judgments',
      category: 'derogatories',
      severity: 'high',
      title: 'Judgments on Record',
      why: 'A civil judgment signals a court-ordered debt obligation and reduces lender confidence. Unsatisfied judgments are a negative factor in most credit evaluations.',
      effort: 'high',
      timeToResult: '60–90 days',
      readinessImpact: 'Satisfying or vacating judgments may improve your credit profile and remove a common lender concern.',
      capitalImpact: 'Judgments may limit approval for credit-based products until addressed.',
      firstStep: 'Review each judgment, confirm accuracy, and consult a legal advisor on whether satisfaction, appeal, or settlement is appropriate.',
      disclosures: [
        'Judgment resolution strategies vary by jurisdiction and case type.',
        'This is not legal advice. Consult a qualified attorney.',
      ],
      confidenceTier: 1,
    });
  }

  if (data.hasChargeoffs) {
    blockers.push({
      id: 'chargeoffs',
      category: 'derogatories',
      severity: 'high',
      title: 'Charge-Offs on Record',
      why: "A charge-off means a creditor declared your debt uncollectible — a significant negative credit event. Even paid charge-offs remain on file for several years.",
      effort: 'medium',
      timeToResult: '60–90 days',
      readinessImpact: 'Paying or settling charge-offs and negotiating accurate reporting may help your estimated credit profile over time.',
      capitalImpact: 'Charge-offs may limit credit options until addressed or aged out.',
      firstStep: 'Identify each charge-off, verify the balance and reporting date are accurate, and contact the creditor to discuss settlement or pay-for-delete options.',
      disclosures: ['Review your official credit reports at AnnualCreditReport.com for accuracy.'],
      confidenceTier: 1,
    });
  }

  if (data.hasLatePay) {
    blockers.push({
      id: 'late_payments',
      category: 'derogatories',
      severity: 'medium',
      title: 'Late Payment History on Record',
      why: 'Late payments (30+ days) signal unreliable repayment behavior. The recency and frequency of late payments determine how much they affect your lender readiness.',
      effort: 'low',
      timeToResult: '90–180 days',
      readinessImpact: 'Building a consistent on-time payment history going forward will gradually reduce the impact of older late payments.',
      capitalImpact: 'Recent late payments may affect rate and terms on credit-based products.',
      firstStep: 'Set up automatic minimum payments on all accounts to prevent any new late payments. Recency matters — recent on-time history offsets older lates.',
      disclosures: ['Late payment impact decreases over time. Recent history carries more weight than older events.'],
      confidenceTier: 1,
    });
  }

  // ── INQUIRY LOAD ─────────────────────────────────────────────────────────────

  if (data.inquiries30d === '5plus') {
    blockers.push({
      id: 'inquiries_high',
      category: 'inquiry_load',
      severity: 'high',
      title: 'High Number of Recent Credit Inquiries',
      why: '5 or more hard inquiries in a short window signal aggressive credit-seeking behavior, which lenders interpret as a sign of financial stress.',
      effort: 'low',
      timeToResult: '90–180 days',
      readinessImpact: 'Inquiries age off over time. Avoiding new hard inquiries now may reduce this suppressor within 6–12 months.',
      capitalImpact: 'May limit rate and terms on new credit applications while inquiry load remains elevated.',
      firstStep: 'Stop applying for new credit for 90–180 days to let current inquiries begin to age out.',
      disclosures: ['Inquiry impact varies by lender and credit model. Rate-shopping inquiries within a short window may count as a single inquiry.'],
      confidenceTier: 1,
    });
  } else if (data.inquiries30d === '3_4') {
    blockers.push({
      id: 'inquiries_medium',
      category: 'inquiry_load',
      severity: 'medium',
      title: 'Moderate Recent Inquiry Load',
      why: '3–4 inquiries suggest active credit-seeking. Managing inquiry volume is part of a strong credit profile.',
      effort: 'low',
      timeToResult: '90–180 days',
      readinessImpact: 'Reducing new applications allows existing inquiries to age, improving your estimated inquiry profile.',
      capitalImpact: 'Moderate impact — unlikely to block approval but may affect terms on new applications.',
      firstStep: 'Avoid unnecessary new credit applications for the next 90 days.',
      disclosures: ['Inquiry scoring varies by credit model. Some lenders treat rate-shopping inquiries differently.'],
      confidenceTier: 1,
    });
  }

  // ── THIN FILE ────────────────────────────────────────────────────────────────

  if (composite > 0 && composite < 580) {
    const hasExplicitDerog =
      data.hasBankruptcy === 'recent' ||
      data.hasCollections === 'active' ||
      (data.hasTaxLiens && data.hasTaxLiens !== 'no');
    if (!hasExplicitDerog) {
      blockers.push({
        id: 'thin_file_weak',
        category: 'thin_file',
        severity: 'high',
        title: 'Low Estimated Credit Score',
        why: 'Your estimated composite score falls below standard lender thresholds. At this level, most traditional credit products require improvement before approval.',
        effort: 'medium',
        timeToResult: '60–90 days',
        readinessImpact: 'Building positive payment history with a secured card may help your estimated score trend upward over time.',
        capitalImpact: 'Some alternative products may still be accessible. Traditional bank and SBA products typically require a stronger credit profile.',
        firstStep: 'Open a secured credit card from your primary bank, use it for small monthly purchases, and pay it in full each month.',
        disclosures: [
          'Score estimate is based on ranges you self-reported and may not reflect your actual bureau score.',
          'Individual credit-building results vary by profile and timeline.',
        ],
        confidenceTier: 1,
      });
    }
  } else if (composite === 0) {
    blockers.push({
      id: 'thin_file_unknown',
      category: 'thin_file',
      severity: 'medium',
      title: 'Credit Score Not Provided',
      why: "Without a credit score estimate, your personal credit readiness can't be evaluated. This is a key input for most lending products.",
      effort: 'low',
      timeToResult: '7–14 days',
      readinessImpact: 'Providing your estimated score ranges in your assessment will give you a clearer picture of your readiness.',
      capitalImpact: 'Many products require personal credit qualification — knowing your range is the first step.',
      firstStep: 'Pull your free credit reports at AnnualCreditReport.com and update your assessment with your estimated score ranges.',
      disclosures: ['AnnualCreditReport.com provides official free reports from Experian, TransUnion, and Equifax.'],
      confidenceTier: 1,
    });
  }

  // ── BUSINESS CREDIT DEPTH ────────────────────────────────────────────────────

  if (data.bizCreditFile === 'none') {
    blockers.push({
      id: 'biz_credit_none',
      category: 'business_credit_depth',
      severity: 'medium',
      title: 'No Business Credit File',
      why: 'Without a business credit file, your SBSS score cannot be meaningfully calculated. Lenders use business credit to evaluate your company independently of your personal profile.',
      effort: 'medium',
      timeToResult: '60–90 days',
      readinessImpact: 'Establishing a D-U-N-S number and opening vendor accounts that report may begin building your business credit profile.',
      capitalImpact: 'Business credit depth may improve access to SBA products, business credit lines, and vendor terms.',
      firstStep: 'Register for a free D-U-N-S number at dnb.com. Then open 2–3 vendor accounts with Net-30 terms that report to Dun & Bradstreet.',
      disclosures: ['Business credit building takes time. Results depend on tradeline activity and reporting schedules.'],
      confidenceTier: 1,
    });
  } else if (data.bizCreditFile === 'below_80') {
    blockers.push({
      id: 'biz_credit_low',
      category: 'business_credit_depth',
      severity: 'medium',
      title: 'Business Credit Score Below Target',
      why: 'A Paydex score below 80 signals payment timing issues in your business credit file. Lenders use Paydex as a quick business creditworthiness signal.',
      effort: 'medium',
      timeToResult: '60–90 days',
      readinessImpact: 'Paying all vendor accounts 10+ days early is the most reliable way to move your Paydex toward the 80 benchmark.',
      capitalImpact: 'A Paydex of 80+ may strengthen access to vendor credit, credit lines, and SBA products.',
      firstStep: 'Pay all accounts that report to D&B at least 10 days before the due date. Paydex specifically rewards early payment.',
      disclosures: ['Paydex improvement timeline depends on how frequently your vendors report to D&B.'],
      confidenceTier: 1,
    });
  } else if (data.bizCreditFile === 'building') {
    blockers.push({
      id: 'biz_credit_building',
      category: 'business_credit_depth',
      severity: 'low',
      title: 'Business Credit Profile in Progress',
      why: "You've started building business credit — the right move. Consistent early payment across multiple accounts will strengthen your SBSS profile over time.",
      effort: 'low',
      timeToResult: '60–90 days',
      readinessImpact: 'Continuing to pay early and adding vendor accounts that report may gradually improve your business credit depth.',
      capitalImpact: 'A stronger business credit profile may improve terms on future applications.',
      firstStep: 'Add one additional vendor account with Net-30 terms that reports to D&B or Experian Business. Pay all accounts 10 days early.',
      disclosures: ['Business credit file depth improves over time with consistent activity.'],
      confidenceTier: 1,
    });
  }

  // ── CAPACITY — DSCR ──────────────────────────────────────────────────────────

  if (data.annualNOI && data.annualNOI !== '' && data.annualDebtService && data.annualDebtService !== '') {
    const noi = NOI_MIDPOINTS[data.annualNOI] ?? 0;
    const ds = DEBT_SERVICE_MIDPOINTS[data.annualDebtService] ?? 0;

    if (ds > 0) {
      const dscr = noi / ds;

      if (dscr < 1.0) {
        blockers.push({
          id: 'dscr_critical',
          category: 'capacity',
          severity: 'critical',
          title: 'DSCR Below 1.0 — Debt Not Covered',
          why: 'Your estimated NOI does not cover your annual debt payments. A DSCR below 1.0x is a hard stop in most lender pipelines — it signals the business cannot service the proposed debt. Lenders will not approve until this is resolved.',
          effort: 'high',
          timeToResult: '90–180 days',
          readinessImpact: 'Bringing DSCR to 1.25x may clear the Capacity module in a lender\'s underwriting pipeline — often the most common reason for denial.',
          capitalImpact: 'Most SBA and conventional products require DSCR ≥ 1.25x. Products with lighter coverage requirements (MCA, revenue-based) may still be accessible.',
          firstStep: 'Use the DSCR Estimator below to calculate exactly how much NOI increase or debt reduction is needed to reach the 1.25x lender threshold.',
          disclosures: [
            'DSCR estimate is based on categorical ranges you self-reported. Actual lender calculations use verified tax returns and full debt schedules.',
            'This is not financial or lending advice. Consult a qualified advisor for your specific situation.',
          ],
          confidenceTier: 1,
        });
      } else if (dscr < 1.25) {
        blockers.push({
          id: 'dscr_below_threshold',
          category: 'capacity',
          severity: 'high',
          title: 'DSCR Below Lender Threshold (1.25x)',
          why: `Your estimated DSCR is approximately ${dscr.toFixed(2)}x — below the 1.25x minimum required by most SBA and conventional lenders. This triggers a Capacity flag in the underwriting pipeline and often requires manual exception review.`,
          effort: 'high',
          timeToResult: '90–180 days',
          readinessImpact: 'Improving DSCR to 1.25x or above may clear the Capacity module and move your application into auto-approval range for many programs.',
          capitalImpact: 'Lenders may approve with compensating factors, but expect higher rates, shorter terms, or additional collateral requirements below 1.25x.',
          firstStep: 'Use the DSCR Estimator below to identify whether increasing NOI or reducing debt service is the faster path to 1.25x.',
          disclosures: [
            'DSCR estimate is based on categorical ranges you self-reported. Actual lender calculations will differ.',
            'Some lenders accept DSCR as low as 1.15x with strong compensating factors. Consult a qualified advisor.',
          ],
          confidenceTier: 1,
        });
      }
    }
  }

  // ── CAPACITY — DTI ───────────────────────────────────────────────────────────
  // Fires only when the page layer provides a completed DTI result.
  // The domain layer never reads localStorage — see ExtractBlockerOptions.

  const dtiResult = options?.dtiResult;
  if (dtiResult && dtiResult.dti > 0) {
    if (dtiResult.dti > 0.43) {
      blockers.push({
        id: 'dti_critical',
        category: 'capacity',
        severity: 'critical',
        title: 'DTI Exceeds Lender Threshold',
        why: `Your estimated debt-to-income ratio is approximately ${Math.round(dtiResult.dti * 100)}% — above the 43% threshold most lenders apply when evaluating personal guarantees. This triggers a Capacity flag in underwriting and is a common reason for denial even when credit scores are strong.`,
        effort: 'high',
        timeToResult: '90–180 days',
        readinessImpact: 'Reducing monthly debt obligations to bring DTI below 43% may clear the personal guarantee Capacity flag and meaningfully improve your approval profile.',
        capitalImpact: 'High DTI may limit access to products requiring personal guarantees. Some alternative products evaluate business cash flow more heavily than personal DTI.',
        firstStep: 'Use the DTI Estimator to identify exactly how much monthly debt reduction — or income increase — is needed to reach the 43% threshold.',
        disclosures: [
          'DTI estimate is based on values you self-reported. Actual lender calculations use verified tax returns, pay stubs, and full debt schedules.',
          'This is not financial or lending advice. Consult a qualified advisor for your specific situation.',
        ],
        confidenceTier: 1,
      });
    } else if (dtiResult.dti > 0.36) {
      blockers.push({
        id: 'dti_high',
        category: 'capacity',
        severity: 'high',
        title: 'DTI Above Preferred Range',
        why: `Your estimated debt-to-income ratio is approximately ${Math.round(dtiResult.dti * 100)}% — above the 36% preferred range, though within what many lenders allow up to 43%. Lenders prefer DTI below 36% when evaluating personal guarantees.`,
        effort: 'medium',
        timeToResult: '60–90 days',
        readinessImpact: 'Reducing monthly debt to bring DTI under 36% may improve your personal guarantee profile and strengthen rate and terms offers.',
        capitalImpact: 'DTI in the 36–43% range may still be acceptable for many products, but reducing it before applying may improve approval odds and terms.',
        firstStep: 'Review recurring monthly obligations and identify any that can be paid off or reduced before your application.',
        disclosures: [
          'DTI estimate is based on values you self-reported. Actual lender calculations will differ.',
          'Some lenders accept DTI above 36% with strong compensating factors such as business cash flow or high credit scores.',
        ],
        confidenceTier: 1,
      });
    }
  }

  return blockers;
}

// ── Top-3 selection ───────────────────────────────────────────────────────────

export function selectTopThree(blockers: CreditBlocker[]): CreditBlocker[] {
  if (blockers.length === 0) return [];

  // Step 1: Deduplicate — one blocker per category (highest severity wins)
  const byCategory = new Map<BlockerCategory, CreditBlocker>();
  for (const blocker of blockers) {
    const existing = byCategory.get(blocker.category);
    if (!existing || SEVERITY_WEIGHT[blocker.severity] > SEVERITY_WEIGHT[existing.severity]) {
      byCategory.set(blocker.category, blocker);
    }
  }
  const deduped = Array.from(byCategory.values());

  // Step 2: Sort by severity → prefer lower effort → prefer faster time to result
  const sorted = deduped.sort((a, b) => {
    const severityDiff = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
    if (severityDiff !== 0) return severityDiff;
    const effortDiff = EFFORT_WEIGHT[b.effort] - EFFORT_WEIGHT[a.effort];
    if (effortDiff !== 0) return effortDiff;
    const timeA = TIME_RANK[a.timeToResult] ?? 99;
    const timeB = TIME_RANK[b.timeToResult] ?? 99;
    return timeA - timeB;
  });

  return sorted.slice(0, 3);
}

// ── Milestone evaluation ──────────────────────────────────────────────────────

export function evaluateMilestones(
  data: UnifiedAnswers,
  progress: CreditProgressState,
  // Pass the already-computed blockers array from the call site — avoids a second
  // extraction pass and keeps milestone evaluation consistent with the rendered cards.
  precomputedBlockers?: CreditBlocker[],
): CreditMilestone[] {
  const composite = getCompositeFromData(data);
  const allBlockers = precomputedBlockers ?? extractCreditBlockers(data);
  const criticalBlockers = allBlockers.filter(b => b.severity === 'critical');
  const unresolvedCritical = criticalBlockers.filter(
    b => !progress.completedActions.includes(b.id),
  );

  const hasDerogAction = progress.completedActions.some(id => {
    const blocker = allBlockers.find(b => b.id === id);
    return blocker &&
      (blocker.category === 'derogatories' || blocker.category === 'bankruptcy');
  });

  // Utilization milestone: distinguish between "already healthy" and "not yet there"
  // so users who had good utilization before opening CreditPath don't see a pre-checked
  // milestone that implies they achieved something here.
  const utilizationAlreadyHealthy =
    data.utilization === 'under_10' || data.utilization === '10_30';
  const utilizationLabel = utilizationAlreadyHealthy
    ? 'Utilization OK'
    : 'Utilization';
  const utilizationDescription = utilizationAlreadyHealthy
    ? 'Credit utilization already in healthy range'
    : 'Credit utilization at or below 30%';

  return [
    {
      id: 'started',
      label: 'Started',
      description: 'You opened CreditPath',
      reached: true,
    },
    {
      id: 'first_action_completed',
      label: 'First Action',
      description: 'Marked your first action as done',
      reached: progress.completedActions.length >= 1,
    },
    {
      id: 'utilization_target',
      label: utilizationLabel,
      description: utilizationDescription,
      reached: utilizationAlreadyHealthy,
    },
    {
      id: 'first_derog_addressed',
      label: 'Derog\u00a0Cleared',
      description: 'Addressed a derogatory item',
      reached: hasDerogAction,
    },
    {
      id: 'bankable_candidate',
      label: 'Bankable',
      description: 'Estimated score in bankable range with no unresolved critical blockers',
      reached: composite >= 700 && unresolvedCritical.length === 0,
    },
  ];
}

// ── Progress state persistence ────────────────────────────────────────────────

export function loadProgressState(): CreditProgressState {
  try {
    const raw = localStorage.getItem(CREDITPATH_PROGRESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CreditProgressState;
      if (parsed.version === '1.0') return parsed;
    }
  } catch { /* non-fatal */ }
  return {
    version: '1.0',
    completedActions: [],
    viewedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    confidenceTier: 1,
  };
}

export function saveProgressState(state: CreditProgressState): void {
  try {
    localStorage.setItem(CREDITPATH_PROGRESS_KEY, JSON.stringify({
      ...state,
      lastUpdated: new Date().toISOString(),
    }));
  } catch { /* non-fatal */ }
}

export function toggleActionComplete(
  state: CreditProgressState,
  blockerId: string,
): CreditProgressState {
  const isComplete = state.completedActions.includes(blockerId);
  return {
    ...state,
    completedActions: isComplete
      ? state.completedActions.filter(id => id !== blockerId)
      : [...state.completedActions, blockerId],
  };
}
