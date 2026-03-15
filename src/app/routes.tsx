import { createBrowserRouter, Navigate, redirect, Suspense } from 'react-router';
import { lazy } from 'react';
import { RootLayout } from './layout/RootLayout';

// Lazy load all page components to reduce initial bundle and Vite scan time
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const FoundationFirstDashboard = lazy(() => import('./pages/FoundationFirst/Dashboard').then(m => ({ default: m.Dashboard })));
const IntegrateReports = lazy(() => import('./pages/IntegrateReports').then(m => ({ default: m.IntegrateReports })));
const StatusReports = lazy(() => import('./pages/StatusReports').then(m => ({ default: m.StatusReports })));
const BankableStatus = lazy(() => import('./pages/StatusReports/BankableStatus').then(m => ({ default: m.BankableStatus })));
const BusinessFICO = lazy(() => import('./pages/StatusReports/BusinessFICO').then(m => ({ default: m.BusinessFICO })));
const EstimatedFunding = lazy(() => import('./pages/StatusReports/EstimatedFunding').then(m => ({ default: m.EstimatedFunding })));
const OwnersCredit = lazy(() => import('./pages/StatusReports/OwnersCredit').then(m => ({ default: m.OwnersCredit })));
const AccessFundingPage = lazy(() => import('./pages/AccessFundingMain').then(m => ({ default: m.AccessFunding })));
const BusinessCreditCards = lazy(() => import('./pages/AccessFunding/BusinessCreditCards').then(m => ({ default: m.BusinessCreditCards })));
const BusinessCreditLine = lazy(() => import('./pages/AccessFunding/BusinessCreditLine').then(m => ({ default: m.BusinessCreditLine })));
const BusinessTermLoan = lazy(() => import('./pages/AccessFunding/BusinessTermLoan').then(m => ({ default: m.BusinessTermLoan })));
const CreditUnionLoans = lazy(() => import('./pages/AccessFunding/CreditUnionLoans').then(m => ({ default: m.CreditUnionLoans })));
const EquipmentFinancing = lazy(() => import('./pages/AccessFunding/EquipmentFinancing').then(m => ({ default: m.EquipmentFinancing })));
const MerchantAdvance = lazy(() => import('./pages/AccessFunding/MerchantAdvance').then(m => ({ default: m.MerchantAdvance })));
const PersonalCreditCards = lazy(() => import('./pages/AccessFunding/PersonalCreditCards').then(m => ({ default: m.PersonalCreditCards })));
const ReceivableFactoring = lazy(() => import('./pages/AccessFunding/ReceivableFactoring').then(m => ({ default: m.ReceivableFactoring })));
const RevenueBasedLoan = lazy(() => import('./pages/AccessFunding/RevenueBasedLoan').then(m => ({ default: m.RevenueBasedLoan })));
const WorkingCapitalLoans = lazy(() => import('./pages/AccessFunding/WorkingCapitalLoans').then(m => ({ default: m.WorkingCapitalLoans })));
const SBABusinessLoan = lazy(() => import('./pages/AccessFunding/SBABusinessLoan').then(m => ({ default: m.SBABusinessLoan })));
const AccountsReceivableFinance = lazy(() => import('./pages/AccessFunding/AccountsReceivableFinance').then(m => ({ default: m.AccountsReceivableFinance })));
const PurchaseOrderFinance = lazy(() => import('./pages/AccessFunding/PurchaseOrderFinance').then(m => ({ default: m.PurchaseOrderFinance })));
const InventoryLineOfCredit = lazy(() => import('./pages/AccessFunding/InventoryLineOfCredit').then(m => ({ default: m.InventoryLineOfCredit })));
const BridgeLoans = lazy(() => import('./pages/AccessFunding/BridgeLoans').then(m => ({ default: m.BridgeLoans })));
const DSCRLoans = lazy(() => import('./pages/AccessFunding/DSCRLoans').then(m => ({ default: m.DSCRLoans })));
const ConstructionLoans = lazy(() => import('./pages/AccessFunding/ConstructionLoans').then(m => ({ default: m.ConstructionLoans })));
const DocumentCollection = lazy(() => import('./pages/DocumentCollection').then(m => ({ default: m.DocumentCollection })));
const LenderCompliance = lazy(() => import('./pages/LenderCompliance').then(m => ({ default: m.LenderCompliance })));
const BuildingCredit = lazy(() => import('./pages/BuildingCredit').then(m => ({ default: m.BuildingCredit })));
const OptimizeReporting = lazy(() => import('./pages/OptimizeReporting').then(m => ({ default: m.OptimizeReporting })));
const OnlineAnalysis = lazy(() => import('./pages/OnlineAnalysis').then(m => ({ default: m.OnlineAnalysis })));
const OrganizeFinancials = lazy(() => import('./pages/OrganizeFinancials').then(m => ({ default: m.OrganizeFinancials })));
const GenericPage = lazy(() => import('./pages/GenericPage').then(m => ({ default: m.GenericPage })));
const Step1 = lazy(() => import('./pages/BusinessSuccessScan/Step1').then(m => ({ default: m.Step1 })));
const Step2 = lazy(() => import('./pages/BusinessSuccessScan/Step2').then(m => ({ default: m.Step2 })));
const Step3 = lazy(() => import('./pages/BusinessSuccessScan/Step3').then(m => ({ default: m.Step3 })));
const TransitionScreen = lazy(() => import('./pages/BusinessSuccessScan/TransitionScreen').then(m => ({ default: m.TransitionScreen })));
const IntegratedAssessment = lazy(() => import('./pages/BusinessSuccessScan/IntegratedAssessment').then(m => ({ default: m.IntegratedAssessment })));
const OldResults = lazy(() => import('./pages/BusinessSuccessScan/Results_NEW').then(m => ({ default: m.Results })));
const UnifiedAssessment = lazy(() => import('./pages/business-assessment/UnifiedAssessment').then(m => ({ default: m.default })));
const UnifiedResults = lazy(() => import('./pages/business-assessment/Results').then(m => ({ default: m.Results })));
const MyBusinessProfile = lazy(() => import('./pages/MyBusinessProfile').then(m => ({ default: m.MyBusinessProfile })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const TemplatesAndResources = lazy(() => import('./pages/TemplatesAndResources').then(m => ({ default: m.TemplatesAndResources })));
const ResourceDetail = lazy(() => import('./pages/ResourceDetail').then(m => ({ default: m.ResourceDetail })));
const CapitalAccessMap = lazy(() => import('./pages/CapitalAccessMap').then(m => ({ default: m.CapitalAccessMap })));
const RedirectToAccountsReceivableFinance = lazy(() => import('./pages/RedirectToAccountsReceivableFinance').then(m => ({ default: m.RedirectToAccountsReceivableFinance })));
const EntityFilings = lazy(() => import('./pages/LenderCompliance/EntityFilings').then(m => ({ default: m.EntityFilings })));

// Loading fallback component
const LoadingFallback = () => <div>Loading...</div>;


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
