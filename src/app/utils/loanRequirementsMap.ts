// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Loan Requirements Map
// Elon: one truth function drives Apply button, requirements display, gap analysis
// Chase: "X of Y complete" creates completion pull; locked = clear goal not punishment
// ════════════════════════════════════════════════════════════════════════════════

export type RequirementSeverity = 'required' | 'recommended';

export interface HardRequirement {
  type: 'hard';
  id: string;
  label: string;
  description: string;
  severity: RequirementSeverity;
  checkFn: (assessment: Record<string, any>) => boolean;
  fixPath?: string; // where to go to fix this
  fixLabel?: string;
}

export interface ComplianceRequirement {
  type: 'compliance';
  id: string; // compliance module id
  label: string;
  description: string;
  severity: RequirementSeverity;
  fixPath: string;
  fixLabel: string;
}

export type LoanRequirement = HardRequirement | ComplianceRequirement;

export interface ApplyReadiness {
  canApply: boolean;           // ALL required items met
  score: number;               // 0–100: % of all (required+recommended) met
  requiredScore: number;       // 0–100: % of required-only items met
  totalRequired: number;
  metRequired: number;
  totalRecommended: number;
  metRecommended: number;
  metRequirements: LoanRequirement[];
  missingRequired: LoanRequirement[];
  missingRecommended: LoanRequirement[];
  nextStep: string;            // The single most important next action
  nextStepPath: string;
}

// ── Compliance module labels (for display) ────────────────────────────────────
const MODULE_META: Record<string, { label: string; description: string }> = {
  'entity-filings':    { label: 'Entity & Filings',    description: 'Business entity established and state filings current' },
  'business-location': { label: 'Business Location',   description: 'Verified business address meeting lender requirements' },
  'phones-411':        { label: 'Phones & 411',         description: 'Business phone lines and directory listings active' },
  'website-email':     { label: 'Website & Email',      description: 'Professional domain and business email address' },
  'ein-licenses':      { label: 'EIN & Licenses',       description: 'EIN obtained and all required licenses in place' },
  'business-banking':  { label: 'Business Banking',     description: 'Dedicated business bank account established' },
  'agencies-naics':    { label: 'Agencies & NAICS',     description: 'Registered with credit agencies and NAICS classified' },
  'business-plan':     { label: 'Business Plan',        description: 'Comprehensive business plan for lender review' },
  'assets-ucc':        { label: 'Assets & UCC Data',    description: 'Business assets documented and UCC filings current' },
  'corp-only-facts':   { label: 'Corp Requirements',    description: 'Corporate-specific compliance requirements met' },
  'bank-rating':       { label: 'Bank Rating',          description: 'Business bank account rating established' },
  'comparable-credit': { label: 'Comparable Credit',    description: 'Credit profile benchmarked against industry standards' },
  'cd-business-loan':  { label: 'CD-Secured Loan',      description: 'CD-secured loan option established' },
};

function complianceReq(id: string, severity: RequirementSeverity): ComplianceRequirement {
  const meta = MODULE_META[id];
  return {
    type: 'compliance',
    id,
    label: meta.label,
    description: meta.description,
    severity,
    fixPath: '/app/lender-compliance',
    fixLabel: 'Complete in Compliance',
  };
}

// ── Hard requirement builders ─────────────────────────────────────────────────
function creditReq(min: number, severity: RequirementSeverity = 'required'): HardRequirement {
  return {
    type: 'hard', id: `credit-${min}`, severity,
    label: `${min}+ FICO Credit Score`,
    description: `Personal credit score of ${min} or higher required`,
    checkFn: (a) => (a.personalCreditScore || 0) >= min,
    fixPath: '/app/lender-compliance',
    fixLabel: 'View Credit Tips',
  };
}

function revenueReq(monthly: number, severity: RequirementSeverity = 'required'): HardRequirement {
  const annual = monthly * 12;
  const label = annual >= 1_000_000 ? `$${annual/1_000_000}M` : `$${annual/1_000}K`;
  return {
    type: 'hard', id: `revenue-${monthly}`, severity,
    label: `${label} Annual Revenue`,
    description: `Minimum $${(monthly).toLocaleString()}/month in gross revenue`,
    checkFn: (a) => (a.monthlyRevenue || 0) >= monthly,
    fixPath: '/app/finances',
    fixLabel: 'Update Financials',
  };
}

function timeReq(months: number, severity: RequirementSeverity = 'required'): HardRequirement {
  const label = months >= 24 ? `${months/12} years` : `${months} months`;
  return {
    type: 'hard', id: `time-${months}`, severity,
    label: `${label} in Business`,
    description: `Business must be operating for at least ${label}`,
    checkFn: (a) => {
      const tib = a.timeInBusiness || a.yearsInBusiness || 0;
      // Could be months (number) or years (decimal)
      const asMonths = tib < 30 ? tib * 12 : tib; // if < 30, treat as years
      return asMonths >= months;
    },
    fixPath: '/business-assessment',
    fixLabel: 'Update Assessment',
  };
}

function bankAccountReq(severity: RequirementSeverity = 'required'): HardRequirement {
  return {
    type: 'hard', id: 'business-bank-account', severity,
    label: 'Business Bank Account',
    description: 'Active business checking account required',
    checkFn: (a) => !!(a.hasBusinessBankAccount || a.businessBankAccount),
    fixPath: '/app/lender-compliance',
    fixLabel: 'Business Banking Module',
  };
}

function einReq(severity: RequirementSeverity = 'required'): HardRequirement {
  return {
    type: 'hard', id: 'ein', severity,
    label: 'EIN Registered',
    description: 'Federal Employer Identification Number required',
    checkFn: (a) => !!(a.hasEIN || a.ein || a.taxId),
    fixPath: '/app/lender-compliance',
    fixLabel: 'EIN & Licenses Module',
  };
}

// ── Loan requirements map ─────────────────────────────────────────────────────
export const LOAN_REQUIREMENTS: Record<string, LoanRequirement[]> = {

  'business-credit-line': [
    creditReq(600),
    revenueReq(40000),
    timeReq(12),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('business-location', 'recommended'),
    complianceReq('website-email', 'recommended'),
  ],

  'business-credit-cards': [
    creditReq(680),
    einReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('business-banking', 'recommended'),
    complianceReq('business-location', 'recommended'),
  ],

  'personal-credit-cards': [
    creditReq(670),
    complianceReq('ein-licenses', 'recommended'),
  ],

  'business-term-loan': [
    creditReq(640),
    revenueReq(20000),
    timeReq(12),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('business-plan', 'required'),
    complianceReq('business-location', 'recommended'),
    complianceReq('agencies-naics', 'recommended'),
  ],

  'working-capital-loans': [
    creditReq(600),
    revenueReq(15000),
    timeReq(6),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'recommended'),
    complianceReq('business-location', 'recommended'),
  ],

  'merchant-advance': [
    creditReq(500),
    revenueReq(10000),
    timeReq(3),
    bankAccountReq(),
    complianceReq('business-banking', 'required'),
    complianceReq('entity-filings', 'recommended'),
  ],

  'revenue-based-loan': [
    creditReq(600),
    revenueReq(15000),
    timeReq(6),
    bankAccountReq(),
    complianceReq('business-banking', 'required'),
    complianceReq('entity-filings', 'recommended'),
    complianceReq('agencies-naics', 'recommended'),
  ],

  'receivable-factoring': [
    revenueReq(10000),
    timeReq(3),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('agencies-naics', 'required'),
    complianceReq('ein-licenses', 'recommended'),
  ],

  'equipment-financing': [
    creditReq(600),
    timeReq(12),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'recommended'),
    complianceReq('assets-ucc', 'recommended'),
  ],

  'credit-union-loans': [
    creditReq(650),
    revenueReq(5000),
    timeReq(12),
    bankAccountReq(),
    einReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('bank-rating', 'recommended'),
    complianceReq('comparable-credit', 'recommended'),
  ],

  'sba-business-loan': [
    creditReq(680),
    revenueReq(0),
    timeReq(24),
    bankAccountReq(),
    einReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('business-location', 'required'),
    complianceReq('phones-411', 'required'),
    complianceReq('website-email', 'required'),
    complianceReq('business-plan', 'required'),
    complianceReq('agencies-naics', 'recommended'),
    complianceReq('assets-ucc', 'recommended'),
  ],

  'accounts-receivable-finance': [
    revenueReq(15000),
    timeReq(6),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('agencies-naics', 'required'),
    complianceReq('ein-licenses', 'recommended'),
  ],

  'inventory-line-of-credit': [
    creditReq(600),
    revenueReq(20000),
    timeReq(12),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('agencies-naics', 'recommended'),
    complianceReq('assets-ucc', 'recommended'),
  ],

  'purchase-order-finance': [
    revenueReq(10000),
    timeReq(6),
    bankAccountReq(),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('business-plan', 'required'),
    complianceReq('agencies-naics', 'recommended'),
  ],

  'bridge-loans': [
    creditReq(640),
    timeReq(12),
    complianceReq('entity-filings', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('assets-ucc', 'required'),
    complianceReq('business-banking', 'recommended'),
    complianceReq('business-plan', 'recommended'),
  ],

  'dscr-loans': [
    creditReq(660),
    revenueReq(8000),
    timeReq(24),
    complianceReq('entity-filings', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('assets-ucc', 'required'),
    complianceReq('business-plan', 'recommended'),
    complianceReq('comparable-credit', 'recommended'),
  ],

  'construction-loans': [
    creditReq(660),
    revenueReq(10000),
    timeReq(24),
    complianceReq('entity-filings', 'required'),
    complianceReq('ein-licenses', 'required'),
    complianceReq('business-plan', 'required'),
    complianceReq('assets-ucc', 'recommended'),
    complianceReq('agencies-naics', 'recommended'),
  ],

  'startup-equipment': [
    creditReq(580),
    revenueReq(10000),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'recommended'),
    complianceReq('assets-ucc', 'recommended'),
  ],

  'truck-utility-vehicles': [
    creditReq(550),
    revenueReq(3000),
    timeReq(6),
    complianceReq('entity-filings', 'required'),
    complianceReq('business-banking', 'required'),
    complianceReq('ein-licenses', 'recommended'),
    complianceReq('assets-ucc', 'recommended'),
  ],
};

// ── Core eligibility engine ───────────────────────────────────────────────────
export function getApplyReadiness(
  loanId: string,
  assessment: Record<string, any>,
  complianceProgress: Record<string, { completed: boolean }>
): ApplyReadiness {
  const requirements = LOAN_REQUIREMENTS[loanId] ?? [];

  const met: LoanRequirement[] = [];
  const missingRequired: LoanRequirement[] = [];
  const missingRecommended: LoanRequirement[] = [];

  for (const req of requirements) {
    const isMet = req.type === 'hard'
      ? req.checkFn(assessment)
      : !!(complianceProgress[req.id]?.completed);

    if (isMet) {
      met.push(req);
    } else if (req.severity === 'required') {
      missingRequired.push(req);
    } else {
      missingRecommended.push(req);
    }
  }

  const totalRequired = requirements.filter(r => r.severity === 'required').length;
  const metRequired = totalRequired - missingRequired.length;
  const totalRecommended = requirements.filter(r => r.severity === 'recommended').length;
  const metRecommended = totalRecommended - missingRecommended.length;
  const total = requirements.length;
  const score = total > 0 ? Math.round((met.length / total) * 100) : 100;
  const requiredScore = totalRequired > 0 ? Math.round((metRequired / totalRequired) * 100) : 100;
  const canApply = missingRequired.length === 0;

  // Determine the single best next step
  let nextStep = 'Complete your business assessment';
  let nextStepPath = '/business-assessment';

  const firstMissingRequired = missingRequired[0];
  if (firstMissingRequired) {
    nextStep = `Complete: ${firstMissingRequired.label}`;
    nextStepPath = firstMissingRequired.type === 'compliance'
      ? firstMissingRequired.fixPath
      : (firstMissingRequired.fixPath ?? '/business-assessment');
  } else if (missingRecommended.length > 0) {
    nextStep = `Boost odds: ${missingRecommended[0].label}`;
    nextStepPath = missingRecommended[0].type === 'compliance'
      ? missingRecommended[0].fixPath
      : (missingRecommended[0].fixPath ?? '/app/lender-compliance');
  }

  return {
    canApply,
    score,
    requiredScore,
    totalRequired,
    metRequired,
    totalRecommended,
    metRecommended,
    metRequirements: met,
    missingRequired,
    missingRecommended,
    nextStep,
    nextStepPath,
  };
}

// ── Which loans does completing a compliance module unlock? ───────────────────
export function getLoansUnlockedByModule(moduleId: string): string[] {
  return Object.entries(LOAN_REQUIREMENTS)
    .filter(([, reqs]) =>
      reqs.some(r => r.type === 'compliance' && r.id === moduleId && r.severity === 'required')
    )
    .map(([loanId]) => loanId);
}
