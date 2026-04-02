import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'business-credit-line',
  icon: '💳',
  title: 'Business Credit Line',
  range: 'Up to $750K',
  fundingSpeed: 'Same-day available',
  tagline: 'Revolving credit — draw what you need, pay only on usage.',
  description: 'A revolving business line of credit that lets you draw funds up to your approved limit. As you make payments, available credit opens back up so you can reuse the line again and again. Approvals are cash-flow based, not just credit-score based.',
  facts: [
    { label: 'Max Line', value: '$750,000' },
    { label: 'Payments', value: 'Weekly or monthly' },
    { label: 'Funding Speed', value: 'Same-day available' },
    { label: 'Structure', value: 'True revolving line' },
  ],
  requirements: [
    { label: 'Time in Business', value: '1 year minimum' },
    { label: 'Credit Score', value: '600+ FICO' },
    { label: 'Annual Revenue', value: '$500K annual or $40K/month deposits' },
    { label: 'Banking', value: 'Business bank account required' },
    { label: 'Bankruptcy', value: 'None on any credit report' },
    { label: 'Judgments / Liens', value: 'No open judgments, liens, or collections on any credit report' },
    { label: 'Personal Income', value: '$75,000+/year (owner)' },
  ],
  benefits: [
    'Cash flow-based approvals — revenue matters more than credit score',
    'Only pay interest on what you actually draw',
    'Same-day funding available for qualified files',
    'Revolving structure — each payment restores available credit',
  ],
  idealFor: 'Businesses wanting ongoing capital access for operating expenses, inventory, and growth without taking a full lump sum upfront.',
};

export function BusinessCreditLine() {
  return <FundingProductPage config={config} />;
}
