import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'construction-loans',
  icon: '🏗️',
  title: 'Construction Loans',
  range: '$200K–$2.5M',
  fundingSpeed: '3–5 days to close',
  tagline: 'Ground-up and renovation construction financing for real estate investors.',
  description: 'Short-term construction loans for ground-up builds and major renovations on investment properties. Funds are disbursed in draws as construction milestones are completed. Loan is based on the After Repair Value (ARV) of the completed project. Interest-only payments during the construction period. Designed for experienced builders and real estate developers.',
  facts: [
    { label: 'Loan Amounts', value: '$200K–$2.5M' },
    { label: 'Basis', value: 'Up to 70% of ARV' },
    { label: 'Disbursement', value: 'Draw schedule tied to milestones' },
    { label: 'Payments', value: 'Interest-only during construction' },
    { label: 'Loan Terms', value: '12–24 months' },
    { label: 'Credit Score', value: '660+ FICO' },
  ],
  requirements: [
    { label: 'Credit Score', value: '660+ FICO' },
    { label: 'Experience', value: 'Prior construction or development experience preferred' },
    { label: 'Property Type', value: 'Investment properties only (no primary residences)' },
    { label: 'LTC', value: 'Up to 85–90% of total project cost' },
    { label: 'ARV LTV', value: 'Up to 70% of after-repair value' },
    { label: 'Documentation', value: 'Construction plans, budget, contractor bids, permits' },
  ],
  benefits: [
    'Draw-based disbursement — only pay interest on funds actually drawn',
    'ARV-based underwriting — loan sized on completed value, not current value',
    'Fast close in 3–5 days — secure your project timeline without delays',
    'Interest-only during construction — lower cash obligation while building',
  ],
  idealFor: 'Real estate developers and experienced investors undertaking ground-up construction or major renovation projects on investment properties.',
};

export function ConstructionLoans() {
  return <FundingProductPage config={config} />;
}
