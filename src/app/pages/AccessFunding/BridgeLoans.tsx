import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'bridge-loans',
  icon: '🌉',
  title: 'Bridge Loans',
  range: '$100K–$3M',
  fundingSpeed: '3–5 days to close',
  tagline: 'Fast-close financing for investment property purchases and refinances.',
  description: 'Short-term bridge loans for investment property transactions. Closes in 3–5 days. Eligible for purchases, refinances, and cash-out refinances. Interest-only monthly payments. No prepayment penalty. Rates from 10.99–12.99% with 1–3 points. Investment properties only — primary residences not eligible.',
  facts: [
    { label: 'Loan Amounts', value: '$100K–$3M' },
    { label: 'Rates', value: '10.99%–12.99%' },
    { label: 'Points', value: '1%–3%' },
    { label: 'Payments', value: 'Monthly interest-only' },
    { label: 'Terms', value: '6, 12, or 18 months' },
    { label: 'Prepayment Penalty', value: 'None' },
  ],
  requirements: [
    { label: 'Credit Score', value: '640+ FICO' },
    { label: 'Property Type', value: 'Investment properties only (no primary residences)' },
    { label: 'LTV — Purchase', value: 'Up to 75%' },
    { label: 'LTV — Refinance', value: 'Up to 70%' },
    { label: 'LTV — Cash-Out', value: 'Up to 65%' },
    { label: 'Documents', value: 'Purchase contract, 2 bank statements, insurance, ID, LLC/entity docs' },
  ],
  benefits: [
    '3–5 day close — compete with cash buyers on investment deals',
    'Interest-only payments reduce monthly cash obligation during hold period',
    'No prepayment penalty — refinance to permanent financing when ready',
    'Eligible for purchase, refinance, and cash-out refinance transactions',
  ],
  idealFor: 'Real estate investors who need fast closing on investment property purchases or refinances to secure time-sensitive deals.',
};

export function BridgeLoans() {
  return <FundingProductPage config={config} />;
}
