// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Product Eligibility Engine
// 17 financing products with specific qualification logic
// ════════════════════════════════════════════════════════════════════════════════

import { UnifiedAnswers, REVENUE_MIDPOINTS, CC_SALES_MIDPOINTS, CREDIT_SCORE_MIDPOINTS } from './types';

export interface Product {
  id: string;
  name: string;
  category: 'Alternative' | 'Traditional' | 'Credit' | 'Asset-Based';
  minScore: number;
  maxAmount: string;
  speed: string; // Time to funding
  description: string;
  qualifies: boolean;
  confidence: 'High' | 'Medium' | 'Low' | 'Not Eligible';
  blockers: string[];
  boosts: string[];
}

export function evaluateProducts(data: UnifiedAnswers, score: number): Product[] {
  const mapCreditScore = (category: string): number => CREDIT_SCORE_MIDPOINTS[category] ?? 0;
  const monthlyRev = REVENUE_MIDPOINTS[data.monthlyRevenue] || 0;
  const ccSales = CC_SALES_MIDPOINTS[data.ccSales] || 0;
  
  const creditScore = Math.min(mapCreditScore(data.experian || ''), mapCreditScore(data.transunion || ''), mapCreditScore(data.equifax || '')); // Lowest score (most conservative)
  const businessAge = calculateBusinessAge(data.startDate.year, data.startDate.month);
  const hasEIN = data.hasEIN === true;
  const hasDedicatedBank = data.bankAccount === 'dedicated';
  const bankAge = data.bankAge;
  const nsfCount = data.nsfCount;
  const hasBankruptcy = data.hasBankruptcy === 'recent' || data.hasBankruptcy === 'aging';
  const hasJudgments = data.hasJudgments === true;

  const products: Product[] = [];

  // ──────────────────────────────────────────────────────────────────────────────
  // ALTERNATIVE LENDING
  // ──────────────────────────────────────────────────────────────────────────────

  // 1. Merchant Cash Advance (MCA)
  const mcaBlockers: string[] = [];
  const mcaBoosts: string[] = [];
  if (ccSales < 5000) mcaBlockers.push('CC sales below $5K/mo');
  if (businessAge < 3) mcaBlockers.push('Business under 3 months');
  if (ccSales >= 15000) mcaBoosts.push('Strong CC sales volume');
  if (bankAge === '24plus') mcaBoosts.push('Mature banking history');

  products.push({
    id: 'mca',
    name: 'Merchant Cash Advance',
    category: 'Alternative',
    minScore: 400,
    maxAmount: '$250K',
    speed: '24–48 hours',
    description: 'Advance against future credit card sales. Fastest funding option.',
    qualifies: mcaBlockers.length === 0 && ccSales >= 5000 && businessAge >= 3,
    confidence: mcaBlockers.length === 0 && ccSales >= 10000 ? 'High' : mcaBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: mcaBlockers,
    boosts: mcaBoosts,
  });

  // 2. Business Term Loan (Alternative)
  const termAltBlockers: string[] = [];
  const termAltBoosts: string[] = [];
  if (monthlyRev < 10000) termAltBlockers.push('Revenue below $10K/mo');
  if (businessAge < 6) termAltBlockers.push('Business under 6 months');
  if (creditScore < 550) termAltBlockers.push('Credit score below 550');
  if (monthlyRev >= 25000) termAltBoosts.push('Strong revenue');
  if (creditScore >= 650) termAltBoosts.push('Strong credit profile');

  products.push({
    id: 'term_alt',
    name: 'Business Term Loan',
    category: 'Alternative',
    minScore: 450,
    maxAmount: '$500K',
    speed: '3–7 days',
    description: 'Fixed-term loan from alternative lender. Flexible requirements.',
    qualifies: termAltBlockers.length === 0,
    confidence: termAltBlockers.length === 0 && monthlyRev >= 25000 && creditScore >= 600 ? 'High' : termAltBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: termAltBlockers,
    boosts: termAltBoosts,
  });

  // 3. Business Line of Credit (Alternative)
  const locAltBlockers: string[] = [];
  const locAltBoosts: string[] = [];
  if (monthlyRev < 15000) locAltBlockers.push('Revenue below $15K/mo');
  if (businessAge < 12) locAltBlockers.push('Business under 1 year');
  if (creditScore < 600) locAltBlockers.push('Credit score below 600');
  if (nsfCount === 'over_5') locAltBlockers.push('Too many NSFs');
  if (hasDedicatedBank) locAltBoosts.push('Dedicated business bank account');
  if (bankAge === '24plus') locAltBoosts.push('Strong banking history');

  products.push({
    id: 'loc_alt',
    name: 'Business Line of Credit',
    category: 'Alternative',
    minScore: 500,
    maxAmount: '$250K',
    speed: '5–10 days',
    description: 'Revolving credit line for ongoing working capital needs.',
    qualifies: locAltBlockers.length === 0,
    confidence: locAltBlockers.length === 0 && monthlyRev >= 30000 ? 'High' : locAltBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: locAltBlockers,
    boosts: locAltBoosts,
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // TRADITIONAL BANK LENDING
  // ──────────────────────────────────────────────────────────────────────────────

  // 4. SBA 7(a) Loan
  const sba7aBlockers: string[] = [];
  const sba7aBoosts: string[] = [];
  if (!hasEIN) sba7aBlockers.push('No EIN');
  if (businessAge < 24) sba7aBlockers.push('Business under 2 years');
  if (creditScore < 680) sba7aBlockers.push('Credit score below 680');
  if (data.entityType === 'sole_prop') sba7aBlockers.push('Must be LLC or Corp');
  if (hasBankruptcy) sba7aBlockers.push('Recent bankruptcy');
  if (hasJudgments) sba7aBlockers.push('Active judgments/liens');
  if (businessAge >= 60) sba7aBoosts.push('5+ years in business');
  if (creditScore >= 720) sba7aBoosts.push('Excellent credit');

  products.push({
    id: 'sba_7a',
    name: 'SBA 7(a) Loan',
    category: 'Traditional',
    minScore: 650,
    maxAmount: '$5M',
    speed: '45–90 days',
    description: 'Government-backed loan with lowest rates. Most rigorous requirements.',
    qualifies: sba7aBlockers.length === 0,
    confidence: sba7aBlockers.length === 0 && creditScore >= 700 && businessAge >= 36 ? 'High' : sba7aBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: sba7aBlockers,
    boosts: sba7aBoosts,
  });

  // 5. SBA Express Loan
  const sbaExpBlockers: string[] = [];
  const sbaExpBoosts: string[] = [];
  if (!hasEIN) sbaExpBlockers.push('No EIN');
  if (businessAge < 12) sbaExpBlockers.push('Business under 1 year');
  if (creditScore < 660) sbaExpBlockers.push('Credit score below 660');
  if (hasBankruptcy) sbaExpBlockers.push('Recent bankruptcy');
  if (creditScore >= 700) sbaExpBoosts.push('Strong credit');
  if (businessAge >= 24) sbaExpBoosts.push('2+ years in business');

  products.push({
    id: 'sba_express',
    name: 'SBA Express',
    category: 'Traditional',
    minScore: 600,
    maxAmount: '$500K',
    speed: '30–45 days',
    description: 'Faster SBA option with streamlined approval.',
    qualifies: sbaExpBlockers.length === 0,
    confidence: sbaExpBlockers.length === 0 && creditScore >= 680 ? 'High' : sbaExpBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: sbaExpBlockers,
    boosts: sbaExpBoosts,
  });

  // 6. Bank Term Loan
  const bankTermBlockers: string[] = [];
  const bankTermBoosts: string[] = [];
  if (businessAge < 24) bankTermBlockers.push('Business under 2 years');
  if (creditScore < 700) bankTermBlockers.push('Credit score below 700');
  if (monthlyRev < 50000) bankTermBlockers.push('Revenue below $50K/mo');
  if (!hasDedicatedBank) bankTermBlockers.push('Need dedicated business account');
  if (nsfCount !== 'zero') bankTermBlockers.push('NSF events present');
  if (businessAge >= 60) bankTermBoosts.push('Mature business');
  if (creditScore >= 750) bankTermBoosts.push('Excellent credit');

  products.push({
    id: 'bank_term',
    name: 'Bank Term Loan',
    category: 'Traditional',
    minScore: 680,
    maxAmount: '$1M+',
    speed: '30–60 days',
    description: 'Traditional bank financing with competitive rates.',
    qualifies: bankTermBlockers.length === 0,
    confidence: bankTermBlockers.length === 0 && monthlyRev >= 100000 ? 'High' : bankTermBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: bankTermBlockers,
    boosts: bankTermBoosts,
  });

  // 7. Bank Line of Credit
  const bankLocBlockers: string[] = [];
  const bankLocBoosts: string[] = [];
  if (businessAge < 24) bankLocBlockers.push('Business under 2 years');
  if (creditScore < 720) bankLocBlockers.push('Credit score below 720');
  if (monthlyRev < 40000) bankLocBlockers.push('Revenue below $40K/mo');
  if (!hasDedicatedBank) bankLocBlockers.push('Need dedicated business account');
  if (nsfCount !== 'zero') bankLocBlockers.push('NSF events present');
  if (bankAge === '24plus') bankLocBoosts.push('Long banking relationship');

  products.push({
    id: 'bank_loc',
    name: 'Bank Line of Credit',
    category: 'Traditional',
    minScore: 700,
    maxAmount: '$500K',
    speed: '30–60 days',
    description: 'Revolving credit from traditional bank.',
    qualifies: bankLocBlockers.length === 0,
    confidence: bankLocBlockers.length === 0 && creditScore >= 750 ? 'High' : bankLocBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: bankLocBlockers,
    boosts: bankLocBoosts,
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // CREDIT PRODUCTS
  // ──────────────────────────────────────────────────────────────────────────────

  // 8. Business Credit Cards
  const bccBlockers: string[] = [];
  const bccBoosts: string[] = [];
  if (businessAge < 3) bccBlockers.push('Business under 3 months');
  if (creditScore < 650) bccBlockers.push('Credit score below 650');
  if (creditScore >= 720) bccBoosts.push('Strong credit profile');
  if (data.personalIncome && ['125_250k', 'over_250k'].includes(data.personalIncome)) bccBoosts.push('Strong personal income');

  products.push({
    id: 'bcc',
    name: 'Business Credit Cards',
    category: 'Credit',
    minScore: 500,
    maxAmount: '$50K',
    speed: '1–7 days',
    description: 'Revolving credit for purchases and expenses.',
    qualifies: bccBlockers.length === 0,
    confidence: bccBlockers.length === 0 && creditScore >= 700 ? 'High' : bccBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: bccBlockers,
    boosts: bccBoosts,
  });

  // 9. 0% APR Business Credit Cards
  const bcc0Blockers: string[] = [];
  const bcc0Boosts: string[] = [];
  if (creditScore < 700) bcc0Blockers.push('Credit score below 700');
  if (data.utilization && data.utilization > 30) bcc0Blockers.push('Utilization above 30%');
  if (creditScore >= 750) bcc0Boosts.push('Excellent credit');
  if (data.utilization && data.utilization < 10) bcc0Boosts.push('Low utilization');

  products.push({
    id: 'bcc_0apr',
    name: '0% APR Business Cards',
    category: 'Credit',
    minScore: 650,
    maxAmount: '$75K',
    speed: '1–7 days',
    description: 'Interest-free financing for 12–18 months.',
    qualifies: bcc0Blockers.length === 0,
    confidence: bcc0Blockers.length === 0 && creditScore >= 740 ? 'High' : bcc0Blockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: bcc0Blockers,
    boosts: bcc0Boosts,
  });

  // 10. Personal Guarantee Credit Line
  const pgclBlockers: string[] = [];
  const pgclBoosts: string[] = [];
  if (creditScore < 680) pgclBlockers.push('Credit score below 680');
  if (data.personalIncome && !['75_125k', '125_250k', 'over_250k'].includes(data.personalIncome)) {
    pgclBlockers.push('Personal income below $75K');
  }
  if (creditScore >= 720) pgclBoosts.push('Strong credit');
  if (data.personalIncome === 'over_250k') pgclBoosts.push('High personal income');

  products.push({
    id: 'pgcl',
    name: 'Personal Guarantee Line',
    category: 'Credit',
    minScore: 600,
    maxAmount: '$150K',
    speed: '7–14 days',
    description: 'Personal credit line for business use.',
    qualifies: pgclBlockers.length === 0,
    confidence: pgclBlockers.length === 0 && creditScore >= 700 ? 'High' : pgclBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: pgclBlockers,
    boosts: pgclBoosts,
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // ASSET-BASED LENDING
  // ──────────────────────────────────────────────────────────────────────────────

  // 11. Invoice Factoring
  const factoringBlockers: string[] = [];
  const factoringBoosts: string[] = [];
  const arHasBalance = data.arBalance && data.arBalance !== 'none' && data.arBalance !== 'under_10k';
  const arIsLarge    = data.arBalance === '50k_250k' || data.arBalance === 'over_250k';
  if (!arHasBalance) factoringBlockers.push('A/R balance below $10K');
  if (businessAge < 3) factoringBlockers.push('Business under 3 months');
  if (arIsLarge) factoringBoosts.push('Strong A/R balance');

  products.push({
    id: 'factoring',
    name: 'Invoice Factoring',
    category: 'Asset-Based',
    minScore: 400,
    maxAmount: '$1M+',
    speed: '24–72 hours',
    description: 'Advance against outstanding invoices.',
    qualifies: factoringBlockers.length === 0,
    confidence: factoringBlockers.length === 0 && arIsLarge ? 'High' : factoringBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: factoringBlockers,
    boosts: factoringBoosts,
  });

  // 12. Equipment Financing
  const equipBlockers: string[] = [];
  const equipBoosts: string[] = [];
  if (businessAge < 6) equipBlockers.push('Business under 6 months');
  if (creditScore < 600) equipBlockers.push('Credit score below 600');
  if (creditScore >= 680) equipBoosts.push('Strong credit');
  if (businessAge >= 24) equipBoosts.push('Established business');

  products.push({
    id: 'equipment',
    name: 'Equipment Financing',
    category: 'Asset-Based',
    minScore: 500,
    maxAmount: '$5M',
    speed: '5–10 days',
    description: 'Financing for machinery, vehicles, technology.',
    qualifies: equipBlockers.length === 0,
    confidence: equipBlockers.length === 0 && creditScore >= 660 ? 'High' : equipBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: equipBlockers,
    boosts: equipBoosts,
  });

  // 13. Purchase Order Financing
  const poBlockers: string[] = [];
  const poBoosts: string[] = [];
  const poHasBalance = data.poBalance && data.poBalance !== 'none' && data.poBalance !== 'under_10k';
  const poIsLarge    = data.poBalance === '50k_250k' || data.poBalance === 'over_250k';
  if (!poHasBalance) poBlockers.push('PO balance below $25K');
  if (businessAge < 6) poBlockers.push('Business under 6 months');
  if (poIsLarge) poBoosts.push('Large PO value');

  products.push({
    id: 'po_financing',
    name: 'Purchase Order Financing',
    category: 'Asset-Based',
    minScore: 450,
    maxAmount: '$1M+',
    speed: '5–10 days',
    description: 'Finance large orders before delivery.',
    qualifies: poBlockers.length === 0,
    confidence: poBlockers.length === 0 && poIsLarge ? 'High' : poBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: poBlockers,
    boosts: poBoosts,
  });

  // 14. Commercial Real Estate Loan
  const creBlockers: string[] = [];
  const creBoosts: string[] = [];
  if (data.ownsProperty !== 'yes' && data.ownsProperty !== 'planning') creBlockers.push('No property acquisition planned');
  if (businessAge < 24) creBlockers.push('Business under 2 years');
  if (creditScore < 680) creBlockers.push('Credit score below 680');
  if (!hasEIN) creBlockers.push('No EIN');
  if (creditScore >= 720) creBoosts.push('Strong credit');
  if (businessAge >= 60) creBoosts.push('Mature business');

  products.push({
    id: 'cre',
    name: 'Commercial Real Estate',
    category: 'Asset-Based',
    minScore: 650,
    maxAmount: '$10M+',
    speed: '45–90 days',
    description: 'Financing to purchase or refinance business property.',
    qualifies: creBlockers.length === 0,
    confidence: creBlockers.length === 0 && creditScore >= 700 && businessAge >= 36 ? 'High' : creBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: creBlockers,
    boosts: creBoosts,
  });

  // 15. Revenue-Based Financing
  const rbfBlockers: string[] = [];
  const rbfBoosts: string[] = [];
  if (monthlyRev < 20000) rbfBlockers.push('Revenue below $20K/mo');
  if (businessAge < 6) rbfBlockers.push('Business under 6 months');
  if (monthlyRev >= 50000) rbfBoosts.push('Strong revenue');

  products.push({
    id: 'rbf',
    name: 'Revenue-Based Financing',
    category: 'Alternative',
    minScore: 500,
    maxAmount: '$500K',
    speed: '7–14 days',
    description: 'Repay as % of monthly revenue.',
    qualifies: rbfBlockers.length === 0,
    confidence: rbfBlockers.length === 0 && monthlyRev >= 40000 ? 'High' : rbfBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: rbfBlockers,
    boosts: rbfBoosts,
  });

  // 16. Inventory Financing
  const invBlockers: string[] = [];
  const invBoosts: string[] = [];
  if (!['Retail, E-commerce, or Wholesale', 'Construction or Real Estate'].includes(data.industry || '')) {
    invBlockers.push('Industry not inventory-heavy');
  }
  if (monthlyRev < 25000) invBlockers.push('Revenue below $25K/mo');
  if (businessAge < 12) invBlockers.push('Business under 1 year');
  if (monthlyRev >= 50000) invBoosts.push('Strong revenue');

  products.push({
    id: 'inventory',
    name: 'Inventory Financing',
    category: 'Asset-Based',
    minScore: 550,
    maxAmount: '$2M',
    speed: '7–14 days',
    description: 'Finance inventory purchases.',
    qualifies: invBlockers.length === 0,
    confidence: invBlockers.length === 0 && monthlyRev >= 40000 ? 'High' : invBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: invBlockers,
    boosts: invBoosts,
  });

  // 17. Business Acquisition Loan
  const acqBlockers: string[] = [];
  const acqBoosts: string[] = [];
  if (creditScore < 680) acqBlockers.push('Credit score below 680');
  if (!hasEIN) acqBlockers.push('No EIN');
  if (businessAge < 12) acqBlockers.push('Buyer business under 1 year');
  if (creditScore >= 720) acqBoosts.push('Strong credit');
  if (businessAge >= 36) acqBoosts.push('Experienced operator');

  products.push({
    id: 'acquisition',
    name: 'Business Acquisition',
    category: 'Traditional',
    minScore: 650,
    maxAmount: '$5M+',
    speed: '60–90 days',
    description: 'Finance the purchase of an existing business.',
    qualifies: acqBlockers.length === 0,
    confidence: acqBlockers.length === 0 && creditScore >= 700 && businessAge >= 24 ? 'High' : acqBlockers.length === 0 ? 'Medium' : 'Not Eligible',
    blockers: acqBlockers,
    boosts: acqBoosts,
  });

  return products.sort((a, b) => {
    // Sort by: qualifies first, then by confidence, then by category priority
    if (a.qualifies !== b.qualifies) return a.qualifies ? -1 : 1;
    
    const confOrder = { High: 0, Medium: 1, Low: 2, 'Not Eligible': 3 };
    if (a.confidence !== b.confidence) return confOrder[a.confidence] - confOrder[b.confidence];
    
    const catOrder = { Alternative: 0, Credit: 1, 'Asset-Based': 2, Traditional: 3 };
    return catOrder[a.category] - catOrder[b.category];
  });
}

function calculateBusinessAge(year?: number, month?: number): number {
  if (!year || !month) return 0;
  const now = new Date();
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
}
