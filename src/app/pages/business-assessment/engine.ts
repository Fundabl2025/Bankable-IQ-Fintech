// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Scoring Engine
// ONE ENGINE. ONE CALCULATION. ONE SCORE. NO SYNC.
// ════════════════════════════════════════════════════════════════════════════════

import { UnifiedAnswers, ScoreResult, ExtendedResultsOutput } from './types';
import { READINESS_QUESTIONS } from './questions';

// ════════════════════════════════════════════════════════════════════════════════
// FUNDSCORE WEIGHTS — Aligned with Elon's Rule Logic Spec
// Personal (P): 20% — FICO, utilization, derog, payment history
// Business (B): 10% — Entity, age, industry
// Financial (F): 25% — Revenue, cash flow, deposits, NSF
// Compliance (C): 20% — NAP, website, EIN, filings
// Stability (S): 15% — Time in biz, bank age, consistency
// File (N):     10% — Business credit, tradelines, inquiries
// ════════════════════════════════════════════════════════════════════════════════
const WEIGHTS = {
  P: 0.20, // Personal Credit (owner FICO, utilization, derogs)
  B: 0.10, // Business Profile (entity, age, industry)
  F: 0.25, // Financial Health (revenue, cash flow, deposits)
  C: 0.20, // Compliance (NAP, website, EIN, filings)
  S: 0.15, // Stability (time in biz, bank age, consistency)
  N: 0.10, // File Strength (biz credit, tradelines, inquiries)
};

/**
 * Compute complete FundScore from unified assessment data
 * Returns score (0-1000) + dimension averages + Bankable Score + NAP Score
 */
export function computeScore(data: UnifiedAnswers): ScoreResult {
  // New 6-dimension buckets aligned with Elon's spec
  const buckets: Record<string, number[]> = {
    P: [], // Personal Credit (20%)
    B: [], // Business Profile (10%)
    F: [], // Financial Health (25%)
    C: [], // Compliance (20%)
    S: [], // Stability (15%)
    N: [], // File Strength (10%)
  };
  let totalBoost = 0;

  // ══════════════════════════════════════════════════════════════════════════════
  // P: PERSONAL CREDIT (20%) — Owner FICO, utilization, derogs, payment history
  // ══════════════════════════════════════════════════════════════════════════════

  // ── P1: PERSONAL CREDIT SCORE (FICO composite from 3 bureaus) ──────────────
  const creditScores = [
    data.experian || 0,
    data.transunion || 0,
    data.equifax || 0,
  ].filter(s => s > 0).sort((a, b) => a - b);
  const composite = creditScores.length > 0 ? creditScores[Math.floor(creditScores.length / 2)] : 0;

  if (composite >= 740) buckets.P.push(1.0);
  else if (composite >= 700) buckets.P.push(0.78);
  else if (composite >= 650) buckets.P.push(0.6);
  else if (composite >= 620) buckets.P.push(0.4);
  else if (composite >= 580) buckets.P.push(0.2);
  else if (composite > 0) buckets.P.push(0.05);
  else buckets.P.push(0.0); // No credit score provided

  // ── P2: CREDIT UTILIZATION ──────────────────────────────────────────────────
  let utilizationScore = 0.5; // Default neutral
  if (data.utilization === 'under_10') utilizationScore = 1.0;
  else if (data.utilization === '10_30') utilizationScore = 0.8;
  else if (data.utilization === '30_50') utilizationScore = 0.5;
  else if (data.utilization === '50_75') utilizationScore = 0.2;
  else if (data.utilization === 'over_75') utilizationScore = 0.0;
  else if (data.utilization) utilizationScore = 0.5; // Unknown value
  else utilizationScore = 0.0; // No data provided
  buckets.P.push(utilizationScore);

  // ── P3: DEROGATORY ITEMS ────────────────────────────────────────────────────
  let derogScore = 1.0; // Start with full credit (no negatives)
  
  // Check for clean credit report flag
  if (data.noDerogItems === 'false') {
    // Has negative items - check specifics
    if (data.hasBankruptcy === 'recent') derogScore = 0.0; // -30 penalty
    else if (data.hasBankruptcy === 'aging') derogScore = 0.3; // -15 penalty
    else if (data.hasBankruptcy === 'old') derogScore = 0.7; // -5 penalty
    
    if (data.hasCollections === 'active') derogScore = Math.min(derogScore, 0.0); // -25 penalty
    else if (data.hasCollections === 'resolved') derogScore = Math.min(derogScore, 0.8); // -5 penalty
    
    if (data.hasTaxLiens && data.hasTaxLiens !== 'no') derogScore = Math.min(derogScore, 0.0); // -20 penalty
  } else if (data.noDerogItems === 'true') {
    derogScore = 1.0; // Clean report bonus
  }
  
  buckets.P.push(derogScore);

  // ── P4: RECENT CREDIT INQUIRIES (new credit seeking) ─────────────────────────
  let inquiryScore = 1.0;
  if (data.inquiries30d === '0') inquiryScore = 1.0;
  else if (data.inquiries30d === '1_2') inquiryScore = 0.85;
  else if (data.inquiries30d === '3_4') inquiryScore = 0.5;
  else if (data.inquiries30d === '5plus') inquiryScore = 0.1;
  buckets.P.push(inquiryScore);

  // ══════════════════════════════════════════════════════════════════════════════
  // F: FINANCIAL HEALTH (25%) — Revenue, cash flow, deposits, NSF
  // ══════════════════════════════════════════════════════════════════════════════

  // ── F1: MONTHLY REVENUE ─────────────────────────────────────────────────────
  let revenueScore = 0.5; // Default neutral
  if (data.monthlyRevenue === 'over_100k') revenueScore = 1.0;
  else if (data.monthlyRevenue === '40k_100k') revenueScore = 0.85;
  else if (data.monthlyRevenue === '15k_40k') revenueScore = 0.65;
  else if (data.monthlyRevenue === '5k_15k') revenueScore = 0.35;
  else if (data.monthlyRevenue === 'under_5k') revenueScore = 0.1;
  buckets.F.push(revenueScore);

  // ── F2: FUND SEPARATION (BANK ACCOUNT TYPE) ─────────────────────────────────
  // BUG FIX: Apply penalty for 'none', full points for 'dedicated', partial for 'personal'
  if (data.bankAccount === 'dedicated') buckets.F.push(1.0);
  else if (data.bankAccount === 'personal') buckets.F.push(0.5);
  else buckets.F.push(-0.5); // FIXED: Changed from 0.0 to -0.5 (significant penalty for no bank account)

  // ── F3: AVERAGE DAILY BALANCE ───────────────────────────────────────────────
  let balanceScore = 0.0; // Default zero if no data
  if (data.avgDailyBalance === '25k_plus' || data.avgDailyBalance === 'over_25k') balanceScore = 1.0;
  else if (data.avgDailyBalance === '10k_25k') balanceScore = 0.8;
  else if (data.avgDailyBalance === '2k_10k') balanceScore = 0.55;
  else if (data.avgDailyBalance === '500_2k') balanceScore = 0.25;
  else if (data.avgDailyBalance === 'near_zero') balanceScore = 0.0;
  buckets.F.push(balanceScore);

  // ── F4: NSF/OVERDRAFT COUNT ─────────────────────────────────────────────────
  let nsfScore = 1.0; // Default full credit if no data
  if (data.nsfCount === '0') nsfScore = 1.0;
  else if (data.nsfCount === 'zero') nsfScore = 1.0; // Handle both '0' and 'zero'
  else if (data.nsfCount === '1_2') nsfScore = 0.7;
  else if (data.nsfCount === '3_5') nsfScore = 0.3;
  else if (data.nsfCount === '5plus' || data.nsfCount === 'over_5') nsfScore = 0.05;
  buckets.F.push(nsfScore);

  // ══════════════════════════════════════════════════════════════════════════════
  // B: BUSINESS PROFILE (10%) — Entity, industry
  // ══════════════════════════════════════════════════════════════════════════════

  // ── B1: ENTITY TYPE ─────────────────────────────────────────────────────────
  const entity = data.entityType;
  if (entity === 'corp') buckets.B.push(1.0);
  else if (entity === 'llc_multi') buckets.B.push(0.78);
  else if (entity === 'llc_single') buckets.B.push(0.65);
  else if (entity === 'sole_prop') buckets.B.push(0.1);
  else buckets.B.push(0.5); // Default if not set

  // ── B2: INDUSTRY (risk overlay) ─────────────────────────────────────────────
  const industry = (data.industry || '').toLowerCase();
  if (industry.includes('professional') || industry.includes('technology') || industry.includes('healthcare')) {
    buckets.B.push(1.0);
  } else if (industry.includes('retail') || industry.includes('e-commerce') || industry.includes('wholesale')) {
    buckets.B.push(0.85);
  } else if (industry.includes('construction') || industry.includes('real estate')) {
    buckets.B.push(0.65);
  } else if (industry.includes('restaurant') || industry.includes('food') || industry.includes('hospitality')) {
    buckets.B.push(0.4);
  } else if (industry.includes('transport') || industry.includes('truck') || industry.includes('logistics')) {
    buckets.B.push(0.5);
  } else {
    buckets.B.push(0.7); // Other
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // S: STABILITY (15%) — Time in biz, bank age, consistency
  // ══════════════════════════════════════════════════════════════════════════════

  // ── S1: BUSINESS AGE (calculated from start date) ───────────────────────────
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

  // ── S2: BANK AGE ────────────────────────────────────────────────────────────
  if (data.bankAge === '24plus') buckets.S.push(1.0);
  else if (data.bankAge === '12_24mo') buckets.S.push(0.7);
  else if (data.bankAge === '6_12mo') buckets.S.push(0.4);
  else if (data.bankAge === '0_6mo') buckets.S.push(0.15);
  else buckets.S.push(0.3);

  // ══════════════════════════════════════════════════════════════════════════════
  // C: COMPLIANCE (20%) — NAP, website, EIN, filings
  // ══════════════════════════════════════════════════════════════════════════════

  // ── C1: EIN ─────────────────────────────────────────────────────────────────
  buckets.C.push(data.hasEIN ? 1.0 : 0.0);

  // ── C2: WEBSITE ─────────────────────────────────────────────────────────────
  buckets.C.push(data.hasWebsite ? 1.0 : 0.0);

  // ── C3: BUSINESS NAME ───────────────────────────────────────────────────────
  buckets.C.push(data.businessName ? 1.0 : 0.0);

  // ── C4: BUSINESS ADDRESS (NAP completeness) ─────────────────────────────────
  const hasFullAddress = data.businessAddress && data.businessCity && data.businessState && data.businessZip;
  buckets.C.push(hasFullAddress ? 1.0 : data.businessAddress ? 0.5 : 0.0);

  // ── C5: BUSINESS PHONE ──────────────────────────────────────────────────────
  buckets.C.push(data.businessPhone || data.ownerPhone ? 1.0 : 0.0);

  // ══════════════════════════════════════════════════════════════════════════════
  // N: FILE STRENGTH (10%) — Business credit, tradelines, inquiries
  // ══════════════════════════════════════════════════════════════════════════════

  // ── N1: BUSINESS CREDIT FILE ────────────────────────────────────────────────
  if (data.bizCreditFile === 'paydex_80plus') buckets.N.push(1.0);
  else if (data.bizCreditFile === 'below_80') buckets.N.push(0.6);
  else if (data.bizCreditFile === 'building') buckets.N.push(0.3);
  else buckets.N.push(0.0);

  // ── N2: INQUIRIES (30 days) ─────────────────────────────────────────────────
  if (data.inquiries30d === '0') buckets.N.push(1.0);
  else if (data.inquiries30d === '1_2') buckets.N.push(0.75);
  else if (data.inquiries30d === '3_4') buckets.N.push(0.4);
  else if (data.inquiries30d === '5plus') buckets.N.push(0.1);
  else buckets.N.push(0.5);

  // ═════════════════════════════════════════════���════════════════════════════════
  // PART 2: READINESS ANSWERS → DIMENSION BUCKETS
  // Map old dimension codes to new ones for readiness questions
  // ═══════════════════════════════════════════════════════════���══════════════════

  const dimMap: Record<string, string> = {
    'C': 'P', // Old Credit → Personal
    'D': 'C', // Old Documentation → Compliance
    'F': 'F', // Financial stays same
    'B': 'S', // Old Banking → Stability (FIXED: was 'F')
    'S': 'B', // Old Structure → Business
    'N': 'N', // Narrative → File
  };

  READINESS_QUESTIONS.forEach((q, qi) => {
    const answerIndex = data.readinessAnswers[qi];
    if (answerIndex === undefined || !q.options) return;

    const selectedOption = q.options[answerIndex];
    if (!selectedOption) return;

    // Add boost if present (Q_R12 Option A has +45)
    if (selectedOption.boost) {
      totalBoost += selectedOption.boost;
    }

    // Add scores to dimension buckets (map old codes to new)
    Object.entries(selectedOption.score).forEach(([dim, val]) => {
      const newDim = dimMap[dim] || dim;
      if (buckets[newDim]) {
        buckets[newDim].push(val as number);
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // COMPUTE DIMENSION AVERAGES
  // ═════════════════════════════════════════════════════��════════════════════════

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
    dimAvg: dimAvg as Record<'P' | 'B' | 'F' | 'C' | 'S' | 'N', number>,
    bankableScore,
    napScore,
  };
}

/**
 * Calculate Bankable Score (SBSS) using Elon's 4-component formula
 * 
 * SBSS Weights (per spec):
 * - Personal Credit: 35% — FICO, utilization, derogations
 * - Financial Health: 30% — Revenue, bank rating, deposits, NSF
 * - Business Profile: 20% — Entity, age, industry, web presence
 * - Business Credit: 15% — Tradelines, Paydex, credit reports
 * 
 * Output: 0-300 scale, 160 = bankable threshold
 */
function calculateBankableScore(data: UnifiedAnswers): number {
  // ══════════════════════════════════════════════════════════════════════════
  // COMPONENT 1: PERSONAL CREDIT (35% = 105 max points)
  // ══════════════════════════════════════════════════════════════════════════
  const creditScores = [data.experian || 0, data.transunion || 0, data.equifax || 0]
    .filter(s => s > 0)
    .sort((a, b) => a - b);
  const composite = creditScores.length > 0 ? creditScores[Math.floor(creditScores.length / 2)] : 0;
  
  // FICO score contribution (0-60 points)
  let ficoPoints = 0;
  if (composite >= 750) ficoPoints = 60;
  else if (composite >= 720) ficoPoints = 52;
  else if (composite >= 700) ficoPoints = 45;
  else if (composite >= 680) ficoPoints = 38;
  else if (composite >= 660) ficoPoints = 30;
  else if (composite >= 640) ficoPoints = 22;
  else if (composite >= 620) ficoPoints = 15;
  else if (composite > 0) ficoPoints = 5;
  else ficoPoints = 0; // No score provided

  // Utilization contribution (0-25 points)
  const utilization = data.utilization || 0;
  let utilPoints = 0;
  if (utilization === 0) utilPoints = 0; // No data provided
  else if (utilization < 10) utilPoints = 25;
  else if (utilization <= 20) utilPoints = 22;
  else if (utilization <= 30) utilPoints = 18;
  else if (utilization <= 50) utilPoints = 10;
  else if (utilization <= 70) utilPoints = 5;
  else utilPoints = 0;

  // Derogatory penalty (0-20 points, subtracted)
  let derogPenalty = 0;
  if (data.hasBankruptcy && data.bankruptcyAge === 'under_2yr') derogPenalty = 20;
  else if (data.hasCollections || data.hasChargeoffs) derogPenalty = 15;
  else if (data.hasTaxLiens) derogPenalty = 12;
  else if (data.hasLatePay) derogPenalty = 5;

  const personalScore = Math.max(0, ficoPoints + utilPoints - derogPenalty);

  // ══════════════════════════════════════════════════════════════════════════
  // COMPONENT 2: FINANCIAL HEALTH (30% = 90 max points)
  // ══════════════════════════════════════════════════════════════════════════
  
  // Revenue contribution (0-40 points) - now categorical
  let revenuePoints = 0;
  if (data.monthlyRevenue === 'over_100k') revenuePoints = 40;
  else if (data.monthlyRevenue === '40k_100k') revenuePoints = 32;
  else if (data.monthlyRevenue === '15k_40k') revenuePoints = 25;
  else if (data.monthlyRevenue === '5k_15k') revenuePoints = 10;
  else if (data.monthlyRevenue === 'under_5k') revenuePoints = 3;

  // Bank rating (0-30 points, but can go negative for 'none')
  // BUG FIX: Apply significant penalty for no bank account
  let bankPoints = 0;
  if (data.bankAccount === 'dedicated') bankPoints += 10;
  else if (data.bankAccount === 'personal') bankPoints += 3;
  else bankPoints -= 15; // FIXED: Changed from 0 to -15 (significant penalty for hard stop)
  
  if (data.avgDailyBalance === '25k_plus' || data.avgDailyBalance === '25k_plus') bankPoints += 12;
  else if (data.avgDailyBalance === '10k_25k') bankPoints += 9;
  else if (data.avgDailyBalance === '2k_10k') bankPoints += 6;
  else if (data.avgDailyBalance === '500_2k') bankPoints += 3;
  else if (data.avgDailyBalance === 'near_zero') bankPoints -= 5; // FIXED: Added penalty for near_zero balance
  
  if (data.nsfCount === '0' || data.nsfCount === 'zero') bankPoints += 8;
  else if (data.nsfCount === '1_2') bankPoints += 3;
  else if (data.nsfCount === '3_5') bankPoints -= 3; // FIXED: Added penalty for multiple NSFs
  else if (data.nsfCount === '5plus' || data.nsfCount === 'over_5') bankPoints -= 8; // FIXED: Added penalty for many NSFs

  // Bank age contribution (0-20 points)
  let bankAgePoints = 0;
  if (data.bankAge === '24plus') bankAgePoints = 20;
  else if (data.bankAge === '12_24mo') bankAgePoints = 14;
  else if (data.bankAge === '6_12mo') bankAgePoints = 8;
  else if (data.bankAge === '0_6mo') bankAgePoints = 3;

  const financialScore = Math.min(90, revenuePoints + bankPoints + bankAgePoints);

  // ══════════════════════════════════════════════════════════════════════════
  // ASSET VALUES (SUPPLEMENTAL SCORING)
  // arBalance, equipmentValue, poBalance now categorical for eligibility check
  // ══════════════════════════════════════════════════════════════════════════
  
  // Accounts Receivable scoring - unlocks invoice factoring at 'over_250k'
  let arPoints = 0;
  if (data.arBalance === 'over_250k') arPoints = 20; // Full points + unlocks factoring
  else if (data.arBalance === '50k_250k') arPoints = 12;
  else if (data.arBalance === '10k_50k') arPoints = 6;
  else if (data.arBalance === 'under_10k') arPoints = 2;
  else arPoints = 0; // 'none' or empty
  
  // Equipment Value scoring - unlocks equipment financing at '50k_250k' or 'over_250k'
  let equipmentPoints = 0;
  if (data.equipmentValue === 'over_250k') equipmentPoints = 20; // Full points
  else if (data.equipmentValue === '50k_250k') equipmentPoints = 18; // Unlocks equipment financing
  else if (data.equipmentValue === '10k_50k') equipmentPoints = 10;
  else if (data.equipmentValue === 'under_10k') equipmentPoints = 3;
  else equipmentPoints = 0; // 'none' or empty
  
  // Purchase Orders scoring - unlocks PO financing at '50k_250k' or 'over_250k'
  let poPoints = 0;
  if (data.poBalance === 'over_250k') poPoints = 20; // Full points
  else if (data.poBalance === '50k_250k') poPoints = 18; // Unlocks PO financing
  else if (data.poBalance === '10k_50k') poPoints = 10;
  else if (data.poBalance === 'under_10k') poPoints = 3;
  else poPoints = 0; // 'none' or empty

  // ══════════════════════════════════════════════════════════════════════════
  // COMPONENT 3: BUSINESS PROFILE (20% = 60 max points)
  // ══════════════════════════════════════════════════════════════════════════
  
  // Entity type (0-15 points)
  let entityPoints = 0;
  if (data.entityType === 'corp') entityPoints = 15;
  else if (data.entityType === 'llc_multi') entityPoints = 12;
  else if (data.entityType === 'llc_single') entityPoints = 8;
  else if (data.entityType === 'sole_prop') entityPoints = 2;

  // Business age (0-20 points)
  const now = new Date();
  const startYear = data.startDate.year || now.getFullYear();
  const startMonth = data.startDate.month || now.getMonth() + 1;
  const ageMonths = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth);
  
  let agePoints = 0;
  if (ageMonths >= 60) agePoints = 20;
  else if (ageMonths >= 36) agePoints = 15;
  else if (ageMonths >= 24) agePoints = 10;
  else if (ageMonths >= 12) agePoints = 5;
  else agePoints = 2;

  // NAP + web presence (0-25 points)
  let napPoints = 0;
  if (data.hasEIN) napPoints += 8;
  if (data.hasWebsite) napPoints += 8;
  if (data.businessName) napPoints += 3;
  if (data.businessAddress) napPoints += 3;
  if (data.businessPhone || data.ownerPhone) napPoints += 3;

  const profileScore = Math.min(60, entityPoints + agePoints + napPoints);

  // ══════════════════════════════════════════════════════════════════════════
  // COMPONENT 4: BUSINESS CREDIT (15% = 45 max points)
  // ══════════════════════════════════════════════════════════════════════════
  
  // Business credit file (0-30 points)
  let bizCreditPoints = 0;
  if (data.bizCreditFile === 'paydex_80plus') bizCreditPoints = 30;
  else if (data.bizCreditFile === 'below_80') bizCreditPoints = 18;
  else if (data.bizCreditFile === 'building') bizCreditPoints = 8;
  else bizCreditPoints = 0;

  // Inquiries impact (0-15 points)
  let inquiryPoints = 0;
  if (data.inquiries30d === '0') inquiryPoints = 15;
  else if (data.inquiries30d === '1_2') inquiryPoints = 10;
  else if (data.inquiries30d === '3_4') inquiryPoints = 5;
  else if (data.inquiries30d === '5plus') inquiryPoints = 0;
  else inquiryPoints = 8;

  const bizCreditScore = Math.min(45, bizCreditPoints + inquiryPoints);

  // ══════════════════════════════════════════════════════════════════════════
  // FINAL SBSS SCORE (0-300 scale)
  // ══════════════════════════════════════════════════════════════════════════
  const sbssTotal = personalScore + financialScore + profileScore + bizCreditScore;
  
  return Math.min(300, Math.max(0, sbssTotal));
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
    monthlyRevenue: '',
    ccSales: '',
    bankAccount: '',
    bankAge: '',
    avgDailyBalance: '',
    nsfCount: '',
    arBalance: '', // FIXED: Changed from 0 to empty string
    equipmentValue: '', // FIXED: Changed from 0 to empty string
    poBalance: '', // FIXED: Changed from 0 to empty string
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

export function computeExtendedResults(data: UnifiedAnswers): ExtendedResultsOutput {
  // Get base scores
  const baseResult = computeScore(data);
  
  // Composite FICO
  const creditScores = [
    data.experian || 0,
    data.transunion || 0,
    data.equifax || 0,
  ].filter(s => s > 0).sort((a, b) => a - b);
  const composite = creditScores.length > 0 ? creditScores[Math.floor(creditScores.length / 2)] : 0;

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

  // SBSS Status (using new 0-300 scale, 160 = bankable threshold)
  const sbssOwnerStatus = composite >= 700 ? 'best' : composite >= 640 ? 'pass' : 'fail';
  const sbssBusinessStatus = baseResult.bankableScore >= 200 ? 'best' : baseResult.bankableScore >= 160 ? 'pass' : 'fail';

  // SBSS Sections
  const sbssSections = computeSBSSSections(data, composite, baseResult.bankableScore);

  // Work Needed
  const workNeeded = computeWorkNeeded(data, composite, bankableItems);

  // SBSS Score is now directly from the bankable score (0-300 scale)
  // Already computed with proper 35/30/20/15 weighting in calculateBankableScore
  const sbssScore = baseResult.bankableScore;

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
    sbssScore,
    sbssOwnerStatus,
    sbssBusinessStatus,
    sbssSections,
    workNeeded,
  };
}

// ─────────────────────────────────────────────────���──────────────────────────────
// HELPER: Funding Range Lookup
// Aligned with Elon's strategic notes: ranges should reflect real capital unlock potential
// Reference: "$80K → $250K → $1.4M" trajectory mentioned in strategic review
// ─────────────���──────────────────────────────────────────────────────────────────
function getFundingRange(score: number): ExtendedResultsOutput['fundingRange'] {
  // Score is 0-1000
  if (score >= 900) {
    return {
      currentBand: '900 to 1000',
      businessOnlyMin: 500000,
      businessOnlyMax: 1500000,
      personalAndBusinessMin: 750000,
      personalAndBusinessMax: 2500000,
      scoreRangeLabel: '900 to 1000',
    };
  }
  if (score >= 800) {
    return {
      currentBand: '800 to 899',
      businessOnlyMin: 100000,
      businessOnlyMax: 500000,
      personalAndBusinessMin: 150000,
      personalAndBusinessMax: 750000,
      scoreRangeLabel: '800 to 899',
    };
  }
  if (score >= 700) {
    return {
      currentBand: '700 to 799',
      businessOnlyMin: 50000,
      businessOnlyMax: 150000,
      personalAndBusinessMin: 75000,
      personalAndBusinessMax: 250000,
      scoreRangeLabel: '700 to 799',
    };
  }
  if (score >= 600) {
    return {
      currentBand: '600 to 699',
      businessOnlyMin: 25000,
      businessOnlyMax: 75000,
      personalAndBusinessMin: 40000,
      personalAndBusinessMax: 125000,
      scoreRangeLabel: '600 to 699',
    };
  }
  // Below 600 - limited options but still some alternative financing available
  return {
    currentBand: 'Below 600',
    businessOnlyMin: 5000,
    businessOnlyMax: 25000,
    personalAndBusinessMin: 10000,
    personalAndBusinessMax: 50000,
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
// ─────────────────────────��────────────��─────────────────────────────────────────
function computeBankableItems(data: UnifiedAnswers): ExtendedResultsOutput['bankableItems'] {
  const creditScores = [data.experian || 0, data.transunion || 0, data.equifax || 0].filter(s => s > 0).sort((a, b) => a - b);
  const composite = creditScores.length > 0 ? creditScores[Math.floor(creditScores.length / 2)] : 0;
  const goodStanding = data.readinessAnswers[8] === 0; // Q_R9 index 8, option A = "Yes, all filings current"
  const sbssScore = calculateBankableScore(data); // Get computed SBSS score (0-300)

  const descriptions = [
    'Funding programs you currently pre-qualify for are listed inside the bankable system login.',
    'A minimum 160 SBSS is required by banks, credit unions and all the SBA lenders.',
    "35% of the SBSS score is the Owner's credit. A minimum 640 FICO 8 is required.",
    '30% of the SBSS score is the Bank Rating. A minimum Low 5 is required.',
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
    { name: 'Business FICO (SBSS)', status: (sbssScore >= 160 ? 'pass' : 'fail') as const },
    { name: 'Owner\'s Credit', status: (composite >= 640 ? 'pass' : 'fail') as const },
    { name: 'Bank Rating', status: (data.avgDailyBalance !== 'near_zero' && data.nsfCount === 'zero' ? 'pass' : 'fail') as const },
    { name: 'Business Credit', status: (data.bizCreditFile === 'paydex_80plus' ? 'pass' : 'fail') as const },
    { name: 'Reporting Tradelines', status: (data.bizCreditFile === 'paydex_80plus' ? 'pass' : 'fail') as const },
    { name: 'Detailed Reports', status: (data.bizCreditFile !== 'none' ? 'pass' : 'fail') as const },
    { name: 'Business Revenue', status: ((['15k_40k', '40k_100k', 'over_100k'].includes(data.monthlyRevenue)) ? 'pass' : 'fail') as const },
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
        (['40k_100k', 'over_100k'].includes(data.monthlyRevenue) && data.nsfCount === '0' && data.bankAccount === 'dedicated') ? 'pass' :
        (['5k_15k', '15k_40k', '40k_100k', 'over_100k'].includes(data.monthlyRevenue) || data.bankAccount === 'dedicated') ? 'partial' :
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
