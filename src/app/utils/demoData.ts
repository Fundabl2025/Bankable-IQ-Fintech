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
  monthlyRevenue: 35000,
  ccSales: 8000,

  // Q_F6: Banking
  bankAccount: 'dedicated',
  bankAge: '24plus',
  avgDailyBalance: '10k_25k',

  // Q_F7: NSFs & Assets
  nsfCount: 'zero',
  arBalance: 45000,
  equipmentValue: 25000,
  poBalance: 0,
  ownsProperty: 'no',
  constructionPlan: 'no',

  // Q_F8: Personal Credit (good scores)
  experian: 712,
  transunion: 705,
  equifax: 718,

  // Q_F9: Utilization & Income
  utilization: 28,
  personalIncome: '75_125k',

  // Q_F10: Bankruptcy & Derogatories (clean)
  hasBankruptcy: false,
  hasJudgments: false,
  hasCollections: false,
  hasChargeoffs: false,
  hasLatePay: false,
  hasTaxLiens: false,
  noDerogItems: true,

  // Q_F11: Business Credit & Inquiries
  bizCreditFile: 'below_80',
  inquiries30d: '1_2',

  // Additional contact data
  businessAddress: '123 Main Street',
  businessCity: 'Austin',
  businessState: 'TX',
  businessZip: '78701',
  businessPhone: '555-987-6543',

  // Readiness answers (13 questions, indices 0-12)
  readinessAnswers: [
    1, // Q_R1: Some docs ready
    0, // Q_R2: Have P&L
    1, // Q_R3: Filed taxes somewhat recently
    0, // Q_R4: Bank statements available
    1, // Q_R5: Clear purpose
    0, // Q_R6: Good timing
    2, // Q_R7: Some history with lenders
    0, // Q_R8: Ready to respond quickly
    0, // Q_R9: Filings current
    1, // Q_R10: Narrative somewhat polished
    0, // Q_R11: Will consider guidance
    0, // Q_R12: Full commitment
    1, // Q_R13: Some flexibility on terms
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
  window.dispatchEvent(new Event('fundscoreUpdated'));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Check if demo data is loaded
 */
export function hasDemoData(): boolean {
  return localStorage.getItem('unified_assessment') !== null;
}
