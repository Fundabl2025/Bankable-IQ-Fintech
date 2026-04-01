import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'revenue-based-loan',
  icon: '📈',
  title: 'Revenue-Based Loan',
  range: '$10K–$5M',
  fundingSpeed: '24 hours–7 days',
  tagline: 'Repayments adjust with your revenue — no fixed monthly payment.',
  description: 'Flexible financing where repayment is a fixed percentage of your monthly or weekly gross revenue. During slower months, your payment is smaller. During strong months, you pay more and pay it off faster. Pricing is set upfront via a flat factor rate (1.1x–1.3x) — no compounding interest, no prepayment penalties.',
  facts: [
    { label: 'Amount', value: '10–30% of annual recurring revenue' },
    { label: 'Term', value: '6–24 months (cap-based)' },
    { label: 'Factor Rate', value: '1.1x–1.3x (no compounding)' },
    { label: 'Payment', value: '5–10% of monthly/weekly gross revenue' },
    { label: 'Prepayment Penalty', value: 'None' },
    { label: 'Collateral', value: 'Generally unsecured' },
  ],
  requirements: [
    { label: 'Time in Business', value: '6–12 months' },
    { label: 'Monthly Revenue', value: '$10,000–$25,000 minimum' },
    { label: 'Gross Margins', value: '50%+ preferred' },
    { label: 'Data Access', value: 'Bank account, QuickBooks, or Stripe linking required' },
  ],
  benefits: [
    'Payments scale with revenue — you pay less during slower months automatically',
    'Flat factor rate upfront — no surprises, no compounding interest',
    'No prepayment penalty — pay off early and your effective cost drops',
    'Fast funding once accounts are linked — typically 24 hours to 7 days',
  ],
  idealFor: 'Businesses with strong gross margins and consistent revenue that experience seasonal fluctuations and want payment flexibility rather than a fixed monthly obligation.',
};

export function RevenueBasedLoan() {
  return <FundingProductPage config={config} />;
}
