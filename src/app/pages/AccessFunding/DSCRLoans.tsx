import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'dscr-loans',
  icon: '🏘️',
  title: 'DSCR Loans',
  range: '$100K–$1.5M',
  fundingSpeed: 'Varies',
  tagline: 'Qualify on rental income — no personal income verification required.',
  description: 'DSCR (Debt Service Coverage Ratio) loans qualify based on the property\'s rental income rather than your personal income. If the property generates enough cash flow to cover the mortgage payment, you can qualify. No tax returns, no W-2s, no personal income documentation. Ideal for real estate investors building a portfolio.',
  facts: [
    { label: 'Loan Amounts', value: '$100K–$1.5M' },
    { label: 'Rates', value: 'Market rate, varies by DSCR' },
    { label: 'Min DSCR', value: '1.0x (breakeven)' },
    { label: 'Loan Terms', value: '30-year fixed available' },
    { label: 'Property Types', value: 'SFR, 2–4 units, condos, short-term rentals' },
    { label: 'Credit Score', value: '680+ FICO' },
  ],
  requirements: [
    { label: 'Credit Score', value: '680+ FICO' },
    { label: 'DSCR', value: '1.0x minimum (rental income ÷ PITIA)' },
    { label: 'Down Payment', value: '20–25% typically required' },
    { label: 'Property Type', value: 'Investment properties only (no primary residences)' },
    { label: 'Documentation', value: 'Lease agreement or market rent appraisal' },
    { label: 'Reserves', value: '3–6 months PITIA reserves required' },
  ],
  benefits: [
    'No personal income verification — qualify on property cash flow alone',
    'No tax returns or W-2s required — ideal for self-employed investors',
    'Portfolio-friendly — no limit on number of properties financed',
    '30-year fixed option — long-term stability for buy-and-hold investors',
  ],
  idealFor: 'Real estate investors who own or are purchasing rental properties and want to qualify based on property income rather than personal income documentation.',
};

export function DSCRLoans() {
  return <FundingProductPage config={config} />;
}
