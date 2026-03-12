import { Link, useLocation, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  DollarSign,
  FolderOpen,
  Shield,
  TrendingUp,
  LineChart,
  CreditCard,
  Briefcase,
  Building,
  GraduationCap,
  HelpCircle,
  ClipboardCheck,
  ChevronDown,
  ChevronRight,
  Zap,
  User,
  BookOpen,
  Lock,
  Heart,
  Wallet,
  Home,
  ShieldCheck,
  Target,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getPreQualifiedPrograms, isProgramPathPreQualified } from '../utils/fundingEligibility';
import { getFoundationFirstData } from '../utils/foundationFirstData';

// Business Success module items
const businessMenuItems = [
  { path: '/business-success-scan/step-1', label: 'Business Success Scan', icon: ClipboardCheck, badge: 'Start' },
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { 
    path: '/access-funding', 
    label: 'Access Funding', 
    icon: DollarSign, 
    showPreQualifiedBadge: true,
    subItems: [
      { path: '/access-funding/business-credit-cards', label: 'Syndicated Line of Credit (SLOC)' },
      { path: '/access-funding/business-credit-line', label: 'Business Credit Line' },
      { path: '/access-funding/business-term-loan', label: 'Business Term Loan' },
      { path: '/access-funding/credit-union-loans', label: 'Credit Union Loans' },
      { path: '/access-funding/equipment-financing', label: 'Equipment Financing' },
      { path: '/access-funding/merchant-advance', label: 'Merchant Advance' },
      { path: '/access-funding/personal-credit-cards', label: 'Personal Credit Cards' },
      { path: '/access-funding/receivable-factoring', label: 'Receivable Factoring' },
      { path: '/access-funding/revenue-based-loan', label: 'Revenue Based Loan' },
      { path: '/access-funding/working-capital-loans', label: 'Working Capital Loans' },
      { path: '/access-funding/sba-business-loan', label: 'SBA Loans: 7a & 504' },
      { path: '/access-funding/accounts-receivable-finance', label: 'Accounts Receivable Finance' },
      { path: '/access-funding/inventory-line-of-credit', label: 'Inventory Line of Credit' },
      { path: '/access-funding/purchase-order-finance', label: 'Purchase Order Finance' },
      { path: '/access-funding/bridge-loans', label: 'Bridge Loans' },
      { path: '/access-funding/dscr-loans', label: 'DSCR Loans' },
      { path: '/access-funding/construction-loans', label: 'Construction Loans' },
    ]
  },
  { path: '/integrate-reports', label: 'Integrate Reports', icon: FileText },
  { 
    path: '/status-reports', 
    label: 'Status Reports', 
    icon: BarChart3,
    subItems: [
      { path: '/status-reports/bankable-status', label: 'Bankable Status' },
      { path: '/status-reports/business-fico', label: 'Business FICO' },
      { path: '/status-reports/estimated-funding', label: 'Estimated Funding' },
      { path: '/status-reports/owners-credit', label: 'Owners Credit' },
    ]
  },
  { path: '/document-collection', label: 'Document Collection', icon: FolderOpen },
  { path: '/lender-compliance', label: 'Lender Compliance', icon: Shield },
  { path: '/capital-access-map', label: 'Capital Access Map', icon: Target },
  { path: '/optimize-reporting', label: 'Optimize Reporting', icon: TrendingUp },
  { path: '/online-analysis', label: 'Online Analysis', icon: LineChart },
  { path: '/building-credit', label: 'Building Credit', icon: CreditCard },
  { path: '/organize-financials', label: 'Organize Financials', icon: Briefcase },
  { path: '/become-bankable', label: 'Become Bankable', icon: Building },
  { path: '/templates-resources', label: 'Templates & Resources', icon: BookOpen },
  { path: '/business-education', label: 'Business Education', icon: GraduationCap },
  { path: '/help-desk', label: 'Help Desk', icon: HelpCircle },
  { path: '/settings', label: 'Settings', icon: Settings }
];

// FoundationFirst module items
const foundationFirstMenuItems = [
  { path: '/foundation-first/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/foundation-first/financial-profile', label: 'Financial Profile', icon: User },
  { path: '/foundation-first/income-savings', label: 'Income & Savings', icon: Wallet },
  { path: '/foundation-first/assets-debt', label: 'Assets & Debt', icon: Home },
  { path: '/foundation-first/risk-management', label: 'Risk Management', icon: ShieldCheck },
  { path: '/foundation-first/retirement-planning', label: 'Retirement Planning', icon: Target },
  { path: '/foundation-first/settings', label: 'Settings', icon: Settings }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState<string | null>(() => {
    if (location.pathname.startsWith('/status-reports')) return '/status-reports';
    if (location.pathname.startsWith('/access-funding')) return '/access-funding';
    return null;
  });
  const [businessModuleExpanded, setBusinessModuleExpanded] = useState(true);
  const [foundationFirstModuleExpanded, setFoundationFirstModuleExpanded] = useState(false);
  const [preQualifiedCount, setPreQualifiedCount] = useState(0);
  const [hasFoundationFirstAccess, setHasFoundationFirstAccess] = useState(false);

  useEffect(() => {
    // Update pre-qualified count and module access
    const updateData = () => {
      const preQualified = getPreQualifiedPrograms();
      setPreQualifiedCount(preQualified.length);
      
      const foundationData = getFoundationFirstData();
      setHasFoundationFirstAccess(foundationData.hasAccess);
    };

    updateData();

    // Listen for storage changes
    window.addEventListener('storage', updateData);
    window.addEventListener('scanDataUpdated', updateData);
    window.addEventListener('foundationFirstDataUpdated', updateData);

    return () => {
      window.removeEventListener('storage', updateData);
      window.removeEventListener('scanDataUpdated', updateData);
      window.removeEventListener('foundationFirstDataUpdated', updateData);
    };
  }, [location.pathname]);

  // Auto-expand modules based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/foundation-first')) {
      setFoundationFirstModuleExpanded(true);
      setBusinessModuleExpanded(false);
    } else {
      setBusinessModuleExpanded(true);
      setFoundationFirstModuleExpanded(false);
    }
  }, [location.pathname]);

  const toggleExpanded = (path: string) => {
    setExpandedItem(expandedItem === path ? null : path);
  };

  return (
    <div 
      className="min-h-screen shadow-xl relative flex flex-col"
      style={{ 
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        color: 'var(--sidebar-text)'
      }}
    >
      {/* Logo/Brand Section */}
      <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
        <div className="flex items-center gap-2 mb-2">
          <div>
            <h1 
              className="text-[20px] tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}
            >
              <span style={{ color: 'var(--foreground)' }}>FUND</span>
              <span style={{ color: 'var(--primary)' }}>READY</span>
            </h1>
            <p 
              className="text-[9px] uppercase tracking-[0.2em] mt-1"
              style={{ 
                fontFamily: 'var(--font-body)', 
                fontWeight: 400,
                color: 'var(--muted-foreground)'
              }}
            >
              Funding Platform
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto flex-1">
        {/* Business Success Module */}
        <div className="mb-4">
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setBusinessModuleExpanded(!businessModuleExpanded)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200"
            style={{
              backgroundColor: businessModuleExpanded ? 'var(--sidebar-accent-hover)' : 'transparent',
              color: businessModuleExpanded ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
              borderLeft: businessModuleExpanded ? '2px solid var(--primary)' : '2px solid transparent',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 400
            }}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left">Business Success</span>
            <motion.div
              animate={{ rotate: businessModuleExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {businessModuleExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-4 mt-1 space-y-1 pl-4" style={{ borderLeft: '1px solid var(--border)' }}>
                  {businessMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.path === '/settings' 
                      ? location.pathname.startsWith('/settings')
                      : location.pathname === item.path;
                    const isExpanded = expandedItem === item.path;
                    const hasSubItems = item.subItems && item.subItems.length > 0;
                    const isSubItemActive = hasSubItems && item.subItems.some(sub => location.pathname === sub.path);
                    
                    return (
                      <div key={item.path}>
                        {hasSubItems ? (
                          <>
                            <motion.button
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleExpanded(item.path)}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200"
                              style={{
                                backgroundColor: (isActive || isSubItemActive || isExpanded) ? 'var(--sidebar-accent-hover)' : 'transparent',
                                color: (isActive || isSubItemActive || isExpanded) ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                                borderLeft: (isActive || isSubItemActive || isExpanded) ? '2px solid var(--primary)' : '2px solid transparent',
                                fontFamily: 'var(--font-body)',
                                fontSize: '13px',
                                fontWeight: 400
                              }}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.showPreQualifiedBadge && preQualifiedCount > 0 && (
                                <span 
                                  className="px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-[0.15em]"
                                  style={{
                                    backgroundColor: 'var(--primary-bg)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--primary-border)',
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 400
                                  }}
                                >
                                  {preQualifiedCount}
                                </span>
                              )}
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </motion.div>
                            </motion.button>
                            
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="ml-4 mt-1 space-y-1 pl-4" style={{ borderLeft: '1px solid var(--border)' }}>
                                    {item.subItems.map((subItem) => {
                                      const isSubActive = location.pathname === subItem.path;
                                      const isPreQualified = isProgramPathPreQualified(subItem.path);
                                      return (
                                        <motion.div
                                          key={subItem.path}
                                          whileHover={{ x: 4 }}
                                        >
                                          <Link
                                            to={subItem.path}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-sm transition-all duration-200 text-sm"
                                            style={{
                                              backgroundColor: isSubActive ? 'var(--primary-bg)' : 'transparent',
                                              color: isSubActive ? 'var(--primary)' : 'var(--sidebar-text)',
                                              borderLeft: isSubActive ? '2px solid var(--primary)' : '2px solid transparent',
                                              fontFamily: 'var(--font-body)',
                                              fontSize: '13px',
                                              fontWeight: 400
                                            }}
                                          >
                                            {isPreQualified ? (
                                              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
                                            ) : (
                                              <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--destructive)' }} />
                                            )}
                                            <span className="flex-1">{subItem.label}</span>
                                          </Link>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <motion.div
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              to={item.path}
                              className="flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 relative"
                              style={{
                                backgroundColor: isActive ? 'var(--sidebar-accent-hover)' : 'transparent',
                                color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                                borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                                fontFamily: 'var(--font-body)',
                                fontSize: '13px',
                                fontWeight: 400
                              }}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              <span>{item.label}</span>
                              {item.badge && (
                                <span 
                                  className="ml-auto px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-[0.15em]"
                                  style={{
                                    backgroundColor: 'var(--primary-bg)',
                                    color: 'var(--primary)',
                                    border: '1px solid var(--primary-border)',
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 400
                                  }}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FoundationFirst Module */}
        {hasFoundationFirstAccess && (
          <div>
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setFoundationFirstModuleExpanded(!foundationFirstModuleExpanded);
                if (!foundationFirstModuleExpanded || !location.pathname.startsWith('/foundation-first')) {
                  navigate('/foundation-first/dashboard');
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200"
              style={{
                backgroundColor: foundationFirstModuleExpanded ? 'var(--sidebar-accent-hover)' : 'transparent',
                color: foundationFirstModuleExpanded ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                borderLeft: foundationFirstModuleExpanded ? '2px solid var(--primary)' : '2px solid transparent',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400
              }}
            >
              <Heart className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">FoundationFirst</span>
              <motion.div
                animate={{ rotate: foundationFirstModuleExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {foundationFirstModuleExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="ml-4 mt-1 space-y-1 pl-4" style={{ borderLeft: '1px solid var(--border)' }}>
                    {foundationFirstMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <motion.div
                          key={item.path}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Link
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 relative"
                            style={{
                              backgroundColor: isActive ? 'var(--sidebar-accent-hover)' : 'transparent',
                              color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                              borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              fontWeight: 400
                            }}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* FoundationFirst Module - Locked State */}
        {!hasFoundationFirstAccess && (
          <div>
            <motion.div
              whileHover={{ x: 4 }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 cursor-not-allowed opacity-60"
              style={{
                color: 'var(--muted-foreground)',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400
              }}
            >
              <Heart className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">FoundationFirst</span>
              <div className="flex items-center gap-2">
                <span 
                  className="px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-[0.15em]"
                  style={{
                    backgroundColor: 'var(--warning-bg)',
                    color: 'var(--warning)',
                    border: '1px solid var(--warning-border)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400
                  }}
                >
                  Upgrade
                </span>
                <Lock className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        )}
      </nav>

      {/* User Profile Section */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4 border-t"
        style={{ 
          borderColor: 'var(--sidebar-border)',
          backgroundColor: 'var(--sidebar-bg)'
        }}
      >
        <div 
          className="flex items-center gap-3 p-3 rounded-sm hover:bg-[var(--sidebar-accent)] transition-colors cursor-pointer"
        >
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
            style={{ 
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700
            }}
          >
            JD
          </div>
          <div className="flex-1">
            <p 
              className="text-sm font-semibold"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--sidebar-text-active)'
              }}
            >
              John Doe
            </p>
            <p 
              className="text-xs"
              style={{ 
                fontFamily: 'var(--font-body)',
                color: 'var(--muted-foreground)'
              }}
            >
              john@business.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
