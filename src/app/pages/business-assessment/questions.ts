// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Unified Assessment Questions
// 10 Foundation + 23 Readiness = 33 Total, ZERO Redundancy
// ════════════════════════════════════════════════════════════════════════════════

import { Question } from './types';

// ════════════════════════════════════════════════════════════════════════════════
// PART 2: READINESS QUESTIONS (23 questions)
// These are ONLY the questions that foundation data cannot answer
// ════════════════════════════════════════════════════════════════════════════════

export const READINESS_QUESTIONS: Question[] = [
  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION D — DOCUMENTATION (Q_R1–Q_R4)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "How many years of filed business tax returns does your business have available?",
    why: "The SBA requires 2 years of filed returns. Most banks want 2–3 years. No returns = instant denial from most conventional lenders — no workaround exists.",
    type: 'options',
    options: [
      {
        label: 'None filed yet',
        sub: 'A pattern that typically blocks approval',
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
    text: "Is your business's Profit & Loss statement current and accessible?",
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
        sub: 'A common requirement across most lenders',
        score: { D: 0.0 },
      },
    ],
  },
  {
    text: "How many months of business bank statements are readily available?",
    why: "Lenders read every line of 12 months of statements. Less than 3 months disqualifies you from most products — not because of the numbers, but because there isn't enough history to evaluate.",
    type: 'options',
    options: [
      {
        label: 'Less than 3 months',
        sub: 'Below the threshold most lenders look for',
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
    text: "How closely do your reported revenue figures align across your tax returns and bank statements?",
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
        sub: 'A pattern lenders commonly flag',
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
    text: "How would you describe your revenue trajectory over the past 12 months?",
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
        sub: 'A trend that raises repayment questions',
        score: { F: 0.1 },
      },
    ],
  },
  {
    text: "After all expenses, how consistently does your business generate a monthly profit?",
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
        sub: 'Building toward profitability',
        score: { F: 0.05 },
      },
    ],
  },
  {
    text: "If your business took on a new monthly payment, how comfortably could it absorb that obligation?",
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
        sub: 'Limited margin for additional obligations',
        score: { F: 0.05 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION F — BANKING TRAJECTORY (Q_R8)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "How has your average daily bank balance been trending over the last 3–6 months?",
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
        sub: 'A pattern that raises questions',
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
    text: "What is your business's current standing with your state?",
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
        sub: 'An issue that typically needs resolution before applying',
        score: { S: 0.0 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION H — NARRATIVE STRENGTH (Q_R10–Q_R14)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "How precisely can you articulate your intended use of capital — including specific dollar amounts and timeline?",
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
        sub: 'An area that benefits from more specificity',
        score: { N: 0.25 },
      },
      {
        label: 'Not really — I just know I need capital',
        sub: 'An area where additional preparation helps',
        score: { N: 0.0 },
      },
    ],
  },
  {
    text: "How clearly can you map your repayment path — which revenue stream, what margin, what timeline?",
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
        sub: 'An area that benefits from more preparation',
        score: { N: 0.1 },
      },
    ],
  },
  {
    text: "Has your business previously completed repayment on a loan or line of credit?",
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
        sub: 'A pattern that weighs heavily in lender evaluation',
        score: { N: 0.0 },
      },
    ],
  },
  {
    text: "How closely does your professional background align with the business you're operating?",
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

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION H — PERSONAL CREDIT UTILIZATION (Q_R14)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "How much of your available personal credit are you currently using?",
    why: "Credit utilization accounts for 30% of FICO scores. Over 30% signals financial stress to lenders. Lenders read this as: 'This person relies on credit to operate' — which means more risk in downturns.",
    type: 'options',
    options: [
      {
        label: 'Under 10%',
        sub: 'Excellent utilization',
        score: { P: 1.0 },
      },
      {
        label: '10% to 30%',
        sub: 'Good utilization',
        score: { P: 0.8 },
      },
      {
        label: '30% to 50%',
        sub: 'Moderate — approaching risk zone',
        score: { P: 0.5 },
      },
      {
        label: '50% to 75%',
        sub: 'A level that signals financial pressure',
        score: { P: 0.2 },
      },
      {
        label: 'Over 75%',
        sub: 'A pattern that significantly impacts approval',
        score: { P: 0.0 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION I — CLEAN CREDIT REPORT (Q_R15)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Are there any negative items currently appearing on your personal credit report?",
    why: "Negative items tell lenders about your behavior under stress. Even resolved items signal past financial difficulty. Lenders use this to decide: 'Did this person learn from problems or make them worse?'",
    type: 'options',
    options: [
      {
        label: 'No negative items',
        sub: 'Clean credit profile',
        score: { P: 1.0 },
      },
      {
        label: 'Yes, I have some',
        sub: 'Negative items present',
        score: { P: 0.0 }, // Conditional logic determines if next questions show
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION J — BANKRUPTCY HISTORY (Q_R16 - Conditional)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Has a bankruptcy filing appeared in your credit history?",
    why: "Bankruptcy is the ultimate credit event. Recent bankruptcies are near-automatic denials. Age matters significantly — a bankruptcy from 10 years ago is different from one last year.",
    type: 'options',
    options: [
      {
        label: 'No',
        sub: 'No bankruptcy history',
        score: { P: 1.0 },
      },
      {
        label: 'Yes, within the last 2 years',
        sub: 'A significant credit event in recent history',
        score: { P: 0.0 }, // -30 penalty in engine
      },
      {
        label: 'Yes, 2 to 7 years ago',
        sub: 'Aging bankruptcy',
        score: { P: 0.3 }, // -15 penalty in engine
      },
      {
        label: 'Yes, over 7 years ago',
        sub: 'Old bankruptcy — minor impact',
        score: { P: 0.7 }, // -5 penalty in engine
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION K — COLLECTIONS / CHARGEOFFS (Q_R17 - Conditional)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Are there any collections or charge-offs currently on your credit report?",
    why: "Collections mean you broke a payment agreement and an account went to third-party collection. This signals defaulting on financial obligations — the exact behavior lenders fear most.",
    type: 'options',
    options: [
      {
        label: 'No',
        sub: 'No collections or chargeoffs',
        score: { P: 1.0 },
      },
      {
        label: 'Yes, currently active',
        sub: 'Active collection accounts',
        score: { P: 0.0 }, // -25 penalty in engine
      },
      {
        label: 'Yes, but paid or resolved',
        sub: 'Resolved collections',
        score: { P: 0.8 }, // -5 penalty in engine
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION L — TAX LIENS (Q_R18 - Conditional)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Are there any tax liens associated with your profile?",
    why: "Tax liens mean you owe money to the government and have failed to resolve it. Governments always collect first — even before your lenders. This creates a priority problem lenders cannot ignore.",
    type: 'options',
    options: [
      {
        label: 'No',
        sub: 'No tax liens',
        score: { P: 1.0 },
      },
      {
        label: 'Yes, federal',
        sub: 'Federal tax lien',
        score: { P: 0.0 }, // -20 penalty in engine
      },
      {
        label: 'Yes, state',
        sub: 'State tax lien',
        score: { P: 0.0 }, // -20 penalty in engine
      },
      {
        label: 'Yes, both federal and state',
        sub: 'Multiple tax liens',
        score: { P: 0.0 }, // -20 penalty in engine
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION M — BUSINESS CREDIT PROFILE (Q_R19)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Has your business established a credit profile with any of the major business bureaus?",
    why: "Business credit is separate from personal credit. Many lenders check business credit even for small businesses. A strong business credit score signals: 'This company pays its suppliers and vendors on time.'",
    type: 'options',
    options: [
      {
        label: 'Yes, strong payment history (Paydex 80+)',
        sub: 'Excellent business credit',
        score: { N: 1.0 },
      },
      {
        label: 'Yes, but payment history is mixed',
        sub: 'Established but not strong',
        score: { N: 0.6 },
      },
      {
        label: 'Just starting to build business credit',
        sub: 'New business credit profile',
        score: { N: 0.35 },
      },
      {
        label: 'No business credit profile exists',
        sub: 'No business credit yet',
        score: { N: 0.0 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION N — NEW CREDIT INQUIRIES (Q_R20)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "How many new credit inquiries have appeared on your report in the last 30 days?",
    why: "Multiple inquiries in short periods signal credit-seeking desperation to lenders. Lenders use this as an early warning: 'This person is being rejected elsewhere and applying everywhere.'",
    type: 'options',
    options: [
      {
        label: 'None',
        sub: 'No recent inquiries',
        score: { P: 1.0 },
      },
      {
        label: '1 to 2',
        sub: 'Minor inquiry activity',
        score: { P: 0.85 },
      },
      {
        label: '3 to 4',
        sub: 'Moderate inquiry activity',
        score: { P: 0.5 },
      },
      {
        label: '5 or more',
        sub: 'A level of activity that draws lender attention',
        score: { P: 0.1 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION O — AVERAGE DAILY BANK BALANCE (Q_R21 - Conditional)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "What does your business's average daily bank balance look like?",
    why: "Average daily balance tells lenders about operational cash flow. Healthy businesses accumulate cash. Struggling businesses burn through it. Lenders see cash position as a direct signal of business health.",
    type: 'options',
    options: [
      {
        label: 'Near zero or negative',
        sub: 'A level that signals cash flow pressure',
        score: { B: 0.0 },
      },
      {
        label: '$500 to $2,000',
        sub: 'Minimal cash reserves',
        score: { B: 0.25 },
      },
      {
        label: '$2,000 to $10,000',
        sub: 'Moderate cash position',
        score: { B: 0.55 },
      },
      {
        label: '$10,000 to $25,000',
        sub: 'Good cash reserves',
        score: { B: 0.8 },
      },
      {
        label: 'Over $25,000',
        sub: 'Strong cash reserves',
        score: { B: 1.0 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION P — NSF / OVERDRAFT EVENTS (Q_R22 - Conditional)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "Over the past 12 months, how often has your business bank account experienced insufficient funds or overdrafts?",
    why: "NSF events are a hard signal of cash flow dysfunction. Each event tells lenders: 'This business cannot manage basic cash flow. It's unpredictable and risky.'",
    type: 'options',
    options: [
      {
        label: 'Never',
        sub: 'No NSF incidents',
        score: { B: 1.0 },
      },
      {
        label: '1 to 2 times',
        sub: 'Occasional NSF events',
        score: { B: 0.7 },
      },
      {
        label: '3 to 5 times',
        sub: 'Multiple NSF incidents',
        score: { B: 0.3 },
      },
      {
        label: 'More than 5 times',
        sub: 'A pattern that indicates cash flow challenges',
        score: { B: 0.05 },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────────
  // SECTION Q — MONTHLY REVENUE (Q_R23)
  // ──────────────────────────────────────────────────────────────────────────────
  {
    text: "On average, how much revenue is your business generating each month?",
    why: "Revenue size determines loan size eligibility and repayment capacity. $5K/month business can't support a $100K loan. Lenders use monthly revenue as the first filter for product eligibility.",
    type: 'options',
    options: [
      {
        label: 'Under $5,000',
        sub: 'Micro-revenue business',
        score: { F: 0.1 },
      },
      {
        label: '$5,000 to $15,000',
        sub: 'Small revenue base',
        score: { F: 0.35 },
      },
      {
        label: '$15,000 to $40,000',
        sub: 'Moderate revenue',
        score: { F: 0.65 },
      },
      {
        label: '$40,000 to $100,000',
        sub: 'Healthy revenue scale',
        score: { F: 0.85 },
      },
      {
        label: 'Over $100,000',
        sub: 'Strong revenue base',
        score: { F: 1.0 },
      },
    ],
  },
];

// Question indices for each readiness section
export const READINESS_SECTIONS = {
  Documentation: [0, 1, 2, 3],                    // Q_R1–Q_R4
  'Cash Flow': [4, 5, 6],                         // Q_R5–Q_R7
  Structure: [7, 8],                              // Q_R8–Q_R9
  Narrative: [9, 10, 11, 12],                     // Q_R10–Q_R13
  'Personal Credit': [13, 14, 15, 16, 17, 19],   // Q_R14–Q_R18, Q_R20
  'Business Credit': [18],                        // Q_R19
  Banking: [20, 21],                              // Q_R21–Q_R22
  Revenue: [22],                                  // Q_R23
} as const;
