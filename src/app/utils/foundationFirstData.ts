// ============================================================================
// FOUNDATIONFIRST CENTRAL DATA STORE - Single Source of Truth
// ============================================================================

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PersonalProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | '';
  zipCode: string;
  state: string;
  
  // Family Profile
  married: boolean;
  dependentChildren: number;
  childrenAges: number[]; // Array of ages
  
  // Contact Information
  email: string;
  phone: string;
  
  // Metadata
  profileCompleted: boolean;
  lastUpdated: string;
  createdDate: string;
}

export interface IncomeAndSavings {
  // Income
  grossIncome: number;
  
  // Savings
  monthlySavingsRetirement: number;
  monthlySavingsOther: number;
  budgetFrequency: 'Always' | 'Often' | 'Sometimes' | 'Seldom' | 'Never' | '';
  separateEmergencyFund: boolean;
  employerContributionsMaximized: 'Yes' | 'No' | 'Not applicable' | '';
  
  // Metadata
  lastUpdated: string;
}

export interface BankAccount {
  id: string;
  accountType: 'Checking' | 'Savings';
  accountName: string;
  balance: number;
}

export interface RetirementAccount {
  id: string;
  accountType: '401k' | 'IRA' | 'Roth IRA' | 'Traditional IRA' | '403b' | 'Other';
  accountName: string;
  balance: number;
}

export interface EducationAccount {
  id: string;
  accountType: '529 Plan' | 'Coverdell ESA' | 'UTMA/UGMA' | 'Other';
  accountName: string;
  balance: number;
}

export interface OtherAccount {
  id: string;
  accountType: 'Health Savings Account' | 'Other Investments' | 'Retirement Income' | 'Brokerage' | 'Other';
  accountName: string;
  balance: number;
}

export interface PrimaryHome {
  homeOwnership: 'Own with a mortgage' | 'Own outright' | 'Rent' | 'Live with family' | '';
  currentHomeValue: number;
  homeValueWhenBought: number;
  oweOnMortgage: number;
  mortgagePayment: number;
  mortgageInterestRate: number; // Percentage (e.g., 8 = 8%)
  privateMortgageInsurance: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  ownership: 'Loan' | 'Lease' | 'Own outright';
  currentValue: number;
  loanBalance: number;
  monthlyPayment: number;
}

export interface StudentLoan {
  id: string;
  loanName: string;
  balance: number;
  monthlyPayment: number;
  interestRate: number; // Percentage
}

export interface CreditCard {
  id: string;
  cardName: string;
  balance: number;
  creditLimit: number;
  minimumPayment: number;
}

export interface AdditionalRealEstate {
  id: string;
  propertyName: string;
  propertyType: 'Rental Property' | 'Vacation Home' | 'Land' | 'Commercial' | 'Other';
  currentValue: number;
  mortgageBalance: number;
  monthlyPayment: number;
}

export interface OtherAsset {
  id: string;
  assetName: string;
  assetType: string;
  value: number;
}

export interface OtherLiability {
  id: string;
  liabilityName: string;
  liabilityType: string;
  balance: number;
  monthlyPayment: number;
}

export interface AssetsAndDebt {
  // Bank Accounts
  bankAccounts: BankAccount[];
  
  // Retirement Accounts
  retirementAccounts: RetirementAccount[];
  
  // Education Accounts
  educationAccounts: EducationAccount[];
  
  // Other Accounts
  otherAccounts: OtherAccount[];
  
  // Primary Home
  primaryHome: PrimaryHome;
  
  // Vehicles
  vehicles: Vehicle[];
  
  // Student Loans
  studentLoans: StudentLoan[];
  
  // Credit Cards
  activeCreditCards: 'Yes, pay in full each month' | 'Yes, make payments but leave some balance remaining each month' | 'No' | '';
  creditCards: CreditCard[];
  
  // Additional Real Estate
  additionalRealEstate: AdditionalRealEstate[];
  
  // Other Assets
  otherAssets: OtherAsset[];
  
  // Other Liabilities
  otherLiabilities: OtherLiability[];
  
  // Metadata
  lastUpdated: string;
}

export interface InsuranceCoverage {
  homeownersOrRentalInsurance: boolean;
  healthInsurance: boolean;
  autoInsurance: boolean;
  dentalInsurance: boolean;
  termLifeInsurance: boolean;
  permanentLifeInsurance: boolean;
  identityTheftInsurance: boolean;
  disabilityInsurance: boolean;
  umbrellaInsurance: boolean;
  longTermCareInsurance: boolean;
}

export interface EstatePlanning {
  guardianshipNomination: boolean;
  lastWillAndTestament: boolean;
  livingTrust: boolean;
  otherTrust: boolean;
  durablePowerOfAttorney: boolean;
  advanceHealthCareDirective: boolean;
  finalDispositionInstructions: boolean;
}

export interface RiskManagement {
  // Credit
  creditScoreRange: '300-579' | '580-669' | '670-739' | '740-799' | '800-850' | '';
  
  // Estate Planning
  estatePlanning: EstatePlanning;
  
  // Insurance Coverage
  insuranceCoverage: InsuranceCoverage;
  
  // Life Insurance
  yourLifeInsurance: number;
  
  // Life Expectancy
  healthRating: 'Very healthy' | 'Somewhat healthy' | 'Average health' | 'Somewhat unhealthy' | 'Very unhealthy' | '';
  smokeRating: 'Never smoked' | 'Former smoker' | 'Current smoker' | '';
  
  // Metadata
  lastUpdated: string;
}

export interface RetirementOutlook {
  targetRetirementAge: number;
  preferredRetirementLifestyle: 'More modest than now' | 'About the same as now' | 'More extravagant than now' | '';
  
  // Metadata
  lastUpdated: string;
}

export interface FoundationFirstData {
  personalProfile: PersonalProfile;
  incomeAndSavings: IncomeAndSavings;
  assetsAndDebt: AssetsAndDebt;
  riskManagement: RiskManagement;
  retirementOutlook: RetirementOutlook;
  
  // Account Settings
  emailPreferences: {
    emailStatus: 'Subscribed' | 'Unsubscribed';
  };
  security: {
    mfaEnabled: boolean;
  };
  
  // Membership (for future premium features)
  membership: {
    currentPlan: 'Starter' | 'Pro' | 'Premium';
    accountStatus: 'Active' | 'Inactive' | 'Suspended';
  };
  
  // Module access flag
  hasAccess: boolean;
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

export function calculateTotalAssets(data: FoundationFirstData): number {
  const { assetsAndDebt } = data;
  
  let total = 0;
  
  // Bank accounts
  total += assetsAndDebt.bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Retirement accounts
  total += assetsAndDebt.retirementAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Education accounts
  total += assetsAndDebt.educationAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Other accounts
  total += assetsAndDebt.otherAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Primary home
  total += assetsAndDebt.primaryHome.currentHomeValue;
  
  // Vehicles
  total += assetsAndDebt.vehicles.reduce((sum, vehicle) => sum + vehicle.currentValue, 0);
  
  // Additional real estate
  total += assetsAndDebt.additionalRealEstate.reduce((sum, property) => sum + property.currentValue, 0);
  
  // Other assets
  total += assetsAndDebt.otherAssets.reduce((sum, asset) => sum + asset.value, 0);
  
  return total;
}

export function calculateTotalLiabilities(data: FoundationFirstData): number {
  const { assetsAndDebt } = data;
  
  let total = 0;
  
  // Mortgage
  total += assetsAndDebt.primaryHome.oweOnMortgage;
  
  // Vehicles
  total += assetsAndDebt.vehicles.reduce((sum, vehicle) => sum + vehicle.loanBalance, 0);
  
  // Student loans
  total += assetsAndDebt.studentLoans.reduce((sum, loan) => sum + loan.balance, 0);
  
  // Credit cards
  total += assetsAndDebt.creditCards.reduce((sum, card) => sum + card.balance, 0);
  
  // Additional real estate mortgages
  total += assetsAndDebt.additionalRealEstate.reduce((sum, property) => sum + property.mortgageBalance, 0);
  
  // Other liabilities
  total += assetsAndDebt.otherLiabilities.reduce((sum, liability) => sum + liability.balance, 0);
  
  return total;
}

export function calculateNetWorth(data: FoundationFirstData): number {
  return calculateTotalAssets(data) - calculateTotalLiabilities(data);
}

export function calculateDebtToIncomeRatio(data: FoundationFirstData): number {
  const { incomeAndSavings, assetsAndDebt } = data;
  
  if (incomeAndSavings.grossIncome === 0) return 0;
  
  const monthlyIncome = incomeAndSavings.grossIncome / 12;
  
  let monthlyDebtPayments = 0;
  
  // Mortgage payment
  monthlyDebtPayments += assetsAndDebt.primaryHome.mortgagePayment;
  
  // Vehicle payments
  monthlyDebtPayments += assetsAndDebt.vehicles.reduce((sum, vehicle) => sum + vehicle.monthlyPayment, 0);
  
  // Student loan payments
  monthlyDebtPayments += assetsAndDebt.studentLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
  
  // Credit card minimum payments
  monthlyDebtPayments += assetsAndDebt.creditCards.reduce((sum, card) => sum + card.minimumPayment, 0);
  
  // Additional real estate payments
  monthlyDebtPayments += assetsAndDebt.additionalRealEstate.reduce((sum, property) => sum + property.monthlyPayment, 0);
  
  // Other liability payments
  monthlyDebtPayments += assetsAndDebt.otherLiabilities.reduce((sum, liability) => sum + liability.monthlyPayment, 0);
  
  return monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
}

export function calculateSavingsRate(data: FoundationFirstData): number {
  const { incomeAndSavings } = data;
  
  if (incomeAndSavings.grossIncome === 0) return 0;
  
  const monthlyIncome = incomeAndSavings.grossIncome / 12;
  const totalMonthlySavings = incomeAndSavings.monthlySavingsRetirement + incomeAndSavings.monthlySavingsOther;
  
  return monthlyIncome > 0 ? (totalMonthlySavings / monthlyIncome) * 100 : 0;
}

export function calculateIncomeReplacementRatio(data: FoundationFirstData): number {
  const { incomeAndSavings, assetsAndDebt } = data;
  
  if (incomeAndSavings.grossIncome === 0) return 0;
  
  // Total retirement savings
  const retirementSavings = assetsAndDebt.retirementAccounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Estimated annual retirement income (using 4% rule)
  const estimatedAnnualRetirementIncome = retirementSavings * 0.04;
  
  return incomeAndSavings.grossIncome > 0 ? (estimatedAnnualRetirementIncome / incomeAndSavings.grossIncome) * 100 : 0;
}

export function calculateFinancialWellnessScore(data: FoundationFirstData): number {
  let score = 0;
  
  // 1. Net Worth (15 points max)
  const netWorth = calculateNetWorth(data);
  if (netWorth > 500000) score += 15;
  else if (netWorth > 250000) score += 12;
  else if (netWorth > 100000) score += 10;
  else if (netWorth > 50000) score += 7;
  else if (netWorth > 0) score += 5;
  
  // 2. Debt-to-Income Ratio (20 points max)
  const dti = calculateDebtToIncomeRatio(data);
  if (dti < 20) score += 20;
  else if (dti < 30) score += 15;
  else if (dti < 40) score += 10;
  else if (dti < 50) score += 5;
  
  // 3. Savings Rate (15 points max)
  const savingsRate = calculateSavingsRate(data);
  if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 15) score += 12;
  else if (savingsRate >= 10) score += 9;
  else if (savingsRate >= 5) score += 6;
  else if (savingsRate > 0) score += 3;
  
  // 4. Emergency Fund (10 points max)
  if (data.incomeAndSavings.separateEmergencyFund) score += 10;
  
  // 5. Budget Frequency (10 points max)
  const budgetScore = {
    'Always': 10,
    'Often': 8,
    'Sometimes': 5,
    'Seldom': 2,
    'Never': 0,
    '': 0
  };
  score += budgetScore[data.incomeAndSavings.budgetFrequency] || 0;
  
  // 6. Insurance Coverage (10 points max)
  const insurance = data.riskManagement.insuranceCoverage;
  const insuranceCount = [
    insurance.healthInsurance,
    insurance.autoInsurance,
    insurance.termLifeInsurance,
    insurance.disabilityInsurance
  ].filter(Boolean).length;
  score += (insuranceCount / 4) * 10;
  
  // 7. Estate Planning (10 points max)
  const estate = data.riskManagement.estatePlanning;
  const estateCount = [
    estate.lastWillAndTestament,
    estate.durablePowerOfAttorney,
    estate.advanceHealthCareDirective
  ].filter(Boolean).length;
  score += (estateCount / 3) * 10;
  
  // 8. Retirement Planning (10 points max)
  const incomeReplacement = calculateIncomeReplacementRatio(data);
  if (incomeReplacement >= 80) score += 10;
  else if (incomeReplacement >= 60) score += 8;
  else if (incomeReplacement >= 40) score += 6;
  else if (incomeReplacement >= 20) score += 4;
  else if (incomeReplacement > 0) score += 2;
  
  return Math.round(score);
}

export function getFinancialWellnessGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_PERSONAL_PROFILE: PersonalProfile = {
  firstName: '',
  lastName: '',
  age: 0,
  gender: '',
  zipCode: '',
  state: '',
  married: false,
  dependentChildren: 0,
  childrenAges: [],
  email: '',
  phone: '',
  profileCompleted: false,
  lastUpdated: new Date().toISOString(),
  createdDate: new Date().toISOString()
};

const DEFAULT_INCOME_AND_SAVINGS: IncomeAndSavings = {
  grossIncome: 0,
  monthlySavingsRetirement: 0,
  monthlySavingsOther: 0,
  budgetFrequency: '',
  separateEmergencyFund: false,
  employerContributionsMaximized: '',
  lastUpdated: new Date().toISOString()
};

const DEFAULT_ASSETS_AND_DEBT: AssetsAndDebt = {
  bankAccounts: [],
  retirementAccounts: [],
  educationAccounts: [],
  otherAccounts: [],
  primaryHome: {
    homeOwnership: '',
    currentHomeValue: 0,
    homeValueWhenBought: 0,
    oweOnMortgage: 0,
    mortgagePayment: 0,
    mortgageInterestRate: 0,
    privateMortgageInsurance: false
  },
  vehicles: [],
  studentLoans: [],
  activeCreditCards: '',
  creditCards: [],
  additionalRealEstate: [],
  otherAssets: [],
  otherLiabilities: [],
  lastUpdated: new Date().toISOString()
};

const DEFAULT_RISK_MANAGEMENT: RiskManagement = {
  creditScoreRange: '',
  estatePlanning: {
    guardianshipNomination: false,
    lastWillAndTestament: false,
    livingTrust: false,
    otherTrust: false,
    durablePowerOfAttorney: false,
    advanceHealthCareDirective: false,
    finalDispositionInstructions: false
  },
  insuranceCoverage: {
    homeownersOrRentalInsurance: false,
    healthInsurance: false,
    autoInsurance: false,
    dentalInsurance: false,
    termLifeInsurance: false,
    permanentLifeInsurance: false,
    identityTheftInsurance: false,
    disabilityInsurance: false,
    umbrellaInsurance: false,
    longTermCareInsurance: false
  },
  yourLifeInsurance: 0,
  healthRating: '',
  smokeRating: '',
  lastUpdated: new Date().toISOString()
};

const DEFAULT_RETIREMENT_OUTLOOK: RetirementOutlook = {
  targetRetirementAge: 65,
  preferredRetirementLifestyle: '',
  lastUpdated: new Date().toISOString()
};

export const DEFAULT_FOUNDATION_FIRST_DATA: FoundationFirstData = {
  personalProfile: DEFAULT_PERSONAL_PROFILE,
  incomeAndSavings: DEFAULT_INCOME_AND_SAVINGS,
  assetsAndDebt: DEFAULT_ASSETS_AND_DEBT,
  riskManagement: DEFAULT_RISK_MANAGEMENT,
  retirementOutlook: DEFAULT_RETIREMENT_OUTLOOK,
  emailPreferences: {
    emailStatus: 'Subscribed'
  },
  security: {
    mfaEnabled: false
  },
  membership: {
    currentPlan: 'Starter',
    accountStatus: 'Active'
  },
  hasAccess: false // Default to no access - can be toggled for testing
};

// ============================================================================
// LOCALSTORAGE FUNCTIONS
// ============================================================================

const STORAGE_KEY = 'foundationFirstData';

export function getFoundationFirstData(): FoundationFirstData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading FoundationFirst data:', error);
  }
  return DEFAULT_FOUNDATION_FIRST_DATA;
}

export function saveFoundationFirstData(data: FoundationFirstData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event for cross-component updates
    window.dispatchEvent(new Event('foundationFirstDataUpdated'));
  } catch (error) {
    console.error('Error saving FoundationFirst data:', error);
  }
}

export function updatePersonalProfile(updates: Partial<PersonalProfile>): void {
  const data = getFoundationFirstData();
  data.personalProfile = {
    ...data.personalProfile,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  saveFoundationFirstData(data);
}

export function updateIncomeAndSavings(updates: Partial<IncomeAndSavings>): void {
  const data = getFoundationFirstData();
  data.incomeAndSavings = {
    ...data.incomeAndSavings,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  saveFoundationFirstData(data);
}

export function updateAssetsAndDebt(updates: Partial<AssetsAndDebt>): void {
  const data = getFoundationFirstData();
  data.assetsAndDebt = {
    ...data.assetsAndDebt,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  saveFoundationFirstData(data);
}

export function updateRiskManagement(updates: Partial<RiskManagement>): void {
  const data = getFoundationFirstData();
  data.riskManagement = {
    ...data.riskManagement,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  saveFoundationFirstData(data);
}

export function updateRetirementOutlook(updates: Partial<RetirementOutlook>): void {
  const data = getFoundationFirstData();
  data.retirementOutlook = {
    ...data.retirementOutlook,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
  saveFoundationFirstData(data);
}

export function toggleFoundationFirstAccess(hasAccess: boolean): void {
  const data = getFoundationFirstData();
  data.hasAccess = hasAccess;
  saveFoundationFirstData(data);
}

// ============================================================================
// TEST DATA FUNCTIONS
// ============================================================================

export function loadFoundationFirstTestData(): void {
  const testData: FoundationFirstData = {
    personalProfile: {
      firstName: 'Kevin',
      lastName: 'Murphy',
      age: 38,
      gender: 'Male',
      zipCode: '75204',
      state: 'TX',
      married: false,
      dependentChildren: 3,
      childrenAges: [12, 11, 10],
      email: 'kevin@myuig.com',
      phone: '(214) 555-0123',
      profileCompleted: true,
      lastUpdated: new Date().toISOString(),
      createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    incomeAndSavings: {
      grossIncome: 50002,
      monthlySavingsRetirement: 0,
      monthlySavingsOther: 0,
      budgetFrequency: 'Seldom',
      separateEmergencyFund: false,
      employerContributionsMaximized: 'Not applicable',
      lastUpdated: new Date().toISOString()
    },
    assetsAndDebt: {
      bankAccounts: [
        {
          id: '1',
          accountType: 'Checking',
          accountName: 'Checking 1',
          balance: 300
        },
        {
          id: '2',
          accountType: 'Savings',
          accountName: 'Savings 1',
          balance: 100
        }
      ],
      retirementAccounts: [],
      educationAccounts: [],
      otherAccounts: [
        {
          id: '1',
          accountType: 'Health Savings Account',
          accountName: 'HSA',
          balance: 0
        },
        {
          id: '2',
          accountType: 'Other Investments',
          accountName: 'Brokerage',
          balance: 0
        }
      ],
      primaryHome: {
        homeOwnership: 'Own with a mortgage',
        currentHomeValue: 450000,
        homeValueWhenBought: 450000,
        oweOnMortgage: 714444,
        mortgagePayment: 3522,
        mortgageInterestRate: 8,
        privateMortgageInsurance: false
      },
      vehicles: [
        {
          id: '1',
          name: 'Car 1',
          ownership: 'Loan',
          currentValue: 0,
          loanBalance: 7800,
          monthlyPayment: 300
        }
      ],
      studentLoans: [],
      activeCreditCards: 'Yes, make payments but leave some balance remaining each month',
      creditCards: [],
      additionalRealEstate: [],
      otherAssets: [],
      otherLiabilities: [],
      lastUpdated: new Date().toISOString()
    },
    riskManagement: {
      creditScoreRange: '670-739',
      estatePlanning: {
        guardianshipNomination: false,
        lastWillAndTestament: false,
        livingTrust: false,
        otherTrust: false,
        durablePowerOfAttorney: false,
        advanceHealthCareDirective: false,
        finalDispositionInstructions: false
      },
      insuranceCoverage: {
        homeownersOrRentalInsurance: true,
        healthInsurance: true,
        autoInsurance: true,
        dentalInsurance: false,
        termLifeInsurance: false,
        permanentLifeInsurance: false,
        identityTheftInsurance: false,
        disabilityInsurance: false,
        umbrellaInsurance: false,
        longTermCareInsurance: false
      },
      yourLifeInsurance: 0,
      healthRating: 'Very unhealthy',
      smokeRating: 'Never smoked',
      lastUpdated: new Date().toISOString()
    },
    retirementOutlook: {
      targetRetirementAge: 75,
      preferredRetirementLifestyle: 'About the same as now',
      lastUpdated: new Date().toISOString()
    },
    emailPreferences: {
      emailStatus: 'Unsubscribed'
    },
    security: {
      mfaEnabled: false
    },
    membership: {
      currentPlan: 'Starter',
      accountStatus: 'Active'
    },
    hasAccess: true // Test data has access enabled
  };
  
  saveFoundationFirstData(testData);
  console.log('✅ FoundationFirst test data loaded successfully');
}

export function clearFoundationFirstData(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('foundationFirstDataUpdated'));
  console.log('✅ FoundationFirst data cleared');
}
