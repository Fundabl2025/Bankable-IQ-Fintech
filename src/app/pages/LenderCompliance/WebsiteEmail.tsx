// Website & Email — Lender Compliance Module 3
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const tasks: ModuleTask[] = [
  {
    id: 'professional-website',
    title: 'Build a Professional Business Website',
    description: 'Create a domain-based business website that passes lender due diligence scrutiny.',
    priority: 'critical',
    ficoImpact: 15,
    why: 'Lenders search your business online as part of due diligence. A missing website or a free website (Wix.com/yourbusiness, etc.) signals an unestablished business. Most commercial lenders require a professional domain-based web presence.',
    warningBox: {
      title: 'No website or free subdomain = credibility killer',
      body: "Using a free subdomain (wixsite.com, wordpress.com, etc.) tells lenders you haven't invested in your business. It takes less than $20/year to own a real domain — there is no excuse for not having one.",
    },
    steps: [
      'Purchase your exact business name domain (yourbusiness.com)',
      'Build a professional site — even a simple 3–5 page site is sufficient',
      'Include: About, Services, Contact page with your business phone and address',
      'Ensure your business name on the website matches your Secretary of State filing exactly',
      'Add an SSL certificate (HTTPS) — free via most hosts, required for trust',
    ],
    resources: [
      { name: 'GoDaddy — Domains from $12/yr', url: 'https://www.godaddy.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Squarespace — Professional websites from $16/mo', url: 'https://www.squarespace.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Webflow — Professional websites from $14/mo', url: 'https://webflow.com/?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: 'domain-email',
    title: 'Get a Domain-Based Business Email Address',
    description: 'Replace Gmail or personal email with a professional you@yourbusiness.com address.',
    priority: 'critical',
    ficoImpact: 5,
    why: 'Applying for business credit or financing with a Gmail, Yahoo, or Hotmail address signals a non-serious business to lenders and underwriters. A domain-based email (you@yourbusiness.com) is a basic credibility signal that costs under $6/month.',
    warningBox: {
      title: 'Gmail on a loan application = credibility red flag',
      body: 'This is one of the easiest and cheapest items to fix, and one of the most commonly missed. Any lender who sees Gmail or Yahoo on a business application immediately discounts your application before reading the rest.',
    },
    steps: [
      "Purchase a domain if you haven't already",
      'Set up business email via Google Workspace ($6/user/mo) or Microsoft 365 ($6/user/mo)',
      'Create your primary address: yourname@yourbusiness.com',
      'Update your domain email on all business accounts: bank, IRS, Secretary of State, credit applications',
      'Set up email forwarding from your old personal email if needed during transition',
    ],
    resources: [
      { name: 'Google Workspace — Business email from $6/mo', url: 'https://workspace.google.com/?utm_source=bankableiq&utm_medium=referral' },
      { name: 'Microsoft 365 Business Basic — $6/mo', url: 'https://www.microsoft.com/en-us/microsoft-365/business/compare-all-plans?utm_source=bankableiq&utm_medium=referral' },
    ],
  },
  {
    id: 'website-name-match',
    title: 'Ensure Website Matches Your Legal Business Name',
    description: 'Verify that your website displays your legal business name consistently with your state filing.',
    priority: 'high',
    ficoImpact: 0,
    why: 'Lenders cross-reference your application business name with what appears on your website. A mismatch (e.g., DBA on website vs. legal entity name on application) creates confusion that can delay or kill an approval.',
    steps: [
      "Check that your website footer shows your full legal business name (e.g., 'Smith Consulting LLC')",
      'Ensure your About page or Contact page matches the name on your state filing',
      "If you operate under a DBA, display both: 'ABC Marketing, a division of Smith Consulting LLC'",
      'Update your domain WHOIS record to show your business name (or use WHOIS privacy)',
    ],
  },
];

export function WebsiteEmail() {
  return (
    <ComplianceModulePage
      moduleId="website-email"
      icon="🌐"
      tasks={tasks}
    />
  );
}
