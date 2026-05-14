// Business Banking — Lender Compliance Module 5
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'open-business-checking',
    title: 'Open a Dedicated Business Checking Account',
    description: 'Establish a business bank account in your entity name using your EIN to build a clean financial history.',
    priority: 'critical',
    ficoImpact: 30,
    why: 'Your business bank account is the most fundamental credibility signal to any lender. Every lender requires at least 3 months of business bank statements showing consistent revenue. Without a separate business account, you have no financial history that lenders can evaluate.',
    warningBox: {
      title: 'Mixing personal and business funds = hard lender barrier',
      body: 'If you run business revenue through a personal account, no traditional lender will touch you. Commingling funds also pierces the corporate veil — meaning you lose your personal liability protection. This is a non-negotiable.',
    },
    steps: [
      'Open a business checking account in your exact legal business entity name',
      'Use your EIN (not SSN) when opening the account',
      'Deposit all business revenue into this account going forward — no exceptions',
      'Pay all business expenses from this account',
      'Let the account age a minimum of 3 months before applying for business credit',
    ],
    resources: [
      { name: 'Chase Business Complete Checking — No min opening deposit', url: 'https://www.chase.com/business/banking/checking?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Bank of America Business Advantage — Full-service business banking', url: 'https://www.bankofamerica.com/smallbusiness/checking/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Relay Business Banking — No fees, built for small business', url: 'https://relayfi.com/?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: 'minimum-balance',
    title: 'Maintain a Healthy Average Daily Balance',
    description: 'Keep your average daily balance above $2,500 to achieve a positive internal bank rating.',
    priority: 'high',
    ficoImpact: 10,
    why: 'Your bank internally rates every business account on a scale of 1–9. An average daily balance below $1,000 earns you their worst rating. A Low-4 or better rating (requiring $2,500–$10,000 average daily balance) is what unlocks bank relationship products.',
    infoBox: {
      title: 'Bank rating: the invisible score lenders see',
      body: "When you apply at your own bank, they share your internal bank rating with underwriting. Most borrowers never see this rating, but lenders use it heavily. A single NSF or sustained low balance can lock you out of your own bank's products.",
    },
    steps: [
      'Target a minimum average daily balance of $2,500 — this is the Low-4 threshold',
      'Never let your balance drop below $1,000 — below this triggers negative bank rating',
      'If you have irregular cash flow, maintain a buffer savings account to protect the checking balance',
      'Work toward $10,000+ average daily balance — this unlocks the best bank rating tier',
    ],
  },
  {
    id: 'nsf-elimination',
    title: 'Eliminate All NSFs and Overdrafts',
    description: 'Prevent Non-Sufficient Funds transactions, which cause automatic loan declines at virtually every lender.',
    priority: 'critical',
    ficoImpact: 0,
    why: 'A single NSF (Non-Sufficient Funds) on your business bank statements is an automatic decline at virtually every lender. Banks and underwriters scan statements specifically for NSF transactions before a human ever reviews your application.',
    warningBox: {
      title: 'One NSF = automatic loan decline — no exceptions',
      body: 'NSF fees appear on bank statements as a line item. Underwriters are trained to look for them. Even one NSF in the past 12 months will disqualify you at most traditional lenders. Zero tolerance policy.',
    },
    steps: [
      'Set up overdraft protection linked to a business savings account',
      'Enable low balance alerts at $500, $1,000, and $2,500',
      'If you have NSFs on recent statements: wait until they are at least 12 months old before applying',
      'Maintain a cash buffer equal to your largest expected expense to prevent future NSFs',
    ],
  },
  {
    id: 'banking-history',
    title: 'Build 3–6 Months of Clean Banking History',
    description: 'Establish a consistent deposit pattern over at least 3 months before applying for business credit.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Lenders require a minimum of 3 months of business bank statements showing consistent deposits. Newer accounts are a harder sell. 6 months of clean, consistent history dramatically expands your lender options.',
    steps: [
      'Do not apply for business loans until your account is at least 3 months old',
      'Deposit consistently — even small regular deposits build pattern credibility',
      'Keep statements clean: no NSFs, no large unexplained withdrawals, no round-number transfers that look like cash movement',
      'After 6 months, you unlock the majority of online lenders; after 12 months, traditional banks and SBA',
    ],
  },
];

export function BusinessBanking() {
  return (
    <ComplianceModulePage
      moduleId="business-banking"
      icon="🏦"
      tasks={tasks}
    />
  );
}
