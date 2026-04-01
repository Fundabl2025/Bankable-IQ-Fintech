// Bank Rating — Lender Compliance Module 4
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'understand-bank-rating',
    title: 'Understand Your Internal Bank Rating',
    description: 'Learn how your bank scores your account on a 1–9 scale and what it means for lending.',
    priority: 'critical',
    ficoImpact: 20,
    why: 'Every business bank account receives an internal risk rating from your bank — a number from 1 to 9 that determines what products they\'ll offer you, what interest rates you qualify for, and whether your loan application even makes it past their initial screening.',
    infoBox: {
      title: 'The bank rating scale: 1–9',
      body: '1-3: Undesirable (account may be closed, no loan products)\n4: Low-4 — minimum acceptable (basic products available)\n5-6: Standard (most bank products available)\n7-8: Preferred (best rates, relationship banking)\n9: Premium (private banking, lowest rates)',
    },
    steps: [
      'Your bank rating is not publicly disclosed — you can estimate it based on your account behavior',
      'Key factors: average daily balance, NSF history, account age, number of products, deposit consistency',
      'A Low-4 rating requires: no NSFs, $2,500+ average daily balance, 6+ months account history',
      'To improve: increase average daily balance, eliminate overdrafts, add business products (savings, credit card) at the same bank',
    ],
  },
  {
    id: 'average-daily-balance',
    title: 'Build Your Average Daily Balance to $10,000+',
    description: 'Track and grow your 90-day average daily balance to reach preferred banking status.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Average daily balance is the single biggest factor in your bank rating. Banks calculate it over a 30, 60, and 90-day window. Hitting $10,000 average daily balance unlocks a High-5 or better rating — which is where preferred products, better rates, and relationship lending start.',
    steps: [
      'Track your current average daily balance for the last 90 days',
      'Set a 90-day goal: $2,500 minimum → $5,000 → $10,000',
      'Deposit a cash reserve buffer to maintain the balance baseline',
      'If you have multiple bank accounts: consolidate to build a stronger balance at one primary bank',
      'Avoid sweeping funds out of business checking for personal use — this destroys your ADB',
    ],
  },
  {
    id: 'banking-relationship',
    title: 'Build a Relationship with Your Business Banker',
    description: 'Schedule quarterly meetings with your banker to build the relationship that advocates for your loan.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Business banking is a relationship business. An account with a $50,000 average daily balance where the owner has never spoken to anyone gets a worse loan deal than the same account where the owner meets with their banker quarterly. Relationship = advocacy inside the bank.',
    infoBox: {
      title: 'The banker advocacy effect',
      body: 'When you apply for a loan at your own bank, your banker can go to bat for you in the credit committee. A banker who knows your business and likes you can often get marginal applications approved that would otherwise be declined. Invest in this relationship.',
    },
    steps: [
      'Request an in-person or video meeting with a small business banker at your primary bank',
      'Bring: 3 months of bank statements, your business plan one-pager, your financial projections',
      "Ask specifically: 'What does my account need to look like to qualify for a business line of credit?'",
      'Follow up every 90 days — quarterly touchpoints build the relationship that pays off on your loan application',
    ],
  },
  {
    id: 'eliminate-nsf-bank-rating',
    title: 'Zero NSFs — Protect Your Bank Rating at All Costs',
    description: 'Set overdraft protection and balance alerts to prevent any NSF events on your account.',
    priority: 'critical',
    ficoImpact: 0,
    why: 'NSFs are the fastest way to destroy a bank rating. A single NSF in a 12-month window can drop you two rating tiers — turning a preferred customer into an undesirable one. Banks share this data with credit reporting networks.',
    warningBox: {
      title: 'One NSF destroys months of rating-building progress',
      body: 'A bank rating takes 6–12 months to build. A single NSF can drop it in 24 hours. This is asymmetric — the damage is fast, the recovery is slow. Set overdraft protection and cash alerts today.',
    },
    steps: [
      'Enable overdraft protection immediately — link to a business savings or credit account',
      "Set automated low-balance alerts at $1,000 and $2,500 via your bank's mobile app",
      'Never let payroll, ACH payments, or large scheduled transactions run without confirmed funds',
      'If you have recurring automatic payments: audit them monthly to ensure sufficient funds are present on payment dates',
    ],
  },
];

export function BankRating() {
  return (
    <ComplianceModulePage
      moduleId="bank-rating"
      icon="⭐"
      tasks={tasks}
    />
  );
}
