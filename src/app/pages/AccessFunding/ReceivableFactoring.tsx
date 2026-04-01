import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'receivable-factoring',
  icon: '📄',
  title: 'Receivable Factoring',
  range: '$100K–$100M',
  fundingSpeed: '7–10 days',
  tagline: 'Convert verified B2B invoices into same-week working capital.',
  description: 'A revolving credit facility secured by your outstanding accounts receivable. The facility scales with your receivables — draw more as your A/R grows, pay back as invoices are collected. Advance rate up to 95% of current receivables. Starting rate at Prime + 2%. No minimum FICO required.',
  facts: [
    { label: 'Facility Size', value: '$100K–$100M' },
    { label: 'Advance Rate', value: 'Up to 95% of A/R' },
    { label: 'Starting Rate', value: 'Prime + 2%' },
    { label: 'Structure', value: 'Revolving — grows with volume' },
    { label: 'Minimum A/R', value: '$250K+ (some $100K+)' },
    { label: 'Credit Score', value: 'No minimum FICO' },
  ],
  requirements: [
    { label: 'Time in Business', value: '1+ year' },
    { label: 'Annual Revenue', value: '$1,000,000+' },
    { label: 'Customer Type', value: 'Verifiable B2B customers required' },
    { label: 'Receivables', value: '$250K+ in outstanding A/R (some accept $100K+)' },
    { label: 'Reporting', value: 'Clean financial reporting required for A/R verification' },
  ],
  benefits: [
    'No minimum FICO — facility size is driven by your receivables volume, not your credit score',
    'Scale from $100K to $100M as your invoicing volume grows',
    'Prime-based starting rate — significantly lower than unsecured alternatives',
    'Stabilizes cash flow by eliminating 30–90 day payment delays from customers',
  ],
  idealFor: 'B2B businesses with verifiable customers and $1M+ in annual revenue whose cash flow is constrained by slow invoice payments.',
};

export function ReceivableFactoring() {
  return <FundingProductPage config={config} />;
}
