// Centralized funding eligibility storage and retrieval

import { checkAllProgramsEligibility, type ScanData, checkProgramEligibility } from './fundingRequirements';
import { evaluateProducts } from '../pages/business-assessment/productEligibility';
import { computeScore } from '../pages/business-assessment/engine';
import type { UnifiedAnswers } from '../pages/business-assessment/types';

// Map program IDs to their routes
export const programRoutes: { [key: string]: string } = {
  'business-credit-cards': '/access-funding/business-credit-cards',
  'personal-credit-cards': '/access-funding/personal-credit-cards',
  'business-credit-line': '/access-funding/business-credit-line',
  'business-term-loan': '/access-funding/business-term-loan',
  'working-capital-loans': '/access-funding/working-capital-loans',
  'merchant-advance': '/access-funding/merchant-advance',
  'revenue-based-loan': '/access-funding/revenue-based-loan',
  'receivable-factoring': '/access-funding/receivable-factoring',
  'equipment-financing': '/access-funding/equipment-financing',
  'credit-union-loans': '/access-funding/credit-union-loans',
  'sba-business-loan': '/access-funding/sba-business-loan',
  'accounts-receivable-finance': '/access-funding/accounts-receivable-finance',
  'inventory-line-of-credit': '/access-funding/inventory-line-of-credit',
  'purchase-order-finance': '/access-funding/purchase-order-finance',
  'bridge-loans': '/access-funding/bridge-loans',
  'dscr-loans': '/access-funding/dscr-loans',
  'construction-loans': '/access-funding/construction-loans',
  'startup-equipment': '/access-funding/startup-equipment',
  'truck-utility-vehicles': '/access-funding/truck-utility-vehicles',
};

// Store pre-qualified programs in localStorage
export function storePreQualifiedPrograms(programIds: string[]): void {
  localStorage.setItem('preQualifiedPrograms', JSON.stringify(programIds));
  // Dispatch event for sidebar to update
  window.dispatchEvent(new Event('scanDataUpdated'));
}

// ── Canonical product ID → route ID mapping ──────────────────────────────────
// Single source of truth. Results.tsx imports this; do not redeclare elsewhere.
// productEligibility IDs (engine) → fundingEligibility program IDs (routes)
export const PRODUCT_TO_PROGRAM_ID: Record<string, string> = {
  mca:          'merchant-advance',
  term_alt:     'business-term-loan',
  loc_alt:      'business-credit-line',
  sba_7a:       'sba-business-loan',
  sba_express:  'sba-business-loan',
  bank_term:    'business-term-loan',
  bank_loc:     'business-credit-line',
  bcc:          'business-credit-cards',
  bcc_0apr:     'business-credit-cards',
  pgcl:         'personal-credit-cards',
  factoring:    'receivable-factoring',
  equipment:    'equipment-financing',
  po_financing: 'purchase-order-finance',
  cre:          'dscr-loans',
  rbf:          'revenue-based-loan',
  inventory:    'inventory-line-of-credit',
  acquisition:  'bridge-loans',
};

// Derive pre-qualified route IDs from unified_assessment using the canonical
// evaluateProducts() engine. Fallback for users who skipped the Results page.
function deriveFromUnifiedAssessment(): string[] {
  try {
    const raw = localStorage.getItem('unified_assessment');
    if (!raw) return [];
    const data = JSON.parse(raw) as UnifiedAnswers;
    const { score } = computeScore(data);
    const eligible = evaluateProducts(data, score).filter(p => p.qualifies);
    return [...new Set(eligible.map(p => PRODUCT_TO_PROGRAM_ID[p.id]).filter(Boolean))];
  } catch {
    return [];
  }
}

// Get pre-qualified programs from localStorage.
// Falls back to deriving from unified_assessment (new system) when key is absent.
export function getPreQualifiedPrograms(): string[] {
  const stored = localStorage.getItem('preQualifiedPrograms');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* fall through */ }
  }
  // Derive from unified_assessment and cache for this session
  const derived = deriveFromUnifiedAssessment();
  if (derived.length > 0) {
    try { localStorage.setItem('preQualifiedPrograms', JSON.stringify(derived)); } catch { /* ignore */ }
  }
  return derived;
}

// Check if a specific program is pre-qualified
export function isProgramPreQualified(programId: string): boolean {
  const preQualified = getPreQualifiedPrograms();
  return preQualified.includes(programId);
}

// Get program route by ID
export function getProgramRoute(programId: string): string {
  return programRoutes[programId] || '/access-funding';
}

// Calculate and store eligibility from scan data
export function calculateAndStoreEligibility(scanData: ScanData): void {
  const results = checkAllProgramsEligibility(scanData);
  const eligible = results.filter(r => r.eligible).map(r => r.programId);
  storePreQualifiedPrograms(eligible);
}

// Get full eligibility for a program path (used by sidebar)
export function isProgramPathPreQualified(path: string): boolean {
  const preQualified = getPreQualifiedPrograms();
  
  // Find matching program ID from path
  for (const [programId, route] of Object.entries(programRoutes)) {
    if (route === path) {
      return preQualified.includes(programId);
    }
  }
  
  return false;
}

// Clear pre-qualified data (for testing/reset)
export function clearPreQualifiedPrograms(): void {
  localStorage.removeItem('preQualifiedPrograms');
  window.dispatchEvent(new Event('scanDataUpdated'));
}

// ── Context-aware filtering: loan amount, purpose, ineligible biz type ──────

// Which loan purposes each product is best suited for
const PROGRAM_PURPOSE_FIT: Record<string, string[]> = {
  'working-capital-loans':        ['working_capital', 'payroll'],
  'merchant-advance':             ['working_capital', 'payroll', 'expansion'],
  'revenue-based-loan':           ['working_capital', 'expansion', 'payroll'],
  'business-credit-line':         ['working_capital', 'payroll', 'expansion'],
  'business-credit-cards':        ['working_capital', 'equipment', 'expansion'],
  'personal-credit-cards':        ['working_capital', 'equipment'],
  'equipment-financing':          ['equipment'],
  'startup-equipment':            ['equipment'],
  'truck-utility-vehicles':       ['equipment', 'expansion'],
  'construction-loans':           ['real_estate', 'expansion'],
  'dscr-loans':                   ['real_estate'],
  'bridge-loans':                 ['real_estate', 'acquisition'],
  'sba-business-loan':            ['real_estate', 'expansion', 'acquisition', 'working_capital', 'equipment'],
  'business-term-loan':           ['expansion', 'equipment', 'acquisition', 'working_capital'],
  'credit-union-loans':           ['working_capital', 'expansion', 'equipment'],
  'receivable-factoring':         ['working_capital', 'payroll'],
  'accounts-receivable-finance':  ['working_capital', 'payroll'],
  'purchase-order-finance':       ['working_capital', 'expansion'],
  'inventory-line-of-credit':     ['working_capital', 'expansion'],
};

// Max funding each product can reach
const PROGRAM_MAX_AMOUNT: Record<string, number> = {
  'working-capital-loans': 500000,
  'merchant-advance': 500000,
  'revenue-based-loan': 500000,
  'business-credit-line': 250000,
  'business-credit-cards': 100000,
  'personal-credit-cards': 50000,
  'equipment-financing': 5000000,
  'startup-equipment': 150000,
  'truck-utility-vehicles': 500000,
  'construction-loans': 10000000,
  'dscr-loans': 10000000,
  'bridge-loans': 10000000,
  'sba-business-loan': 5000000,
  'business-term-loan': 500000,
  'credit-union-loans': 500000,
  'receivable-factoring': 5000000,
  'accounts-receivable-finance': 1000000,
  'purchase-order-finance': 1000000,
  'inventory-line-of-credit': 500000,
};

const SBA_PRODUCTS = ['sba-business-loan'];

const AMOUNT_MIN_MAP: Record<string, number> = {
  under_25k: 0, '25k_100k': 25000, '100k_250k': 100000,
  '250k_500k': 250000, '500k_1m': 500000, over_1m: 1000000,
};

/**
 * Apply loan amount, purpose, and ineligibility filters to an eligible program list.
 * Returns filtered list + purpose-matched subset (for UI highlighting).
 */
export function applyContextFilters(
  eligibleIds: string[],
  loanAmount: string,
  loanPurpose: string,
  isIneligibleBizType: boolean
): { filtered: string[]; purposeMatches: string[] } {
  let filtered = [...eligibleIds];

  // Remove SBA if ineligible biz type
  if (isIneligibleBizType) {
    filtered = filtered.filter(id => !SBA_PRODUCTS.includes(id));
  }

  // Remove products that can't reach the requested minimum amount
  const requestedMin = loanAmount ? (AMOUNT_MIN_MAP[loanAmount] ?? 0) : 0;
  if (requestedMin > 0) {
    filtered = filtered.filter(id => (PROGRAM_MAX_AMOUNT[id] ?? 0) >= requestedMin);
  }

  // Identify purpose-matched products (surface first in UI)
  const purposeMatches = loanPurpose
    ? filtered.filter(id => (PROGRAM_PURPOSE_FIT[id] ?? []).includes(loanPurpose))
    : [];

  return { filtered, purposeMatches };
}

/** Persist purpose matches so Access Funding and Dashboard can surface them */
export function storePurposeMatches(ids: string[]): void {
  localStorage.setItem('purposeMatchPrograms', JSON.stringify(ids));
}

export function getPurposeMatches(): string[] {
  try { return JSON.parse(localStorage.getItem('purposeMatchPrograms') || '[]'); }
  catch { return []; }
}

// Get all funding programs with their pre-qualified status
export function getFundingPrograms() {
  const preQualified = getPreQualifiedPrograms();
  
  // Try to get scan data for gap analysis
  let scanData: ScanData | null = null;
  try {
    const step1 = localStorage.getItem('scanStep1');
    const step2 = localStorage.getItem('scanStep2');
    const step3 = localStorage.getItem('scanStep3');
    
    if (step1 && step2 && step3) {
      const s1 = JSON.parse(step1);
      const s2 = JSON.parse(step2);
      const s3 = JSON.parse(step3);
      
      scanData = {
        hasEIN: s1.hasEIN,
        einNumber: s1.einNumber,
        startMonth: s2.startMonth,
        startYear: s2.startYear,
        monthlyRevenue: s2.monthlyRevenue,
        creditCardSales: s2.creditCardSales,
        owedToYou: s2.owedToYou,
        purchaseOrders: s2.purchaseOrders,
        inventory: s2.inventory,
        property: s2.property,
        creditScore: s3.creditScore,
        businessBankAccount: s2.businessBankAccount,
        openBankruptcies: s3.openBankruptcies,
        recentInquiries: s3.recentInquiries,
        newAccounts: s3.newAccounts,
        latePayments: s3.latePayments,
        collections: s3.collections,
      };
    }
  } catch (error) {
    console.error('Error loading scan data for gap analysis:', error);
  }
  
  const allPrograms = [
    {
      id: 'business-credit-cards',
      name: 'Syndicated Line of Credit (SLOC)',
      type: 'Credit Line',
      amount: '$25K-$150K',
      description: 'Multiple credit cards per owner, 0% interest periods, builds business credit',
      requirements: 'Personal FICO 8 scores 700+',
      rate: '0% APR (promotional)',
      term: 'Revolving',
      fundingSpeed: '7-14 days',
      status: preQualified.includes('business-credit-cards') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'business-credit-cards', programName: 'Syndicated Line of Credit (SLOC)', path: '/access-funding/business-credit-cards', minCreditScore: 680, minMonthlyRevenue: 0, minTimeInBusinessMonths: 0, requiresEIN: false, requiresBusinessBankAccount: false, noDerogatoryItems: true, maxInquiries: 4, maxInquiriesPeriodDays: 30 },
        scanData
      ) : null
    },
    {
      id: 'personal-credit-cards',
      name: 'Personal Credit Cards',
      type: 'Credit Line',
      amount: 'Varies',
      description: 'Personal credit cards for business use, additional capital source',
      requirements: 'FICO 8 scores 700+, personal income $75k+, no judgments/liens',
      rate: 'Varies',
      term: 'Revolving',
      fundingSpeed: '7-14 days',
      status: preQualified.includes('personal-credit-cards') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'personal-credit-cards', programName: 'Personal Credit Cards', path: '/access-funding/personal-credit-cards', minCreditScore: 650, minMonthlyRevenue: 0, minTimeInBusinessMonths: 0, requiresEIN: false, noDerogatoryItems: true, maxInquiries: 4, maxInquiriesPeriodDays: 730, noNewAccountsMonths: 6 },
        scanData
      ) : null
    },
    {
      id: 'business-credit-line',
      name: 'Business Credit Line',
      type: 'Line of Credit',
      amount: 'Up to $750K',
      description: 'Revolving credit line, cash flow based approvals, same-day funding available',
      requirements: 'FICO 600+, 1 year in business, $500K annual sales or $40K monthly deposits',
      rate: '8-25%',
      term: 'Revolving',
      fundingSpeed: '1-3 days',
      status: preQualified.includes('business-credit-line') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'business-credit-line', programName: 'Business Credit Line', path: '/access-funding/business-credit-line', minCreditScore: 600, minMonthlyRevenue: 40000, minAnnualRevenue: 500000, minTimeInBusinessMonths: 12, requiresBusinessBankAccount: true, allowsPersonalBankAccountForSoleProps: false },
        scanData
      ) : null
    },
    {
      id: 'business-term-loan',
      name: 'Business Term Loan',
      type: 'Term Loan',
      amount: 'Up to $10M',
      description: '1-2 year terms, no prepayment penalty, refinance options',
      requirements: 'FICO 600+, 2 years in business, $500K annual sales or $40K monthly deposits',
      rate: '8-30%',
      term: '1-2 years',
      fundingSpeed: '2-5 days',
      status: preQualified.includes('business-term-loan') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'business-term-loan', programName: 'Business Term Loan', path: '/access-funding/business-term-loan', minCreditScore: 600, minMonthlyRevenue: 40000, minAnnualRevenue: 500000, minTimeInBusinessMonths: 24, requiresBusinessBankAccount: true, allowsPersonalBankAccountForSoleProps: false },
        scanData
      ) : null
    },
    {
      id: 'working-capital-loans',
      name: 'Working Capital Loans',
      type: 'Term Loan',
      amount: 'Up to $10M',
      description: 'Cash flow based approvals, same-day funding available, flexible payment options',
      requirements: '$10k+ monthly cash flow deposits, 6+ months in business',
      rate: '10-35%',
      term: '3-18 months',
      fundingSpeed: '24-48 hours',
      status: preQualified.includes('working-capital-loans') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'working-capital-loans', programName: 'Working Capital Loans', path: '/access-funding/working-capital-loans', minCreditScore: 0, minMonthlyRevenue: 10000, minTimeInBusinessMonths: 6, requiresBusinessBankAccount: true, allowsPersonalBankAccountForSoleProps: false },
        scanData
      ) : null
    },
    {
      id: 'merchant-advance',
      name: 'Merchant Cash Advance',
      type: 'Cash Advance',
      amount: 'Up to $500K',
      description: 'Approvals within hours, funding within 24-48 hours, same-day possible, no credit check, no collateral',
      requirements: '$10k+ monthly revenue, 3-6+ months in business (NO credit required)',
      rate: 'Factor rate 1.1-1.5',
      term: '3-12 months',
      fundingSpeed: '24-48 hours',
      status: preQualified.includes('merchant-advance') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'merchant-advance', programName: 'Merchant Advance', path: '/access-funding/merchant-advance', minCreditScore: 0, minMonthlyRevenue: 10000, minTimeInBusinessMonths: 3, noOpenBankruptcies: true, requiresBusinessBankAccount: true },
        scanData
      ) : null
    },
    {
      id: 'revenue-based-loan',
      name: 'Revenue Based Loan',
      type: 'Revenue Financing',
      amount: '10% of annualized revenue',
      description: 'Based on revenue, 48-72 hour approval, repaid as % of revenue',
      requirements: '$15k+ monthly revenue, 6+ months in business, 550+ FICO score',
      rate: '15-35%',
      term: '6-18 months',
      fundingSpeed: '2-3 days',
      status: preQualified.includes('revenue-based-loan') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'revenue-based-loan', programName: 'Revenue Based Loan', path: '/access-funding/revenue-based-loan', minCreditScore: 600, minMonthlyRevenue: 15000, minTimeInBusinessMonths: 6, requiresBusinessBankAccount: true, allowsPersonalBankAccountForSoleProps: false },
        scanData
      ) : null
    },
    {
      id: 'receivable-factoring',
      name: 'Invoice Factoring',
      type: 'Factoring',
      amount: 'Up to 90% of invoices',
      description: 'Based on customer credit, immediate cash, frees working capital',
      requirements: 'Has outstanding invoices/receivables (NO owner credit required)',
      rate: '1-5% per month',
      term: 'Per invoice',
      fundingSpeed: '24-48 hours',
      status: preQualified.includes('receivable-factoring') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'receivable-factoring', programName: 'Receivable Factoring', path: '/access-funding/receivable-factoring', minCreditScore: 0, minMonthlyRevenue: 10000, minTimeInBusinessMonths: 3, requiresAccountsReceivable: true, minAccountsReceivable: 10000, requiresBusinessBankAccount: true },
        scanData
      ) : null
    },
    {
      id: 'equipment-financing',
      name: 'Equipment Financing',
      type: 'Equipment Loan',
      amount: 'Up to 100% of equipment value',
      description: 'Low down payment, fast approval, builds business credit',
      requirements: 'Has equipment value (very lenient, no specific credit requirement)',
      rate: '5-30%',
      term: '2-7 years',
      fundingSpeed: '3-7 days',
      status: preQualified.includes('equipment-financing') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'equipment-financing', programName: 'Equipment Financing', path: '/access-funding/equipment-financing', minCreditScore: 550, minMonthlyRevenue: 25000, minTimeInBusinessMonths: 12, requiresEquipmentInvoice: true, requiresBusinessBankAccount: true, allowsPersonalBankAccountForSoleProps: false },
        scanData
      ) : null
    },
    {
      id: 'credit-union-loans',
      name: 'Credit Union Loans',
      type: 'Personal Loan',
      amount: '$5K-$75K',
      description: 'Signature loans, lower credit requirements',
      requirements: 'FICO 8 scores 680+',
      rate: '6-18%',
      term: '1-7 years',
      fundingSpeed: '3-10 days',
      status: preQualified.includes('credit-union-loans') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'credit-union-loans', programName: 'Credit Union Loans', path: '/access-funding/credit-union-loans', minCreditScore: 600, minMonthlyRevenue: 0, minTimeInBusinessMonths: 6, requiresMembership: true, debtToIncomeMax: 50 },
        scanData
      ) : null
    },
    {
      id: 'sba-business-loan',
      name: 'SBA Loans: 7a & 504',
      type: 'SBA Loan',
      amount: 'Up to $5M',
      description: 'Low interest rates, generous terms, no prepayment penalty, government backed',
      requirements: 'FICO SBSS score of 160 or higher (BUSINESS credit score)',
      rate: '5-11%',
      term: '5-25 years',
      fundingSpeed: '30-90 days',
      status: preQualified.includes('sba-business-loan') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'sba-business-loan', programName: 'SBA Loans: 7a & 504', path: '/access-funding/sba-business-loan', minCreditScore: 680, minMonthlyRevenue: 0, minTimeInBusinessMonths: 24, requiresBusinessBankAccount: true, requiresEIN: true },
        scanData
      ) : null
    },
    {
      id: 'accounts-receivable-finance',
      name: 'Accounts Receivable Finance',
      type: 'AR Financing',
      amount: 'Up to 95% of receivables',
      description: 'Revolving line of credit secured by outstanding receivables, up to 95% financing, facility size $100K to $100M',
      requirements: 'Has $100K+ to $250K+ in accounts receivable and $1M+ annual revenue, 1+ year in business',
      rate: '1-3% per month',
      term: 'Revolving',
      fundingSpeed: '5-10 days',
      status: preQualified.includes('accounts-receivable-finance') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'accounts-receivable-finance', programName: 'Accounts Receivable Finance', path: '/access-funding/accounts-receivable-finance', minCreditScore: 0, minMonthlyRevenue: 10000, minTimeInBusinessMonths: 3, requiresAccountsReceivable: true, minAccountsReceivable: 10000, requiresBusinessBankAccount: true },
        scanData
      ) : null
    },
    {
      id: 'inventory-line-of-credit',
      name: 'Inventory Line of Credit',
      type: 'Inventory Financing',
      amount: 'Up to 85% of inventory value',
      description: 'Revolving credit facility secured by inventory, up to 85% financing of inventory liquidation value',
      requirements: 'Has $1M+ in current inventory and $1M+ annual revenue, 1+ year in business',
      rate: '8-20%',
      term: 'Revolving',
      fundingSpeed: '7-14 days',
      status: preQualified.includes('inventory-line-of-credit') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'inventory-line-of-credit', programName: 'Inventory Line of Credit', path: '/access-funding/inventory-line-of-credit', minCreditScore: 650, minMonthlyRevenue: 50000, minTimeInBusinessMonths: 12, requiresInventory: true, requiresBusinessBankAccount: true, requiresEIN: true },
        scanData
      ) : null
    },
    {
      id: 'purchase-order-finance',
      name: 'Purchase Order Finance',
      type: 'PO Financing',
      amount: '$100K to $10M+',
      description: 'Short-term funding to cover supplier or production costs for verified purchase orders, funding range $100K to $10M+, 7-14 days funding speed',
      requirements: 'Minimum 640 FICO scores',
      rate: '1.5-6% per transaction',
      term: 'Per order',
      fundingSpeed: '7-14 days',
      status: preQualified.includes('purchase-order-finance') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'purchase-order-finance', programName: 'Purchase Order Finance', path: '/access-funding/purchase-order-finance', minCreditScore: 600, minMonthlyRevenue: 0, minTimeInBusinessMonths: 6, requiresPurchaseOrders: true, requiresBusinessBankAccount: true },
        scanData
      ) : null
    },
    {
      id: 'bridge-loans',
      name: 'Bridge Loans (Investment Properties)',
      type: 'Bridge Loan',
      amount: '$100K to $3M',
      description: 'Short-term financing for investment property transactions, $100K to $3M loan amounts, 3 to 5 days to close, interest-only payments',
      requirements: 'Minimum 640 FICO scores',
      rate: '8-15%',
      term: '6-24 months',
      fundingSpeed: '3-5 days',
      status: preQualified.includes('bridge-loans') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'bridge-loans', programName: 'Bridge Loans', path: '/access-funding/bridge-loans', minCreditScore: 650, minMonthlyRevenue: 0, minTimeInBusinessMonths: 0, requiresPropertyOrConstruction: true, requiresBusinessBankAccount: true },
        scanData
      ) : null
    },
    {
      id: 'dscr-loans',
      name: 'DSCR Loans',
      type: 'Real Estate Loan',
      amount: '$100K to $1.5M',
      description: 'Rental property financing underwritten based on DSCR metrics, $100K to $1.5M loan amounts, supports 2 to 50 portfolios, up to 80% LTV',
      requirements: 'Minimum 660 FICO scores',
      rate: '7-12%',
      term: '15-30 years',
      fundingSpeed: '14-30 days',
      status: preQualified.includes('dscr-loans') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'dscr-loans', programName: 'DSCR Loans', path: '/access-funding/dscr-loans', minCreditScore: 620, minMonthlyRevenue: 0, minTimeInBusinessMonths: 0, requiresPropertyOrConstruction: true, requiresBusinessBankAccount: true },
        scanData
      ) : null
    },
    {
      id: 'construction-loans',
      name: 'Construction Loans',
      type: 'Construction Financing',
      amount: '$200K to $2.5M',
      description: 'Short-term construction financing for infill projects, $200K to $2.5M loan amounts, 12-24 month terms, interest-only payments',
      requirements: 'Minimum 660 FICO scores',
      rate: '8-14%',
      term: '12-24 months',
      fundingSpeed: '14-30 days',
      status: preQualified.includes('construction-loans') ? 'pre-qualified' : 'not-qualified',
      gapAnalysis: scanData ? checkProgramEligibility(
        { programId: 'construction-loans', programName: 'Construction Loans', path: '/access-funding/construction-loans', minCreditScore: 680, minMonthlyRevenue: 0, minTimeInBusinessMonths: 12, requiresPropertyOrConstruction: true, requiresBusinessBankAccount: true, requiresEIN: true },
        scanData
      ) : null
    }
  ];
  
  return allPrograms;
}

// Calculate total pre-qualified funding amount
export function getTotalPreQualifiedAmount(): number {
  const programs = getFundingPrograms();
  const preQualifiedPrograms = programs.filter(p => p.status === 'pre-qualified');
  
  // Calculate estimated total (using midpoint of ranges or stated amounts)
  let total = 0;
  
  preQualifiedPrograms.forEach(program => {
    const amount = program.amount;
    
    // Parse different amount formats
    if (amount.includes('-')) {
      // Range format like "$25K-$150K"
      const parts = amount.split('-');
      const high = parts[1].replace(/[^0-9.]/g, '');
      if (high.includes('K')) {
        total += parseFloat(high) * 1000;
      } else if (high.includes('M')) {
        total += parseFloat(high) * 1000000;
      }
    } else if (amount.includes('Up to')) {
      // "Up to $XXX" format
      const parsed = amount.replace(/[^0-9.]/g, '');
      if (amount.includes('K')) {
        total += parseFloat(parsed) * 1000;
      } else if (amount.includes('M')) {
        total += parseFloat(parsed) * 1000000;
      }
    } else if (amount.includes('%')) {
      // Percentage based - estimate $50K average
      total += 50000;
    } else {
      // Try to parse as number
      const parsed = amount.replace(/[^0-9.]/g, '');
      if (parsed && amount.includes('K')) {
        total += parseFloat(parsed) * 1000;
      } else if (parsed && amount.includes('M')) {
        total += parseFloat(parsed) * 1000000;
      }
    }
  });
  
  return total;
}