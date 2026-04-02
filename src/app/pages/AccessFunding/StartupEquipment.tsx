import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'startup-equipment',
  icon: '🚀',
  title: 'Startup Equipment Financing',
  range: '$10K–$150K',
  fundingSpeed: '5–10 days',
  tagline: 'Get the equipment you need to launch — no years in business required.',
  description: 'Asset-backed equipment financing designed for businesses under 2 years old. Because the equipment itself secures the loan, lenders can approve businesses that don\'t yet have long revenue history. Covers machinery, technology, kitchen equipment, tools, and commercial-grade gear for new operators.',
  facts: [
    { label: 'Max Amount', value: '$150,000' },
    { label: 'Term', value: '2–5 years' },
    { label: 'Rates', value: '9–24.99% (tier dependent)' },
    { label: 'Down Payment', value: '10–20% typical' },
    { label: 'Min Deal Size', value: '$10,000' },
    { label: 'Time in Business', value: '0–24 months eligible' },
  ],
  requirements: [
    { label: 'Time in Business', value: '12 months (some lenders accept 0–12 months)' },
    { label: 'Credit Score', value: '580+ FICO' },
    { label: 'Monthly Revenue', value: '$10,000+' },
    { label: 'Documentation', value: 'Equipment invoice required' },
    { label: 'Banking', value: 'Business bank account required' },
    { label: 'Bankruptcy', value: 'None on any credit report' },
    { label: 'Judgments / Liens', value: 'No open judgments, liens, or charge-offs' },
  ],
  benefits: [
    'Accessible for businesses under 2 years — equipment value anchors approval',
    'Preserve working capital while deploying essential gear from day one',
    'Builds business credit history with an installment tradeline',
    'Wide asset coverage: machinery, tech, kitchen, tools, and commercial equipment',
  ],
  idealFor: 'Early-stage businesses that need essential equipment to operate and want a lower-barrier entry into asset-backed financing without years of revenue history.',
};

export function StartupEquipment() {
  return <FundingProductPage config={config} />;
}
