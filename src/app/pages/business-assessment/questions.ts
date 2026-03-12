// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Assessment Questions
// 10 Foundation + 13 Readiness = 23 Total, ZERO Redundancy
// ════════════════════════════════════════════════════════════════════════════════

import { Question } from './types';

// ════════════════════════════════════════════════════════════════════════════════
// PART 2: READINESS QUESTIONS (13 questions)
// These are ONLY the questions that foundation data cannot answer
// ════════════════════════════════════════════════════════════════════════════════

export const READINESS_QUESTIONS: Question[] = [
  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION D — DOCUMENTATION (Q_R1–Q_R4)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "How many years of filed business tax returns do you have?",
    why: "The SBA requires 2 years of filed returns. Most banks want 2–3 years. No returns = instant denial from most conventional lenders — no workaround exists.",
    type: 'options',
    options: [
      {
        label: 'None filed yet',
        sub: 'Hard stop for most lenders',
        score: { D: 0.0 },
      },
      {
        label: '1 year filed',
        sub: 'Qualifies for some alternative lenders',
        score: { D: 0.35 },
      },
      {
        label: '2 years filed',
        sub: 'Meets SBA and most bank requirements',
        score: { D: 0.75 },
      },
      {
        label: '3 or more years',
        sub: 'Strong documentation position',
        score: { D: 1.0 },
      },
    ],
  },
  {
    text: "Do you have a current Profit & Loss (P&L) statement?",
    why: "A P&L shows lenders whether the business actually makes money. Without one, you're asking them to trust a number with no proof. This is the document most business owners don't have when they apply.",
    type: 'options',
    options: [
      {
        label: 'Yes — professionally prepared (CPA or accounting software)',
        sub: 'Strongest documentation signal',
        score: { D: 1.0 },
      },
      {
        label: 'Yes — I made it myself in a spreadsheet',
        sub: 'Acceptable for most lenders',
        score: { D: 0.6 },
      },
      {
        label: "I have one but it's over 6 months old",
        sub: 'Needs to be updated',
        score: { D: 0.35 },
      },
      {
        label: 'No P&L',
        sub: 'Hard requirement for most products',
        score: { D: 0.0 },
      },
    ],
  },
  {
    text: "How many months of business bank statements can you provide right now?",
    why: "Lenders read every line of 12 months of statements. Less than 3 months disqualifies you from most products — not because of the numbers, but because there isn't enough history to evaluate.",
    type: 'options',
    options: [
      {
        label: 'Less than 3 months',
        sub: 'Insufficient for most lenders',
        score: { D: 0.1 },
      },
      {
        label: '3 – 5 months',
        sub: 'Minimum for alternative lenders',
        score: { D: 0.35 },
      },
      {
        label: '6 – 11 months',
        sub: 'Good — approaching full year',
        score: { D: 0.65 },
      },
      {
        label: '12 or more months',
        sub: 'Meets all lender requirements',
        score: { D: 1.0 },
      },
    ],
  },
  {
    text: "Do the revenue figures on your tax returns and bank statements roughly match each other?",
    why: "Lenders cross-reference your documents automatically. A material difference between your tax-reported income and bank deposits raises immediate questions that stall or kill applications.",
    type: 'options',
    options: [
      {
        label: 'Yes — within 10%',
        sub: 'Clean documentation alignment',
        score: { D: 1.0 },
      },
      {
        label: 'Within 15–25% difference',
        sub: 'May require explanation',
        score: { D: 0.6 },
      },
      {
        label: 'Significant difference exists',
        sub: 'Red flag for lenders',
        score: { D: 0.15 },
      },
      {
        label: "I'm not sure",
        sub: 'Need to verify before applying',
        score: { D: 0.35 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION E — CASH FLOW BEHAVIOR (Q_R5–Q_R7)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Has your revenue been growing, flat, or declining over the past 12 months?",
    why: "Lenders don't just look at where you are — they look at where you're headed. A declining trend triggers automatic concern about repayment ability regardless of the current revenue number.",
    type: 'options',
    options: [
      {
        label: 'Growing — consistently up month over month',
        sub: 'Strongest trend signal',
        score: { F: 1.0 },
      },
      {
        label: 'Growing — but inconsistently',
        sub: 'Positive direction with volatility',
        score: { F: 0.7 },
      },
      {
        label: 'Flat — roughly the same each month',
        sub: 'Stable but no growth trajectory',
        score: { F: 0.5 },
      },
      {
        label: 'Declining — revenue has been going down',
        sub: 'Repayment risk concern',
        score: { F: 0.1 },
      },
    ],
  },
  {
    text: "After all business expenses, does your business consistently generate a monthly profit?",
    why: "Profit is how lenders know you can service new debt. A business that breaks even every month has no margin for a new loan payment — and lenders see that immediately in your numbers.",
    type: 'options',
    options: [
      {
        label: 'Yes — profitable every month',
        sub: 'Strong cash flow position',
        score: { F: 1.0 },
      },
      {
        label: 'Most months — occasional break-even',
        sub: 'Generally positive with some volatility',
        score: { F: 0.65 },
      },
      {
        label: 'About half the time',
        sub: 'Inconsistent profitability',
        score: { F: 0.3 },
      },
      {
        label: 'Rarely or not yet',
        sub: 'Not yet profitable',
        score: { F: 0.05 },
      },
    ],
  },
  {
    text: "If you took on a new monthly loan payment, could your business comfortably cover it?",
    why: "This is the DSCR — Debt Service Coverage Ratio — the most critical cash flow metric. Lenders want to see 25% more income than debt payments. 'Probably' is not a DSCR position that lenders accept.",
    type: 'options',
    options: [
      {
        label: 'Yes — strong surplus above expenses',
        sub: 'DSCR 1.35+ — excellent position',
        score: { F: 1.0 },
      },
      {
        label: 'Yes — but it would be tight',
        sub: 'DSCR 1.10–1.25 — acceptable',
        score: { F: 0.6 },
      },
      {
        label: 'Possibly — depends on the amount',
        sub: 'Marginal debt capacity',
        score: { F: 0.35 },
      },
      {
        label: 'No — little to no margin',
        sub: 'Insufficient debt capacity',
        score: { F: 0.05 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION F — BANKING TRAJECTORY (Q_R8)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Has your average daily bank balance been trending upward over the last 3–6 months?",
    why: "An improving cash position tells lenders your business is gaining financial strength. Lenders read direction, not just current state. A rising balance story is worth more than a static one.",
    type: 'options',
    options: [
      {
        label: 'Yes — consistently growing',
        sub: 'Positive trajectory',
        score: { B: 1.0 },
      },
      {
        label: 'About the same',
        sub: 'Stable position',
        score: { B: 0.55 },
      },
      {
        label: 'Declining',
        sub: 'Concerning trend',
        score: { B: 0.1 },
      },
      {
        label: "I haven't tracked it",
        sub: 'Unknown trajectory',
        score: { B: 0.4 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION G — LEGAL STANDING (Q_R9)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Is your business currently in good standing with your state?",
    why: "Lapsed filings or delinquent state fees trigger automatic rejection. Lenders verify this in minutes through state databases — there is no workaround and no exception process.",
    type: 'options',
    options: [
      {
        label: 'Yes — all filings current',
        sub: 'Compliant status',
        score: { S: 1.0 },
      },
      {
        label: "I think so — haven't checked recently",
        sub: 'Should verify before applying',
        score: { S: 0.65 },
      },
      {
        label: 'No — there are outstanding issues',
        sub: 'Hard stop — must resolve first',
        score: { S: 0.0 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION H — NARRATIVE STRENGTH (Q_R10–Q_R14)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Can you clearly explain exactly how you will use the loan funds — with specific dollar amounts?",
    why: "Vague use-of-funds kills applications that otherwise qualify. Lenders want exact numbers, exact purpose, exact timeline. 'Working capital' is not an answer.",
    type: 'options',
    options: [
      {
        label: 'Yes — precisely, with numbers and timeline',
        sub: 'Clear capital deployment plan',
        score: { N: 1.0 },
      },
      {
        label: 'Mostly — I have a general idea',
        sub: 'Needs more specificity',
        score: { N: 0.55 },
      },
      {
        label: "I know what I need but can't explain ROI",
        sub: 'Weak narrative position',
        score: { N: 0.25 },
      },
      {
        label: 'Not really — I just know I need capital',
        sub: 'Not ready for lender questions',
        score: { N: 0.0 },
      },
    ],
  },
  {
    text: "Can you clearly explain how you will repay the loan — from which revenue stream, on what timeline?",
    why: "Lenders lend to plans, not desperation. 'From business revenue' is not a repayment plan. Which revenue stream, what margin, what timeline — these are the specifics that separate confident applicants from denied ones.",
    type: 'options',
    options: [
      {
        label: 'Yes — specific revenue stream and repayment path',
        sub: 'Clear repayment plan',
        score: { N: 1.0 },
      },
      {
        label: 'Generally — from ongoing business revenue',
        sub: 'Vague but directionally correct',
        score: { N: 0.5 },
      },
      {
        label: "I haven't thought this through in detail",
        sub: 'Not prepared for lender questions',
        score: { N: 0.1 },
      },
    ],
  },
  {
    text: "Have you ever successfully repaid a business loan or line of credit?",
    why: "Past repayment is the single strongest behavioral predictor lenders use. A completed, on-time loan repayment proves credit character in a way no credit score fully captures.",
    type: 'options',
    options: [
      {
        label: 'Yes — paid in full, on time',
        sub: 'Proven repayment behavior',
        score: { N: 1.0 },
        boost: 45, // THE ONLY BOOST IN THE ENTIRE SYSTEM
      },
      {
        label: 'Yes — paid off but had some late payments',
        sub: 'Completed but imperfect',
        score: { N: 0.55 },
      },
      {
        label: 'No — this would be my first business loan',
        sub: 'No repayment track record',
        score: { N: 0.4 },
      },
      {
        label: 'No — and there were defaults or issues',
        sub: 'Negative repayment history',
        score: { N: 0.0 },
      },
    ],
  },
  {
    text: "How relevant is your personal background and experience to the business you currently operate?",
    why: "Years of relevant experience reduce perceived execution risk — especially for newer businesses. Lenders weigh operator expertise heavily when the business itself has limited history.",
    type: 'options',
    options: [
      {
        label: '10+ years in this exact industry',
        sub: 'Deep domain expertise',
        score: { N: 1.0 },
      },
      {
        label: '5–10 years of relevant experience',
        sub: 'Solid industry background',
        score: { N: 0.78 },
      },
      {
        label: '1–5 years — still building expertise',
        sub: 'Some industry experience',
        score: { N: 0.5 },
      },
      {
        label: 'New to this industry',
        sub: 'Learning on the job',
        score: { N: 0.2 },
      },
    ],
  },
];

// Question indices for each readiness section
export const READINESS_SECTIONS = {
  Documentation: [0, 1, 2, 3],    // Q_R1–Q_R4
  'Cash Flow': [4, 5, 6],         // Q_R5–Q_R7
  Structure: [7, 8],               // Q_R8, Q_R9
  Narrative: [9, 10, 11, 12],     // Q_R10–Q_R13 (removed Q_R14 duplicate)
} as const;