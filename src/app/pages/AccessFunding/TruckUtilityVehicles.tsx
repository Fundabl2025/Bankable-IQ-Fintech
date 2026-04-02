import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'truck-utility-vehicles',
  icon: '🚛',
  title: 'Truck & Utility Vehicle Financing',
  range: '$15K–$500K',
  fundingSpeed: '3–7 days',
  tagline: 'Finance your fleet — commercial trucks, vans, and work vehicles.',
  description: 'Specialized asset-backed financing for commercial vehicles. Covers Class 1–8 trucks, cargo vans, box trucks, utility vehicles, and work vehicles — new and used. The vehicle title secures the loan, enabling more flexible approvals than unsecured products. Single vehicle or full fleet eligible.',
  facts: [
    { label: 'Max Amount', value: '$500,000' },
    { label: 'Term', value: '2–7 years' },
    { label: 'Rates', value: '6–22% (tier dependent)' },
    { label: 'Down Payment', value: '0–20%' },
    { label: 'Min Deal Size', value: '$15,000' },
    { label: 'Eligible Vehicles', value: 'New and used commercial vehicles' },
  ],
  requirements: [
    { label: 'Time in Business', value: '6 months minimum' },
    { label: 'Credit Score', value: '550+ FICO' },
    { label: 'Monthly Revenue', value: '$3,000+' },
    { label: 'Documentation', value: 'Vehicle invoice or purchase agreement required' },
    { label: 'Banking', value: 'Business bank account required' },
    { label: 'Bankruptcy', value: 'None on any credit report' },
    { label: 'Judgments / Liens', value: 'No open charge-offs on personal credit reports' },
    { label: 'Personal Income', value: '$75,000+/year (owner)' },
  ],
  benefits: [
    'Fleet financing from a single vehicle up to an entire fleet',
    'Vehicle secures the loan — broader approval than unsecured products',
    'New and used vehicles both eligible — dealer or private sale',
    'Faster close than SBA or unsecured products — funds in 3–7 days',
  ],
  idealFor: 'Transportation, logistics, construction, and field-service businesses that need commercial vehicles to operate or expand their fleet.',
};

export function TruckUtilityVehicles() {
  return <FundingProductPage config={config} />;
}
