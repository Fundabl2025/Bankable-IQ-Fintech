import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'working-capital-loans',
  icon: '🔄',
  title: 'Working Capital Loans',
  range: 'Up to $10M',
  fundingSpeed: 'Same-day available',
  tagline: 'Cash flow-based approvals — fund operations, payroll, and inventory fast.',
  description: 'Short-term loans sized to your monthly revenue for day-to-day operational needs. Approvals are based on cash flow, not just credit. Multiple payment cadences available (daily, weekly, or monthly) to match your cash cycle. Same-day funding available. Early payoff discounts may apply.',
  facts: [
    { label: 'Max Amount', value: '$10,000,000' },
    { label: 'Term', value: '6–24 months' },
    { label: 'Payments', value: 'Daily, weekly, or monthly' },
    { label: 'Funding Speed', value: 'Same-day available' },
    { label: 'Credit Score', value: 'No minimum FICO' },
  ],
  requirements: [
    { label: 'Time in Business', value: '6 months minimum' },
    { label: 'Monthly Deposits', value: '$10,000+ minimum cash flow' },
    { label: 'Credit Score', value: 'No minimum — cash flow based' },
    { label: 'Banking', value: 'Business bank account required' },
  ],
  benefits: [
    'Cash flow-based approvals — your deposits matter more than your credit score',
    'Same-day funding for qualified files',
    'Flexible payment cadence — daily, weekly, or monthly to match your cash cycle',
    'Early payoff discounts available at some lenders',
  ],
  idealFor: 'Businesses with consistent monthly deposits ($10K+) needing fast capital for payroll, inventory, seasonal expenses, or operational gaps.',
};

export function WorkingCapitalLoans() {
  return <FundingProductPage config={config} />;
}
