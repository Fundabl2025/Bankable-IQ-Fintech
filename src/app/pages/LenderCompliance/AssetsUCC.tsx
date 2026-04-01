// Assets & UCC — Lender Compliance Module 2
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'document-assets',
    title: 'Document All Business Assets and Collateral',
    description: 'Create a complete asset schedule with current values for all business-owned property.',
    priority: 'high',
    ficoImpact: 15,
    why: 'Secured lending (equipment loans, real estate, asset-based lines of credit) offers the lowest rates and highest amounts. To access these products, lenders need a clear picture of what collateral you can offer. Undocumented assets = undeclared collateral = higher rates.',
    steps: [
      'Create an asset schedule: list every business asset with purchase date, original cost, and current market value',
      'Include: equipment, vehicles, real estate, inventory, accounts receivable, intellectual property',
      'Obtain current appraisals or market value estimates for high-value items',
      'Keep purchase receipts, titles, and appraisals organized — lenders will request them',
      'Update your asset schedule quarterly as you add or depreciate assets',
    ],
  },
  {
    id: 'ucc-search',
    title: 'Search for Existing UCC Liens on Your Business',
    description: 'Search your Secretary of State database to find all UCC filings against your business.',
    priority: 'critical',
    ficoImpact: 0,
    why: 'UCC (Uniform Commercial Code) liens are legal claims on your business assets filed by creditors. If another lender has a blanket UCC lien on your business, new lenders cannot lend against those assets — effectively blocking you. Most business owners don\'t know these exist.',
    warningBox: {
      title: 'Existing UCC liens can block you from new lending',
      body: 'Merchant cash advance companies and some online lenders file UCC blanket liens as part of their standard process. If you\'ve ever taken an MCA or online business loan, search for UCC filings immediately — they may be blocking you right now.',
    },
    steps: [
      "Search your Secretary of State's UCC filing database (free) — search by your business name and EIN",
      'Search also by your personal name if you have personally guaranteed any business debt',
      'If you find filings from lenders you no longer owe: contact them to request a UCC termination (Form UCC-3)',
      'If you find filings from active lenders: note the collateral claimed — this limits what new lenders can take as security',
    ],
    resources: [
      { name: 'National UCC Filing Locator — state-by-state links', url: 'https://www.nass.org/business-services/ucc-filings' },
    ],
  },
  {
    id: 'ucc-termination',
    title: 'Terminate Expired or Paid-Off UCC Liens',
    description: 'File UCC-3 termination statements for any liens from loans you have already repaid.',
    priority: 'high',
    ficoImpact: 0,
    why: "UCC filings don't automatically disappear when you pay off a loan. Creditors must file a UCC-3 termination — and many don't, leaving zombie liens on your record that block future lending.",
    steps: [
      'For every paid-off loan: contact the former lender and request UCC-3 termination in writing',
      'If they fail to respond within 20 days, you can file a UCC-3 termination yourself (check your state rules)',
      "After termination filing, re-search your state's UCC database in 30 days to confirm removal",
      'Document all terminations — save confirmation numbers and dates',
    ],
  },
  {
    id: 'understand-ucc-blanket-liens',
    title: 'Understand How Blanket Liens Affect Future Borrowing',
    description: 'Learn the difference between blanket and specific UCC liens and how to negotiate better terms.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'A blanket UCC lien (all assets) from one lender claims priority over all your business assets — meaning future lenders are subordinated and may decline to lend at all. Understanding this lets you negotiate better terms on new credit.',
    infoBox: {
      title: 'Blanket lien vs. specific lien',
      body: "A specific lien covers one asset (e.g., 'equipment serial #12345'). A blanket lien covers everything you own now and in the future. MCAs and online lenders almost always file blanket liens. Traditional banks often file specific liens — which is better for you as a borrower.",
    },
    steps: [
      'When negotiating any new credit, ask whether the lender will file a blanket or specific UCC lien',
      'Avoid blanket liens whenever possible — push for specific collateral liens',
      'If you must accept a blanket lien, try to negotiate a first position lien carve-out for specific assets you may need for future financing',
    ],
  },
];

export function AssetsUCC() {
  return (
    <ComplianceModulePage
      moduleId="assets-ucc"
      icon="⚖️"
      tasks={tasks}
    />
  );
}
