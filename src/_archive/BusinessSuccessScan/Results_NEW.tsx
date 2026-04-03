import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle, XCircle, AlertCircle, Info, TrendingUp, Lock, Eye, EyeOff, ArrowRight, HelpCircle } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { motion, useSpring, useTransform } from 'motion/react';
import { syncScanDataToAuditItems, updateBusinessProfile, calculateFicoSBSS } from '../../utils/businessData';
import { checkAllProgramsEligibilityPhase1, getEligibilitySummary } from '../../utils/phase1EligibilityChecker';
import type { ScanData, EligibilityResult } from '../../utils/fundingRequirements';
import { getProgramRoute } from '../../utils/fundingEligibility';
import { computeScore, getBand } from '../fundscore-assessment/engine';
import { QUESTIONS } from '../fundscore-assessment/questions';

/**
 * ========================================
 * BUSINESS SUCCESS SCAN RESULTS - PHASE 1
 * ========================================
 * 
 * Displays personalized pre-qualification results with 3-tier system:
 * 1. PRE-QUALIFIED - High confidence, ready to apply
 * 2. LIKELY QUALIFIED - Needs verification of some details
 * 3. NOT PRE-QUALIFIED - Requirements not met, roadmap provided
 * 4. NOT APPLICABLE - Hidden by default, irrelevant programs
 */

// Program details lookup (amounts, descriptions)
const programDetails: Record<string, { amount: string; description: string }> = {
  'business-credit-cards': {
    amount: '$25K-$150K',
    description: 'Multiple credit cards per owner, 0% interest periods, builds business credit'
  },
  'personal-credit-cards': {
    amount: 'Varies by approval',
    description: 'Personal credit cards for business use, additional capital source'
  },
  'business-credit-line': {
    amount: 'Up to $750K',
    description: 'Revolving credit line, cash flow based approvals, same-day funding available'
  },
  'business-term-loan': {
    amount: 'Up to $10M',
    description: '1-2 year terms, no prepayment penalty, refinance options'
  },
  'working-capital-loans': {
    amount: 'Up to $10M',
    description: 'Cash flow based approvals, same-day funding, flexible payment options'
  },
  'merchant-advance': {
    amount: 'Up to $500K',
    description: 'Fast approvals, funding in 24-48 hours, no credit check required'
  },
  'revenue-based-loan': {
    amount: '10% of annual revenue',
    description: 'Revenue-based repayment, 48-72 hour approval, flexible terms'
  },
  'receivable-factoring': {
    amount: 'Up to 90% of invoices',
    description: 'Immediate cash based on customer credit, frees working capital'
  },
  'equipment-financing': {
    amount: 'Up to 100% of equipment',
    description: 'Low down payment, fast approval, builds business credit'
  },
  'credit-union-loans': {
    amount: '$5K-$75K',
    description: 'Signature loans, lower credit requirements, member benefits'
  },
  'sba-business-loan': {
    amount: 'Up to $5M',
    description: 'Low interest rates, generous terms, government backed, no prepayment penalty'
  },
  'accounts-receivable-finance': {
    amount: 'Up to 95% of AR',
    description: 'Revolving credit secured by receivables, $100K to $100M facility size'
  },
  'inventory-line-of-credit': {
    amount: 'Up to 85% of inventory',
    description: 'Revolving credit secured by inventory, based on liquidation value'
  },
  'purchase-order-finance': {
    amount: '$100K to $10M+',
    description: 'Short-term funding for verified purchase orders, 7-14 day funding'
  },
  'bridge-loans': {
    amount: '$100K to $3M',
    description: 'Short-term property financing, 3-5 days to close, interest-only payments'
  },
  'dscr-loans': {
    amount: '$100K to $1.5M',
    description: 'Rental property financing, DSCR-based underwriting, 2-50 property portfolios'
  },
  'construction-loans': {
    amount: '$200K to $2.5M',
    description: 'Short-term construction financing, 12-24 month terms, interest-only'
  },
};

// Program Card Component
interface ProgramCardProps {
  program: EligibilityResult;
  showDetails?: boolean;
}

function ProgramCard({ program, showDetails = false }: ProgramCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const details = programDetails[program.programId] || { amount: 'Varies', description: '' };
  
  // Color schemes by status
  const statusConfig = {
    'pre-qual': {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      icon: CheckCircle,
      badgeVariant: 'success' as const,
      badgeText: 'Pre-Qualified',
    },
    'likely-qual': {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      icon: AlertCircle,
      badgeVariant: 'warning' as const,
      badgeText: 'Likely Qualified',
    },
    'not-pre-qual': {
      bg: 'bg-slate-50',
      border: 'border-slate-300',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      icon: Lock,
      badgeVariant: 'secondary' as const,
      badgeText: 'Not Pre-Qualified',
    },
    'not-applicable': {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-500',
      icon: Info,
      badgeVariant: 'secondary' as const,
      badgeText: 'Not Applicable',
    },
  };
  
  const config = statusConfig[program.status];
  const Icon = config.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bg} ${config.border} border-2 rounded-xl p-5 transition-all hover:shadow-md`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`${config.iconBg} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{program.programName}</h3>
              <p className="text-sm font-semibold text-emerald-700 mt-0.5">{details.amount}</p>
            </div>
            
            {/* Status Badge */}
            <Badge variant={config.badgeVariant} className="whitespace-nowrap">
              {config.badgeText}
            </Badge>
          </div>
          
          {/* Program Description */}
          <p className="text-sm text-gray-700 mb-3">{details.description}</p>
          
          {/* Reasoning */}
          <div className={`p-3 rounded-lg border ${
            program.status === 'pre-qual' ? 'bg-blue-50 border-blue-200' :
            program.status === 'likely-qual' ? 'bg-white border-amber-200' :
            program.status === 'not-pre-qual' ? 'bg-white border-slate-200' :
            'bg-white border-gray-200'
          }`}>
            <p className="text-sm text-gray-800">
              {program.status === 'pre-qual' && '✅ '}
              {program.status === 'likely-qual' && '⚠️ '}
              {program.status === 'not-pre-qual' && '🔒 '}
              {program.reasoning}
            </p>
          </div>
          
          {/* Passed Requirements */}
          {program.passedRequirements.length > 0 && expanded && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-emerald-200">
              <p className="text-xs font-semibold text-emerald-800 mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Requirements Met ({program.passedRequirements.length})
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                {program.passedRequirements.slice(0, 3).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-emerald-600 mt-0.5">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
                {program.passedRequirements.length > 3 && (
                  <li className="text-emerald-600 italic">
                    + {program.passedRequirements.length - 3} more...
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Missing Data (Likely Qualified) */}
          {program.missingData.length > 0 && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-amber-300">
              <p className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Please Verify ({program.missingData.length})
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                {program.missingData.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Failed Requirements (Not Pre-Qualified) */}
          {program.failedRequirements.length > 0 && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-red-300">
              <p className="text-xs font-semibold text-red-900 mb-2 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Requirements to Build ({program.failedRequirements.length})
              </p>
              <ul className="text-xs text-gray-700 space-y-1">
                {program.failedRequirements.slice(0, 3).map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-red-600 mt-0.5">✗</span>
                    <span>{req}</span>
                  </li>
                ))}
                {program.failedRequirements.length > 3 && (
                  <li className="text-red-600 italic">
                    + {program.failedRequirements.length - 3} more...
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="mt-4 flex items-center gap-3">
            {program.status === 'pre-qual' && (
              <Button
                onClick={() => navigate(getProgramRoute(program.programId))}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold shadow-md hover:shadow-lg"
              >
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {program.status === 'likely-qual' && (
              <Button
                onClick={() => navigate(getProgramRoute(program.programId))}
                variant="outline"
                className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold"
              >
                Verify & Apply
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {program.status === 'not-pre-qual' && (
              <Button
                onClick={() => navigate('/bankable-roadmap')}
                variant="outline"
                className="border-2 border-slate-400 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                View Roadmap
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            {/* Show Details Toggle */}
            {(program.passedRequirements.length > 0 || showDetails) && (
              <Button
                onClick={() => setExpanded(!expanded)}
                variant="ghost"
                size="sm"
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                {expanded ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Show Details
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Match Score Indicator */}
      {program.matchScore > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Match Score</span>
            <span className="font-semibold text-gray-900">{program.matchScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className={`h-2 rounded-full ${
                program.matchScore >= 80 ? 'bg-emerald-500' :
                program.matchScore >= 50 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${program.matchScore}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function Results() {
  const navigate = useNavigate();
  const [step1Data, setStep1Data] = useState<any>(null);
  const [step2Data, setStep2Data] = useState<any>(null);
  const [step3Data, setStep3Data] = useState<any>(null);
  const [showNotApplicable, setShowNotApplicable] = useState(false);
  
  // Phase 1 eligibility results
  const [eligibilityResults, setEligibilityResults] = useState<EligibilityResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  
  // FundScore results (if available from unified flow)
  const [fundScore, setFundScore] = useState<number | null>(null);
  const [fundScoreBand, setFundScoreBand] = useState<any>(null);

  useEffect(() => {
    // Try new unified BSS flow keys first
    let step1 = localStorage.getItem('bss_step1');
    let step2 = localStorage.getItem('bss_step2');
    let step3 = localStorage.getItem('bss_step3');
    
    // Fall back to old keys if new ones don't exist
    if (!step1) step1 = localStorage.getItem('scanStep1');
    if (!step2) step2 = localStorage.getItem('scanStep2');
    if (!step3) step3 = localStorage.getItem('scanStep3');
    
    if (!step1 || !step2 || !step3) {
      navigate('/business-success-scan/step-1');
      return;
    }
    
    const s1 = JSON.parse(step1);
    const s2 = JSON.parse(step2);
    const s3 = JSON.parse(step3);
    
    setStep1Data(s1);
    setStep2Data(s2);
    setStep3Data(s3);
    
    // Calculate time in business from start date
    const startYear = parseInt(s2.startYear) || new Date().getFullYear();
    const startMonth = parseInt(s2.startMonth) || 1;
    const startDate = new Date(startYear, startMonth - 1);
    const now = new Date();
    const monthsInBusiness = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    const yearsInBusiness = Math.floor(monthsInBusiness / 12);
    
    let timeInBusinessText = '';
    if (yearsInBusiness === 0) {
      timeInBusinessText = 'Less than 1 year';
    } else if (yearsInBusiness === 1) {
      timeInBusinessText = '1 year';
    } else {
      timeInBusinessText = `${yearsInBusiness} years`;
    }
    
    // Calculate annual revenue from monthly
    const monthlyRev = parseFloat(s2.monthlyRevenue?.toString().replace(/[^0-9.]/g, '') || '0');
    const annualRev = monthlyRev * 12;
    const annualRevenueText = annualRev >= 1000000 
      ? `$${(annualRev / 1000000).toFixed(1)}M+`
      : annualRev >= 1000
        ? `$${(annualRev / 1000).toFixed(0)}K+`
        : `$${annualRev.toFixed(0)}`;
    
    // Get the best credit score from the three bureaus
    const experian = parseInt(s3.experianScore) || 0;
    const transunion = parseInt(s3.transUnionScore) || 0;
    const equifax = parseInt(s3.equiFaxScore) || 0;
    const bestScore = Math.max(experian, transunion, equifax);
    
    // Update business profile with COMPLETE scan data
    updateBusinessProfile({
      // Step 1 - Contact & Business Basics
      businessLegalName: s1.businessLegalName || '',
      contactFirstName: s1.contactFirstName || '',
      contactLastName: s1.contactLastName || '',
      contactEmail: s1.contactEmail || '',
      contactPhone: s1.contactPhone || '',
      businessAddress: s1.businessAddress || '',
      city: s1.city || '',
      state: s1.state || '',
      zipCode: s1.zipCode || '',
      businessPhoneNumber: s1.businessPhone || '',
      hasEIN: s1.hasEIN === 'Yes',
      einNumber: s1.einNumber || '',
      
      // Step 2 - Business Operations & Financials
      businessType: s2.businessType || '',
      industry: s2.industry || '',
      timeInBusiness: timeInBusinessText,
      monthlyRevenue: s2.monthlyRevenue?.toString() || '0',
      annualRevenue: annualRevenueText,
      
      // Step 2 - Banking
      hasBankAccount: s2.hasBizBankAccount === 'Yes',
      
      // Step 2 - Business Infrastructure (from Step 2 extended questions)
      hasBusinessAddress: s1.businessAddress ? true : false,
      hasBusinessPhone: s1.businessPhone ? true : false,
      hasBusinessEmail: s1.contactEmail ? true : false,
      hasWebsite: false, // Not captured in scan yet
      hasBusinessLicense: false, // Not captured in scan yet
      
      // Step 3 - Credit Scores (ALL three bureaus)
      personalCreditScore: bestScore, // Use best score as primary
      experianScore: experian,
      transunionScore: transunion,
      equifaxScore: equifax,
      
      // Step 3 - Personal Info
      annualHouseholdIncome: s3.personalIncome?.toString() || '',
      
      // Business Credit (default values - will be enhanced later)
      hasBusinessCredit: false,
      tradelineCount: 0,
      hasDUNS: false,
      
      // Metadata
      scanCompleted: true,
      scanCompletedDate: new Date().toISOString(),
    });
    
    // Auto-mark audit items complete
    syncScanDataToAuditItems();
    
    // Dispatch event to update sidebar
    window.dispatchEvent(new Event('scanDataUpdated'));
    
    // ========================================
    // PHASE 1: BUILD COMPREHENSIVE SCAN DATA
    // ========================================
    const scanData: ScanData = {
      // Step 1 - Business Info
      hasEIN: s1.hasEIN,
      businessType: s2.businessType,
      
      // Step 2 - Operations & Financials
      startMonth: s2.startMonth,
      startYear: s2.startYear,
      monthlyRevenue: s2.monthlyRevenue,
      creditCardSales: s2.creditCardSales,
      owedToYou: s2.owedToYou,
      purchaseOrders: s2.purchaseOrders,
      equipmentValue: s2.equipmentValue,
      
      // PHASE 1: Business Banking
      hasBizBankAccount: s2.hasBizBankAccount,
      bankAccountAge: s2.bankAccountAge,
      avgMonthlyBalance: s2.avgMonthlyBalance,
      hasNSF: s2.hasNSF,
      
      // PHASE 1: Property Ownership
      ownsInvestmentProperty: s2.ownsInvestmentProperty,
      propertyCount: s2.propertyCount,
      totalPropertyValue: s2.totalPropertyValue,
      totalMortgageBalance: s2.totalMortgageBalance,
      totalRentalIncome: s2.totalRentalIncome,
      planningConstruction: s2.planningConstruction,
      constructionBudget: s2.constructionBudget,
      
      // Step 3 - Credit & Personal
      experianScore: s3.experianScore,
      transUnionScore: s3.transUnionScore,
      equiFaxScore: s3.equiFaxScore,
      hasBankruptcy: s3.hasBankruptcy,
      hasJudgments: s3.hasJudgments,
      personalIncome: s3.personalIncome,
      
      // PHASE 1: Credit Profile Details
      inquiriesLast30Days: s3.inquiriesLast30Days,
      newAccountsLast12Months: s3.newAccountsLast12Months,
      creditUtilization: s3.creditUtilization,
      hasCollections: s3.hasCollections,
      hasChargeOffs: s3.hasChargeOffs,
      hasLatePayments: s3.hasLatePayments,
      hasTaxLiens: s3.hasTaxLiens,
      noDerogatoryItems: s3.noDerogatoryItems,
    };
    
    // ========================================
    // RUN PHASE 1 ELIGIBILITY CHECKER
    // ========================================
    const results = checkAllProgramsEligibilityPhase1(scanData);
    const eligibilitySummary = getEligibilitySummary(scanData);
    
    setEligibilityResults(results);
    setSummary(eligibilitySummary);
    
    // Store pre-qualified program IDs for sidebar
    const preQualifiedIds = eligibilitySummary.preQualified.map((p: EligibilityResult) => p.programId);
    localStorage.setItem('preQualifiedPrograms', JSON.stringify(preQualifiedIds));
    window.dispatchEvent(new Event('preQualifiedProgramsUpdated'));
    
    // ========================================
    // CALCULATE FUNDSCORE (if answers exist)
    // ========================================
    const fundScoreAnswers = localStorage.getItem('fundscore_answers');
    if (fundScoreAnswers) {
      try {
        const answers = JSON.parse(fundScoreAnswers);
        const { score, dimAvg } = computeScore(answers, QUESTIONS);
        const band = getBand(score);
        setFundScore(score);
        setFundScoreBand(band);
        
        // Store for other components (Dashboard, etc.)
        localStorage.setItem('fundscore_result', JSON.stringify({ score, band, dimAvg }));
        
        // Notify Dashboard to refresh
        window.dispatchEvent(new Event('fundscoreUpdated'));
      } catch (error) {
        console.error('Error calculating FundScore:', error);
      }
    }
    
  }, [navigate]);

  // Don't render until data is loaded
  if (!step1Data || !step2Data || !step3Data || !summary) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Funding Results</h1>
              <p className="text-gray-600">Pre-Qualification Summary • {new Date().toLocaleDateString()}</p>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              Analysis Complete
            </Badge>
          </div>
        </motion.div>

        {/* FundScore Hero (if available from unified flow) */}
        {fundScore !== null && fundScoreBand && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            style={{
              background: 'var(--card)',
              border: '2px solid var(--primary)',
              padding: '32px',
              marginBottom: '32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 400,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--muted-foreground)',
                marginBottom: '12px',
              }}
            >
              YOUR FUNDSCORE™
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '72px',
                fontWeight: 800,
                color: fundScoreBand.color,
                lineHeight: 1,
                marginBottom: '8px',
              }}
            >
              {fundScore}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontStyle: 'italic',
                color: 'var(--secondary-foreground)',
                marginBottom: '16px',
              }}
            >
              {fundScoreBand.name}
            </div>
            <div
              style={{
                maxWidth: '480px',
                margin: '0 auto',
                background: 'var(--border)',
                height: '8px',
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(fundScore / 1000) * 100}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, var(--primary-hover), var(--primary))`,
                }}
              />
            </div>
            <div
              style={{
                marginTop: '16px',
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--muted-foreground)',
              }}
            >
              Based on your complete assessment across 6 dimensions
            </div>
          </motion.div>
        )}

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl p-5 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{summary.preQualified.length}</div>
            <div className="text-sm text-emerald-100">✅ Pre-Qualified</div>
            <div className="text-xs text-emerald-200 mt-1">Ready to apply now</div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{summary.likelyQualified.length}</div>
            <div className="text-sm text-amber-100">⚠️ Likely Qualified</div>
            <div className="text-xs text-amber-200 mt-1">Needs verification</div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-500 to-gray-500 rounded-xl p-5 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{summary.notPreQualified.length}</div>
            <div className="text-sm text-slate-100">🔒 Not Yet Qualified</div>
            <div className="text-xs text-slate-200 mt-1">Work to unlock</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{summary.totalPrograms - summary.notApplicable.length}</div>
            <div className="text-sm text-blue-100">🎯 Relevant Programs</div>
            <div className="text-xs text-blue-200 mt-1">Out of {summary.totalPrograms} total</div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 mb-8"
        >
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 mb-1">
                📊 Your results are based on {eligibilityResults.length} funding programs analyzed with our Phase 1 eligibility system
              </p>
              <p className="text-sm text-gray-700">
                We've collected {Object.keys(step2Data).length + Object.keys(step3Data).length} data points to give you the most accurate pre-qualification available. 
                Programs are categorized into 3 tiers based on confidence level.
              </p>
            </div>
          </div>
        </motion.div>

        {/* TIER 1: PRE-QUALIFIED PROGRAMS */}
        {summary.preQualified.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  ✅ Pre-Qualified Programs ({summary.preQualified.length})
                </h2>
                <p className="text-sm text-gray-600">
                  You meet ALL requirements for these programs with high confidence. Ready to apply!
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {summary.preQualified.map((program: EligibilityResult) => (
                <ProgramCard key={program.programId} program={program} showDetails />
              ))}
            </div>
          </motion.div>
        )}

        {/* TIER 2: LIKELY QUALIFIED PROGRAMS */}
        {summary.likelyQualified.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  ⚠️ Likely Qualified - Verification Needed ({summary.likelyQualified.length})
                </h2>
                <p className="text-sm text-gray-600">
                  You likely qualify, but we need to verify a few details before you can apply.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {summary.likelyQualified.map((program: EligibilityResult) => (
                <ProgramCard key={program.programId} program={program} />
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>💡 Next Step:</strong> Contact your coach to verify the missing details and move these programs to "Pre-Qualified" status.
              </p>
            </div>
          </motion.div>
        )}

        {/* TIER 3: NOT PRE-QUALIFIED PROGRAMS */}
        {summary.notPreQualified.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  🔒 Not Pre-Qualified Yet ({summary.notPreQualified.length})
                </h2>
                <p className="text-sm text-gray-600">
                  These programs have requirements you don't currently meet. We'll help you work towards them!
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {summary.notPreQualified.map((program: EligibilityResult) => (
                <ProgramCard key={program.programId} program={program} />
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>🎯 Good News:</strong> Our 90-day Bankable Roadmap is designed to help you meet these requirements. 
                Each program shows exactly what you need to work on.
              </p>
            </div>
          </motion.div>
        )}

        {/* NOT APPLICABLE (Hidden by default) */}
        {summary.notApplicable.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <button
              onClick={() => setShowNotApplicable(!showNotApplicable)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-gray-500" />
                <span className="font-semibold text-gray-700">
                  {showNotApplicable ? 'Hide' : 'View'} programs that don't apply to your situation ({summary.notApplicable.length})
                </span>
              </div>
              <div className="text-gray-500">
                {showNotApplicable ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </div>
            </button>
            
            {showNotApplicable && (
              <div className="grid grid-cols-1 gap-4 mt-4">
                {summary.notApplicable.map((program: EligibilityResult) => (
                  <ProgramCard key={program.programId} program={program} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <h3 className="text-2xl font-bold mb-4">🎉 What's Next?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl mb-2">1️⃣</div>
              <p className="font-semibold mb-1">Apply for Pre-Qualified Programs</p>
              <p className="text-sm text-blue-100">
                Start with the {summary.preQualified.length} programs you're pre-qualified for today
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl mb-2">2️⃣</div>
              <p className="font-semibold mb-1">Verify Likely Qualified</p>
              <p className="text-sm text-blue-100">
                Work with your coach to verify details for {summary.likelyQualified.length} more programs
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-3xl mb-2">3️⃣</div>
              <p className="font-semibold mb-1">Follow the Roadmap</p>
              <p className="text-sm text-blue-100">
                Complete your 90-day journey to unlock all {summary.totalPrograms} programs
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={() => navigate('/bankable-roadmap')}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 font-semibold"
              size="lg"
            >
              View 90-Day Roadmap
              <TrendingUp className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}