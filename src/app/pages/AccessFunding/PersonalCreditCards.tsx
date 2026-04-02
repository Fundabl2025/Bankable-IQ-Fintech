import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'personal-credit-cards',
  icon: '💰',
  title: 'Personal Credit Lines',
  range: 'Up to $250K',
  fundingSpeed: 'Varies',
  tagline: '0% promotional APR for 18–24 months — startup eligible, no revenue required.',
  description: 'Personal-credit-based funding lines offering 0% promotional APR for 18–24 months. Approved based entirely on your personal credit profile — no time-in-business or revenue requirements. Access via check or card. Liquidation assistance available to convert to cash. Builds your credit profile while deployed.',
  facts: [
    { label: 'Max Funding', value: 'Up to $250,000' },
    { label: '0% Promo Period', value: '18–24 months' },
    { label: 'Min Payment', value: '2–5% on usage' },
    { label: 'Access Method', value: 'Check and card' },
    { label: 'Time in Business', value: 'Not required' },
    { label: 'Revenue', value: 'Not required' },
  ],
  requirements: [
    { label: 'Credit Score', value: '650+ FICO' },
    { label: 'Derogatory Items', value: 'None on credit report' },
    { label: 'Inquiries', value: 'No more than 4 in last 24 months' },
    { label: 'New Accounts', value: 'None in last 6 months' },
    { label: 'Personal Income', value: '$75,000+/year required' },
    { label: 'Ownership', value: 'Guarantor must hold 20%+ ownership' },
  ],
  benefits: [
    '0% interest for 18–24 months — zero cost of capital during promo window',
    'Startup eligible — no revenue or business history required',
    'Check and card access with optional cash liquidation support',
    'Builds personal and business credit profile simultaneously',
  ],
  idealFor: 'Entrepreneurs and startups with strong personal credit (650+) who need working capital without business revenue history or time-in-business requirements.',
};

export function PersonalCreditCards() {
  return <FundingProductPage config={config} />;
}
