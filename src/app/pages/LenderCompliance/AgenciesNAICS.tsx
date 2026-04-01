// Agencies & NAICS — Lender Compliance Module 6
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'naics-code',
    title: 'Identify and Register Your Correct NAICS Code',
    description: 'Verify your 6-digit NAICS code accurately reflects your primary business activity across all registrations.',
    priority: 'critical',
    ficoImpact: 15,
    why: 'NAICS codes classify your industry and drive lender risk assessment. An incorrect NAICS code can flag you as high-risk, restrict your loan products, or cause an underwriter to deny you for programs you actually qualify for. It also affects which SBA programs you\'re eligible for.',
    warningBox: {
      title: 'Wrong NAICS code = wrong risk tier',
      body: "If your NAICS code classifies you as a higher-risk industry than you actually are, you pay more and have fewer options. If it's wrong in the other direction, you may not qualify for industry-specific programs. Get it right.",
    },
    steps: [
      'Search the NAICS code lookup tool at census.gov/naics',
      'Choose the most specific 6-digit code that matches your primary business activity',
      'Verify your NAICS code matches on: Secretary of State filing, IRS EIN registration, and D&B listing',
      'If your NAICS code triggers high-risk flags (financial services, cannabis-adjacent, etc.), consult a business advisor before applying for credit',
    ],
    resources: [
      { name: 'U.S. Census NAICS Code Lookup — Free official tool', url: 'https://www.census.gov/naics/' },
    ],
  },
  {
    id: 'duns-number',
    title: 'Register with Dun & Bradstreet and Get a D-U-N-S Number',
    description: 'Establish your business identity at D&B to create a credit file at the largest business credit bureau.',
    priority: 'critical',
    ficoImpact: 10,
    why: "Dun & Bradstreet is one of the three major business credit bureaus. Your D-U-N-S number is your business's identity at D&B and is required for most government contracting, corporate supply chains, and many lender applications. Without it, you have no D&B credit file.",
    steps: [
      'Go to dnb.com/get-a-duns-number and register your business for free',
      'Ensure your business name, address, and phone match your Secretary of State filing exactly',
      'The free D-U-N-S takes 30 business days — use this to plan ahead',
      'Once registered, monitor your D&B file for errors and update as your business information changes',
    ],
    resources: [
      { name: 'Dun & Bradstreet — Get a free D-U-N-S Number', url: 'https://www.dnb.com/duns-number/get-a-duns.html' },
    ],
  },
  {
    id: 'experian-equifax-biz',
    title: 'Register with Experian Business and Equifax Business',
    description: 'Verify your business has an active file at both Experian Business and Equifax Business credit bureaus.',
    priority: 'high',
    ficoImpact: 0,
    why: 'The three major business credit bureaus are D&B, Experian Business, and Equifax Business. Lenders pull from all three. If you have no file at any one of them, that bureau returns a "no file" result — which lenders interpret as high risk.',
    steps: [
      'Visit Experian Business (businesscredit.experian.com) — verify your business appears or register it',
      'Visit Equifax Business (equifax.com/business) — same process',
      'Ensure your business name, address, phone, and EIN are consistent at both bureaus',
      'If you find inaccurate information at either bureau, file a dispute immediately',
    ],
    resources: [
      { name: 'Experian Business Credit — Verify or register your business', url: 'https://www.experian.com/business/products/business-credit.html' },
      { name: 'Equifax Business Credit — Verify your business', url: 'https://www.equifax.com/business/business-credit/' },
    ],
  },
  {
    id: 'bureau-consistency',
    title: 'Ensure Consistent Business Info Across All Three Bureaus',
    description: 'Reconcile your business name, address, phone, and EIN across D&B, Experian, and Equifax.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'When your business name, address, phone, or EIN varies between D&B, Experian, and Equifax, each bureau treats them as different entities. This means your credit history is split across phantom businesses and none of your profiles is strong.',
    steps: [
      'Pull your business credit reports from all three bureaus',
      'Create a spreadsheet: exact name, address, phone, EIN, date established at each bureau',
      'File corrections with any bureau showing inaccurate information',
      'Monitor quarterly — data aggregators push inaccurate data to bureaus regularly',
    ],
  },
];

export function AgenciesNAICS() {
  return (
    <ComplianceModulePage
      moduleId="agencies-naics"
      icon="🔢"
      tasks={tasks}
    />
  );
}
