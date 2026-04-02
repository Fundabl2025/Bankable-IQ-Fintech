// ════════════════════════════════════════════════════════════════════════════════
// DEMO DATA — Pre-seeded assessment for testing
// Use this to bypass assessment during development
// ════════════════════════════════════════════════════════════════════════════════

import type { UnifiedAnswers } from '../pages/business-assessment/types';

/**
 * Demo business profile: "Acme Consulting LLC"
 * FundScore: ~680-720 (Progressing tier)
 * SBSS: ~155-165 (Near bankable threshold)
 */
export const DEMO_ASSESSMENT_DATA: UnifiedAnswers = {
  // Q_F1: Owner Contact Info
  ownerFirstName: 'Alex',
  ownerLastName: 'Demo',
  ownerEmail: 'alex@acmeconsulting.com',
  ownerPhone: '555-123-4567',

  // Q_F2: Business Name + Entity Type
  businessName: 'Acme Consulting LLC',
  entityType: 'llc_multi',

  // Q_F3: Start Date & Industry (3 years old)
  startDate: { month: 3, year: 2023 },
  industry: 'Professional Services',

  // Q_F4: EIN & Website
  hasEIN: true,
  einNumber: '12-3456789',
  hasWebsite: true,
  websiteUrl: 'https://acmeconsulting.com',

  // Q_F5: Revenue & CC Sales
  monthlyRevenue: '40k_100k', // Changed from 35000 to categorical
  ccSales: '5k_15k', // Changed from 8000 to categorical

  // Q_F6: Banking
  bankAccount: 'dedicated',
  bankAge: '24plus',
  avgDailyBalance: '10k_25k',

  // Q_F7: NSFs & Assets
  nsfCount: '0', // Changed from 'zero' to match new type
  arBalance: '50k_250k', // FIXED: Changed from 45000 to categorical
  equipmentValue: '10k_50k', // FIXED: Changed from 25000 to categorical
  poBalance: 'none', // FIXED: Changed from 0 to categorical
  ownsProperty: 'no',
  constructionPlan: 'no',

  // Q_F8: Personal Credit (good scores) - FIXED: Changed from numeric to categorical
  experian: 'very_good', // Equivalent to 770 (740-799 range)
  transunion: 'very_good', // Equivalent to 770 (740-799 range)
  equifax: 'good', // Equivalent to 700 (670-739 range)

  // Q_F9: Utilization & Income
  utilization: '30_50', // FIXED: Changed from 28 (numeric) to categorical
  personalIncome: '75_125k',

  // Q_F10: Bankruptcy & Derogatories (clean)
  hasBankruptcy: '',
  hasJudgments: false,
  hasCollections: '',
  hasChargeoffs: false,
  hasLatePay: false,
  hasTaxLiens: '',
  noDerogItems: 'true', // FIXED: Changed from boolean true to string 'true'

  // Q_F11: Business Credit & Inquiries
  bizCreditFile: 'below_80',
  inquiries30d: '1_2',

  // Additional contact data
  businessAddress: '123 Main Street',
  businessCity: 'Austin',
  businessState: 'TX',
  businessZip: '78701',
  businessPhone: '555-987-6543',

  // Readiness answers (23 questions, indices 0-22)
  readinessAnswers: [
    // Section D — Documentation (Q_R1–Q_R4)
    2, // Q_R1: 2 years of filed tax returns (meets SBA requirement)
    0, // Q_R2: P&L professionally prepared (CPA)
    3, // Q_R3: 12+ months of bank statements available
    0, // Q_R4: Revenue figures align within 10%
    // Section E — Cash Flow Behavior (Q_R5–Q_R7)
    1, // Q_R5: Revenue growing but inconsistently
    1, // Q_R6: Profitable most months, occasional break-even
    1, // Q_R7: Can absorb new payment but it would be tight (DSCR 1.10–1.25)
    // Section F — Banking Trajectory (Q_R8)
    0, // Q_R8: Average daily balance consistently growing
    // Section G — Legal Standing (Q_R9)
    0, // Q_R9: All state filings current
    // Section H — Narrative Strength (Q_R10–Q_R13)
    1, // Q_R10: Capital use mostly articulated, general idea
    1, // Q_R11: Repayment generally from ongoing business revenue
    2, // Q_R12: First business loan (no prior repayment history)
    1, // Q_R13: 5–10 years of relevant industry experience
    // Section H — Personal Credit Utilization (Q_R14)
    2, // Q_R14: 30–50% utilization (matches utilization: '30_50')
    // Section I — Clean Credit Report (Q_R15)
    0, // Q_R15: No negative items on personal credit (noDerogItems: 'true')
    // Section J — Bankruptcy History (Q_R16 - conditional)
    0, // Q_R16: No bankruptcy
    // Section K — Collections / Chargeoffs (Q_R17 - conditional)
    0, // Q_R17: No collections or charge-offs
    // Section L — Tax Liens (Q_R18 - conditional)
    0, // Q_R18: No tax liens
    // Section M — Business Credit Profile (Q_R19)
    2, // Q_R19: Just starting to build business credit (bizCreditFile: 'below_80')
    // Section N — New Credit Inquiries (Q_R20)
    1, // Q_R20: 1–2 inquiries (matches inquiries30d: '1_2')
    // Section O — Average Daily Balance (Q_R21 - conditional)
    3, // Q_R21: $10,000–$25,000 average daily balance (matches avgDailyBalance: '10k_25k')
    // Section P — NSF / Overdraft Events (Q_R22 - conditional)
    0, // Q_R22: Never NSF (matches nsfCount: '0')
    // Section Q — Monthly Revenue (Q_R23)
    3, // Q_R23: $40,000–$100,000 monthly revenue (matches monthlyRevenue: '40k_100k')
  ],
};

/**
 * Demo audit item statuses
 * Marks some items as complete to show realistic progress
 */
const DEMO_COMPLETED_ITEMS = [
  // These are complete for Acme Consulting
  'entity-formation', // LLC formed
  'ein-number', // Has EIN
  'business-bank-account', // Has bank account
  'business-website', // Has website
  'business-email', // Has email
  'personal-fico-680', // Good credit score (712+)
];

/**
 * Seed demo data into localStorage
 */
export function seedDemoData(): void {
  try {
    console.log('[v0] seedDemoData: Starting...');
    
    // Set demo mode flag to bypass auth protection
    localStorage.setItem('fundready_demo_mode', 'true');
    console.log('[v0] Set demo mode flag');

    // Unlock all features for demo — set to live tier
    localStorage.setItem('fundready_membership_tier', 'live');
    console.log('[v0] Set membership tier: live');
    
    // Save unified assessment data
    const assessmentJSON = JSON.stringify(DEMO_ASSESSMENT_DATA);
    localStorage.setItem('unified_assessment', assessmentJSON);
    console.log('[v0] Saved unified_assessment:', assessmentJSON.length, 'bytes');
    
    // Save business profile
    const profileData = {
      businessName: DEMO_ASSESSMENT_DATA.businessName,
      ownerName: `${DEMO_ASSESSMENT_DATA.ownerFirstName} ${DEMO_ASSESSMENT_DATA.ownerLastName}`,
      industry: DEMO_ASSESSMENT_DATA.industry,
      monthlyRevenue: DEMO_ASSESSMENT_DATA.monthlyRevenue,
      entityType: DEMO_ASSESSMENT_DATA.entityType,
    };
    localStorage.setItem('fundready_business_profile', JSON.stringify(profileData));
    console.log('[v0] Saved business profile');

    // Save audit items completion status
    const completedItems: Record<string, { status: 'complete'; completedDate: string }> = {};
    const today = new Date().toISOString();
    
    DEMO_COMPLETED_ITEMS.forEach(id => {
      completedItems[id] = {
        status: 'complete',
        completedDate: today,
      };
    });
    
    localStorage.setItem('auditItems', JSON.stringify(completedItems));
    console.log('[v0] Saved audit items:', DEMO_COMPLETED_ITEMS.length, 'items marked complete');

    // Dispatch events to notify components
    window.dispatchEvent(new Event('fundscoreUpdated'));
    window.dispatchEvent(new Event('membershipUpdated'));
    window.dispatchEvent(new Event('storage'));
    console.log('[v0] Dispatched update events');
    
    console.log('[v0] seedDemoData: Complete!');
  } catch (error) {
    console.error('[v0] seedDemoData: ERROR -', error);
    throw error;
  }
}

/**
 * Clear all demo/assessment data
 */
export function clearDemoData(): void {
  localStorage.removeItem('unified_assessment');
  localStorage.removeItem('fundready_business_profile');
  localStorage.removeItem('auditItems');
  localStorage.removeItem('fundready_demo_mode');
  localStorage.removeItem('fundready_membership_tier');
  window.dispatchEvent(new Event('fundscoreUpdated'));
  window.dispatchEvent(new Event('membershipUpdated'));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Check if demo data is loaded
 */
export function hasDemoData(): boolean {
  return localStorage.getItem('unified_assessment') !== null;
}
