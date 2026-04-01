// Corp-Only Facts — Lender Compliance Module 3
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'corp-vs-llc-credit',
    title: 'Understand Corporate Advantages for Credit',
    description: 'Learn when a C-Corp or S-Corp structure provides meaningful advantages over an LLC.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'C-Corps and S-Corps can issue stock, raise equity capital, and in some cases access credit products not available to LLCs. Understanding these advantages helps you make an informed decision about your entity structure — and whether converting makes financial sense.',
    infoBox: {
      title: 'LLC vs. Corp for credit purposes',
      body: 'For most small business credit purposes, an LLC and a Corporation are treated identically by lenders. The primary advantages of a Corp over an LLC are: (1) easier to raise investor equity, (2) ability to issue multiple classes of stock, (3) cleaner structure for eventual acquisition or IPO. For lending alone, LLC is often simpler.',
    },
    steps: [
      'Understand: for most business loans, LLC and Corp are treated the same by lenders',
      'If you plan to raise venture or equity capital: a C-Corp (Delaware) is the standard',
      'If you are in a highly regulated industry: consult a corporate attorney about entity choice',
      'If you converted from LLC to Corp: ensure your EIN, bank account, and all filings are updated under the new entity',
    ],
  },
  {
    id: 'corporate-formalities',
    title: 'Maintain Corporate Formalities and Records',
    description: 'Hold annual meetings, keep minutes, and document major decisions with board resolutions.',
    priority: 'high',
    ficoImpact: 0,
    why: "Courts and lenders both look at whether you've maintained corporate formalities when evaluating liability and creditworthiness. Poor record-keeping can pierce the corporate veil — eliminating your personal liability protection and making your business's credit history worthless.",
    warningBox: {
      title: 'Ignored formalities = pierced corporate veil',
      body: "If you skip annual meetings, don't keep minutes, or mix personal and business finances, a court can hold you personally liable for business debts. It also signals to sophisticated lenders that your entity is not truly separate.",
    },
    steps: [
      'Hold annual meetings (even solo) and document them with minutes',
      'Keep corporate minutes in a dedicated binder or digital folder',
      'Issue stock certificates if incorporated — even if it\'s just you',
      'Pass corporate resolutions for major decisions (opening bank accounts, taking on debt, etc.)',
    ],
  },
  {
    id: 'stock-certificates',
    title: 'Issue and Record Stock Certificates Properly',
    description: 'Maintain a current cap table and properly issued stock certificates for all shareholders.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'Some lenders and investors require a current cap table (capitalization table) showing who owns what percentage of the corporation. Missing or improperly issued stock certificates create due diligence delays or deal killers.',
    steps: [
      'Issue stock certificates to all shareholders at the time of incorporation',
      'Record every issuance in the corporate stock ledger',
      'Never verbally agree to equity splits without documenting them with signed certificates and board resolutions',
      'If you plan to bring on investors or partners: consult a corporate attorney before issuing any shares',
    ],
  },
  {
    id: 'board-advisors',
    title: 'Establish an Advisory Board',
    description: 'Formalize an advisory board to signal credibility for larger loan amounts and SBA applications.',
    priority: 'low',
    ficoImpact: 0,
    why: 'For lenders evaluating larger loan amounts ($250K+), a credible management team or advisory board signals that the business has expertise beyond just the founder. It\'s particularly important for SBA loans, bank relationships, and any equity-based financing.',
    steps: [
      'Identify 2–3 experienced advisors in your industry who would lend credibility',
      'Formalize their role with an advisory agreement (even informal is fine early on)',
      'List your advisory board on your business plan and website',
      'Advisors are typically compensated with equity (0.1–0.5%) or a small cash retainer for early-stage companies',
    ],
  },
];

export function CorpOnlyFacts() {
  return (
    <ComplianceModulePage
      moduleId="corp-only-facts"
      icon="🏢"
      tasks={tasks}
    />
  );
}
