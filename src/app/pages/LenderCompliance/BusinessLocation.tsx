// Business Location — Lender Compliance Module 1
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'professional-address',
    title: 'Get a Professional Business Address',
    description: 'Replace any residential or P.O. Box address with a verifiable commercial address.',
    priority: 'critical',
    ficoImpact: 20,
    why: 'Lenders physically verify your business address. A residential address triggers home-based business flags that disqualify you from most commercial products. Virtual office addresses in commercial buildings are acceptable.',
    warningBox: {
      title: 'Residential address = hard lender barrier',
      body: 'Using your home address as your business address is one of the fastest ways to get auto-declined. Many lenders and underwriters are programmed to reject home addresses regardless of your credit score or revenue.',
    },
    steps: [
      'Register a virtual office or commercial mailbox (not a P.O. Box — lenders reject P.O. Boxes)',
      'Update your Secretary of State filing to the new address',
      'Update your EIN record with the IRS to match',
      'Ensure your address is consistent on all accounts: bank, licenses, credit applications',
    ],
    resources: [
      { name: 'Regus — Virtual office addresses from $49/mo', url: 'https://www.regus.com/en-us/virtual-offices?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Alliance Virtual Offices — from $49/mo', url: 'https://www.alliancevirtualoffices.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'iPostal1 — Virtual address + mail scanning', url: 'https://ipostal1.com/?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: 'google-business-profile',
    title: 'Claim & Verify Google Business Profile',
    description: 'Establish a verified Google Business Profile so lenders can confirm your business exists.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Lenders and underwriters search Google to verify your business is real before approving. An unverified or missing Google Business Profile raises immediate red flags.',
    steps: [
      'Go to business.google.com and claim your listing',
      'Verify via postcard or phone (takes 1–2 weeks for postcard)',
      'Ensure your business name, address, and phone number exactly match your state filing',
      'Add your business hours, website, and a brief business description',
    ],
    resources: [
      { name: 'Google Business Profile — Free', url: 'https://business.google.com' },
    ],
  },
  {
    id: 'nap-consistency',
    title: 'Lock NAP Consistency Across All Platforms',
    description: 'Synchronize your Name, Address, and Phone across every directory and business account.',
    priority: 'high',
    ficoImpact: 10,
    why: 'NAP stands for Name, Address, Phone. When your business information is inconsistent across Google, Yelp, 411, your bank, and your state filing, automated lender systems interpret it as a different business — or worse, a fraudulent one.',
    warningBox: {
      title: 'Inconsistent NAP is an invisible score killer',
      body: 'Even a small difference ("St." vs "Street", or "LLC" missing) causes your NAP score to drop. Lenders pay data aggregators to verify NAP — mismatches are flagged.',
    },
    steps: [
      'Write down your exact business name, address, and phone as filed with your Secretary of State',
      'Search Google, Yelp, Facebook, LinkedIn, and YellowPages for any existing listings',
      'Update each listing to match your Secretary of State filing exactly',
      'After updating, re-search every 30 days for 90 days to confirm the correct data is propagating',
    ],
  },
  {
    id: 'po-box-check',
    title: 'Eliminate P.O. Box as Primary Address',
    description: 'Replace any P.O. Box used as a primary address with a physical commercial address.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'P.O. Boxes are a hard decline at most banks and SBA lenders. Unlike virtual office addresses (which are physical commercial addresses), P.O. Boxes are treated as indicators of a non-operational business.',
    steps: [
      'If you currently use a P.O. Box: replace it with a virtual office or commercial mailbox immediately',
      'P.O. Box is fine as a secondary mailing address — just not primary',
      'Update all business registrations and financial accounts to the physical commercial address',
    ],
  },
];

export function BusinessLocation() {
  return (
    <ComplianceModulePage
      moduleId="business-location"
      icon="📍"
      tasks={tasks}
    />
  );
}
