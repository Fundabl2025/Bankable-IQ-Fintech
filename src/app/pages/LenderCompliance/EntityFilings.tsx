// Entity & Filings — Lender Compliance Module 1
// Built on ComplianceModulePage shared template

import { ComplianceModulePage, type ModuleTask } from '../../components/ComplianceModulePage';

const HIGH_RISK_FINANCIAL = ['Loan', 'Lending', 'Credit', 'Debt', 'Financing', 'Capital', 'Funding', 'Bank', 'Mortgage'];
const HIGH_RISK_REGULATED = ['Cannabis', 'CBD', 'Tobacco', 'Vape', 'Gambling', 'Casino', 'Adult', 'Firearms'];

const tasks: ModuleTask[] = [
  {
    id: 'entity-formation',
    title: 'Form Your Business Entity (LLC or Corporation)',
    description: 'Set up a proper business entity so your business can stand on its own for financing.',
    priority: 'critical',
    ficoImpact: 45,
    why: 'Your business cannot become bankable — or get financing on its own merits — without being a separate legal entity. Sole proprietors and partnerships build credit reports that are 100% personal, making them worthless for business credit.',
    warningBox: {
      title: "Don't be fooled by business credit for sole props",
      body: 'The business credit reporting agencies will let you build business credit reports under a sole prop or partnership, but these are completely worthless — everything you do under those is 100% personal and lenders know it.',
    },
    steps: [
      'Choose entity type — LLC is recommended for most small businesses',
      'File Articles of Organization with your Secretary of State ($50–$500 depending on state)',
      'Obtain your EIN from the IRS (free, takes 10 minutes online)',
      'Open a dedicated business bank account under your new entity',
      'Keep all formation documents in a secure, accessible folder',
    ],
    resources: [
      { name: 'ZenBusiness — Form LLC from $0 + state fee', url: 'https://www.zenbusiness.com/?utm_source=fundready&utm_medium=referral&utm_campaign=entity-formation' },
      { name: 'Northwest Registered Agent — $39 LLC + privacy protection', url: 'https://www.northwestregisteredagent.com/?utm_source=fundready&utm_medium=referral' },
      { name: 'Bizee (formerly Incfile) — $0 LLC formation', url: 'https://www.bizee.com/?utm_source=fundready&utm_medium=referral' },
      { name: 'LegalZoom — Attorney-reviewed formation', url: 'https://www.legalzoom.com/business/business-formation/?utm_source=fundready&utm_medium=referral' },
      { name: 'IRS EIN Online Application — Free, instant', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online' },
    ],
  },

  {
    id: 'trademark-verification',
    title: 'Verify No Trademark Infringement',
    description: 'Check the USPTO TESS database to confirm your business name does not infringe on existing trademarks.',
    priority: 'high',
    ficoImpact: 0,
    why: 'When you form your entity, your state only checks for name availability within that state. A company in another state may have already trademarked your name — using it can result in expensive lawsuits and force a rebrand after you\'ve built credit.',
    warningBox: {
      title: 'State approval ≠ trademark clearance',
      body: 'Getting your LLC approved by your Secretary of State does NOT mean your name is safe to use nationally. Always run a federal trademark search before printing materials or building credit.',
    },
    steps: [
      'Go to the USPTO TESS database (free)',
      'Search for your exact business name',
      'Search for phonetically similar names in your industry',
      'If clear: document your search with a screenshot and date',
      'If conflict: consult a trademark attorney before proceeding',
    ],
    resources: [
      { name: 'USPTO TESS Trademark Search — Free federal database', url: 'https://tess.uspto.gov' },
      { name: 'Trademark Engine — File a trademark from $99', url: 'https://www.trademarkengine.com/?utm_source=fundready&utm_medium=referral' },
      { name: 'LegalZoom — Trademark Registration with attorney review', url: 'https://www.legalzoom.com/trademarks/?utm_source=fundready&utm_medium=referral' },
    ],
  },

  {
    id: 'good-standing',
    title: 'Verify Entity is in Good Standing',
    description: 'Confirm your entity is current with all state filings, annual reports, and fees.',
    priority: 'critical',
    ficoImpact: 25,
    why: 'Lenders directly verify your good standing status with your Secretary of State during underwriting. If your entity is not in good standing — even for a missed $50 annual fee — your application is automatically declined before a human reviews it.',
    warningBox: {
      title: 'Auto-decline — no exceptions',
      body: 'Lenders WILL verify good standing. Not in good standing = automatic decline, regardless of your personal credit score, revenue, or time in business. Fix this before applying anywhere.',
    },
    steps: [
      'Visit your Secretary of State website (search "[your state] Secretary of State business search")',
      'Look up your business entity by name or entity number',
      'Verify status shows "Active" or "In Good Standing"',
      'If any annual reports are overdue, file them immediately',
      'Pay any outstanding state fees or penalties',
      'Download a Certificate of Good Standing if available (some lenders request it)',
    ],
  },

  {
    id: 'business-name-review',
    title: 'Review Business Name for High-Risk Terms',
    description: 'Ensure your business name does not contain words that trigger automatic lender declines.',
    priority: 'medium',
    ficoImpact: 0,
    why: 'Most business lenders use automated screening systems that reject applications before a human reviews them — based solely on the business name. These systems are looking for words that signal high-risk industries or direct competitors.',
    customContent: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '8px' }}>
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>
            ❌ Financial Services Terms — Auto-Decline
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {HIGH_RISK_FINANCIAL.map(term => (
              <span key={term} style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', padding: '3px 9px', borderRadius: '99px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                {term}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', margin: 0 }}>
            Lenders don't want to lend to other lenders. These terms trigger instant rejection at most institutions.
          </p>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: '#f59e0b', marginBottom: '8px' }}>
            ⚠️ Regulated Industry Terms — High Scrutiny / Decline
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
            {HIGH_RISK_REGULATED.map(term => (
              <span key={term} style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '11px', padding: '3px 9px', borderRadius: '99px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                {term}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', margin: 0 }}>
            Complex regulations make most business lenders avoid these industries entirely.
          </p>
        </div>
      </div>
    ),
    steps: [
      'Read your full legal business name out loud — does it contain any of the terms above?',
      'If your name is clear: you\'re good — mark this complete',
      'Option A (safest): File your entity under a clean name, use a DBA for marketing',
      'Option B: Rebrand now — change your name before building any credit',
      'Option C: Add a specific industry descriptor to generic financial terms (e.g., "Smith Business Advisory" vs "Smith Capital")',
    ],
  },
];

export function EntityFilings() {
  return (
    <ComplianceModulePage
      moduleId="entity-filings"
      icon="🏛️"
      tasks={tasks}
    />
  );
}
