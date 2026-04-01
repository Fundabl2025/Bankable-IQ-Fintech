import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'inventory-line-of-credit',
  icon: '🏭',
  title: 'Inventory Line of Credit',
  range: '$100K–$10M',
  fundingSpeed: '7+ days',
  tagline: 'Revolving credit secured by inventory — capital that grows with your stock.',
  description: 'A revolving credit facility secured by the liquidation value of your inventory. Borrowing capacity adjusts with inventory levels — as you acquire more stock, more capital becomes available; as inventory depletes, availability adjusts accordingly. Advance rate up to 85% of inventory liquidation value.',
  facts: [
    { label: 'Facility Size', value: '$100K–$10M' },
    { label: 'Advance Rate', value: 'Up to 85% of liquidation value' },
    { label: 'Starting Rate', value: 'Prime + 2%' },
    { label: 'Structure', value: 'Revolving — adjusts with inventory' },
    { label: 'Min Inventory', value: '$1,000,000 current inventory' },
    { label: 'Credit Score', value: 'No minimum FICO' },
  ],
  requirements: [
    { label: 'Time in Business', value: '1 year minimum' },
    { label: 'Annual Revenue', value: '$1,000,000+' },
    { label: 'Minimum Inventory', value: '$1,000,000 in current inventory' },
    { label: 'Reporting', value: 'Inventory verification and clean financial reporting required' },
    { label: 'Credit Score', value: 'No minimum FICO' },
  ],
  benefits: [
    'Facility scales with inventory — more stock means more available capital',
    'No minimum FICO — underwriting based on inventory value, not credit score',
    'Revolving structure — as you repay, the line restores for reuse',
    'Prime-based pricing — competitive rate for asset-backed facility',
  ],
  idealFor: 'Inventory-heavy businesses (eCommerce, wholesale, manufacturing) with $1M+ in current inventory that need working capital without waiting on sales cycles.',
};

export function InventoryLineOfCredit() {
  return <FundingProductPage config={config} />;
}
