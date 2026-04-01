import { FundingProductPage, type ProductPageConfig } from '../../components/FundingProductPage';

const config: ProductPageConfig = {
  id: 'purchase-order-finance',
  icon: '📦',
  title: 'Purchase Order Finance',
  range: '$100K–$10M+',
  fundingSpeed: '7–14 days',
  tagline: 'Fulfill large orders without upfront capital — funder pays your supplier directly.',
  description: 'Purchase order financing enables you to fulfill large customer orders without fronting the production or supplier costs. The financing provider pays your supplier directly. Restricted to supplier and production costs only — not operational expenses. Often paired with A/R financing to complete the full order-to-cash cycle.',
  facts: [
    { label: 'Funding Range', value: '$100K–$10M+' },
    { label: 'Funding Speed', value: '7–14 days' },
    { label: 'Payment Method', value: 'Direct to supplier' },
    { label: 'Credit Score', value: 'No minimum FICO' },
    { label: 'Pairs With', value: 'A/R financing for full cycle' },
  ],
  requirements: [
    { label: 'Time in Business', value: '1+ year' },
    { label: 'Annual Revenue', value: '$500,000+' },
    { label: 'Purchase Order', value: 'Must have PO from creditworthy buyer' },
    { label: 'Supplier', value: 'Verifiable supplier quote required' },
    { label: 'Verification', value: 'Buyer and supplier must pass verification' },
    { label: 'Use of Funds', value: 'Restricted to supplier/production costs only' },
  ],
  benefits: [
    'Fulfill orders that exceed your current working capital capacity',
    'Funder pays supplier directly — you never handle the capital',
    'No minimum FICO — approval driven by the creditworthiness of your buyer',
    'Pairs with A/R financing to complete the full order-to-cash cycle',
  ],
  idealFor: 'Wholesalers, importers, manufacturers, distributors, and contractors who have large purchase orders but lack the upfront capital to fulfill them.',
};

export function PurchaseOrderFinance() {
  return <FundingProductPage config={config} />;
}
