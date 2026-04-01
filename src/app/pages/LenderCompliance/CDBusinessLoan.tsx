// CD Business Loan — Lender Compliance Module 6
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'understand-cd-loan',
    title: 'Understand How a CD-Secured Business Loan Works',
    description: 'Learn the mechanics of using a Certificate of Deposit as collateral to build business credit cheaply.',
    priority: 'medium',
    ficoImpact: 10,
    why: 'A Certificate of Deposit (CD) secured business loan is one of the most powerful and underused tools for building business credit. You deposit cash into a CD, borrow against it at 80–100% of the CD value, then repay the loan while the CD earns interest. The loan reports to business credit bureaus and costs you very little net interest.',
    infoBox: {
      title: 'Why the CD loan strategy works',
      body: 'A $10,000 CD earns roughly 4–5% APY. You borrow $9,000 against it at 6–7% APR. Net cost: ~2% per year, or ~$180. In return, you get a loan that reports to D&B, Experian Business, and Equifax Business as a paid installment loan — one of the highest-value tradeline types in business credit scoring.',
    },
    steps: [
      'Understand: this is a deliberate credit-building strategy, not a necessity for the cash',
      'You need: a business bank account at the lending bank, minimum $1,000–$5,000 to deposit into the CD',
      'The bank holds the CD as collateral — your risk is near-zero',
      'The loan repayment history reports to business bureaus and builds a strong installment tradeline',
    ],
  },
  {
    id: 'open-business-cd',
    title: 'Open a Business CD at Your Primary Bank',
    description: 'Deposit $2,500–$10,000 into a 12-month business CD in your entity\'s name.',
    priority: 'high',
    ficoImpact: 0,
    why: 'The CD must be at the same bank where you will take the secured loan. Your existing bank relationship (from Module 6: Business Banking) is where you execute this — it strengthens that relationship at the same time.',
    steps: [
      "Ask your business banker: 'Do you offer CD-secured business loans?'",
      'If yes: open a business CD with $2,500–$10,000 (more CD = more loan = more impact)',
      'Term: 12-month CDs are typical for this strategy — they balance flexibility with rate',
      "Ensure the CD is in your business entity's name, not your personal name",
    ],
  },
  {
    id: 'take-cd-secured-loan',
    title: 'Take the Secured Business Loan Against Your CD',
    description: 'Borrow 80–90% of your CD value as a business installment loan with automatic monthly payments.',
    priority: 'high',
    ficoImpact: 0,
    why: 'The loan itself is the credit-builder. Taking the CD is only step one — the loan reporting to business credit bureaus is what does the work.',
    steps: [
      'Request a business installment loan for 80–90% of your CD value',
      'Confirm with the banker that this loan WILL report to business credit bureaus (not all small banks do this)',
      'Accept the loan funds — deposit them into your business checking account',
      'Set up automatic monthly payments to the loan from your business checking',
      'Never let a payment be late — even one late payment destroys the benefit of this strategy',
    ],
  },
  {
    id: 'verify-bureau-reporting',
    title: 'Verify the CD Loan is Reporting to Business Bureaus',
    description: 'Confirm the loan appears on your D&B and Experian Business reports within 60 days.',
    priority: 'critical',
    ficoImpact: 0,
    why: 'Some banks do not report small business loans to all three major business bureaus. If the loan isn\'t reporting, you get the cost without the credit benefit. Verify before committing.',
    warningBox: {
      title: 'Confirm reporting before committing to the loan',
      body: "Ask the bank directly: 'Does this loan report to Dun & Bradstreet, Experian Business, and Equifax Business?' If they say only one bureau, it's still worth doing. If they say none, find a different bank.",
    },
    steps: [
      'Ask before signing: which business credit bureaus does this loan report to?',
      'After your first loan payment posts (usually 30 days): pull your D&B and Experian Business reports',
      'Confirm the loan appears as an active installment tradeline',
      'If the loan is not showing after 60 days: contact the bank and request a manual bureau report',
    ],
  },
];

export function CDBusinessLoan() {
  return (
    <ComplianceModulePage
      moduleId="cd-business-loan"
      icon="💰"
      tasks={tasks}
    />
  );
}
