import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'business-term-loan',
  icon: '🏛️',
  title: 'Business Term Loan',
  range: 'Up to $10M',
  fundingSpeed: 'Varies by lender',
  tagline: 'Lump-sum capital with defined repayment and no prepayment penalty.',
  description: 'A structured business loan repaid over 1–2 years with weekly or monthly payment options. No prepayment penalties mean you can pay early and save. Can be used to refinance up to 2 existing loans or merchant cash advances, consolidating obligations into one payment.',
  facts: [
    { label: 'Max Amount', value: '$10,000,000' },
    { label: 'Term', value: '1–2 years' },
    { label: 'Payments', value: 'Weekly or monthly' },
    { label: 'Prepayment Penalty', value: 'None' },
  ],
  requirements: [
    { label: 'Time in Business', value: '2 years minimum' },
    { label: 'Credit Score', value: '600+ FICO' },
    { label: 'Annual Revenue', value: '$500K annual or $40K/month deposits' },
    { label: 'Banking', value: 'Business bank account required' },
    { label: 'Guarantor', value: 'All owners with 20%+ ownership must sign' },
    { label: 'Bankruptcy', value: 'None on any credit report' },
    { label: 'Judgments / Liens', value: 'No judgments, liens, or charge-offs on any credit report' },
    { label: 'Personal Income', value: '$75,000+/year (owner)' },
  ],
  benefits: [
    'No prepayment penalty — pay off early and save on interest',
    'Refinance up to 2 existing loans or MCAs into one payment',
    'May report to business credit bureaus, building your profile',
    'Flexible weekly or monthly payment cadence',
  ],
  idealFor: 'Established businesses (2+ years) needing a lump sum for growth, equipment, or debt consolidation with a predictable repayment schedule.',
};

export function BusinessTermLoan() {
  return <FundingProductPage config={config} />;
}
