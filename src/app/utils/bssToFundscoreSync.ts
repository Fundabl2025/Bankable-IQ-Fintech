// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — BSS to FundScore Data Sync
// Pre-fill logic and data mapping between BSS intake and FundScore assessment
// ════════════════════════════════════════════════════════════════════════════════

export interface BSSData {
  step1: {
    businessLegalName: string;
    hasEIN: 'yes' | 'no' | '';
    einNumber: string;
  };
  step2: {
    startMonth: string;
    startYear: string;
    industry: string;
    entityType: string;
    monthlyRevenue: number;
    bankAccountStatus: string;
    bankAccountAge: string;
    avgMonthlyBalance: string;
    nsfOverdrafts: string;
  };
  step3: {
    experianScore: number;
    transunionScore: number;
    equifaxScore: number;
    creditUtilization: number;
    derogatoryItems: string[];
    personalIncome: string;
  };
}

export interface PrefilledAnswers {
  [questionIndex: number]: number; // Maps question index to selected option index
}

/**
 * Maps BSS data to FundScore assessment question pre-fills
 * Returns an object with question indices as keys and option indices as values
 */
export function mapBSSToFundScoreAnswers(bssData: BSSData): PrefilledAnswers {
  const prefilled: PrefilledAnswers = {};

  // Q0: Personal credit score (from BSS Step 3 credit scores)
  const creditScores = [
    bssData.step3.experianScore || 680,
    bssData.step3.transunionScore || 680,
    bssData.step3.equifaxScore || 680,
  ].sort((a, b) => a - b);
  const middleScore = creditScores[1];

  if (middleScore >= 740) prefilled[0] = 5; // 740 or above
  else if (middleScore >= 700) prefilled[0] = 4; // 700-739
  else if (middleScore >= 650) prefilled[0] = 3; // 650-699
  else if (middleScore >= 620) prefilled[0] = 2; // 620-649
  else if (middleScore >= 580) prefilled[0] = 1; // 580-619
  else prefilled[0] = 0; // Below 580

  // Q1: Credit utilization (from BSS Step 3)
  const utilization = bssData.step3.creditUtilization || 30;
  if (utilization < 20) prefilled[1] = 0; // Under 20%
  else if (utilization <= 30) prefilled[1] = 1; // 20-30%
  else if (utilization <= 50) prefilled[1] = 2; // 30-50%
  else prefilled[1] = 3; // Over 50%

  // Q2: Derogatory marks (from BSS Step 3)
  const hasCleanCredit = bssData.step3.derogatoryItems?.length === 0 || 
                         bssData.step3.derogatoryItems?.includes('No derogatory items - my report is clean');
  if (hasCleanCredit) {
    prefilled[2] = 0; // No - my report is clean
  } else {
    // For now, default to "some are within last 2 years" if they have derogatories
    prefilled[2] = 2; // Yes - some are within last 2 years
  }

  // Q8: Monthly revenue (from BSS Step 2)
  const revenue = bssData.step2.monthlyRevenue || 0;
  if (revenue >= 50000) prefilled[8] = 5; // $50K+
  else if (revenue >= 25000) prefilled[8] = 4; // $25K-$50K
  else if (revenue >= 10000) prefilled[8] = 3; // $10K-$25K
  else if (revenue >= 5000) prefilled[8] = 2; // $5K-$10K
  else if (revenue >= 2000) prefilled[8] = 1; // $2K-$5K
  else prefilled[8] = 0; // Under $2K

  // Q12: Overdrafts/NSFs (from BSS Step 2)
  const nsf = bssData.step2.nsfOverdrafts;
  if (nsf === 'Zero') prefilled[12] = 0; // Zero
  else if (nsf === '1-2') prefilled[12] = 1; // 1-2
  else if (nsf === '3-5') prefilled[12] = 2; // 3-5
  else if (nsf === '5+') prefilled[12] = 3; // 5+

  // Q13: Average daily balance (from BSS Step 2)
  const balance = bssData.step2.avgMonthlyBalance;
  if (balance === '$25,000+') prefilled[13] = 4; // $25K+
  else if (balance === '$10,000 - $25,000') prefilled[13] = 3; // $10K-$25K
  else if (balance === '$2,000 - $10,000') prefilled[13] = 2; // $2K-$10K
  else if (balance === '500-2000' || balance === '$500 - $2,000') prefilled[13] = 1; // $500-$2K
  else prefilled[13] = 0; // Near zero or negative

  // Q14: Personal/business fund separation (from BSS Step 2)
  const bankStatus = bssData.step2.bankAccountStatus;
  if (bankStatus === 'Yes - dedicated business account') {
    prefilled[14] = 0; // Completely separated
  } else if (bankStatus === 'Yes - but I use a personal account for business') {
    prefilled[14] = 1; // Same account
  } else {
    prefilled[14] = 2; // I don't separate them
  }

  // Q16: Entity type (from BSS Step 2)
  const entity = bssData.step2.entityType;
  if (entity?.includes('S-Corp') || entity?.includes('C-Corp')) {
    prefilled[16] = 3; // S-Corp or C-Corp
  } else if (entity?.includes('Multi-Member') || entity?.includes('Partnership')) {
    prefilled[16] = 2; // LLC (multi-member) or Partnership
  } else if (entity?.includes('Single-Member')) {
    prefilled[16] = 1; // LLC (single-member)
  } else if (entity?.includes('Sole Proprietorship')) {
    prefilled[16] = 0; // Sole proprietorship
  }

  // Q17: Years in business (from BSS Step 2)
  const businessAgeMonths = calculateBusinessAgeMonths(
    bssData.step2.startMonth,
    bssData.step2.startYear
  );
  const businessAgeYears = businessAgeMonths / 12;
  
  if (businessAgeYears >= 5) prefilled[17] = 5; // 5+ years
  else if (businessAgeYears >= 3) prefilled[17] = 4; // 3-5 years
  else if (businessAgeYears >= 2) prefilled[17] = 3; // 2-3 years
  else if (businessAgeYears >= 1) prefilled[17] = 2; // 1-2 years
  else if (businessAgeMonths >= 6) prefilled[17] = 1; // 6-12 months
  else prefilled[17] = 0; // Under 6 months

  // Q18: Industry (from BSS Step 2)
  const industry = bssData.step2.industry;
  if (industry?.includes('Professional Services') || industry?.includes('Technology') || industry?.includes('Healthcare')) {
    prefilled[18] = 0; // Professional Services, Technology, or Healthcare
  } else if (industry?.includes('Retail') || industry?.includes('E-commerce') || industry?.includes('Wholesale')) {
    prefilled[18] = 1; // Retail, E-commerce, or Wholesale
  } else if (industry?.includes('Construction') || industry?.includes('Real Estate')) {
    prefilled[18] = 2; // Construction or Real Estate
  } else if (industry?.includes('Restaurant') || industry?.includes('Food Service') || industry?.includes('Hospitality')) {
    prefilled[18] = 3; // Restaurant, Food Service, or Hospitality
  } else if (industry?.includes('Transportation') || industry?.includes('Trucking') || industry?.includes('Logistics')) {
    prefilled[18] = 4; // Transportation, Trucking, or Logistics
  } else {
    prefilled[18] = 5; // Other
  }

  // Q19: State standing - we'll default to "Yes" since we can't verify from BSS
  // This should be manually confirmed in the assessment
  // Don't pre-fill this one - let them answer it

  return prefilled;
}

/**
 * Calculate business age in months from start month and year
 */
function calculateBusinessAgeMonths(startMonth: string, startYear: string): number {
  if (!startMonth || !startYear) return 0;
  const startDate = new Date(parseInt(startYear), parseInt(startMonth) - 1);
  const now = new Date();
  return (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
}

/**
 * Load BSS data from localStorage
 */
export function loadBSSData(): BSSData | null {
  try {
    const step1 = localStorage.getItem('bss_step1');
    const step2 = localStorage.getItem('bss_step2');
    const step3 = localStorage.getItem('bss_step3');

    if (!step1 || !step2 || !step3) {
      return null;
    }

    return {
      step1: JSON.parse(step1),
      step2: JSON.parse(step2),
      step3: JSON.parse(step3),
    };
  } catch (error) {
    console.error('Error loading BSS data:', error);
    return null;
  }
}

/**
 * Check which questions are pre-filled from BSS data
 */
export function getPrefilledQuestionIndices(): number[] {
  // These are the question indices that can be pre-filled from BSS data
  return [0, 1, 2, 8, 12, 13, 14, 16, 17, 18];
}

/**
 * Check if a specific question is pre-filled
 */
export function isQuestionPrefilled(questionIndex: number): boolean {
  return getPrefilledQuestionIndices().includes(questionIndex);
}
