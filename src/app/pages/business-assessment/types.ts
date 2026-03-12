// ════════════════════════════════════════════════════════════════════════════════
// UNIFIED ASSESSMENT DATA MODEL
// Single source of truth — 24 questions, zero duplicates
// ════════════════════════════════════════════════════════════════════════════════

export interface UnifiedAnswers {
  // ──────────────────────────────────────────────────────────────────────────────
  // FOUNDATION QUESTIONS (Q_F1–Q_F11)
  // ──────────────────────────────────────────────────────────────────────────────

  // Q_F1: Owner Contact Info
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;

  // Q_F2: Business Name + Entity Type
  businessName: string;
  entityType: 'sole_prop' | 'llc_single' | 'llc_multi' | 'corp' | '';
  
  // Q_F3: Start Date & Industry
  startDate: { month: number; year: number };
  industry: string;
  
  // Q_F4: EIN & Website
  hasEIN: boolean;
  einNumber?: string;
  hasWebsite: boolean;
  websiteUrl?: string;
  
  // Q_F5: Revenue & CC Sales
  monthlyRevenue: number;
  ccSales: number;
  
  // Q_F6: Banking (3 sub-fields)
  bankAccount: 'dedicated' | 'personal' | 'none' | '';
  bankAge: '0_6mo' | '6_12mo' | '12_24mo' | '24plus' | '';
  avgDailyBalance: 'near_zero' | '500_2k' | '2k_10k' | '10k_25k' | '25k_plus' | '';
  
  // Q_F7: NSFs & Assets
  nsfCount: 'zero' | '1_2' | '3_5' | 'over_5' | '';
  arBalance: number;
  equipmentValue: number;
  poBalance: number;
  ownsProperty: 'yes' | 'no' | 'planning' | '';
  propertyData?: {
    count: number;
    value: number;
    mortgage: number;
    rentalIncome: number;
  };
  constructionPlan: 'yes' | 'no' | 'later' | '';
  constructionBudget?: number;
  
  // Q_F8: Personal Credit (3 bureaus)
  experian: number;
  transunion: number;
  equifax: number;
  
  // Q_F9: Utilization & Income
  utilization: number;
  personalIncome: 'under_35k' | '35_75k' | '75_125k' | '125_250k' | 'over_250k' | '';
  
  // Q_F10: Bankruptcy & Derogatories
  hasBankruptcy: boolean;
  bankruptcyAge?: 'under_2yr' | '2_7yr' | 'over_7yr';
  hasJudgments: boolean;
  hasCollections: boolean;
  hasChargeoffs: boolean;
  hasLatePay: boolean;
  hasTaxLiens: boolean;
  noDerogItems: boolean;
  
  // Q_F11: Business Credit & Inquiries
  bizCreditFile: 'paydex_80plus' | 'below_80' | 'building' | 'none' | '';
  inquiries30d: '0' | '1_2' | '3_4' | '5plus' | 'unknown' | '';
  
  // Additional contact data
  businessAddress?: string;
  businessCity?: string;
  businessState?: string;
  businessZip?: string;
  businessPhone?: string;
  
  // ── PART 2: READINESS (14 questions, indices 0–13) ─────────────────────────
  readinessAnswers: (number | undefined)[];
}

export interface Question {
  text: string;
  why: string;
  type: 'options' | 'combined';
  options?: Option[];
  fields?: Field[];
}

export interface Option {
  label: string;
  sub?: string;
  score: Record<string, number>;
  boost?: number;
}

export interface Field {
  id: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'select' | 'cards' | 'slider' | 'month-year' | 'toggle';
  placeholder?: string;
  options?: { value: string; label: string; color?: string }[];
  min?: number;
  max?: number;
  required?: boolean;
  conditional?: { field: string; value: any };
}

export interface ScoreResult {
  score: number;
  dimAvg: Record<'C' | 'D' | 'F' | 'B' | 'S' | 'N', number>;
  bankableScore: number;
  napScore: number;
}

// Extended results for dynamic reports
export interface ExtendedResultsOutput {
  // Core scores (existing)
  fundScore: number;
  bankableScore: number;
  napScore: number;
  dimAvg: Record<'C' | 'D' | 'F' | 'B' | 'S' | 'N', number>;

  // Report metadata
  ownerName: string;
  businessName: string;
  reportDate: string;
  estimateExpiry: string;

  // Report 1 — Funding Range
  fundingRange: {
    currentBand: string;
    businessOnlyMin: number;
    businessOnlyMax: number;
    personalAndBusinessMin: number;
    personalAndBusinessMax: number;
    scoreRangeLabel: string;
  };

  ownerStatus: {
    name: string;
    experian: number;
    transunion: number;
    equifax: number;
    inquiries3mo: number;
    inquiries6mo: number;
    inquiries12mo: number;
    personalIncome: string;
    timeInBusiness: string;
    openTradelines: string;
    revolvingUsage: string;
  };

  contingencies: Array<{
    item: string;
    found: number;
    cause: string;
    status: 'clear' | 'flagged';
  }>;

  // Report 2 — Bankable Status
  bankableItems: Array<{
    name: string;
    status: 'pass' | 'fail';
    description: string;
  }>;

  // Report 3 — Business FICO
  sbssOwnerStatus: 'fail' | 'pass' | 'best';
  sbssBusinessStatus: 'fail' | 'pass' | 'best';
  sbssSections: Array<{
    section: string;
    percentage: string;
    status: 'pass' | 'partial' | 'fail';
    description: string;
  }>;
  workNeeded: Array<{
    item: string;
    current: string | number;
    goal: string;
    description: string;
  }>;
}

export const DIMENSION_INFO = {
  C: { name: 'Credit Profile', color: '#c89020', weight: 0.28 },
  D: { name: 'Documentation', color: '#8ab820', weight: 0.22 },
  F: { name: 'Cash Flow', color: '#38a880', weight: 0.20 },
  B: { name: 'Banking Behavior', color: '#a0a020', weight: 0.13 },
  S: { name: 'Business Structure', color: '#c8f040', weight: 0.10 },
  N: { name: 'Narrative Strength', color: '#b04428', weight: 0.07 },
} as const;

export const SECTION_NAMES = [
  'Identity',
  'Operations',
  'Credit',
  'Documentation',
  'Cash Flow',
  'Structure',
  'Narrative',
] as const;

export function getDefaultAnswers(): UnifiedAnswers {
  return {
    // Foundation
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    businessName: '',
    entityType: '',
    startDate: { month: 0, year: 0 },
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
    noDerogItems: false,
    bizCreditFile: '',
    inquiries30d: '',

    // Readiness
    readinessAnswers: Array(14).fill(undefined),
  };
}