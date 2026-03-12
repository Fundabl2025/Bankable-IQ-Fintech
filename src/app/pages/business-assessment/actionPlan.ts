// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Action Plan Generator
// Intelligent prioritization of 5 highest-impact actions
// ════════════════════════════════════════════════════════════════════════════════

import { UnifiedAnswers } from './types';

export interface Action {
  id: string;
  priority: number; // 1-5, where 1 is highest
  title: string;
  impact: 'Critical' | 'High' | 'Medium';
  impactPoints: number; // Estimated score increase
  timeline: string;
  category: 'Credit' | 'Documentation' | 'Banking' | 'Structure' | 'Revenue';
  description: string;
  steps: string[];
}

export function generateActionPlan(data: UnifiedAnswers, currentScore: number): Action[] {
  const actions: Action[] = [];
  let priority = 1;

  const creditScore = Math.min(data.experian || 680, data.transunion || 680, data.equifax || 680);
  const businessAge = calculateBusinessAge(data.startDate.year, data.startDate.month);

  // ──────────────────────────────────────────────────────────────────────────────
  // CRITICAL ACTIONS (Must be fixed before applying)
  // ──────────────────────────────────────────────────────────────────────────────

  // Not in good standing
  if (data.q_r9 && data.q_r9 !== 'yes_current') {
    actions.push({
      id: 'state_standing',
      priority: priority++,
      title: 'Resolve State Compliance Issues',
      impact: 'Critical',
      impactPoints: 0, // Gating issue, not score-based
      timeline: '1–2 weeks',
      category: 'Structure',
      description: 'Your business is not in good standing with your state. This is an automatic rejection reason for all lenders.',
      steps: [
        'Visit your state\'s Secretary of State website',
        'Check status of all required filings (Annual Report, Business License)',
        'Pay any outstanding fees or penalties',
        'File any missing reports',
        'Obtain "Certificate of Good Standing" (required by most lenders)',
      ],
    });
  }

  // Recent bankruptcy
  if (data.hasBankruptcy && data.bankruptcyAge === 'under_2yr') {
    actions.push({
      id: 'bankruptcy_wait',
      priority: priority++,
      title: 'Wait for Bankruptcy Seasoning',
      impact: 'Critical',
      impactPoints: 0,
      timeline: 'Time-dependent',
      category: 'Credit',
      description: 'Your bankruptcy is under 2 years old. Most lenders require 2–4 years of seasoning.',
      steps: [
        'Focus on rebuilding credit in the meantime',
        'Consider alternative lenders after 2-year mark',
        'Target SBA products after 4 years',
        'Build strong business documentation now',
        'Document post-bankruptcy financial recovery',
      ],
    });
  }

  // Active judgments/liens
  if (data.hasJudgments === true) {
    actions.push({
      id: 'resolve_judgments',
      priority: priority++,
      title: 'Resolve All Judgments and Liens',
      impact: 'Critical',
      impactPoints: 0,
      timeline: '2–8 weeks',
      category: 'Credit',
      description: 'Active judgments or liens are automatic disqualifiers for most financing.',
      steps: [
        'Pull your credit report from all 3 bureaus',
        'Identify all judgments, liens, and their amounts',
        'Negotiate payment or settlement with creditors',
        'Pay in full or establish payment plan',
        'Obtain satisfaction documents and file with courts',
        'Verify removal from credit reports (90–120 days)',
      ],
    });
  }

  // No EIN
  if (!data.hasEIN) {
    actions.push({
      id: 'get_ein',
      priority: priority++,
      title: 'Obtain an EIN Immediately',
      impact: 'Critical',
      impactPoints: 35,
      timeline: '1 day',
      category: 'Structure',
      description: 'An EIN is required for SBA loans and most institutional lenders.',
      steps: [
        'Visit IRS.gov/EIN',
        'Complete online application (SS-4)',
        'Receive EIN instantly online',
        'Update bank account to reflect EIN',
        'Update all business registrations',
      ],
    });
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // HIGH-IMPACT ACTIONS
  // ──────────────────────────────────────────────────────────────────────────────

  // High utilization
  if (data.utilization && data.utilization > 30) {
    const pointsGain = data.utilization > 70 ? 50 : data.utilization > 50 ? 35 : 25;
    actions.push({
      id: 'reduce_utilization',
      priority: priority++,
      title: 'Reduce Credit Utilization Below 30%',
      impact: 'High',
      impactPoints: pointsGain,
      timeline: '1–2 months',
      category: 'Credit',
      description: `Your utilization is ${data.utilization}%. This is actively lowering your credit score. Getting below 30% will increase your score 20–40 points.`,
      steps: [
        `Pay down balances by approximately $${Math.round((data.utilization - 28) * 10 * 10)}`,
        'Focus on cards with highest utilization first',
        'Request credit limit increases (doesn\'t hurt if approved)',
        'Consider balance transfer to 0% APR card',
        'Set up automatic payments to prevent utilization spikes',
      ],
    });
  }

  // No dedicated business bank account
  if (data.bankAccount !== 'dedicated') {
    actions.push({
      id: 'dedicated_bank',
      priority: priority++,
      title: 'Open a Dedicated Business Bank Account',
      impact: 'High',
      impactPoints: 30,
      timeline: '1 week',
      category: 'Banking',
      description: 'Using a personal account for business damages your fundability and complicates lender review.',
      steps: [
        'Research business checking accounts (local banks often best)',
        'Bring EIN, business formation docs, and ID',
        'Open account with initial deposit',
        'Redirect all business income to new account',
        'Pay all business expenses from this account only',
        'Wait 3–6 months to build history before applying',
      ],
    });
  }

  // Young bank account
  if (data.bankAge === '0_6mo') {
    actions.push({
      id: 'bank_age',
      priority: priority++,
      title: 'Age Your Business Bank Account',
      impact: 'High',
      impactPoints: 25,
      timeline: '6–12 months',
      category: 'Banking',
      description: 'Your account is under 6 months old. Most lenders want 12 months of statements.',
      steps: [
        'Continue operating through current account',
        'Maintain consistent deposit activity',
        'Avoid NSFs and overdrafts',
        'Build average daily balance',
        'Keep account open until at least 12 months',
        'Document all transactions clearly',
      ],
    });
  }

  // NSF issues
  if (data.nsfCount && ['3_5', 'over_5'].includes(data.nsfCount)) {
    actions.push({
      id: 'eliminate_nsfs',
      priority: priority++,
      title: 'Eliminate NSF and Overdraft Events',
      impact: 'High',
      impactPoints: 30,
      timeline: 'Immediate + 6 months',
      category: 'Banking',
      description: 'Multiple NSFs in the last 12 months are red flags. Lenders review statements line by line.',
      steps: [
        'Set up low balance alerts (under $500)',
        'Link savings account for overdraft protection',
        'Build 2-week cash buffer in checking',
        'Review cash flow weekly, not monthly',
        'Wait 6–12 months for NSFs to age off review window',
      ],
    });
  }

  // No P&L
  if (data.q_r2 === 'no_pl') {
    actions.push({
      id: 'create_pl',
      priority: priority++,
      title: 'Create a Current Profit & Loss Statement',
      impact: 'High',
      impactPoints: 40,
      timeline: '1–2 weeks',
      category: 'Documentation',
      description: 'A P&L is a hard requirement for most lenders. Without it, you cannot demonstrate profitability.',
      steps: [
        'Use QuickBooks, Xero, or Wave (free)',
        'Categorize all income and expenses for last 12 months',
        'Generate monthly P&L statements',
        'Compare to bank statements for consistency',
        'Have a CPA review (optional but strengthens credibility)',
        'Update monthly going forward',
      ],
    });
  }

  // No tax returns
  if (data.q_r1 === 'none_filed') {
    actions.push({
      id: 'file_taxes',
      priority: priority++,
      title: 'File Business Tax Returns',
      impact: 'Critical',
      impactPoints: 50,
      timeline: '2–4 weeks',
      category: 'Documentation',
      description: 'No filed returns = instant denial from most conventional lenders.',
      steps: [
        'Hire a CPA or tax professional',
        'Gather all income and expense records',
        'File past-due returns (if applicable)',
        'File current year return on time',
        'Obtain copies of filed returns for lender submission',
      ],
    });
  }

  // Insufficient bank statements
  if (data.q_r3 && ['under_3mo', '3_5mo'].includes(data.q_r3)) {
    actions.push({
      id: 'bank_statements',
      priority: priority++,
      title: 'Build 12 Months of Bank Statement History',
      impact: 'High',
      impactPoints: 35,
      timeline: `${12 - (data.q_r3 === 'under_3mo' ? 2 : 4)} months`,
      category: 'Banking',
      description: 'Most lenders require 12 months of business bank statements. You need more time.',
      steps: [
        'Continue operating through current account',
        'Maintain clean, consistent deposit patterns',
        'Avoid commingling personal and business funds',
        'Build to 12 months before applying',
        'Ensure statements show consistent revenue',
      ],
    });
  }

  // Documentation mismatch
  if (data.q_r4 && ['significant_diff', 'not_sure'].includes(data.q_r4)) {
    actions.push({
      id: 'doc_consistency',
      priority: priority++,
      title: 'Align Tax Returns and Bank Statements',
      impact: 'High',
      impactPoints: 40,
      timeline: '2–4 weeks',
      category: 'Documentation',
      description: 'Lenders cross-check your documents. Discrepancies raise red flags and stall applications.',
      steps: [
        'Compare reported tax revenue to bank deposits',
        'Identify and document all differences',
        'Prepare explanations for legitimate differences (loans, transfers, etc.)',
        'If error exists, file amended return if necessary',
        'Ensure going forward all income is deposited and reported',
      ],
    });
  }

  // Low revenue
  if (data.monthlyRevenue && data.monthlyRevenue < 10000) {
    actions.push({
      id: 'grow_revenue',
      priority: priority++,
      title: 'Increase Monthly Revenue to $10K+',
      impact: 'High',
      impactPoints: 45,
      timeline: '3–6 months',
      category: 'Revenue',
      description: 'Most alternative lenders require $10K/mo minimum. Traditional lenders want $25K+.',
      steps: [
        'Focus on sales and customer acquisition',
        'Raise prices if underpriced',
        'Add complementary products/services',
        'Improve conversion rates',
        'Document revenue growth month-over-month',
      ],
    });
  }

  // Declining revenue trend
  if (data.q_r5 === 'declining') {
    actions.push({
      id: 'reverse_decline',
      priority: priority++,
      title: 'Reverse Declining Revenue Trend',
      impact: 'Critical',
      impactPoints: 50,
      timeline: '3–6 months',
      category: 'Revenue',
      description: 'Declining revenue triggers automatic concern about repayment ability.',
      steps: [
        'Identify root cause of decline (seasonality, market, operations)',
        'Implement corrective actions immediately',
        'Focus on customer retention',
        'Cut unprofitable products/services',
        'Wait until you show 3+ months of growth before applying',
      ],
    });
  }

  // Not profitable
  if (data.q_r6 && ['rarely', 'half'].includes(data.q_r6)) {
    actions.push({
      id: 'achieve_profit',
      priority: priority++,
      title: 'Achieve Consistent Monthly Profitability',
      impact: 'Critical',
      impactPoints: 55,
      timeline: '2–6 months',
      category: 'Revenue',
      description: 'Lenders need to see margin for new debt payments. Break-even businesses cannot service loans.',
      steps: [
        'Conduct profitability analysis by product/service',
        'Cut or fix unprofitable offerings',
        'Reduce variable costs where possible',
        'Increase pricing strategically',
        'Target 20%+ net profit margin',
        'Document 3+ months of profitability before applying',
      ],
    });
  }

  // No business credit
  if (data.bizCreditFile === 'none') {
    actions.push({
      id: 'build_biz_credit',
      priority: priority++,
      title: 'Start Building Business Credit',
      impact: 'Medium',
      impactPoints: 30,
      timeline: '6–12 months',
      category: 'Credit',
      description: 'Business credit (D&B Paydex, Experian Intelliscore) is separate from personal credit and opens additional funding.',
      steps: [
        'Register with D&B (Dun & Bradstreet) to get a DUNS number',
        'Register with Experian Business',
        'Open trade lines with vendors that report (Uline, Grainger, Quill)',
        'Make on-time payments for 6+ months',
        'Apply for net-30 terms and pay early',
        'Build to Paydex 80+ and Intelliscore 76+',
      ],
    });
  }

  // No website
  if (data.hasWebsite === false) {
    actions.push({
      id: 'create_website',
      priority: priority++,
      title: 'Create a Professional Business Website',
      impact: 'Medium',
      impactPoints: 15,
      timeline: '1–2 weeks',
      category: 'Structure',
      description: 'Lenders verify your web presence. A website signals legitimacy and operational maturity.',
      steps: [
        'Purchase domain matching business name',
        'Use Wix, Squarespace, or WordPress',
        'Include: About, Services, Contact info, NAP (Name/Address/Phone)',
        'Add business logo and professional images',
        'Ensure NAP matches all other business listings',
        'Connect to Google My Business',
      ],
    });
  }

  // Sole proprietor
  if (data.entityType === 'sole_prop') {
    actions.push({
      id: 'form_llc',
      priority: priority++,
      title: 'Form an LLC or Corporation',
      impact: 'High',
      impactPoints: 35,
      timeline: '2–4 weeks',
      category: 'Structure',
      description: 'Sole proprietorships face limited funding options. LLC or Corp is required for SBA and most bank products.',
      steps: [
        'Choose LLC (simpler) or S-Corp (tax advantages)',
        'File Articles of Organization with your state',
        'Obtain new EIN under LLC/Corp name',
        'Open new business bank account under LLC',
        'Transfer operations to new entity',
        'Update all licenses, permits, and registrations',
      ],
    });
  }

  // No industry experience
  if (data.q_r14 === 'new_industry') {
    actions.push({
      id: 'document_expertise',
      priority: priority++,
      title: 'Document Your Industry Expertise',
      impact: 'Medium',
      impactPoints: 20,
      timeline: '1 week',
      category: 'Documentation',
      description: 'Even if you\'re new to this industry, document transferable skills and early traction.',
      steps: [
        'Create a business owner resume highlighting relevant skills',
        'Document any training, certifications, or education',
        'Highlight transferable experience from prior roles',
        'Include customer testimonials or early wins',
        'Prepare to explain why you\'re qualified despite being new',
      ],
    });
  }

  // No prior loan repayment
  if (data.q_r12 && ['no_first', 'no_defaults'].includes(data.q_r12)) {
    actions.push({
      id: 'establish_repayment',
      priority: priority++,
      title: 'Establish Business Loan Repayment History',
      impact: 'Medium',
      impactPoints: 25,
      timeline: '6–12 months',
      category: 'Credit',
      description: 'Past repayment is the strongest behavioral signal. Consider a small starter loan.',
      steps: [
        'Apply for a small working capital loan ($5K–$10K)',
        'Use from alternative lender (faster approval)',
        'Make all payments on time',
        'Pay off in full over 6–12 months',
        'This history will strengthen next application significantly',
      ],
    });
  }

  // Sort actions by priority and return top 5
  return actions
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map((action, index) => ({ ...action, priority: index + 1 }));
}

function calculateBusinessAge(year?: number, month?: number): number {
  if (!year || !month) return 0;
  const now = new Date();
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
}
