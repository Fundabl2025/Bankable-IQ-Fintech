// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Scoring Engine
// ONE ENGINE. ONE CALCULATION. ONE SCORE. NO SYNC.
// ════════════════════════════════════════════════════════════════════════════════

import { UnifiedAnswers, ScoreResult } from './types';
import { READINESS_QUESTIONS } from './questions';

const WEIGHTS = {
  C: 0.28, // Credit Profile
  D: 0.22, // Documentation
  F: 0.20, // Cash Flow
  B: 0.13, // Banking Behavior
  S: 0.10, // Business Structure
  N: 0.07, // Narrative Strength
};

/**
 * Compute complete FundScore from unified assessment data
 * Returns score (0-1000) + dimension averages + Bankable Score + NAP Score
 */
export function computeScore(data: UnifiedAnswers): ScoreResult {
  const buckets: Record<string, number[]> = {
    C: [], D: [], F: [], B: [], S: [], N: []
  };
  let totalBoost = 0;

  // ══════════════════════════════════════════════════════════════════════════════
  // PART 1: FOUNDATION DATA → DIMENSION BUCKETS
  // ══════════════════════════════════════════════════════════════════════════════

  // ── C: PERSONAL CREDIT SCORE (FICO composite from 3 bureaus) ──────────────
  const creditScores = [
    data.experian || 680,
    data.transunion || 680,
    data.equifax || 680,
  ].sort((a, b) => a - b);
  const composite = creditScores[1]; // Middle score

  if (composite >= 740) buckets.C.push(1.0);
  else if (composite >= 700) buckets.C.push(0.78);
  else if (composite >= 650) buckets.C.push(0.6);
  else if (composite >= 620) buckets.C.push(0.4);
  else if (composite >= 580) buckets.C.push(0.2);
  else buckets.C.push(0.05);

  // ── C: CREDIT UTILIZATION ──────────────────────────────────────────────────
  const utilization = data.utilization || 30;
  if (utilization < 20) buckets.C.push(1.0);
  else if (utilization <= 30) buckets.C.push(0.75);
  else if (utilization <= 50) buckets.C.push(0.45);
  else buckets.C.push(0.1);

  // ── C: DEROGATORY ITEMS ────────────────────────────────────────────────────
  const hasRecentBankruptcy = data.hasBankruptcy && data.bankruptcyAge === 'under_2yr';
  const hasSeriousDerog = data.hasCollections || data.hasChargeoffs || data.hasTaxLiens;
  
  if (data.noDerogItems) buckets.C.push(1.0);
  else if (hasRecentBankruptcy) buckets.C.push(0.1);
  else if (hasSeriousDerog) buckets.C.push(0.2);
  else if (data.hasLatePay) buckets.C.push(0.4);
  else buckets.C.push(0.6);

  // ── F: MONTHLY REVENUE ─────────────────────────────────────────────────────
  const revenue = data.monthlyRevenue || 0;
  if (revenue >= 50000) buckets.F.push(1.0);
  else if (revenue >= 25000) buckets.F.push(0.78);
  else if (revenue >= 10000) buckets.F.push(0.55);
  else if (revenue >= 5000) buckets.F.push(0.3);
  else if (revenue >= 2000) buckets.F.push(0.1);
  else buckets.F.push(0.05);

  // ── B: FUND SEPARATION (BANK ACCOUNT TYPE) ─────────────────────────────────
  if (data.bankAccount === 'dedicated') buckets.B.push(1.0);
  else if (data.bankAccount === 'personal') buckets.B.push(0.5);
  else buckets.B.push(0.0);

  // ── B: AVERAGE DAILY BALANCE ───────────────────────────────────────────────
  const balance = data.avgDailyBalance;
  if (balance === '25k_plus') buckets.B.push(1.0);
  else if (balance === '10k_25k') buckets.B.push(0.8);
  else if (balance === '2k_10k') buckets.B.push(0.55);
  else if (balance === '500_2k') buckets.B.push(0.25);
  else buckets.B.push(0.0);

  // ── B: NSF/OVERDRAFT COUNT ─────────────────────────────────────────────────
  const nsf = data.nsfCount;
  if (nsf === 'zero') buckets.B.push(1.0);
  else if (nsf === '1_2') buckets.B.push(0.65);
  else if (nsf === '3_5') buckets.B.push(0.25);
  else buckets.B.push(0.0);

  // ── S: ENTITY TYPE ─────────────────────────────────────────────────────────
  const entity = data.entityType;
  if (entity === 'corp') buckets.S.push(1.0);
  else if (entity === 'llc_multi') buckets.S.push(0.78);
  else if (entity === 'llc_single') buckets.S.push(0.65);
  else if (entity === 'sole_prop') buckets.S.push(0.1);
  else buckets.S.push(0.5); // Default if not set

  // ── S: BUSINESS AGE (calculated from start date) ───────────────────────────
  const now = new Date();
  const startYear = data.startDate.year || now.getFullYear();
  const startMonth = data.startDate.month || now.getMonth() + 1;
  const ageMonths = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth);

  if (ageMonths >= 60) buckets.S.push(1.0);  // 5+ years
  else if (ageMonths >= 36) buckets.S.push(0.85); // 3-5 years
  else if (ageMonths >= 24) buckets.S.push(0.55); // 2-3 years
  else if (ageMonths >= 12) buckets.S.push(0.25); // 1-2 years
  else if (ageMonths >= 6) buckets.S.push(0.05);  // 6-12 months
  else buckets.S.push(0.05); // Under 6 months

  // ── S: INDUSTRY (risk overlay) ─────────────────────────────────────────────
  const industry = (data.industry || '').toLowerCase();
  if (industry.includes('professional') || industry.includes('technology') || industry.includes('healthcare')) {
    buckets.S.push(1.0);
  } else if (industry.includes('retail') || industry.includes('e-commerce') || industry.includes('wholesale')) {
    buckets.S.push(0.85);
  } else if (industry.includes('construction') || industry.includes('real estate')) {
    buckets.S.push(0.65);
  } else if (industry.includes('restaurant') || industry.includes('food') || industry.includes('hospitality')) {
    buckets.S.push(0.4);
  } else if (industry.includes('transport') || industry.includes('truck') || industry.includes('logistics')) {
    buckets.S.push(0.5);
  } else {
    buckets.S.push(0.7); // Other
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PART 2: READINESS ANSWERS → DIMENSION BUCKETS
  // ══════════════════════════════════════════════════════════════════════════════

  READINESS_QUESTIONS.forEach((q, qi) => {
    const answerIndex = data.readinessAnswers[qi];
    if (answerIndex === undefined || !q.options) return;

    const selectedOption = q.options[answerIndex];
    if (!selectedOption) return;

    // Add boost if present (Q_R12 Option A has +45)
    if (selectedOption.boost) {
      totalBoost += selectedOption.boost;
    }

    // Add scores to dimension buckets
    Object.entries(selectedOption.score).forEach(([dim, val]) => {
      if (buckets[dim]) {
        buckets[dim].push(val as number);
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // COMPUTE DIMENSION AVERAGES
  // ══════════════════════════════════════════════════════════════════════════════

  const dimAvg: Record<string, number> = {};
  Object.keys(buckets).forEach((dim) => {
    const values = buckets[dim];
    if (values.length > 0) {
      dimAvg[dim] = values.reduce((sum, val) => sum + val, 0) / values.length;
    } else {
      // Default to 0.5 (neutral) if no data for dimension
      dimAvg[dim] = 0.5;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // WEIGHTED COMPOSITE → 0–1000 SCORE
  // ══════════════════════════════════════════════════════════════════════════════

  let baseScore = 0;
  Object.entries(WEIGHTS).forEach(([dim, weight]) => {
    baseScore += (dimAvg[dim] || 0) * weight;
  });

  // Convert 0-1 to 0-1000 and add boost (max 80 pts)
  const finalScore = Math.max(
    0,
    Math.min(1000, Math.round(baseScore * 1000 + Math.min(totalBoost, 80)))
  );

  // ══════════════════════════════════════════════════════════════════════════════
  // BANKABLE SCORE & NAP SCORE
  // ══════════════════════════════════════════════════════════════════════════════

  const bankableScore = calculateBankableScore(data);
  const napScore = calculateNAPScore(data);

  return {
    score: finalScore,
    dimAvg: dimAvg as Record<'C' | 'D' | 'F' | 'B' | 'S' | 'N', number>,
    bankableScore,
    napScore,
  };
}

/**
 * Calculate Bankable Score (0-160) from foundation data
 */
function calculateBankableScore(data: UnifiedAnswers): number {
  let score = 80; // Baseline

  // Basic completeness
  if (data.hasEIN) score += 15;
  if (data.hasWebsite) score += 20;
  if (data.businessName) score += 5;
  if (data.businessAddress) score += 5;
  if (data.businessPhone) score += 5;
  
  // Banking
  if (data.bankAccount === 'dedicated') score += 15;
  if (data.bankAge === '24plus' || data.bankAge === '12_24mo') score += 5;
  
  // Credit quality
  const composite = [data.experian || 680, data.transunion || 680, data.equifax || 680]
    .sort((a, b) => a - b)[1];
  if (composite >= 700) score += 10;
  else if (composite >= 650) score += 5;
  
  // Entity structure
  if (data.entityType === 'corp' || data.entityType === 'llc_multi') score += 5;

  return Math.min(160, score);
}

/**
 * Calculate NAP Score (0-100) - Name, Address, Phone completeness
 */
function calculateNAPScore(data: UnifiedAnswers): number {
  let score = 0;

  if (data.businessName) score += 25;
  if (data.businessAddress && data.businessCity && data.businessState && data.businessZip) {
    score += 25;
  }
  if (data.businessPhone) score += 25;
  if (data.hasWebsite) score += 15;
  if (data.hasEIN) score += 10;

  return Math.min(100, score);
}

/**
 * Get score band info
 */
export function getBand(score: number): {
  name: string;
  color: string;
  min: number;
  max: number;
} {
  if (score >= 900) return { name: 'Prime', color: '#c8f040', min: 900, max: 1000 };
  if (score >= 750) return { name: 'Ready', color: '#8ab820', min: 750, max: 899 };
  if (score >= 650) return { name: 'Approaching', color: '#38a880', min: 650, max: 749 };
  if (score >= 550) return { name: 'Developing', color: '#a0a020', min: 550, max: 649 };
  if (score >= 400) return { name: 'Low', color: '#c89020', min: 400, max: 549 };
  return { name: 'Critical', color: '#b04428', min: 0, max: 399 };
}

/**
 * Calculate partial score during assessment (for live updates)
 */
export function calculatePartialScore(partialData: Partial<UnifiedAnswers>): number {
  // Fill undefined fields with neutral values
  const completeData: UnifiedAnswers = {
    businessName: '',
    entityType: '',
    startDate: { month: 1, year: new Date().getFullYear() - 1 },
    industry: '',
    hasEIN: false,
    hasWebsite: false,
    monthlyRevenue: 0,
    ccSales: 0,
    bankAccount: '',
    bankAge: '',
    avgDailyBalance: '',
    nsfCount: '',
    arBalance: 0,
    equipmentValue: 0,
    poBalance: 0,
    ownsProperty: '',
    constructionPlan: '',
    experian: 680,
    transunion: 680,
    equifax: 680,
    utilization: 30,
    personalIncome: '',
    hasBankruptcy: false,
    hasJudgments: false,
    hasCollections: false,
    hasChargeoffs: false,
    hasLatePay: false,
    hasTaxLiens: false,
    noDerogItems: true,
    bizCreditFile: '',
    inquiries30d: '',
    readinessAnswers: new Array(14).fill(undefined),
    ...partialData,
  };

  const result = computeScore(completeData);
  return result.score;
}

// ════════════════════════════════════════════════════════════════════════════════
// EXTENDED RESULTS COMPUTATION FOR DYNAMIC REPORTS
// ════════════════════════════════════════════════════════════════════════════════

import { ExtendedResultsOutput } from './types';

export function computeExtendedResults(data: UnifiedAnswers): ExtendedResultsOutput {
  // Get base scores
  const baseResult = computeScore(data);
  
  // Composite FICO
  const creditScores = [
    data.experian || 680,
    data.transunion || 680,
    data.equifax || 680,
  ].sort((a, b) => a - b);
  const composite = creditScores[1]; // Middle score

  // Report metadata
  const ownerName = `${data.ownerFirstName} ${data.ownerLastName}`.trim() || 'Business Owner';
  const businessName = data.businessName || 'Your Business';
  const today = new Date();
  const reportDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const expiryDate = new Date(today);
  expiryDate.setDate(expiryDate.getDate() + 14);
  const estimateExpiry = expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Funding Range computation
  const fundingRange = getFundingRange(baseResult.score);

  // Owner Status
  const personalIncomeMap: Record<string, string> = {
    'under_35k': 'Under $35K',
    '35_75k': '$35K–$75K',
    '75_125k': '$75K–$125K',
    '125_250k': '$125K–$250K',
    'over_250k': 'Over $250K',
  };

  const timeInBusiness = calculateTimeInBusiness(data.startDate.year, data.startDate.month);

  // Map inquiries (approximate)
  const inquiryMap: Record<string, { mo3: number; mo6: number; mo12: number }> = {
    '0': { mo3: 0, mo6: 0, mo12: 0 },
    '1_2': { mo3: 1, mo6: 2, mo12: 3 },
    '3_4': { mo3: 2, mo6: 3, mo12: 5 },
    '5plus': { mo3: 4, mo6: 6, mo12: 10 },
    'unknown': { mo3: 0, mo6: 0, mo12: 0 },
  };
  const inquiryData = inquiryMap[data.inquiries30d || 'unknown'];

  const ownerStatus = {
    name: ownerName,
    experian: data.experian || 680,
    transunion: data.transunion || 680,
    equifax: data.equifax || 680,
    inquiries3mo: inquiryData.mo3,
    inquiries6mo: inquiryData.mo6,
    inquiries12mo: inquiryData.mo12,
    personalIncome: personalIncomeMap[data.personalIncome || ''] || 'Not provided',
    timeInBusiness,
    openTradelines: 'Verify in credit report',
    revolvingUsage: `${data.utilization || 30}%`,
  };

  // Contingencies
  const contingencies = computeContingencies(data);

  // Bankable Items (20 items)
  const bankableItems = computeBankableItems(data);

  // SBSS Status
  const sbssOwnerStatus = composite >= 700 ? 'best' : composite >= 640 ? 'pass' : 'fail';
  const sbssBusinessStatus = baseResult.bankableScore >= 160 ? 'best' : baseResult.bankableScore >= 130 ? 'pass' : 'fail';

  // SBSS Sections
  const sbssSections = computeSBSSSections(data, composite, baseResult.bankableScore);

  // Work Needed
  const workNeeded = computeWorkNeeded(data, composite, bankableItems);

  return {
    fundScore: baseResult.score,
    bankableScore: baseResult.bankableScore,
    napScore: baseResult.napScore,
    dimAvg: baseResult.dimAvg,
    ownerName,
    businessName,
    reportDate,
    estimateExpiry,
    fundingRange,
    ownerStatus,
    contingencies,
    bankableItems,
    sbssOwnerStatus,
    sbssBusinessStatus,
    sbssSections,
    workNeeded,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER: Funding Range Lookup
// ────────────────────────────────────────────────────────────────────────────────
function getFundingRange(score: number): ExtendedResultsOutput['fundingRange'] {
  // Score is 0-1000, not 0-100. Convert to 0-100 band for lookup
  const normalizedScore = score / 10; // 0-1000 → 0-100
  
  if (normalizedScore >= 90) {
    return {
      currentBand: '900 to 1000',
      businessOnlyMin: 80000,
      businessOnlyMax: 100000,
      personalAndBusinessMin: 90000,
      personalAndBusinessMax: 120000,
      scoreRangeLabel: '900 to 1000',
    };
  }
  if (normalizedScore >= 80) {
    return {
      currentBand: '800 to 899',
      businessOnlyMin: 60000,
      businessOnlyMax: 80000,
      personalAndBusinessMin: 70000,
      personalAndBusinessMax: 100000,
      scoreRangeLabel: '800 to 899',
    };
  }
  if (normalizedScore >= 70) {
    return {
      currentBand: '700 to 799',
      businessOnlyMin: 40000,
      businessOnlyMax: 60000,
      personalAndBusinessMin: 50000,
      personalAndBusinessMax: 80000,
      scoreRangeLabel: '700 to 799',
    };
  }
  if (normalizedScore >= 60) {
    return {
      currentBand: '600 to 699',
      businessOnlyMin: 20000,
      businessOnlyMax: 40000,
      personalAndBusinessMin: 30000,
      personalAndBusinessMax: 60000,
      scoreRangeLabel: '600 to 699',
    };
  }
  return {
    currentBand: 'Below 600',
    businessOnlyMin: 0,
    businessOnlyMax: 0,
    personalAndBusinessMin: 0,
    personalAndBusinessMax: 0,
    scoreRangeLabel: 'Below 600',
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER: Time in Business
// ────────────────────────────────────────────────────────────────────────────────
function calculateTimeInBusiness(year: number, month: number): string {
  if (!year || !month) return 'Not provided';
  const start = new Date(year, month - 1);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  if (years > 0) return `${years}y ${months}m`;
  return `${months}m`;
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER: Contingencies
// ────────────────────────────────────────────────────────────────────────────────
function computeContingencies(data: UnifiedAnswers): ExtendedResultsOutput['contingencies'] {
  const contingencies: ExtendedResultsOutput['contingencies'] = [];

  // Utilization
  const utilization = data.utilization || 30;
  if (utilization > 45) {
    contingencies.push({
      item: 'Utilization',
      found: 1,
      cause: 'Keep revolving balances below 45% of limit',
      status: 'flagged',
    });
  } else {
    contingencies.push({
      item: 'Utilization',
      found: 0,
      cause: '',
      status: 'clear',
    });
  }

  // Inquiries
  const inquiryMap: Record<string, { found: number; cause: string }> = {
    '0': { found: 0, cause: '' },
    '1_2': { found: 0, cause: '' },
    '3_4': { found: 1, cause: 'Multiple recent inquiries may signal credit-seeking behavior' },
    '5plus': { found: 2, cause: 'Excessive inquiries in 30 days. Avoid new credit applications' },
    'unknown': { found: 0, cause: '' },
  };
  const inquiryData = inquiryMap[data.inquiries30d || 'unknown'];
  contingencies.push({
    item: 'Inquiries',
    found: inquiryData.found,
    cause: inquiryData.cause,
    status: inquiryData.found > 0 ? 'flagged' : 'clear',
  });

  // Derogatories
  const derogCount = [
    data.hasCollections,
    data.hasChargeoffs,
    data.hasLatePay,
    data.hasTaxLiens,
    data.hasBankruptcy,
  ].filter(Boolean).length;
  contingencies.push({
    item: 'Derogatories',
    found: derogCount,
    cause: derogCount > 0 ? 'Must be no major derogatory history with banks you seek funding from' : '',
    status: derogCount > 0 ? 'flagged' : 'clear',
  });

  // Accounts (tax returns mismatch check from readiness Q_R4 index 3)
  const taxReturnsMismatch = data.readinessAnswers[3] === 2 || data.readinessAnswers[3] === 3; // "Significant difference" or "Not sure"
  contingencies.push({
    item: 'Accounts',
    found: taxReturnsMismatch ? 2 : 0,
    cause: taxReturnsMismatch ? '1. Tax returns must align with bank statements. 2. No more than two 30-day late payments in prior 24 months.' : '',
    status: taxReturnsMismatch ? 'flagged' : 'clear',
  });

  return contingencies;
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER: Bankable Items (20 items)
// ────────────────────────────────────────────────────────────────────────────────
function computeBankableItems(data: UnifiedAnswers): ExtendedResultsOutput['bankableItems'] {
  const composite = [data.experian || 680, data.transunion || 680, data.equifax || 680].sort((a, b) => a - b)[1];
  const goodStanding = data.readinessAnswers[8] === 0; // Q_R9 index 8, option A = "Yes, all filings current"

  const descriptions = [
    'Funding programs you currently pre-qualify for are listed inside the bankable system login.',
    'A minimum 160 FICO SBSS is required by banks, credit unions and all the SBA lenders.',
    "35% of the business FICO score is the Owner's credit. A minimum 640 FICO 8 is required.",
    '30% of the business FICO SBSS score is the Bank Rating. A minimum Low 5 is required.',
    'The business must have credit reports with Experian, Equifax and Dun & Bradstreet.',
    'The business should have a minimum of 10 to 12 reporting business credit tradelines.',
    'The business should have a detailed business profile inside the business credit reports.',
    'The business should show existing revenue that is able to support servicing the debt.',
    'A legal business entity is required such as an LLC or Corp separate from the owners.',
    'There are certain \'Trigger Words\' that will get any business categorized as high risk.',
    'Location must be listed as a \'business\' location by the USPS, not residence or mail stop.',
    'Phone numbers must be listed as \'business or VOIP\' by FCC, not residence or cell.',
    'Must have a business website that describes the products or services that are offered.',
    'Must be using a professional email like john@xyzbusiness.com, not john@gmail.com.',
    'Must have a Federal Employer Identification Number for IRS business tax reporting.',
    'The business name and its domain name must not create a trademark infringement.',
    'The business entity must be listed as \'In Good Standing\' with the Secretary of State.',
    'All the Federal, State, County and City filings must be accurate for taxes and licenses.',
    'Business should have a \'Web Rating Score\' of at least a 60 on the scale of 0 to 100.',
    'Business should have \'Name, Address, Phone\' listings correct on all major directories.',
  ];

  const items = [
    { name: 'Available Funding', status: 'pass' as const }, // Always pass
    { name: 'Business FICO', status: (data.bankableScore >= 130 ? 'pass' : 'fail') as const },
    { name: 'Owner\'s Credit', status: (composite >= 640 ? 'pass' : 'fail') as const },
    { name: 'Bank Rating', status: (data.avgDailyBalance !== 'near_zero' && data.nsfCount === 'zero' ? 'pass' : 'fail') as const },
    { name: 'Business Credit', status: (data.bizCreditFile === 'paydex_80plus' ? 'pass' : 'fail') as const },
    { name: 'Reporting Tradelines', status: (data.bizCreditFile === 'paydex_80plus' ? 'pass' : 'fail') as const },
    { name: 'Detailed Reports', status: (data.bizCreditFile !== 'none' ? 'pass' : 'fail') as const },
    { name: 'Business Revenue', status: ((data.monthlyRevenue || 0) >= 10000 ? 'pass' : 'fail') as const },
    { name: 'Business Type', status: (data.entityType !== 'sole_prop' ? 'pass' : 'fail') as const },
    { name: 'Business Name', status: (!!data.businessName ? 'pass' : 'fail') as const },
    { name: 'Business Location', status: (data.hasEIN ? 'pass' : 'fail') as const },
    { name: 'Business Phones', status: (!!data.ownerPhone ? 'pass' : 'fail') as const },
    { name: 'Business Website', status: (data.hasWebsite ? 'pass' : 'fail') as const },
    { name: 'Business Email', status: (data.ownerEmail && !['gmail', 'yahoo', 'hotmail', 'outlook', 'aol'].some(d => data.ownerEmail.toLowerCase().includes(d)) ? 'pass' : 'fail') as const },
    { name: 'Business EIN', status: (data.hasEIN ? 'pass' : 'fail') as const },
    { name: 'Business Trademark', status: 'pass' as const }, // Cannot verify, default pass
    { name: 'In Good Standing', status: (goodStanding ? 'pass' : 'fail') as const },
    { name: 'Government Filings', status: (data.hasEIN && goodStanding ? 'pass' : 'fail') as const },
    { name: 'Web Rating Score', status: (data.hasWebsite ? 'pass' : 'fail') as const },
    { name: 'NAP Validation', status: (data.hasWebsite && data.hasEIN && !!data.ownerPhone ? 'pass' : 'fail') as const },
  ];

  return items.map((item, index) => ({
    ...item,
    description: descriptions[index],
  }));
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER: SBSS Sections
// ────────────────────────────────────────────────────────────────────────────────
function computeSBSSSections(data: UnifiedAnswers, composite: number, bankableScore: number): ExtendedResultsOutput['sbssSections'] {
  const goodStanding = data.readinessAnswers[8] === 0;

  return [
    {
      section: "Owner's Credit",
      percentage: '35%',
      status: composite >= 700 ? 'pass' : composite >= 640 ? 'partial' : 'fail',
      description: 'Anyone owning 20+% of the business',
    },
    {
      section: 'Business Revenue',
      percentage: '30%',
      status: 
        (data.monthlyRevenue || 0) > 15000 && data.nsfCount === 'zero' && data.bankAccount === 'dedicated' ? 'pass' :
        (data.monthlyRevenue || 0) > 5000 || data.bankAccount === 'dedicated' ? 'partial' :
        'fail',
      description: 'Business bank rating, revenue, debt ratio',
    },
    {
      section: 'Business Status',
      percentage: '20%',
      status: 
        data.hasWebsite && data.hasEIN && data.entityType !== 'sole_prop' && goodStanding ? 'pass' :
        [data.hasWebsite, data.hasEIN, data.entityType !== 'sole_prop', goodStanding].filter(Boolean).length >= 2 ? 'partial' :
        'fail',
      description: 'Web presence, industry, location, margins',
    },
    {
      section: 'Business Credit',
      percentage: '15%',
      status: 
        data.bizCreditFile === 'paydex_80plus' ? 'pass' :
        data.bizCreditFile === 'below_80' || data.bizCreditFile === 'building' ? 'partial' :
        'fail',
      description: 'Experian, Equifax and Dun & Bradstreet',
    },
  ];
}

// ────────────────────────────────────────────────────────────────────────────────
// HELPER: Work Needed
// ────────────────────────────────────────────────────────────────────────────────
function computeWorkNeeded(data: UnifiedAnswers, composite: number, bankableItems: ExtendedResultsOutput['bankableItems']): ExtendedResultsOutput['workNeeded'] {
  const passCount = bankableItems.filter(item => item.status === 'pass').length;
  const tradelineEstimate = data.bizCreditFile === 'paydex_80plus' ? 9 : 0;
  const webScore = data.hasWebsite ? 30 : 0;

  return [
    {
      item: "Owner's Score",
      current: composite,
      goal: '700+',
      description: "Owner's must have 640 or higher FICO 8",
    },
    {
      item: 'Lender Compliance',
      current: passCount,
      goal: '20',
      description: 'Entity, location, phone, email and website',
    },
    {
      item: 'Reporting Tradelines',
      current: tradelineEstimate,
      goal: '12',
      description: 'Third parties that report payment histories',
    },
    {
      item: 'Web Presence Score',
      current: webScore,
      goal: '80+',
      description: 'Web rating score + business NAP validation',
    },
  ];
}
