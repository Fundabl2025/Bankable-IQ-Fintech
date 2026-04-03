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

import { UnifiedAnswers, CREDIT_SCORE_MIDPOINTS } from '../../pages/business-assessment/types';

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
  | 'business_credit_depth';

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

export function extractCreditBlockers(data: UnifiedAnswers): CreditBlocker[] {
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
): CreditMilestone[] {
  const composite = getCompositeFromData(data);
  const allBlockers = extractCreditBlockers(data);
  const criticalBlockers = allBlockers.filter(b => b.severity === 'critical');
  const unresolvedCritical = criticalBlockers.filter(
    b => !progress.completedActions.includes(b.id),
  );

  const hasDerogAction = progress.completedActions.some(id => {
    const blocker = allBlockers.find(b => b.id === id);
    return blocker &&
      (blocker.category === 'derogatories' || blocker.category === 'bankruptcy');
  });

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
      label: 'Utilization',
      description: 'Credit utilization at or below 30%',
      reached: data.utilization === 'under_10' || data.utilization === '10_30',
    },
    {
      id: 'first_derog_addressed',
      label: 'Derog Addressed',
      description: 'Addressed a derogatory item',
      reached: hasDerogAction,
    },
    {
      id: 'bankable_candidate',
      label: 'Bankable Range',
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
