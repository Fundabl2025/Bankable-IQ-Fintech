// Business Plan — Lender Compliance Module 1
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'lender-ready-business-plan',
    title: 'Write a Lender-Ready Business Plan',
    description: 'Create a complete business plan package that meets SBA and bank lending requirements.',
    priority: 'critical',
    ficoImpact: 20,
    why: 'Every SBA loan, bank term loan, and most commercial lending programs require a business plan. Without one, you are locked out of the largest and lowest-rate capital sources. A one-page executive summary is the minimum — a full 10–15 page plan unlocks the best terms.',
    warningBox: {
      title: 'No business plan = no SBA, no bank term loans',
      body: "SBA 7(a) loans, SBA 504, and most community bank products require a business plan as part of the application package. This is not negotiable. Online lenders don't require one, but they also charge 3–5x more interest.",
    },
    steps: [
      'Write a 1–2 page executive summary first — this is what lenders read',
      'Document your business model: what you sell, who buys it, and how you deliver it',
      'Include a brief competitive analysis — show you understand your market',
      'Write your management team section: relevant experience of owners and key employees',
      'Add financial projections: 3-year P&L, cash flow statement, and balance sheet',
      "Include a 'Use of Funds' section explaining exactly how loan proceeds will be used",
    ],
    resources: [
      { name: 'SBA Business Plan Guide — Free official template', url: 'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan' },
      { name: 'LivePlan — Business plan software from $20/mo', url: 'https://www.liveplan.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Bplans — Free business plan examples by industry', url: 'https://www.bplans.com/sample-business-plans/' },
    ],
  },
  {
    id: 'use-of-funds',
    title: 'Create a Detailed Use of Funds Statement',
    description: 'Itemize exactly how loan proceeds will be used with dollar amounts and business outcomes.',
    priority: 'critical',
    ficoImpact: 0,
    why: 'The Use of Funds statement is often the deciding factor in whether a lender approves your application. Vague answers like "working capital" raise red flags. Specific, itemized uses signal a disciplined borrower.',
    infoBox: {
      title: 'What lenders want to see',
      body: "'Equipment purchase: $50,000 — 2 CNC machines to increase production capacity by 40%' is far stronger than 'buy equipment.' Specificity = credibility. Lenders want to know exactly where their money goes and how it generates return.",
    },
    steps: [
      'List every intended use of loan proceeds with a dollar amount',
      "Tie each use to a business outcome ('$30K for digital advertising → projected 20% revenue increase')",
      'Keep the total exactly equal to the requested loan amount',
      'If applying for multiple products, create a separate Use of Funds for each loan amount',
    ],
  },
  {
    id: 'financial-projections',
    title: 'Build 3-Year Financial Projections',
    description: 'Create monthly Year 1 and quarterly Year 2–3 projections showing debt service coverage.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Financial projections show lenders that you understand the math of your business and that you can service the debt. Projections without assumptions are worthless — lenders want to see the reasoning behind your numbers.',
    steps: [
      'Build a monthly P&L projection for Year 1, quarterly for Years 2 and 3',
      'Document your revenue assumptions: how many units, at what price, with what growth rate',
      'Include your debt service line: the monthly payment for the requested loan',
      'Show that your projected net income covers debt service by at least 1.25x (DSCR requirement)',
      'Use Excel, Google Sheets, or LivePlan — format matters less than logic',
    ],
  },
  {
    id: 'personal-financial-statement',
    title: 'Prepare a Personal Financial Statement',
    description: 'Complete SBA Form 413 or equivalent for all owners with 20%+ ownership.',
    priority: 'high',
    ficoImpact: 0,
    why: 'All business loans under $5M require a personal financial statement from any owner with 20%+ ownership. This is separate from the business plan but part of the same package. Missing it delays or kills the application.',
    steps: [
      'List all personal assets: real estate, vehicles, investments, retirement accounts',
      'List all personal liabilities: mortgages, auto loans, credit cards, student loans',
      'Calculate your personal net worth: assets minus liabilities',
      'Most lenders use SBA Form 413 — download it from sba.gov',
    ],
    resources: [
      { name: 'SBA Form 413 — Personal Financial Statement', url: 'https://www.sba.gov/document/support-sba-form-413-personal-financial-statement' },
    ],
  },
];

export function BusinessPlan() {
  return (
    <ComplianceModulePage
      moduleId="business-plan"
      icon="📄"
      tasks={tasks}
    />
  );
}
