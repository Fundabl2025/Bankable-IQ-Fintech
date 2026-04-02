import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'merchant-advance',
  icon: '⚡',
  title: 'Merchant Advance',
  range: 'Based on Revenue',
  fundingSpeed: '24–48 hours',
  tagline: 'Fastest path to capital — approvals in hours, funded in 24–48 hours.',
  description: 'A revenue-based advance funded against your recent bank deposits. No credit score requirement. No collateral. Approval decisions are made in hours based on your bank statement deposits. Funds arrive within 24–48 hours (same-day possible). Renews every 6–8 weeks.',
  facts: [
    { label: 'Minimum Revenue', value: '$10,000+/month deposits' },
    { label: 'Approval Time', value: 'Hours' },
    { label: 'Funding Time', value: '24–48 hours (same-day possible)' },
    { label: 'Payments', value: 'Daily or weekly' },
    { label: 'Renewal Cycle', value: 'Every 6–8 weeks' },
  ],
  requirements: [
    { label: 'Credit Score', value: 'Not required' },
    { label: 'Monthly Revenue', value: '$10,000+ in bank deposits' },
    { label: 'Time in Business', value: '6+ months (some 3+ months)' },
    { label: 'Banking', value: 'Active U.S. business bank account' },
    { label: 'Bankruptcies', value: 'No open bankruptcies' },
    { label: 'Excluded Industries', value: 'Real Estate, Insurance, and Financial Services not eligible' },
  ],
  benefits: [
    'No credit score required — approval based on cash flow only',
    'No collateral required — unsecured advance',
    'Fastest funding in the capital stack — same-day possible',
    'Minimal documentation — bank statements only',
    'Renews every 6–8 weeks as you build repayment history',
  ],
  idealFor: 'Businesses with consistent monthly deposits ($10K+) that need fast capital for payroll, emergencies, or opportunities and can handle daily or weekly repayments.',
};

export function MerchantAdvance() {
  return <FundingProductPage config={config} />;
}
