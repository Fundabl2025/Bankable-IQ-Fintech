import { createBrowserRouter, Navigate, redirect } from 'react-router';
import { RootLayout } from './layout/RootLayout';
import { Dashboard } from './pages/Dashboard';
import { Dashboard as FoundationFirstDashboard } from './pages/FoundationFirst/Dashboard';
import { IntegrateReports } from './pages/IntegrateReports';
import { StatusReports } from './pages/StatusReports';
import { BankableStatus } from './pages/StatusReports/BankableStatus';
import { BusinessFICO } from './pages/StatusReports/BusinessFICO';
import { EstimatedFunding } from './pages/StatusReports/EstimatedFunding';
import { OwnersCredit } from './pages/StatusReports/OwnersCredit';
import { AccessFunding as AccessFundingPage } from './pages/AccessFundingMain';
import { BusinessCreditCards } from './pages/AccessFunding/BusinessCreditCards';
import { BusinessCreditLine } from './pages/AccessFunding/BusinessCreditLine';
import { BusinessTermLoan } from './pages/AccessFunding/BusinessTermLoan';
import { CreditUnionLoans } from './pages/AccessFunding/CreditUnionLoans';
import { EquipmentFinancing } from './pages/AccessFunding/EquipmentFinancing';
import { MerchantAdvance } from './pages/AccessFunding/MerchantAdvance';
import { PersonalCreditCards } from './pages/AccessFunding/PersonalCreditCards';
import { ReceivableFactoring } from './pages/AccessFunding/ReceivableFactoring';
import { RevenueBasedLoan } from './pages/AccessFunding/RevenueBasedLoan';
import { WorkingCapitalLoans } from './pages/AccessFunding/WorkingCapitalLoans';
import { SBABusinessLoan } from './pages/AccessFunding/SBABusinessLoan';
import { AccountsReceivableFinance } from './pages/AccessFunding/AccountsReceivableFinance';
import { PurchaseOrderFinance } from './pages/AccessFunding/PurchaseOrderFinance';
import { InventoryLineOfCredit } from './pages/AccessFunding/InventoryLineOfCredit';
import { BridgeLoans } from './pages/AccessFunding/BridgeLoans';
import { DSCRLoans } from './pages/AccessFunding/DSCRLoans';
import { ConstructionLoans } from './pages/AccessFunding/ConstructionLoans';
import { RedirectToAccountsReceivableFinance } from './pages/RedirectToAccountsReceivableFinance';
import { DocumentCollection } from './pages/DocumentCollection';
import { LenderCompliance } from './pages/LenderCompliance';
import {
  BusinessLocation,
  Phones411,
  WebsiteEmail,
  EINLicenses,
  BusinessBanking,
  AgenciesNAICS,
  BusinessPlan,
  AssetsUCC,
  CorpOnlyFacts,
  BankRating,
  ComparableCredit,
  CDBusinessLoan
} from './pages/LenderCompliance/index';
import { EntityFilings } from './pages/LenderCompliance/EntityFilings';
import { BuildingCredit } from './pages/BuildingCredit';
import { OptimizeReporting } from './pages/OptimizeReporting';
import { OnlineAnalysis } from './pages/OnlineAnalysis';
import { OrganizeFinancials } from './pages/OrganizeFinancials';
import { GenericPage } from './pages/GenericPage';
// OLD BSS IMPORTS - Keep for backward compatibility temporarily
import { Step1 } from './pages/BusinessSuccessScan/Step1';
import { Step2 } from './pages/BusinessSuccessScan/Step2';
import { Step3 } from './pages/BusinessSuccessScan/Step3';
import { TransitionScreen } from './pages/BusinessSuccessScan/TransitionScreen';
import { IntegratedAssessment } from './pages/BusinessSuccessScan/IntegratedAssessment';
import { Results as OldResults } from './pages/BusinessSuccessScan/Results_NEW';
// NEW UNIFIED ASSESSMENT
import UnifiedAssessment from './pages/business-assessment/UnifiedAssessment';
import { Results as UnifiedResults } from './pages/business-assessment/Results';
import { MyBusinessProfile } from './pages/MyBusinessProfile';
import { Settings } from './pages/Settings';
import { TemplatesAndResources } from './pages/TemplatesAndResources';
import { ResourceDetail } from './pages/ResourceDetail';
import { CapitalAccessMap } from './pages/CapitalAccessMap';
// FundScoreAssessment deprecated - redirects to Unified Assessment
import {
  FolderOpen,
  Shield,
  TrendingUp,
  LineChart,
  CreditCard,
  Briefcase,
  Building,
  GraduationCap,
  HelpCircle,
  User,
  DollarSign
} from 'lucide-react';

export const router = createBrowserRouter([
  {
    path: 'fundscore-assessment',
    element: <Navigate to="/business-assessment" replace />,
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'capital-dashboard',
        Component: Dashboard,
      },
      {
        path: 'business-success-scan',
        element: <Navigate to="/business-assessment" replace />,
      },
      {
        path: 'business-success-scan/step-1',
        element: <Navigate to="/business-assessment" replace />,
      },
      {
        path: 'business-success-scan/step-2',
        element: <Navigate to="/business-assessment" replace />,
      },
      {
        path: 'business-success-scan/step-3',
        element: <Navigate to="/business-assessment" replace />,
      },
      {
        path: 'business-success-scan/fundscore',
        element: <Navigate to="/business-assessment" replace />,
      },
      {
        path: 'business-success-scan/assessment',
        element: <Navigate to="/business-assessment" replace />,
      },
      {
        path: 'business-success-scan/results',
        element: <Navigate to="/business-assessment/results" replace />,
      },
      {
        path: 'business-assessment',
        Component: UnifiedAssessment,
      },
      {
        path: 'business-assessment/results',
        Component: UnifiedResults,
      },
      {
        path: 'integrate-reports',
        Component: IntegrateReports,
      },
      {
        path: 'settings',
        Component: Settings,
      },
      {
        path: 'settings/my-business-profile',
        Component: MyBusinessProfile,
      },
      {
        path: 'my-business-profile',
        element: <Navigate to="/settings/my-business-profile" replace />,
      },
      {
        path: 'status-reports',
        Component: StatusReports,
      },
      {
        path: 'status-reports/bankable-status',
        Component: BankableStatus,
      },
      {
        path: 'status-reports/business-fico',
        Component: BusinessFICO,
      },
      {
        path: 'status-reports/estimated-funding',
        Component: EstimatedFunding,
      },
      {
        path: 'status-reports/owners-credit',
        Component: OwnersCredit,
      },
      {
        path: 'access-funding',
        Component: AccessFundingPage,
        children: [
          {
            path: 'business-credit-cards',
            Component: BusinessCreditCards,
          },
          {
            path: 'business-credit-line',
            Component: BusinessCreditLine,
          },
          {
            path: 'business-term-loan',
            Component: BusinessTermLoan,
          },
          {
            path: 'credit-union-loans',
            Component: CreditUnionLoans,
          },
          {
            path: 'equipment-financing',
            Component: EquipmentFinancing,
          },
          {
            path: 'merchant-advance',
            Component: MerchantAdvance,
          },
          {
            path: 'personal-credit-cards',
            Component: PersonalCreditCards,
          },
          {
            path: 'receivable-factoring',
            Component: ReceivableFactoring,
          },
          {
            path: 'revenue-based-loan',
            Component: RevenueBasedLoan,
          },
          {
            path: 'working-capital-loans',
            Component: WorkingCapitalLoans,
          },
          {
            path: 'sba-business-loan',
            Component: SBABusinessLoan,
          },
          {
            path: 'accounts-receivable-finance',
            Component: AccountsReceivableFinance,
          },
          {
            path: 'startup-equipment',
            element: <Navigate to="/access-funding/accounts-receivable-finance" replace />,
          },
          {
            path: 'truck-utility-vehicles',
            element: <Navigate to="/access-funding/purchase-order-finance" replace />,
          },
          {
            path: 'purchase-order-finance',
            Component: PurchaseOrderFinance,
          },
          {
            path: 'inventory-line-of-credit',
            Component: InventoryLineOfCredit,
          },
          {
            path: 'bridge-loans',
            Component: BridgeLoans,
          },
          {
            path: 'dscr-loans',
            Component: DSCRLoans,
          },
          {
            path: 'construction-loans',
            Component: ConstructionLoans,
          },
        ],
      },
      {
        path: 'document-collection',
        Component: DocumentCollection,
      },
      {
        path: 'lender-compliance',
        Component: LenderCompliance,
      },
      {
        path: 'capital-access-map',
        Component: CapitalAccessMap,
      },
      {
        path: 'lender-compliance/entity-filings',
        Component: EntityFilings,
      },
      {
        path: 'lender-compliance/entity-filings-user-friendly',
        Component: EntityFilings,
      },
      {
        path: 'lender-compliance/business-location',
        Component: BusinessLocation,
      },
      {
        path: 'lender-compliance/phones-411',
        Component: Phones411,
      },
      {
        path: 'lender-compliance/website-email',
        Component: WebsiteEmail,
      },
      {
        path: 'lender-compliance/ein-licenses',
        Component: EINLicenses,
      },
      {
        path: 'lender-compliance/business-banking',
        Component: BusinessBanking,
      },
      {
        path: 'lender-compliance/agencies-naics',
        Component: AgenciesNAICS,
      },
      {
        path: 'lender-compliance/business-plan',
        Component: BusinessPlan,
      },
      {
        path: 'lender-compliance/assets-ucc',
        Component: AssetsUCC,
      },
      {
        path: 'lender-compliance/corp-only-facts',
        Component: CorpOnlyFacts,
      },
      {
        path: 'lender-compliance/bank-rating',
        Component: BankRating,
      },
      {
        path: 'lender-compliance/comparable-credit',
        Component: ComparableCredit,
      },
      {
        path: 'lender-compliance/cd-business-loan',
        Component: CDBusinessLoan,
      },
      {
        path: 'optimize-reporting',
        Component: OptimizeReporting,
      },
      {
        path: 'online-analysis',
        Component: OnlineAnalysis,
      },
      {
        path: 'building-credit',
        Component: BuildingCredit,
      },
      {
        path: 'organize-financials',
        Component: OrganizeFinancials,
      },
      {
        path: 'become-bankable',
        element: (
          <GenericPage
            title="Become Bankable"
            description="Goal is to ensure larger loans at lower rates and longer terms."
            icon={Building}
          />
        ),
      },
      {
        path: 'bankable-roadmap',
        element: <Navigate to="/lender-compliance" replace />,
      },
      {
        path: 'business-education',
        element: (
          <GenericPage
            title="Business Education"
            description="Learn essential business finance concepts and best practices."
            icon={GraduationCap}
          />
        ),
      },
      {
        path: 'help-desk',
        element: (
          <GenericPage
            title="Help Desk"
            description="Get support and answers to your questions about the system."
            icon={HelpCircle}
          />
        ),
      },
      {
        path: 'templates-resources',
        Component: TemplatesAndResources,
      },
      {
        path: 'templates-resources/:id',
        Component: ResourceDetail,
      },
      {
        path: 'foundation-first',
        element: <Navigate to="/foundation-first/dashboard" replace />,
      },
      {
        path: 'foundation-first/dashboard',
        Component: FoundationFirstDashboard,
      },
      {
        path: 'foundation-first/financial-profile',
        element: (
          <GenericPage
            title="Financial Profile"
            description="Manage your personal financial information and track your progress."
            icon={User}
          />
        ),
      },
      {
        path: 'foundation-first/income-savings',
        element: (
          <GenericPage
            title="Income & Savings"
            description="Track your income sources and savings goals."
            icon={DollarSign}
          />
        ),
      },
      {
        path: 'foundation-first/assets-debt',
        element: (
          <GenericPage
            title="Assets & Debt"
            description="Manage your assets and liabilities for a complete financial picture."
            icon={Building}
          />
        ),
      },
      {
        path: 'foundation-first/risk-management',
        element: (
          <GenericPage
            title="Risk Management"
            description="Protect your financial future with proper insurance and estate planning."
            icon={Shield}
          />
        ),
      },
      {
        path: 'foundation-first/retirement-planning',
        element: (
          <GenericPage
            title="Retirement Planning"
            description="Plan for a secure retirement with personalized strategies."
            icon={TrendingUp}
          />
        ),
      },
      {
        path: 'foundation-first/settings',
        element: (
          <GenericPage
            title="Settings"
            description="Manage your account settings and preferences."
            icon={HelpCircle}
          />
        ),
      },
    ],
  },
]);