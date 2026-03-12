// Centralized funding program requirements and eligibility matching logic

export interface FundingRequirements {
  programId: string;
  programName: string;
  path: string;
  minCreditScore?: number; // Personal FICO
  maxCreditScore?: number; // For tiering
  minMonthlyRevenue?: number; // In dollars
  minAnnualRevenue?: number; // In dollars
  minTimeInBusinessMonths?: number;
  requiresEIN?: boolean;
  requiresBusinessBankAccount?: boolean;
  allowsPersonalBankAccountForSoleProps?: boolean;
  noOpenBankruptcies?: boolean;
  maxInquiries?: number;
  maxInquiriesPeriodDays?: number;
  noNewAccountsMonths?: number;
  noDerogatoryItems?: boolean;
  requiresCreditCardSales?: boolean;
  minCreditCardSales?: number;
  requiresAccountsReceivable?: boolean;
  minAccountsReceivable?: number;
  requiresPurchaseOrders?: boolean;
  requiresEquipmentInvoice?: boolean;
  requiresPropertyOrConstruction?: boolean;
  requiresInventory?: boolean;
  debtToIncomeMax?: number; // As percentage
  requiresMembership?: boolean; // For credit unions
  tier?: string; // 'prime', 'subprime', 'startup', etc.
}

// All 17 funding programs with their requirements
export const fundingPrograms: FundingRequirements[] = [
  // 1. Business Credit Cards (SLOC)
  {
    programId: 'business-credit-cards',
    programName: 'Syndicated Line of Credit (SLOC)',
    path: '/access-funding/business-credit-cards',
    minCreditScore: 680,
    minMonthlyRevenue: 0, // None required
    minTimeInBusinessMonths: 0, // None required
    requiresEIN: false,
    requiresBusinessBankAccount: false,
    noDerogatoryItems: true,
    maxInquiries: 4,
    maxInquiriesPeriodDays: 30,
  },

  // 2. Personal Credit Cards
  {
    programId: 'personal-credit-cards',
    programName: 'Personal Credit Cards',
    path: '/access-funding/personal-credit-cards',
    minCreditScore: 650,
    minMonthlyRevenue: 0, // None required
    minTimeInBusinessMonths: 0, // None required
    requiresEIN: false,
    noDerogatoryItems: true,
    maxInquiries: 4,
    maxInquiriesPeriodDays: 730, // 24 months
    noNewAccountsMonths: 6,
  },

  // 3. Business Credit Line
  {
    programId: 'business-credit-line',
    programName: 'Business Credit Line',
    path: '/access-funding/business-credit-line',
    minCreditScore: 600,
    minMonthlyRevenue: 40000, // $40k monthly OR $500k annual
    minAnnualRevenue: 500000,
    minTimeInBusinessMonths: 12, // 1 year
    requiresBusinessBankAccount: true,
    allowsPersonalBankAccountForSoleProps: false,
  },

  // 4. Business Term Loan
  {
    programId: 'business-term-loan',
    programName: 'Business Term Loan',
    path: '/access-funding/business-term-loan',
    minCreditScore: 600,
    minMonthlyRevenue: 40000, // $40k monthly OR $500k annual
    minAnnualRevenue: 500000,
    minTimeInBusinessMonths: 24, // 2 years
    requiresBusinessBankAccount: true,
    allowsPersonalBankAccountForSoleProps: false,
  },

  // 5. Working Capital Loans
  {
    programId: 'working-capital-loans',
    programName: 'Working Capital Loans',
    path: '/access-funding/working-capital-loans',
    minCreditScore: 0, // No minimum
    minMonthlyRevenue: 10000, // $10k monthly cash flow
    minTimeInBusinessMonths: 6,
    requiresBusinessBankAccount: true,
    allowsPersonalBankAccountForSoleProps: false,
  },

  // 6. Merchant Advance (MCA)
  {
    programId: 'merchant-advance',
    programName: 'Merchant Advance',
    path: '/access-funding/merchant-advance',
    minCreditScore: 0, // No credit required
    minMonthlyRevenue: 10000, // $10k+ monthly
    minTimeInBusinessMonths: 3, // 3+ months (also mentions 6+ in some places)
    noOpenBankruptcies: true,
    requiresBusinessBankAccount: true,
  },

  // 7. Revenue Based Loan
  {
    programId: 'revenue-based-loan',
    programName: 'Revenue Based Loan',
    path: '/access-funding/revenue-based-loan',
    minCreditScore: 600,
    minMonthlyRevenue: 15000, // $15k+ monthly revenue
    minTimeInBusinessMonths: 6,
    requiresBusinessBankAccount: true,
    allowsPersonalBankAccountForSoleProps: false,
  },

  // 8. Receivable Factoring
  {
    programId: 'receivable-factoring',
    programName: 'Receivable Factoring',
    path: '/access-funding/receivable-factoring',
    minCreditScore: 0, // No minimum stated, focuses on customer creditworthiness
    minMonthlyRevenue: 10000, // Implied from $10k+ AR requirement
    minTimeInBusinessMonths: 3, // 3+ months
    requiresAccountsReceivable: true,
    minAccountsReceivable: 10000, // $10k+ in AR
    requiresBusinessBankAccount: true,
  },

  // 9. Equipment Financing
  {
    programId: 'equipment-financing',
    programName: 'Equipment Financing',
    path: '/access-funding/equipment-financing',
    minCreditScore: 550, // Baseline, tiering from 450-750+
    minMonthlyRevenue: 25000, // $25k+ monthly
    minTimeInBusinessMonths: 12, // 1 year baseline, 2+ for startup/subprime
    requiresEquipmentInvoice: true,
    requiresBusinessBankAccount: true,
    allowsPersonalBankAccountForSoleProps: false,
  },

  // 10. Credit Union Loans
  {
    programId: 'credit-union-loans',
    programName: 'Credit Union Loans',
    path: '/access-funding/credit-union-loans',
    minCreditScore: 600, // Many look for 600+
    minMonthlyRevenue: 0, // Not explicitly stated
    minTimeInBusinessMonths: 6, // 6-12 months employment stability
    requiresMembership: true,
    debtToIncomeMax: 50, // Ideal 36%, max 50%
  },

  // 11. SBA Loans (7a & 504)
  {
    programId: 'sba-business-loan',
    programName: 'SBA Loans: 7a & 504',
    path: '/access-funding/sba-business-loan',
    minCreditScore: 680, // Typical minimum for SBA
    minMonthlyRevenue: 0, // Varies by loan size
    minTimeInBusinessMonths: 24, // 2 years preferred
    requiresBusinessBankAccount: true,
    requiresEIN: true,
  },

  // 12. Accounts Receivable Finance
  {
    programId: 'accounts-receivable-finance',
    programName: 'Accounts Receivable Finance',
    path: '/access-funding/accounts-receivable-finance',
    minCreditScore: 0, // Focuses on customer credit
    minMonthlyRevenue: 10000, // Typical AR requirement
    minTimeInBusinessMonths: 3,
    requiresAccountsReceivable: true,
    minAccountsReceivable: 10000,
    requiresBusinessBankAccount: true,
  },

  // 13. Purchase Order Finance
  {
    programId: 'purchase-order-finance',
    programName: 'Purchase Order Finance',
    path: '/access-funding/purchase-order-finance',
    minCreditScore: 600, // Typical requirement
    minMonthlyRevenue: 0, // Based on PO size
    minTimeInBusinessMonths: 6,
    requiresPurchaseOrders: true,
    requiresBusinessBankAccount: true,
  },

  // 14. Inventory Line of Credit
  {
    programId: 'inventory-line-of-credit',
    programName: 'Inventory Line of Credit',
    path: '/access-funding/inventory-line-of-credit',
    minCreditScore: 650, // Typical for inventory financing
    minMonthlyRevenue: 50000, // Higher revenue for inventory needs
    minTimeInBusinessMonths: 12,
    requiresInventory: true,
    requiresBusinessBankAccount: true,
    requiresEIN: true,
  },

  // 15. Bridge Loans
  {
    programId: 'bridge-loans',
    programName: 'Bridge Loans',
    path: '/access-funding/bridge-loans',
    minCreditScore: 650, // Real estate backed
    minMonthlyRevenue: 0, // Property-based
    minTimeInBusinessMonths: 0,
    requiresPropertyOrConstruction: true,
    requiresBusinessBankAccount: true,
  },

  // 16. DSCR Loans (Debt Service Coverage Ratio)
  {
    programId: 'dscr-loans',
    programName: 'DSCR Loans',
    path: '/access-funding/dscr-loans',
    minCreditScore: 620, // Typical for real estate investors
    minMonthlyRevenue: 0, // Property income based
    minTimeInBusinessMonths: 0,
    requiresPropertyOrConstruction: true,
    requiresBusinessBankAccount: true,
  },

  // 17. Construction Loans
  {
    programId: 'construction-loans',
    programName: 'Construction Loans',
    path: '/access-funding/construction-loans',
    minCreditScore: 680, // Higher for construction risk
    minMonthlyRevenue: 0, // Project-based
    minTimeInBusinessMonths: 12,
    requiresPropertyOrConstruction: true,
    requiresBusinessBankAccount: true,
    requiresEIN: true,
  },
];

// Helper function to parse revenue strings like "$25,000" or "$25k" to numbers
export function parseRevenueString(revenueStr: string | number | undefined): number {
  if (!revenueStr) return 0;
  
  // If it's already a number, return it
  if (typeof revenueStr === 'number') return revenueStr;
  
  // Remove $, commas, spaces
  let cleaned = revenueStr.replace(/[\$,\s]/g, '');
  
  // Handle 'k' for thousands
  if (cleaned.toLowerCase().includes('k')) {
    const num = parseFloat(cleaned.replace(/k/i, ''));
    return num * 1000;
  }
  
  // Handle 'M' or 'm' for millions
  if (cleaned.toLowerCase().includes('m')) {
    const num = parseFloat(cleaned.replace(/m/i, ''));
    return num * 1000000;
  }
  
  // Handle ranges like "25000-50000" - take the lower bound
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    return parseFloat(parts[0]) || 0;
  }
  
  return parseFloat(cleaned) || 0;
}

// Calculate business age in months from start date
export function calculateBusinessAgeMonths(startMonth: string, startYear: string): number {
  if (!startMonth || !startYear) return 0;
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthIndex = monthNames.indexOf(startMonth);
  if (monthIndex === -1) return 0;
  
  const startDate = new Date(parseInt(startYear), monthIndex, 1);
  const currentDate = new Date();
  
  const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
  const monthsDiff = currentDate.getMonth() - startDate.getMonth();
  
  return (yearsDiff * 12) + monthsDiff;
}

// Parse credit score - handles "680", "680-720", "680+", etc.
export function parseCreditScore(scoreStr: string | number): number {
  if (typeof scoreStr === 'number') return scoreStr;
  if (!scoreStr) return 0;
  
  const cleaned = scoreStr.toString().replace(/[+\s]/g, '');
  
  // Handle ranges - take lower bound
  if (cleaned.includes('-')) {
    const parts = cleaned.split('-');
    return parseInt(parts[0]) || 0;
  }
  
  return parseInt(cleaned) || 0;
}

// Main eligibility checker
export interface ScanData {
  // Step 1 - Business Info
  hasEIN?: string; // 'Yes' | 'No'
  einNumber?: string;
  businessType?: string; // For sole prop exceptions
  
  // Step 2 - Operations & Financials
  startMonth?: string;
  startYear?: string;
  monthlyRevenue?: string | number; // "$25,000" format or number
  creditCardSales?: string | number;
  owedToYou?: string | number; // Accounts Receivable
  purchaseOrders?: string | number;
  equipmentValue?: string | number;
  
  // PHASE 1: Business Banking (CRITICAL)
  hasBizBankAccount?: string; // 'yes-dedicated' | 'yes-personal' | 'no'
  bankAccountAge?: string; // '0-3' | '3-6' | '6-12' | '12-24' | '24+' | 'unknown'
  avgMonthlyBalance?: string; // '0-1k' | '1k-5k' | '5k-10k' | '10k-25k' | '25k+' | 'unknown'
  hasNSF?: string; // 'yes' | 'no' | 'unknown'
  
  // PHASE 1: Property Ownership (OPTIONAL)
  ownsInvestmentProperty?: string; // 'yes' | 'no' | 'planning'
  propertyCount?: string; // '1' | '2-4' | '5-10' | '10+'
  totalPropertyValue?: string; // '0-250k' | '250k-500k' | '500k-1m' | '1m-3m' | '3m+'
  totalMortgageBalance?: string; // 'none' | '0-100k' | '100k-250k' | '250k-500k' | '500k-1m' | '1m+'
  totalRentalIncome?: string; // '0' | '0-5k' | '5k-10k' | '10k-25k' | '25k+'
  planningConstruction?: string; // 'yes' | 'no' | 'maybe'
  constructionBudget?: string; // '0-100k' | '100k-250k' | '250k-500k' | '500k-1m' | '1m-2.5m' | '2.5m+'
  
  // Step 3 - Credit & Personal Information
  creditScore?: string | number; // Personal FICO (average of 3 bureaus)
  experianScore?: string | number;
  transUnionScore?: string | number;
  equiFaxScore?: string | number;
  hasBankruptcy?: string; // 'Yes' | 'No'
  hasJudgments?: string; // 'Yes' | 'No'
  personalIncome?: string | number;
  
  // PHASE 1: Credit Profile Details (CRITICAL)
  inquiriesLast30Days?: string; // '0' | '1-2' | '3-4' | '5-6' | ... | 'unknown'
  newAccountsLast12Months?: string; // '0' | '1-2' | '3-4' | '5-6' | ... | 'unknown'
  creditUtilization?: string; // '0-25' | '26-50' | '51-75' | '76-100' | 'unknown'
  hasCollections?: boolean;
  hasChargeOffs?: boolean;
  hasLatePayments?: boolean;
  hasTaxLiens?: boolean;
  noDerogatoryItems?: boolean;
}

export type EligibilityStatus = 'pre-qual' | 'likely-qual' | 'not-pre-qual' | 'not-applicable';

export interface EligibilityResult {
  programId: string;
  programName: string;
  path: string;
  status: EligibilityStatus; // NEW: 3-tier + not-applicable
  confidence: 'high' | 'medium' | 'low'; // NEW: Confidence level
  matchScore: number; // 0-100, how well they match
  passedRequirements: string[];
  failedRequirements: string[];
  missingData: string[]; // NEW: Enhanced to track specific unknown fields
  reasoning: string; // NEW: Human-readable explanation
  
  // Legacy support (deprecated - use status instead)
  eligible?: boolean;
}

export function checkProgramEligibility(
  program: FundingRequirements,
  scanData: ScanData
): EligibilityResult {
  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];
  
  let totalChecks = 0;
  let passedChecks = 0;
  
  // Helper to check requirement
  const checkReq = (
    condition: boolean | null, 
    passMsg: string, 
    failMsg: string, 
    missingMsg?: string
  ) => {
    totalChecks++;
    if (condition === null) {
      if (missingMsg) missing.push(missingMsg);
    } else if (condition) {
      passed.push(passMsg);
      passedChecks++;
    } else {
      failed.push(failMsg);
    }
  };
  
  // Parse scan data
  const hasEIN = scanData.hasEIN === 'Yes';
  const creditScore = parseCreditScore(scanData.creditScore || '0');
  const monthlyRevenue = parseRevenueString(scanData.monthlyRevenue || '0');
  const businessAgeMonths = calculateBusinessAgeMonths(
    scanData.startMonth || '',
    scanData.startYear || ''
  );
  const creditCardSales = parseRevenueString(scanData.creditCardSales || '0');
  const accountsReceivable = parseRevenueString(scanData.owedToYou || '0');
  const hasBankAccount = scanData.businessBankAccount === 'Yes';
  const hasOpenBankruptcies = scanData.openBankruptcies === 'Yes';
  const recentInquiries = parseInt(scanData.recentInquiries || '0');
  const hasNewAccounts = scanData.newAccounts === 'Yes';
  const hasLatePayments = scanData.latePayments === 'Yes';
  const hasCollections = scanData.collections === 'Yes';
  const hasPurchaseOrders = (scanData.purchaseOrders && parseRevenueString(scanData.purchaseOrders) > 0);
  const hasInventory = (scanData.inventory && parseRevenueString(scanData.inventory) > 0);
  const hasProperty = (scanData.property && scanData.property.toLowerCase() === 'yes');
  
  // Check credit score requirement
  if (program.minCreditScore !== undefined) {
    checkReq(
      scanData.creditScore ? creditScore >= program.minCreditScore : null,
      `Credit score ${creditScore} meets minimum ${program.minCreditScore}`,
      `Credit score ${creditScore} below minimum ${program.minCreditScore}`,
      'Credit score not provided'
    );
  }
  
  // Check monthly revenue
  if (program.minMonthlyRevenue !== undefined && program.minMonthlyRevenue > 0) {
    checkReq(
      scanData.monthlyRevenue ? monthlyRevenue >= program.minMonthlyRevenue : null,
      `Monthly revenue $${monthlyRevenue.toLocaleString()} meets minimum $${program.minMonthlyRevenue.toLocaleString()}`,
      `Monthly revenue $${monthlyRevenue.toLocaleString()} below minimum $${program.minMonthlyRevenue.toLocaleString()}`,
      'Monthly revenue not provided'
    );
  }
  
  // Check time in business
  if (program.minTimeInBusinessMonths !== undefined && program.minTimeInBusinessMonths > 0) {
    checkReq(
      (scanData.startMonth && scanData.startYear) ? businessAgeMonths >= program.minTimeInBusinessMonths : null,
      `Business age ${businessAgeMonths} months meets minimum ${program.minTimeInBusinessMonths} months`,
      `Business age ${businessAgeMonths} months below minimum ${program.minTimeInBusinessMonths} months`,
      'Business start date not provided'
    );
  }
  
  // Check EIN requirement
  if (program.requiresEIN) {
    checkReq(
      scanData.hasEIN ? hasEIN : null,
      'Has EIN',
      'EIN required but not provided',
      'EIN status not provided'
    );
  }
  
  // Check business bank account
  if (program.requiresBusinessBankAccount) {
    checkReq(
      scanData.businessBankAccount ? hasBankAccount : null,
      'Has business bank account',
      'Business bank account required',
      'Bank account status not provided'
    );
  }
  
  // Check no open bankruptcies
  if (program.noOpenBankruptcies) {
    checkReq(
      scanData.openBankruptcies ? !hasOpenBankruptcies : null,
      'No open bankruptcies',
      'Has open bankruptcies',
      'Bankruptcy status not provided'
    );
  }
  
  // Check inquiries
  if (program.maxInquiries !== undefined) {
    const period = program.maxInquiriesPeriodDays || 30;
    checkReq(
      scanData.recentInquiries ? recentInquiries <= program.maxInquiries : null,
      `${recentInquiries} inquiries within limit (${program.maxInquiries})`,
      `${recentInquiries} inquiries exceeds limit (${program.maxInquiries})`,
      'Recent inquiries not provided'
    );
  }
  
  // Check no derogatory items
  if (program.noDerogatoryItems) {
    const hasDerogatories = hasLatePayments || hasCollections;
    checkReq(
      (scanData.latePayments || scanData.collections) ? !hasDerogatories : null,
      'No recent late payments or collections',
      'Has late payments or collections',
      'Credit history not fully provided'
    );
  }
  
  // Check new accounts restriction
  if (program.noNewAccountsMonths) {
    checkReq(
      scanData.newAccounts ? !hasNewAccounts : null,
      'No new accounts in restricted period',
      `Has new accounts within ${program.noNewAccountsMonths} months`,
      'New accounts status not provided'
    );
  }
  
  // Check credit card sales (for MCA)
  if (program.requiresCreditCardSales && program.minCreditCardSales) {
    checkReq(
      scanData.creditCardSales ? creditCardSales >= program.minCreditCardSales : null,
      `Credit card sales $${creditCardSales.toLocaleString()} meets minimum`,
      `Credit card sales below minimum $${program.minCreditCardSales.toLocaleString()}`,
      'Credit card sales not provided'
    );
  }
  
  // Check accounts receivable
  if (program.requiresAccountsReceivable && program.minAccountsReceivable) {
    checkReq(
      scanData.owedToYou ? accountsReceivable >= program.minAccountsReceivable : null,
      `Accounts receivable $${accountsReceivable.toLocaleString()} meets minimum`,
      `Accounts receivable below minimum $${program.minAccountsReceivable.toLocaleString()}`,
      'Accounts receivable not provided'
    );
  }
  
  // Check purchase orders
  if (program.requiresPurchaseOrders) {
    checkReq(
      scanData.purchaseOrders !== undefined ? hasPurchaseOrders : null,
      'Has purchase orders',
      'Purchase orders required',
      'Purchase orders status not provided'
    );
  }
  
  // Check inventory
  if (program.requiresInventory) {
    checkReq(
      scanData.inventory !== undefined ? hasInventory : null,
      'Has inventory',
      'Inventory required',
      'Inventory status not provided'
    );
  }
  
  // Check property/construction
  if (program.requiresPropertyOrConstruction) {
    checkReq(
      scanData.property !== undefined ? hasProperty : null,
      'Has property or construction project',
      'Property or construction project required',
      'Property status not provided'
    );
  }
  
  // Calculate match score
  const matchScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  
  // Eligible if passed all checks and no critical failures
  const eligible = failed.length === 0 && missing.length === 0;
  
  // Determine status and confidence
  let status: EligibilityStatus;
  let confidence: 'high' | 'medium' | 'low';
  
  if (matchScore >= 90) {
    status = 'pre-qual';
    confidence = 'high';
  } else if (matchScore >= 70) {
    status = 'likely-qual';
    confidence = 'medium';
  } else {
    status = 'not-pre-qual';
    confidence = 'low';
  }
  
  // Special case for not applicable
  if (program.tier && !program.tier.includes('startup')) {
    if (scanData.businessType === 'sole-prop' && !program.allowsPersonalBankAccountForSoleProps) {
      status = 'not-applicable';
      confidence = 'low';
    }
  }
  
  return {
    programId: program.programId,
    programName: program.programName,
    path: program.path,
    status,
    confidence,
    matchScore,
    passedRequirements: passed,
    failedRequirements: failed,
    missingData: missing,
    reasoning: `Match score: ${matchScore}%, Passed: ${passed.length}, Failed: ${failed.length}, Missing: ${missing.length}`,
    eligible,
  };
}

// Check all programs and return sorted by match score
export function checkAllProgramsEligibility(scanData: ScanData): EligibilityResult[] {
  const results = fundingPrograms.map(program => 
    checkProgramEligibility(program, scanData)
  );
  
  // Sort by eligible first, then by match score
  return results.sort((a, b) => {
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    return b.matchScore - a.matchScore;
  });
}

// Get only eligible programs
export function getEligiblePrograms(scanData: ScanData): EligibilityResult[] {
  return checkAllProgramsEligibility(scanData).filter(result => result.eligible);
}

// Get programs with high match scores (70%+) even if not fully eligible
export function getHighMatchPrograms(scanData: ScanData, minScore: number = 70): EligibilityResult[] {
  return checkAllProgramsEligibility(scanData).filter(result => result.matchScore >= minScore);
}