import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'business-credit-cards',
  icon: '🏦',
  title: 'Syndicated Line of Credit',
  range: '$25K–$150K',
  fundingSpeed: '10 days',
  tagline: '0% promotional APR for 12–24 months — no time-in-business required.',
  description: 'Unsecured business credit lines issued based on personal credit strength. Ideal for startups and early-stage businesses. Features a 0% promotional window of 12–24 months, allowing you to deploy capital interest-free. Lines can be converted to cash for operational use.',
  facts: [
    { label: '0% Promo APR', value: '12–24 months' },
    { label: 'Funding Speed', value: '10 days' },
    { label: 'Collateral', value: 'Unsecured' },
    { label: 'Fee', value: '10% origination + 6% optional liquidation' },
  ],
  requirements: [
    { label: 'Credit Score', value: '680+ FICO' },
    { label: 'Credit History', value: 'No recent late payments or collections' },
    { label: 'Inquiries', value: 'Fewer than 4 in last 30 days' },
    { label: 'Utilization', value: 'Preferably under 25%' },
    { label: 'Time in Business', value: 'None required' },
    { label: 'Revenue', value: 'None required' },
    { label: 'Bankruptcy', value: 'None on any credit report' },
    { label: 'Judgments / Liens', value: 'No judgments, liens, or charge-offs on any credit report' },
    { label: 'Personal Income', value: '$75,000+/year (owner)' },
  ],
  benefits: [
    '0% interest for 12–24 months — deploy capital cost-free during promo period',
    'No time-in-business or revenue requirements — startup eligible',
    'Lines can be converted to cash for maximum flexibility',
    'Builds business credit profile while you use the line',
  ],
  idealFor: 'Startups and entrepreneurs with strong personal credit who need low-cost working capital without business revenue history.',
};

export function BusinessCreditCards() {
  return <FundingProductPage config={config} />;
}
