// Comparable Credit — Lender Compliance Module 5
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'vendor-net30-accounts',
    title: 'Open Vendor / Net-30 Trade Accounts',
    description: 'Open at least 3 Net-30 vendor accounts that report to D&B, Experian Business, and Equifax Business.',
    priority: 'critical',
    ficoImpact: 15,
    why: 'Vendor trade accounts (Net-30 terms) are the first and easiest form of business credit. They report to D&B, Experian Business, and Equifax Business — building your business credit file with zero personal credit check at most vendors.',
    infoBox: {
      title: 'Starter vendors that report to business bureaus',
      body: 'These vendors are known to report Net-30 accounts to business credit bureaus and are relatively easy to get approved for: Uline, Grainger, Quill, Summa Office Supplies, Crown Office Supplies, and Accounts. Apply, buy something small, pay in 30 days.',
    },
    steps: [
      'Open at least 3 Net-30 vendor accounts to establish your bureau files',
      'Purchase a small amount ($50–$200) from each vendor within 30 days of opening',
      'Pay on time — early payment is even better (Net-10 when possible)',
      'Verify the vendor reports to at least one major business bureau before opening the account',
      'After 60–90 days, pull your D&B, Experian Business, and Equifax Business reports to confirm the accounts are reporting',
    ],
    resources: [
      { name: 'Uline — Net-30 shipping supplies', url: 'https://www.uline.com' },
      { name: 'Grainger — Net-30 industrial supplies', url: 'https://www.grainger.com' },
      { name: 'Quill — Net-30 office supplies', url: 'https://www.quill.com' },
    ],
  },
  {
    id: 'business-credit-card',
    title: 'Open a Business Credit Card (Reporting to Business Bureaus)',
    description: 'Get a business credit card that reports to business credit bureaus, not just personal bureaus.',
    priority: 'high',
    ficoImpact: 0,
    why: 'A business credit card that reports to business credit bureaus builds your credit file and demonstrates revolving credit management ability — one of the key factors in commercial loan decisions.',
    warningBox: {
      title: 'Not all business cards report to business bureaus',
      body: 'Many popular business cards (including some AmEx and Chase products) only report to personal bureaus. For business credit building, you need cards that report to D&B, Experian Business, or Equifax Business. Check before applying.',
    },
    steps: [
      'Research which business cards report to business credit bureaus specifically',
      'Apply for a card with no annual fee initially — keep utilization below 30%',
      'Use the card for regular business expenses and pay in full monthly',
      'After 6 months of clean history, apply for a second business card to increase available credit',
    ],
    resources: [
      { name: 'Nav — Compare business credit cards by bureau reporting', url: 'https://www.nav.com/business-credit-cards/?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: 'utilization-management',
    title: 'Keep Business Credit Utilization Below 30%',
    description: 'Monitor and manage revolving balances to stay under 30% utilization across all business credit.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Utilization (balance ÷ credit limit) is the most actionable factor in your business credit score. Business credit scoring algorithms penalize utilization above 30% heavily — keeping balances low relative to limits is the fastest way to improve your score month-over-month.',
    steps: [
      'Calculate your current utilization: total balances ÷ total credit limits across all business cards',
      'If over 30%: pay down balances immediately or request credit limit increases',
      'Never let any single card exceed 50% utilization, even if your overall average is low',
      'Pay balances before the statement closing date to keep reported balances lower than actual charges',
    ],
  },
  {
    id: 'bureau-monitoring',
    title: 'Monitor Your Business Credit Reports Quarterly',
    description: 'Pull and review D&B, Experian Business, and Equifax Business reports every 90 days.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'Business credit reports contain errors far more frequently than personal credit reports because the data aggregation process is less regulated. A single incorrect negative item can cost you tens of thousands in higher interest rates. You can only dispute what you find.',
    steps: [
      'Pull your D&B, Experian Business, and Equifax Business reports every 90 days',
      'Look for: incorrect payment history, accounts you don\'t recognize, incorrect business information',
      'File disputes immediately for any errors — each bureau has an online dispute process',
      'Keep records of all disputes and their resolution confirmation',
    ],
    resources: [
      { name: 'Nav — Free business credit monitoring', url: 'https://www.nav.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Dun & Bradstreet CreditSignal — Free D&B monitoring', url: 'https://www.dnb.com/products/small-business/dnb-creditsignal.html' },
    ],
  },
];

export function ComparableCredit() {
  return (
    <ComplianceModulePage
      moduleId="comparable-credit"
      icon="📊"
      tasks={tasks}
    />
  );
}
