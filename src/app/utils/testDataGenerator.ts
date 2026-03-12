// Test data generator for Business Success Scan
// Generates randomized realistic test scenarios to test funding eligibility logic

import { ScanData } from './fundingRequirements';

// Generate random value from array
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate random number in range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random boolean with weighted probability
function randomBool(probabilityTrue: number = 0.5): boolean {
  return Math.random() < probabilityTrue;
}

export interface TestScenario {
  name: string;
  description: string;
  data: ScanData;
  expectedPrograms: string[]; // IDs of programs they should qualify for
}

// Predefined test scenarios
export const testScenarios: TestScenario[] = [
  // Scenario 1: Excellent Credit, Established Business (Should qualify for MOST programs)
  {
    name: 'Prime Established Business',
    description: 'Excellent credit, 3+ years in business, strong revenue - qualifies for almost everything',
    data: {
      hasEIN: 'Yes',
      einNumber: '12-3456789',
      startMonth: 'January',
      startYear: '2021',
      monthlyRevenue: '$75,000',
      creditCardSales: '$20,000',
      owedToYou: '$50,000',
      purchaseOrders: '$10,000',
      inventory: '$150,000',
      property: 'Yes',
      creditScore: '750',
      businessBankAccount: 'Yes',
      openBankruptcies: 'No',
      recentInquiries: '2',
      newAccounts: 'No',
      latePayments: 'No',
      collections: 'No',
    },
    expectedPrograms: [
      'business-credit-cards',
      'personal-credit-cards',
      'business-credit-line',
      'business-term-loan',
      'working-capital-loans',
      'credit-union-loans',
      'equipment-financing',
      'merchant-advance',
      'receivable-factoring',
      'revenue-based-loan',
      'accounts-receivable-finance',
      'inventory-line-of-credit',
      'purchase-order-finance',
      'bridge-loans',
      'dscr-loans',
      'construction-loans',
    ],
  },

  // Scenario 2: New Business, Good Credit, Low Revenue (Limited options)
  {
    name: 'Startup with Good Credit',
    description: 'New business (6 months), good credit but low revenue - limited to starter programs',
    data: {
      hasEIN: 'Yes',
      einNumber: '98-7654321',
      startMonth: 'June',
      startYear: '2024',
      monthlyRevenue: '$12,000',
      creditCardSales: '$8,000',
      owedToYou: '$5,000',
      purchaseOrders: '$0',
      inventory: '$0',
      property: 'No',
      creditScore: '700',
      businessBankAccount: 'Yes',
      openBankruptcies: 'No',
      recentInquiries: '1',
      newAccounts: 'No',
      latePayments: 'No',
      collections: 'No',
    },
    expectedPrograms: [
      'business-credit-cards',
      'personal-credit-cards',
      'working-capital-loans',
      'credit-union-loans',
      'merchant-advance',
      'receivable-factoring',
      'purchase-order-finance',
      'bridge-loans',
      'dscr-loans',
      'construction-loans',
    ],
  },

  // Scenario 3: No/Bad Credit, Cash Flow Business (MCA/Factoring Only)
  {
    name: 'Cash Flow - No Credit',
    description: 'Poor/no credit but strong cash flow - qualifies for no-credit-required programs',
    data: {
      hasEIN: 'Yes',
      einNumber: '45-6789012',
      startMonth: 'March',
      startYear: '2023',
      monthlyRevenue: '$35,000',
      creditCardSales: '$25,000',
      owedToYou: '$40,000',
      purchaseOrders: '$0',
      inventory: '$0',
      property: 'No',
      creditScore: '520',
      businessBankAccount: 'Yes',
      openBankruptcies: 'No',
      recentInquiries: '0',
      newAccounts: 'No',
      latePayments: 'Yes',
      collections: 'Yes',
    },
    expectedPrograms: [
      'merchant-advance',
      'receivable-factoring',
      'working-capital-loans',
      'revenue-based-loan',
    ],
  },

  // Scenario 4: High Revenue, Credit Issues (Collateral-based programs)
  {
    name: 'High Revenue with Credit Challenges',
    description: 'High revenue but credit challenges - asset-based and invoice financing',
    data: {
      hasEIN: 'Yes',
      einNumber: '78-9012345',
      startMonth: 'May',
      startYear: '2020',
      monthlyRevenue: '$120,000',
      creditCardSales: '$40,000',
      owedToYou: '$180,000',
      purchaseOrders: '$50,000',
      inventory: '$250,000',
      property: 'Yes',
      creditScore: '580',
      businessBankAccount: 'Yes',
      openBankruptcies: 'No',
      recentInquiries: '3',
      newAccounts: 'No',
      latePayments: 'Yes',
      collections: 'No',
    },
    expectedPrograms: [
      'merchant-advance',
      'receivable-factoring',
      'working-capital-loans',
      'revenue-based-loan',
      'equipment-financing',
      'accounts-receivable-finance',
      'inventory-line-of-credit',
    ],
  },

  // Scenario 5: Brand New Business, Excellent Personal Credit (Credit cards only)
  {
    name: 'New Startup - Excellent Personal Credit',
    description: 'Just started, no business history but excellent personal credit',
    data: {
      hasEIN: 'No',
      einNumber: '',
      startMonth: 'December',
      startYear: '2024',
      monthlyRevenue: '$5,000',
      creditCardSales: '$3,000',
      owedToYou: '$0',
      purchaseOrders: '$0',
      inventory: '$0',
      property: 'No',
      creditScore: '780',
      businessBankAccount: 'No',
      openBankruptcies: 'No',
      recentInquiries: '1',
      newAccounts: 'No',
      latePayments: 'No',
      collections: 'No',
    },
    expectedPrograms: [
      'business-credit-cards',
      'personal-credit-cards',
      'credit-union-loans',
      'bridge-loans',
      'dscr-loans',
      'construction-loans',
    ],
  },

  // Scenario 6: E-commerce/Inventory Business
  {
    name: 'E-commerce with Inventory',
    description: 'Online business with strong inventory and purchase orders',
    data: {
      hasEIN: 'Yes',
      einNumber: '11-2233445',
      startMonth: 'August',
      startYear: '2022',
      monthlyRevenue: '$95,000',
      creditCardSales: '$60,000',
      owedToYou: '$25,000',
      purchaseOrders: '$150,000',
      inventory: '$1,200,000',
      property: 'No',
      creditScore: '680',
      businessBankAccount: 'Yes',
      openBankruptcies: 'No',
      recentInquiries: '2',
      newAccounts: 'No',
      latePayments: 'No',
      collections: 'No',
    },
    expectedPrograms: [
      'business-credit-cards',
      'personal-credit-cards',
      'business-credit-line',
      'business-term-loan',
      'working-capital-loans',
      'credit-union-loans',
      'equipment-financing',
      'merchant-advance',
      'receivable-factoring',
      'revenue-based-loan',
      'inventory-line-of-credit',
      'purchase-order-finance',
      'bridge-loans',
      'dscr-loans',
      'construction-loans',
    ],
  },

  // Scenario 7: Service Business (B2B) - High AR
  {
    name: 'Service Business with High Receivables',
    description: 'B2B service company with high accounts receivable',
    data: {
      hasEIN: 'Yes',
      einNumber: '55-6677889',
      startMonth: 'February',
      startYear: '2021',
      monthlyRevenue: '$110,000',
      creditCardSales: '$10,000',
      owedToYou: '$220,000',
      purchaseOrders: '$0',
      inventory: '$0',
      property: 'No',
      creditScore: '710',
      businessBankAccount: 'Yes',
      openBankruptcies: 'No',
      recentInquiries: '1',
      newAccounts: 'No',
      latePayments: 'No',
      collections: 'No',
    },
    expectedPrograms: [
      'business-credit-cards',
      'personal-credit-cards',
      'business-credit-line',
      'business-term-loan',
      'working-capital-loans',
      'credit-union-loans',
      'merchant-advance',
      'receivable-factoring',
      'revenue-based-loan',
      'accounts-receivable-finance',
      'purchase-order-finance',
      'bridge-loans',
      'dscr-loans',
      'construction-loans',
    ],
  },

  // Scenario 8: Real Estate Investor
  {
    name: 'Real Estate Investment Business',
    description: 'Property investor needing property-based financing',
    data: {
      hasEIN: 'Yes',
      einNumber: '99-0011223',
      startMonth: 'April',
      startYear: '2019',
      monthlyRevenue: '$45,000',
      creditCardSales: '$0',
      owedToYou: '$0',
      purchaseOrders: '$0',
      inventory: '$0',
      property: 'Yes',
      creditScore: '690',
      businessBankAccount: 'Yes',
      openBankruptcies: 'No',
      recentInquiries: '3',
      newAccounts: 'No',
      latePayments: 'No',
      collections: 'No',
    },
    expectedPrograms: [
      'business-credit-cards',
      'personal-credit-cards',
      'business-credit-line',
      'business-term-loan',
      'working-capital-loans',
      'credit-union-loans',
      'merchant-advance',
      'revenue-based-loan',
      'purchase-order-finance',
      'bridge-loans',
      'dscr-loans',
      'construction-loans',
    ],
  },
];

// Generate completely random test data
export function generateRandomScanData(): ScanData {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentYear = new Date().getFullYear();
  const startYear = randomInRange(currentYear - 5, currentYear);
  
  // Generate revenue ranges
  const revenueRanges = ['$0', '$5,000', '$10,000', '$15,000', '$25,000', '$40,000', '$60,000', '$80,000', '$100,000', '$150,000'];
  
  return {
    hasEIN: randomBool(0.7) ? 'Yes' : 'No',
    einNumber: randomBool(0.7) ? `${randomInRange(10, 99)}-${randomInRange(1000000, 9999999)}` : '',
    startMonth: randomChoice(months),
    startYear: startYear.toString(),
    monthlyRevenue: randomChoice(revenueRanges),
    creditCardSales: randomChoice(revenueRanges),
    owedToYou: randomChoice(['$0', '$5,000', '$10,000', '$25,000', '$50,000', '$100,000', '$200,000']),
    purchaseOrders: randomChoice(['$0', '$5,000', '$25,000', '$50,000', '$100,000']),
    inventory: randomChoice(['$0', '$50,000', '$100,000', '$500,000', '$1,000,000']),
    property: randomBool(0.3) ? 'Yes' : 'No',
    creditScore: randomInRange(450, 850).toString(),
    businessBankAccount: randomBool(0.8) ? 'Yes' : 'No',
    openBankruptcies: randomBool(0.1) ? 'Yes' : 'No',
    recentInquiries: randomInRange(0, 6).toString(),
    newAccounts: randomBool(0.3) ? 'Yes' : 'No',
    latePayments: randomBool(0.2) ? 'Yes' : 'No',
    collections: randomBool(0.15) ? 'Yes' : 'No',
  };
}

// Get a random predefined scenario
export function getRandomScenario(): TestScenario {
  return randomChoice(testScenarios);
}

// Apply test scenario to localStorage (for testing in the app)
export function applyTestScenario(scenario: TestScenario): void {
  const data = scenario.data;
  
  // Convert to scan step format
  const step1 = {
    businessLegalName: 'Test Business LLC',
    contactFirstName: 'John',
    contactLastName: 'Doe',
    contactEmail: 'john@testbusiness.com',
    contactPhone: '(555) 123-4567',
    businessAddress: '123 Main St',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    businessPhone: '(555) 987-6543',
    hasEIN: data.hasEIN,
    einNumber: data.einNumber || '',
  };
  
  const step2 = {
    startMonth: data.startMonth || 'January',
    startYear: data.startYear || '2020',
    industry: 'Technology',
    businessType: 'LLC',
    website: 'https://www.testbusiness.com',
    monthlyRevenue: data.monthlyRevenue || '$0',
    creditCardSales: data.creditCardSales || '$0',
    owedToYou: data.owedToYou || '$0',
    purchaseOrders: data.purchaseOrders || '$0',
    equipmentValue: '$50,000',
    inventory: data.inventory || '$0',
    property: data.property || 'No',
  };
  
  const step3 = {
    experianScore: data.creditScore || '680',
    transUnionScore: data.creditScore || '680',
    equiFaxScore: data.creditScore || '680',
    hasBankruptcy: data.openBankruptcies || 'No',
    hasJudgments: data.latePayments === 'Yes' ? 'Yes' : 'No',
    personalIncome: '75k - 100k',
  };
  
  localStorage.setItem('scanStep1', JSON.stringify(step1));
  localStorage.setItem('scanStep2', JSON.stringify(step2));
  localStorage.setItem('scanStep3', JSON.stringify(step3));
  
  console.log(`✅ Applied test scenario: "${scenario.name}"`);
  console.log(`📋 Description: ${scenario.description}`);
  console.log(`🎯 Expected to qualify for ${scenario.expectedPrograms.length} programs`);
}

// Apply random data
export function applyRandomTestData(): void {
  const randomData = generateRandomScanData();
  const scenario: TestScenario = {
    name: 'Random Test Data',
    description: 'Randomly generated test scenario',
    data: randomData,
    expectedPrograms: [],
  };
  applyTestScenario(scenario);
}

// Helper to cycle through all scenarios
export function cycleToNextScenario(): TestScenario {
  const currentScenario = localStorage.getItem('currentTestScenarioIndex');
  const currentIndex = currentScenario ? parseInt(currentScenario) : -1;
  const nextIndex = (currentIndex + 1) % testScenarios.length;
  
  localStorage.setItem('currentTestScenarioIndex', nextIndex.toString());
  const scenario = testScenarios[nextIndex];
  applyTestScenario(scenario);
  
  return scenario;
}

// Get all scenario names for UI
export function getAllScenarioNames(): string[] {
  return testScenarios.map(s => s.name);
}

// Get scenario by name
export function getScenarioByName(name: string): TestScenario | undefined {
  return testScenarios.find(s => s.name === name);
}
