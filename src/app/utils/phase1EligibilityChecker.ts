/**
 * PHASE 1: Enhanced Eligibility Checker with 3-Tier System
 * 
 * This module implements the updated eligibility logic that includes
 * all Phase 1 data collection fields with smart conditional logic.
 */

import { fundingPrograms, type FundingRequirements, parseRevenueString, parseCreditScore, calculateBusinessAgeMonths } from './fundingRequirements';
import type { ScanData, EligibilityStatus, EligibilityResult } from './fundingRequirements';

/**
 * Helper: Parse inquiry count from ranges like "0", "1-2", "3-4", etc.
 */
function parseInquiryCount(inquiryStr: string | undefined): number | null {
  if (!inquiryStr || inquiryStr === 'unknown') return null;
  
  if (inquiryStr === '0') return 0;
  
  // Handle ranges like "1-2", "3-4" - use midpoint
  if (inquiryStr.includes('-')) {
    const parts = inquiryStr.split('-');
    const low = parseInt(parts[0]) || 0;
    const high = parseInt(parts[1]) || 0;
    return Math.floor((low + high) / 2);
  }
  
  return parseInt(inquiryStr) || 0;
}

/**
 * Helper: Check if program is applicable to user's situation
 */
function isProgramApplicable(program: FundingRequirements, scanData: ScanData): boolean {
  // Property-based programs
  const propertyPrograms = ['bridge-loans', 'dscr-loans', 'construction-loans'];
  if (propertyPrograms.includes(program.programId)) {
    const ownsProperty = scanData.ownsInvestmentProperty === 'yes';
    const planningConstruction = scanData.planningConstruction === 'yes' || scanData.ownsInvestmentProperty === 'planning';
    
    // Construction loans: Need to be planning construction
    if (program.programId === 'construction-loans') {
      return planningConstruction;
    }
    
    // Bridge & DSCR loans: Need to own property
    return ownsProperty;
  }
  
  // Inventory programs
  if (program.requiresInventory) {
    // Check if user has inventory (we don't have this field yet, so assume applicable)
    return true; // TODO: Add inventory field in Phase 2
  }
  
  // All other programs are generally applicable
  return true;
}

/**
 * Main Phase 1 Eligibility Checker
 */
export function checkProgramEligibilityPhase1(
  program: FundingRequirements,
  scanData: ScanData
): EligibilityResult {
  const passed: string[] = [];
  const failed: string[] = [];
  const missing: string[] = [];
  
  let totalChecks = 0;
  let passedChecks = 0;
  let hasUnknownData = false;
  
  // Check if program is applicable first
  if (!isProgramApplicable(program, scanData)) {
    return {
      programId: program.programId,
      programName: program.programName,
      path: program.path,
      status: 'not-applicable',
      confidence: 'high',
      matchScore: 0,
      passedRequirements: [],
      failedRequirements: [],
      missingData: [],
      reasoning: `This program doesn't apply to your situation (e.g., requires property ownership or specific assets you don't have).`,
      eligible: false,
    };
  }
  
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
      hasUnknownData = true;
    } else if (condition) {
      passed.push(passMsg);
      passedChecks++;
    } else {
      failed.push(failMsg);
    }
  };
  
  // ========================================
  // PHASE 1: BUSINESS BANKING
  // ========================================
  if (program.requiresBusinessBankAccount) {
    const hasBizBankAccount = scanData.hasBizBankAccount;
    const isSoleProp = scanData.businessType?.toLowerCase().includes('sole');
    const allowsPersonal = program.allowsPersonalBankAccountForSoleProps;
    
    if (!hasBizBankAccount) {
      checkReq(null, '', 'Business bank account required', 'Business bank account status not provided');
    } else if (hasBizBankAccount === 'no') {
      checkReq(false, '', 'Business bank account required', '');
    } else if (hasBizBankAccount === 'yes-personal') {
      // Personal account - only OK for sole props on lenient programs
      if (isSoleProp && allowsPersonal) {
        checkReq(true, 'Has business bank account (personal allowed for sole prop)', '', '');
      } else {
        checkReq(false, '', 'Dedicated business bank account required (personal account not sufficient)', '');
      }
    } else if (hasBizBankAccount === 'yes-dedicated') {
      checkReq(true, 'Has dedicated business bank account', '', '');
      
      // Check bank account age (if program requires 6+ months, check if account is old enough)
      if (scanData.bankAccountAge) {
        if (scanData.bankAccountAge === 'unknown') {
          checkReq(null, '', '', 'Bank account age unknown');
          hasUnknownData = true;
        } else {
          const ageCheck = ['6-12', '12-24', '24+'].includes(scanData.bankAccountAge);
          checkReq(ageCheck, 'Bank account is 6+ months old', 'Bank account is less than 6 months old', '');
        }
      }
      
      // Check for NSF fees (negative factor)
      if (scanData.hasNSF === 'yes') {
        checkReq(false, '', 'Recent overdrafts/NSF fees detected', '');
      } else if (scanData.hasNSF === 'no') {
        checkReq(true, 'No recent overdrafts or NSF fees', '', '');
      } else if (scanData.hasNSF === 'unknown') {
        hasUnknownData = true;
      }
    }
  }
  
  // ========================================
  // CREDIT SCORE
  // ========================================
  if (program.minCreditScore !== undefined) {
    // Calculate average credit score from 3 bureaus
    const scores = [scanData.experianScore, scanData.transUnionScore, scanData.equiFaxScore]
      .filter(s => s && s !== '')
      .map(s => parseCreditScore(s!));
    
    if (scores.length > 0) {
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      checkReq(
        avgScore >= program.minCreditScore,
        `Credit score ${avgScore} meets minimum ${program.minCreditScore}`,
        `Credit score ${avgScore} below minimum ${program.minCreditScore}`,
        ''
      );
    } else {
      checkReq(null, '', '', 'Credit scores not provided');
    }
  }
  
  // ========================================
  // PHASE 1: CREDIT INQUIRIES
  // ========================================
  if (program.maxInquiries !== undefined) {
    const inquiryCount = parseInquiryCount(scanData.inquiriesLast30Days);
    
    if (inquiryCount === null) {
      // Unknown - can't pre-qualify with certainty
      checkReq(null, '', '', 'Credit inquiries in last 30 days unknown');
      hasUnknownData = true;
    } else {
      checkReq(
        inquiryCount <= program.maxInquiries,
        `${inquiryCount} inquiries within limit (max ${program.maxInquiries})`,
        `${inquiryCount} inquiries exceeds limit (max ${program.maxInquiries})`,
        ''
      );
    }
  }
  
  // ========================================
  // PHASE 1: NEW ACCOUNTS
  // ========================================
  if (program.noNewAccountsMonths) {
    const newAccountCount = parseInquiryCount(scanData.newAccountsLast12Months);
    
    if (newAccountCount === null) {
      checkReq(null, '', '', 'New accounts in last 12 months unknown');
      hasUnknownData = true;
    } else {
      // If they opened 3+ accounts in 12 months, likely violated 6-month rule
      const tooManyNewAccounts = newAccountCount >= 3;
      checkReq(
        !tooManyNewAccounts,
        'No new accounts in restricted period',
        `Too many new accounts opened recently (${newAccountCount} in last 12 months)`,
        ''
      );
    }
  }
  
  // ========================================
  // PHASE 1: DEROGATORY ITEMS
  // ========================================
  if (program.noDerogatoryItems) {
    const hasDerogatories = 
      scanData.hasCollections ||
      scanData.hasChargeOffs ||
      scanData.hasLatePayments ||
      scanData.hasTaxLiens;
    
    const noDerogatories = scanData.noDerogatoryItems;
    
    if (noDerogatories) {
      checkReq(true, 'Clean credit - no derogatory items', '', '');
    } else if (hasDerogatories) {
      const items = [];
      if (scanData.hasCollections) items.push('collections');
      if (scanData.hasChargeOffs) items.push('charge-offs');
      if (scanData.hasLatePayments) items.push('late payments');
      if (scanData.hasTaxLiens) items.push('tax liens');
      checkReq(false, '', `Has derogatory items: ${items.join(', ')}`, '');
    } else {
      // Not explicitly stated either way
      checkReq(null, '', '', 'Derogatory items status not confirmed');
      hasUnknownData = true;
    }
  }
  
  // ========================================
  // BANKRUPTCY & JUDGMENTS (Existing)
  // ========================================
  if (program.noOpenBankruptcies) {
    if (scanData.hasBankruptcy === 'No') {
      checkReq(true, 'No open bankruptcies', '', '');
    } else if (scanData.hasBankruptcy === 'Yes') {
      checkReq(false, '', 'Has open bankruptcy', '');
    } else {
      checkReq(null, '', '', 'Bankruptcy status not provided');
    }
  }
  
  if (scanData.hasJudgments === 'Yes' && program.noDerogatoryItems) {
    checkReq(false, '', 'Has judgments/liens', '');
  }
  
  // ========================================
  // MONTHLY REVENUE
  // ========================================
  if (program.minMonthlyRevenue !== undefined && program.minMonthlyRevenue > 0) {
    const monthlyRevenue = parseRevenueString(scanData.monthlyRevenue || '');
    
    if (monthlyRevenue > 0) {
      checkReq(
        monthlyRevenue >= program.minMonthlyRevenue,
        `Monthly revenue $${monthlyRevenue.toLocaleString()} meets minimum $${program.minMonthlyRevenue.toLocaleString()}`,
        `Monthly revenue $${monthlyRevenue.toLocaleString()} below minimum $${program.minMonthlyRevenue.toLocaleString()}`,
        ''
      );
    } else {
      checkReq(null, '', '', 'Monthly revenue not provided');
    }
  }
  
  // ========================================
  // TIME IN BUSINESS
  // ========================================
  if (program.minTimeInBusinessMonths !== undefined && program.minTimeInBusinessMonths > 0) {
    if (scanData.startMonth && scanData.startYear) {
      const businessAgeMonths = calculateBusinessAgeMonths(scanData.startMonth, scanData.startYear);
      checkReq(
        businessAgeMonths >= program.minTimeInBusinessMonths,
        `Business age ${businessAgeMonths} months meets minimum ${program.minTimeInBusinessMonths} months`,
        `Business age ${businessAgeMonths} months below minimum ${program.minTimeInBusinessMonths} months`,
        ''
      );
    } else {
      checkReq(null, '', '', 'Business start date not provided');
    }
  }
  
  // ========================================
  // PROPERTY-SPECIFIC CHECKS
  // ========================================
  if (program.requiresPropertyOrConstruction && scanData.ownsInvestmentProperty === 'yes') {
    // DSCR calculation for DSCR Loans
    if (program.programId === 'dscr-loans') {
      const rentalIncome = parseRevenueString(scanData.totalRentalIncome || '');
      const mortgageBalance = parseRevenueString(scanData.totalMortgageBalance || '');
      
      if (rentalIncome > 0 && mortgageBalance > 0) {
        // Rough DSCR calculation (monthly rent / monthly mortgage payment)
        // Assume 4% annual rate, 30-year mortgage for payment estimation
        const estimatedMonthlyPayment = mortgageBalance * 0.00477; // Rough estimate
        const dscr = rentalIncome / estimatedMonthlyPayment;
        
        checkReq(
          dscr >= 1.25,
          `DSCR of ${dscr.toFixed(2)} meets minimum 1.25`,
          `DSCR of ${dscr.toFixed(2)} below minimum 1.25`,
          ''
        );
      } else {
        checkReq(null, '', '', 'Property income/mortgage data needed for DSCR calculation');
        hasUnknownData = true;
      }
    }
    
    // Property value check for Bridge Loans
    if (program.programId === 'bridge-loans') {
      if (scanData.totalPropertyValue) {
        const propertyValue = parseRevenueString(scanData.totalPropertyValue);
        checkReq(
          propertyValue >= 100000,
          `Property value meets minimum`,
          `Property value below minimum`,
          ''
        );
      } else {
        checkReq(null, '', '', 'Property value not provided');
        hasUnknownData = true;
      }
    }
    
    // Construction budget check
    if (program.programId === 'construction-loans' && scanData.planningConstruction === 'yes') {
      if (scanData.constructionBudget) {
        const budget = parseRevenueString(scanData.constructionBudget);
        checkReq(
          budget >= 200000,
          `Construction budget meets minimum $200K`,
          `Construction budget below minimum $200K`,
          ''
        );
      } else {
        checkReq(null, '', '', 'Construction budget not provided');
        hasUnknownData = true;
      }
    }
  }
  
  // ========================================
  // ACCOUNTS RECEIVABLE
  // ========================================
  if (program.requiresAccountsReceivable && program.minAccountsReceivable) {
    const ar = parseRevenueString(scanData.owedToYou || '');
    if (ar > 0) {
      checkReq(
        ar >= program.minAccountsReceivable,
        `Accounts receivable $${ar.toLocaleString()} meets minimum`,
        `Accounts receivable below minimum $${program.minAccountsReceivable.toLocaleString()}`,
        ''
      );
    } else {
      checkReq(null, '', '', 'Accounts receivable not provided');
    }
  }
  
  // ========================================
  // PURCHASE ORDERS
  // ========================================
  if (program.requiresPurchaseOrders) {
    const po = parseRevenueString(scanData.purchaseOrders || '');
    checkReq(
      po > 0,
      'Has purchase orders',
      'Purchase orders required',
      po === 0 ? 'Purchase orders status not provided' : ''
    );
  }
  
  // ========================================
  // EQUIPMENT
  // ========================================
  if (program.requiresEquipmentInvoice) {
    const equipment = parseRevenueString(scanData.equipmentValue || '');
    checkReq(
      equipment > 0,
      'Has equipment',
      'Equipment required',
      equipment === 0 ? 'Equipment value not provided' : ''
    );
  }
  
  // ========================================
  // CALCULATE MATCH SCORE & DETERMINE STATUS
  // ========================================
  const matchScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  
  let status: EligibilityStatus;
  let confidence: 'high' | 'medium' | 'low';
  let reasoning: string;
  
  // Determine status based on results
  if (failed.length > 0) {
    // Has failures - not pre-qualified
    status = 'not-pre-qual';
    confidence = 'high';
    reasoning = `You don't meet these requirements: ${failed.slice(0, 3).join('; ')}${failed.length > 3 ? '...' : ''}`;
  } else if (missing.length > 0 || hasUnknownData) {
    // No failures, but has unknowns - likely qualified
    status = 'likely-qual';
    confidence = 'medium';
    reasoning = `You meet most requirements, but we need to verify: ${missing.slice(0, 3).join('; ')}${missing.length > 3 ? '...' : ''}`;
  } else {
    // All checks passed - pre-qualified!
    status = 'pre-qual';
    confidence = 'high';
    reasoning = `You meet all requirements for this program! ${passed.length} requirements confirmed.`;
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
    reasoning,
    eligible: status === 'pre-qual', // Legacy support
  };
}

/**
 * Check all programs with Phase 1 logic
 */
export function checkAllProgramsEligibilityPhase1(scanData: ScanData): EligibilityResult[] {
  const results = fundingPrograms.map(program => 
    checkProgramEligibilityPhase1(program, scanData)
  );
  
  // Sort by status priority (pre-qual > likely-qual > not-pre-qual > not-applicable), then by match score
  return results.sort((a, b) => {
    const statusOrder = { 'pre-qual': 0, 'likely-qual': 1, 'not-pre-qual': 2, 'not-applicable': 3 };
    const aOrder = statusOrder[a.status];
    const bOrder = statusOrder[b.status];
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    return b.matchScore - a.matchScore;
  });
}

/**
 * Get programs by status
 */
export function getProgramsByStatus(scanData: ScanData, status: EligibilityStatus): EligibilityResult[] {
  return checkAllProgramsEligibilityPhase1(scanData).filter(result => result.status === status);
}

/**
 * Get eligibility summary
 */
export function getEligibilitySummary(scanData: ScanData) {
  const results = checkAllProgramsEligibilityPhase1(scanData);
  
  return {
    preQualified: results.filter(r => r.status === 'pre-qual'),
    likelyQualified: results.filter(r => r.status === 'likely-qual'),
    notPreQualified: results.filter(r => r.status === 'not-pre-qual'),
    notApplicable: results.filter(r => r.status === 'not-applicable'),
    totalPrograms: results.length,
  };
}
