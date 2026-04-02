// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Optimize Reporting
// Covers: Business Credit Bureaus (D&B, Experian, Equifax, CreditSafe, FICO SBSS)
//         Owner's Credit Profile (FICO impact, debt, inquiries, credit partners)
// Dynamic: reads unified_assessment + compliance progress → real status + steps
// Gate: virtual/live membership only
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import {
  TrendingUp, AlertCircle, CheckCircle, Lock, ChevronRight,
  BarChart2, Shield, Zap, FileText, Users, Target, ExternalLink
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { getMembershipTier, canAccessGoal2 } from '../lib/membership';
import { getAllAuditItems, getCategoryProgress } from '../utils/businessData';

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab = 'business' | 'owner';

interface AssessmentData {
  experian?: string;
  transunion?: string;
  equifax?: string;
  monthlyRevenue?: string;
  startDate?: { year: number; month: number };
  hasBankruptcy?: string;
  hasEIN?: boolean;
}

interface BureauStatus {
  label: string;
  color: string;
  score: string;
  description: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CREDIT_MAP: Record<string, number> = {
  exceptional: 810, very_good: 760, good: 700, fair: 650, poor: 560, unknown: 600,
};

const CREDIT_LABELS: Record<string, string> = {
  exceptional: 'Exceptional (800+)',
  very_good: 'Very Good (740–799)',
  good: 'Good (670–739)',
  fair: 'Fair (580–669)',
  poor: 'Poor (Below 580)',
  unknown: 'Not Provided',
};

function getAgeMonths(data: AssessmentData): number {
  if (!data.startDate) return 0;
  const now = new Date();
  const start = new Date(data.startDate.year, (data.startDate.month || 1) - 1);
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

function getCreditScore(data: AssessmentData): number {
  return Math.min(
    CREDIT_MAP[data.experian ?? 'unknown'],
    CREDIT_MAP[data.transunion ?? 'unknown'],
    CREDIT_MAP[data.equifax ?? 'unknown'],
  );
}

function getBureauStatus(score: number, ageMonths: number, completedModules: string[]): BureauStatus {
  const hasEntity = completedModules.includes('entity-filings');
  const hasBanking = completedModules.includes('business-banking');
  const hasBothFoundation = hasEntity && hasBanking;

  if (!hasBothFoundation || ageMonths < 6) {
    return { label: 'Not Established', color: 'from-slate-500 to-slate-600', score: '—', description: 'File not yet established with this bureau' };
  }
  if (score >= 720 && ageMonths >= 24) {
    return { label: 'Strong', color: 'from-emerald-500 to-green-600', score: '75–80+', description: 'Profile is strong and growing' };
  }
  if (score >= 650 && ageMonths >= 12) {
    return { label: 'Building', color: 'from-blue-500 to-cyan-600', score: '50–74', description: 'File established, actively improving' };
  }
  return { label: 'Early Stage', color: 'from-amber-500 to-orange-500', score: '20–49', description: 'Established but needs tradelines' };
}

function getFicoSBSSBand(personalFico: number, ageMonths: number, completedModules: number): string {
  const base = Math.round((personalFico / 850) * 160 + (ageMonths / 60) * 20 + completedModules * 3);
  return `~${Math.min(base, 280)} / 300`;
}

// ── Membership Gate ───────────────────────────────────────────────────────────

function UpgradeGate() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-10 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Optimize Reporting</h2>
        <p className="text-gray-600 mb-2 font-semibold">Virtual or Live Membership Required</p>
        <p className="text-sm text-gray-500 mb-8">
          This section gives you a bureau-by-bureau roadmap to build, strengthen, and optimize both your business credit profile and owner's credit — so lenders see exactly what you need them to see.
        </p>
        <div className="space-y-3 mb-8 text-left">
          {[
            'D&B PAYDEX, Experian, Equifax, CreditSafe & FICO SBSS status',
            'Personal FICO impact on every funding product',
            'Debt ratio thresholds lenders actually use',
            'Inquiry management + credit partner strategy',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <Link to="/pricing">
          <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            Upgrade to Unlock This Section
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function OptimizeReporting() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MainTab>('business');
  const [assessment, setAssessment] = useState<AssessmentData>({});
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [creditScore, setCreditScore] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);

  const tier = getMembershipTier();
  const hasAccess = canAccessGoal2(tier);

  useEffect(() => {
    loadData();
    window.addEventListener('businessDataUpdated', loadData);
    window.addEventListener('scanDataUpdated', loadData);
    return () => {
      window.removeEventListener('businessDataUpdated', loadData);
      window.removeEventListener('scanDataUpdated', loadData);
    };
  }, []);

  function loadData() {
    try {
      const raw = localStorage.getItem('unified_assessment');
      const data: AssessmentData = raw ? JSON.parse(raw) : {};
      setAssessment(data);
      setCreditScore(getCreditScore(data));
      setAgeMonths(getAgeMonths(data));
    } catch { /* no data yet */ }

    try {
      const items = getAllAuditItems();
      const done = items.filter(i => i.status === 'complete').map(i => i.id);
      setCompletedModules(done);
    } catch { /* no compliance data */ }
  }

  if (!hasAccess) return <UpgradeGate />;

  const bureauStatus = getBureauStatus(creditScore, ageMonths, completedModules);
  const hasEntityFilings = completedModules.includes('entity-filings');
  const hasBusinessBanking = completedModules.includes('business-banking');
  const hasAgenciesNAICS = completedModules.includes('agencies-naics');
  const hasAssetsUCC = completedModules.includes('assets-ucc');
  const hasEINLicenses = completedModules.includes('ein-licenses');
  const creditLabel = CREDIT_LABELS[assessment.experian ?? 'unknown'];
  const hasBankruptcy = assessment.hasBankruptcy === 'recent' || assessment.hasBankruptcy === 'aging';
  const ficoSBSS = getFicoSBSSBand(creditScore, ageMonths, completedModules.length);
  const creditBand = creditScore >= 720 ? 'strong' : creditScore >= 650 ? 'good' : creditScore >= 580 ? 'fair' : 'low';

  // ── Bureau card definitions ────────────────────────────────────────────────

  const bureaus = [
    {
      id: 'dun-bradstreet',
      name: 'Dun & Bradstreet',
      score: 'PAYDEX Score',
      range: '0–100 (80 = ideal)',
      threshold: '80 PAYDEX',
      purpose: 'Used by banks, corporate vendors, and SBA lenders to assess payment behavior',
      status: bureauStatus,
      established: hasAgenciesNAICS,
      steps: [
        {
          done: hasAgenciesNAICS,
          action: 'Get your DUNS Number via Agencies & NAICS module',
          impact: 'Required to establish your D&B file',
          fix: '/app/lender-compliance/agencies-naics',
          fixLabel: 'Complete Agencies & NAICS',
        },
        {
          done: hasBusinessBanking,
          action: 'Open a dedicated business checking account',
          impact: 'Banking history feeds D&B file establishment',
          fix: '/app/lender-compliance/business-banking',
          fixLabel: 'Complete Business Banking',
        },
        {
          done: completedModules.includes('building-credit-vendors') || ageMonths >= 6,
          action: 'Add NET-30 vendor accounts that report to D&B',
          impact: '+10–20 PAYDEX points per on-time tradeline',
          fix: '/app/building-credit',
          fixLabel: 'Go to Building Credit',
        },
        {
          done: ageMonths >= 12,
          action: 'Pay all vendor invoices on or before the due date',
          impact: 'Each on-time payment moves PAYDEX toward 80',
          fix: null,
          fixLabel: null,
        },
      ],
    },
    {
      id: 'experian-business',
      name: 'Experian Business',
      score: 'Intelliscore Plus',
      range: '1–100 (76+ = low risk)',
      threshold: '76+',
      purpose: 'Used by lenders to assess business payment risk and creditworthiness',
      status: bureauStatus,
      established: hasEntityFilings && hasBusinessBanking,
      steps: [
        {
          done: hasEntityFilings,
          action: 'Complete Entity & Filings — Experian tracks state registration',
          impact: 'Establishes your business identity in Experian\'s database',
          fix: '/app/lender-compliance/entity-filings',
          fixLabel: 'Complete Entity & Filings',
        },
        {
          done: hasEINLicenses,
          action: 'Ensure EIN is active and matches business name exactly',
          impact: 'EIN mismatch causes file fragmentation',
          fix: '/app/lender-compliance/ein-licenses',
          fixLabel: 'Complete EIN & Licenses',
        },
        {
          done: hasBusinessBanking,
          action: 'Establish business banking with consistent deposits',
          impact: 'Banking activity signals operational health to Experian',
          fix: '/app/lender-compliance/business-banking',
          fixLabel: 'Complete Business Banking',
        },
        {
          done: creditScore >= 700,
          action: 'Maintain personal FICO above 700',
          impact: 'Experian blends personal and business signals early on',
          fix: null,
          fixLabel: null,
        },
      ],
    },
    {
      id: 'equifax-business',
      name: 'Equifax Business',
      score: 'Business Credit Risk Score',
      range: '101–992 (556+ = low risk)',
      threshold: '556+',
      purpose: 'Used by banks and credit card issuers to assess default risk',
      status: bureauStatus,
      established: hasEntityFilings && hasBusinessBanking,
      steps: [
        {
          done: hasEntityFilings,
          action: 'Register business entity and keep it in good standing',
          impact: 'Equifax sources from state filings — accuracy is critical',
          fix: '/app/lender-compliance/entity-filings',
          fixLabel: 'Complete Entity & Filings',
        },
        {
          done: hasBusinessBanking,
          action: 'Maintain active business bank account with 3+ months of history',
          impact: 'Equifax uses banking history as a strong signal',
          fix: '/app/lender-compliance/business-banking',
          fixLabel: 'Complete Business Banking',
        },
        {
          done: hasAssetsUCC,
          action: 'Review Assets & UCC — clear any liens from your Equifax profile',
          impact: 'UCC filings showing up incorrectly depress your score',
          fix: '/app/lender-compliance/assets-ucc',
          fixLabel: 'Complete Assets & UCC',
        },
        {
          done: ageMonths >= 18,
          action: 'Build 18+ months of positive payment history',
          impact: 'Equifax weights payment history heavily — time builds score',
          fix: null,
          fixLabel: null,
        },
      ],
    },
    {
      id: 'creditsafe',
      name: 'CreditSafe',
      score: 'CreditSafe Score',
      range: '1–100 (51+ = low risk)',
      threshold: '51+',
      purpose: 'Used by international vendors, B2B suppliers, and alternative lenders',
      status: bureauStatus,
      established: hasEntityFilings,
      steps: [
        {
          done: hasEntityFilings,
          action: 'Ensure business name, address, and EIN are consistent everywhere',
          impact: 'CreditSafe aggregates from public data — consistency is key',
          fix: '/app/lender-compliance/entity-filings',
          fixLabel: 'Complete Entity & Filings',
        },
        {
          done: hasBusinessBanking,
          action: 'Build banking history — CreditSafe uses third-party financial data',
          impact: 'Banking activity improves CreditSafe profile',
          fix: '/app/lender-compliance/business-banking',
          fixLabel: 'Complete Business Banking',
        },
        {
          done: ageMonths >= 12,
          action: 'Allow time for reporting tradelines to accumulate',
          impact: 'CreditSafe scores improve as payment history grows',
          fix: null,
          fixLabel: null,
        },
        {
          done: !hasBankruptcy,
          action: 'Keep record clean of judgments, liens, and bankruptcies',
          impact: 'Public records are the fastest way to damage your CreditSafe score',
          fix: null,
          fixLabel: null,
        },
      ],
    },
    {
      id: 'fico-sbss',
      name: 'FICO SBSS',
      score: 'Small Business Scoring Service',
      range: '0–300 (140+ for SBA)',
      threshold: '140 minimum (SBA loans)',
      purpose: 'Required by SBA — blends personal FICO, business credit, and time in business',
      status: {
        label: creditBand === 'strong' && ageMonths >= 24 ? 'SBA Ready' : creditBand === 'strong' ? 'Building' : 'Needs Work',
        color: creditBand === 'strong' && ageMonths >= 24 ? 'from-emerald-500 to-green-600' : creditBand === 'strong' ? 'from-blue-500 to-cyan-600' : 'from-amber-500 to-orange-500',
        score: ficoSBSS,
        description: 'Estimated based on your reported credit profile',
      },
      established: creditScore >= 640,
      steps: [
        {
          done: creditScore >= 680,
          action: 'Bring personal FICO to 680+ — it drives ~50% of your FICO SBSS',
          impact: 'Every 20 FICO points = ~10 SBSS points',
          fix: null,
          fixLabel: null,
        },
        {
          done: ageMonths >= 24,
          action: 'Reach 2+ years in business',
          impact: 'Time in business is one of three main SBSS inputs',
          fix: null,
          fixLabel: null,
        },
        {
          done: completedModules.length >= 5,
          action: 'Build business credit across D&B, Experian, and Equifax',
          impact: 'Business credit history is the third main SBSS input',
          fix: null,
          fixLabel: null,
        },
        {
          done: !hasBankruptcy,
          action: 'No bankruptcies on personal or business reports',
          impact: 'Bankruptcy can drop SBSS below SBA threshold immediately',
          fix: null,
          fixLabel: null,
        },
      ],
    },
  ];

  // ── Owner credit sections ──────────────────────────────────────────────────

  const lenderThresholds = [
    { product: 'Merchant Advance', minFico: 550, color: 'bg-green-400' },
    { product: 'Truck & Vehicle Financing', minFico: 550, color: 'bg-green-400' },
    { product: 'Revenue-Based Loan', minFico: 550, color: 'bg-green-400' },
    { product: 'Equipment Financing', minFico: 580, color: 'bg-blue-400' },
    { product: 'Startup Equipment', minFico: 580, color: 'bg-blue-400' },
    { product: 'Personal Credit Cards', minFico: 650, color: 'bg-blue-500' },
    { product: 'Business Credit Cards (SLOC)', minFico: 680, color: 'bg-indigo-500' },
    { product: 'SBA Business Loan', minFico: 680, color: 'bg-indigo-500' },
    { product: 'Business Credit Line', minFico: 700, color: 'bg-purple-500' },
    { product: 'Business Term Loan', minFico: 700, color: 'bg-purple-500' },
    { product: 'Credit Union Loans', minFico: 700, color: 'bg-purple-600' },
  ];

  const qualifiedCount = lenderThresholds.filter(t => creditScore >= t.minFico).length;

  const debtStrategies = [
    {
      title: 'Revolving Utilization Target',
      detail: 'Keep all credit card balances below 30% of the limit. Under 10% is ideal for maximum FICO impact.',
      status: 'action',
      icon: '💳',
    },
    {
      title: 'Debt-to-Income Ratio (DTI)',
      detail: 'Most lenders require DTI below 43%. Calculate yours: total monthly debt payments ÷ gross monthly income.',
      status: 'action',
      icon: '📊',
    },
    {
      title: 'Installment vs. Revolving Mix',
      detail: 'Having both revolving (credit cards) and installment (loans, auto) accounts improves your credit mix score.',
      status: 'info',
      icon: '⚖️',
    },
    {
      title: 'Pay Above the Minimum',
      detail: 'Minimum payments on revolving accounts keep utilization high. Pay off balances when possible.',
      status: 'action',
      icon: '🎯',
    },
  ];

  const inquiryStrategies = [
    {
      title: 'Limit Hard Inquiries to Under 4 (30 days)',
      detail: 'Most business credit programs require fewer than 4 hard inquiries in the last 30 days. Each hard pull stays on your report for 2 years.',
      critical: true,
    },
    {
      title: 'Rate Shopping Window',
      detail: 'Multiple mortgage or auto loan inquiries within 14–45 days count as ONE inquiry under FICO\'s rate shopping rules. Use this window strategically.',
      critical: false,
    },
    {
      title: 'No New Personal Accounts (6 months)',
      detail: 'Opening new personal accounts lowers average account age and adds inquiries. Pause new applications while pursuing business funding.',
      critical: true,
    },
    {
      title: 'Check Your Own Credit (Soft Pull Only)',
      detail: 'Checking your own credit via annualcreditreport.com is a soft pull — zero impact. Do this before any lender application.',
      critical: false,
    },
  ];

  const creditPartnerStrategies = [
    {
      title: 'Authorized User Strategy',
      detail: 'Ask a family member or trusted contact with excellent credit (750+) to add you as an authorized user on their oldest, lowest-utilization card. That card\'s history immediately shows on your report.',
      impact: '+20–40 FICO points possible',
      timeframe: '30–60 days',
    },
    {
      title: 'Co-Signer on Business Term Loan',
      detail: 'A co-signer with strong credit (700+) can help you qualify for programs your personal credit currently blocks. The co-signer is equally liable — only use with someone who fully understands the commitment.',
      impact: 'Unlocks higher-tier programs',
      timeframe: 'Immediate for qualification',
    },
    {
      title: 'Business Partner Credit Leverage',
      detail: 'If a business partner has stronger credit, having them serve as the guarantor (provided they hold 20%+ ownership) can improve your program eligibility across the board.',
      impact: 'Unlocks programs requiring 700+ FICO',
      timeframe: 'Immediate',
    },
    {
      title: 'Secured Credit Card for Thin File',
      detail: 'If your credit file is thin (under 3 accounts), open one secured credit card and use it for small recurring expenses. Pay in full monthly. After 6 months, your file thickens significantly.',
      impact: '+15–30 FICO points',
      timeframe: '6–12 months',
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 min-h-screen bg-slate-50 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 md:p-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Optimize Reporting</h1>
            <Badge variant="info" className="text-sm px-3 py-1">
              {tier === 'live' ? '🏆 Live Coached' : '✅ Virtual Coached'}
            </Badge>
          </div>
          <p className="text-gray-600">
            Your complete roadmap to building lender-visible business credit and optimizing your personal credit profile.
          </p>
        </motion.div>

        {/* Summary bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Owner's FICO Range</p>
            <p className="text-lg font-bold text-gray-900">{creditLabel}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Programs Unlocked</p>
            <p className="text-lg font-bold text-emerald-600">{qualifiedCount} / {lenderThresholds.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow p-4">
            <p className="text-xs text-gray-500 mb-1">Business Bureaus</p>
            <p className="text-lg font-bold text-gray-900">{bureauStatus.label}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow p-4">
            <p className="text-xs text-gray-500 mb-1">FICO SBSS Est.</p>
            <p className="text-lg font-bold text-indigo-600">{ficoSBSS}</p>
          </div>
        </motion.div>

        {/* Integrate Reports CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4"
        >
          <div>
            <p className="text-white font-bold text-lg mb-1">Pull Your Actual Bureau Reports</p>
            <p className="text-indigo-100 text-sm">Connect your credit reports to get real scores — not estimates.</p>
          </div>
          <Link to="/app/integrate-reports">
            <Button className="bg-white text-indigo-700 font-semibold hover:bg-indigo-50 whitespace-nowrap">
              Integrate Reports <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-8 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('business')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'business'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 inline mr-2" />
            Business Credit Bureaus
          </button>
          <button
            onClick={() => setActiveTab('owner')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'owner'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Owner's Credit Profile
          </button>
        </div>

        {/* ── BUSINESS CREDIT BUREAUS TAB ─────────────────────────────────── */}
        {activeTab === 'business' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Business Credit ≠ Personal Credit</p>
                  <p className="text-sm text-amber-800">
                    Five separate agencies track your business. Each uses different scoring models and different data sources.
                    Unlike personal credit, <strong>anyone</strong> can pull your business credit report — lenders, vendors, partners.
                    Build all five files proactively.
                  </p>
                </div>
              </div>
            </div>

            {bureaus.map((bureau, idx) => {
              const doneCount = bureau.steps.filter(s => s.done).length;
              const totalSteps = bureau.steps.length;
              const pct = Math.round((doneCount / totalSteps) * 100);

              return (
                <motion.div
                  key={bureau.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden"
                >
                  {/* Bureau header */}
                  <div className={`bg-gradient-to-r ${bureau.status.color} text-white p-5`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{bureau.name}</h3>
                        <p className="text-sm opacity-90">{bureau.score} · {bureau.range}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{bureau.status.score}</p>
                        <p className="text-xs opacity-80">Estimated</p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1 opacity-90">
                        <span>{doneCount} of {totalSteps} steps complete</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-white rounded-full h-2 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div className="px-5 pt-4 pb-2">
                    <p className="text-xs text-gray-500 italic">{bureau.purpose}</p>
                  </div>

                  {/* Action steps */}
                  <div className="p-5 space-y-3">
                    {bureau.steps.map((step, si) => (
                      <div
                        key={si}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
                          step.done
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {step.done
                            ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                            : <div className="w-5 h-5 rounded-full border-2 border-slate-300 bg-white" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${step.done ? 'text-emerald-900' : 'text-gray-900'}`}>
                            {step.action}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{step.impact}</p>
                        </div>
                        {!step.done && step.fix && (
                          <Link to={step.fix} className="flex-shrink-0">
                            <Button size="sm" variant="outline" className="text-xs whitespace-nowrap">
                              {step.fixLabel} <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* ── OWNER'S CREDIT PROFILE TAB ──────────────────────────────────── */}
        {activeTab === 'owner' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {/* FICO & Funding Products section */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Personal FICO & Funding Access</h3>
                    <p className="text-sm opacity-80">Your score: {creditLabel}</p>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 mb-5">
                  Your personal FICO is the single most impactful variable in business funding. Every program below has a minimum threshold — here's where you stand today:
                </p>
                <div className="space-y-2">
                  {lenderThresholds.map((t, i) => {
                    const unlocked = creditScore >= t.minFico;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${unlocked ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                        <div className={`w-2 h-8 rounded-full flex-shrink-0 ${unlocked ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${unlocked ? 'text-emerald-900' : 'text-gray-600'}`}>
                            {t.product}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">Min: {t.minFico}</p>
                          {unlocked
                            ? <p className="text-xs font-bold text-emerald-600">✓ Eligible</p>
                            : <p className="text-xs font-bold text-slate-400">Need +{t.minFico - creditScore} pts</p>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-sm font-semibold text-indigo-900 mb-1">
                    You currently qualify for {qualifiedCount} of {lenderThresholds.length} programs on FICO alone.
                  </p>
                  <p className="text-xs text-indigo-700">
                    Moving from {creditLabel} to the next tier unlocks {lenderThresholds.filter(t => t.minFico > creditScore && t.minFico <= creditScore + 30).length} additional programs within 30 points.
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Debt Management */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Debt Management Strategy</h3>
                    <p className="text-sm opacity-80">Ratios, limits, and paydown sequencing</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {debtStrategies.map((s, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border-2 ${s.status === 'action' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-2xl flex-shrink-0">{s.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">{s.title}</p>
                      <p className="text-xs text-gray-600">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inquiry Management */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Inquiry & Identity Management</h3>
                    <p className="text-sm opacity-80">Hard pulls kill funding — here's how to manage them</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {inquiryStrategies.map((s, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border-2 ${s.critical ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border-2 border-current">
                      <AlertCircle className={`w-4 h-4 ${s.critical ? 'text-red-500' : 'text-slate-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{s.title}</p>
                        {s.critical && <Badge variant="error" className="text-xs flex-shrink-0">Critical</Badge>}
                      </div>
                      <p className="text-xs text-gray-600">{s.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credit Partners */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Using Credit Partners</h3>
                    <p className="text-sm opacity-80">Leverage stronger credit profiles to unlock more capital</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-600">
                  If your personal credit is preventing access to higher-tier programs, these strategies let you use someone else's credit strength — legally and strategically.
                </p>
                {creditPartnerStrategies.map((s, i) => (
                  <div key={i} className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <p className="font-semibold text-purple-900 text-sm">{s.title}</p>
                      <div className="flex gap-2">
                        <Badge variant="success" className="text-xs">{s.impact}</Badge>
                        <Badge variant="info" className="text-xs">{s.timeframe}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700">{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Wins */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Quick Wins — Do These First</h3>
                    <p className="text-sm opacity-80">Highest impact actions for your current profile</p>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { action: 'Review all 3 personal credit reports for errors', why: 'Errors appear on 1 in 3 reports — disputes can gain 20–50 points in 30 days', time: '1–2 weeks', url: 'https://www.annualcreditreport.com', external: true },
                  { action: 'Pay down any cards above 30% utilization', why: 'Utilization is 30% of your FICO — fastest score lever available', time: 'Immediate', url: null, external: false },
                  { action: 'Set up autopay on all accounts', why: 'Payment history is 35% of FICO — one missed payment can drop 50–100 points', time: '1 day', url: null, external: false },
                  { action: 'Complete Entity & Filings module', why: 'Foundation for all 5 business credit bureau files', time: '1–2 hours', url: '/app/lender-compliance/entity-filings', external: false },
                  { action: 'Complete Agencies & NAICS to get DUNS number', why: 'Required to establish D&B file — needed for SBA and corporate vendor credit', time: '1–2 hours', url: '/app/lender-compliance/agencies-naics', external: false },
                  { action: 'Add 2–3 NET-30 vendor accounts', why: 'Fastest way to build PAYDEX to 80 — 90 days of on-time payments', time: '1 day to apply', url: '/app/building-credit', external: false },
                ].map((w, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                    <div className="w-7 h-7 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-900 text-sm mb-0.5">{w.action}</p>
                      <p className="text-xs text-gray-600 mb-2">{w.why}</p>
                      <p className="text-xs text-gray-400">⏱ {w.time}</p>
                    </div>
                    {w.url && (
                      w.external
                        ? <a href={w.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                              Open <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </a>
                        : <Link to={w.url}>
                            <Button size="sm" variant="outline" className="text-xs whitespace-nowrap flex-shrink-0">
                              Go <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
