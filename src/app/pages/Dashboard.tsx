// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ MISSION CONTROL DASHBOARD
// Per Elon's spec: 5 Hero Cards + Premium "Tesla/Stripe" aesthetic
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'motion/react';
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Clock,
  Target,
  ChevronRight,
  Building2,
  CreditCard,
  Shield,
  FileText,
  Lock,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { 
  getBusinessProfile, 
  getAllAuditItems,
  getOverallProgress 
} from '../utils/businessData';
import { computeScore, getBand, computeExtendedResults } from './business-assessment/engine';
import { getDataItem } from '../lib/data-adapter';
import { useAuth } from '../contexts/AuthContext';
import type { UnifiedAnswers } from './business-assessment/types';
import { BadgeStrip, BadgeToastContainer } from '../components/BadgeGrid';
import { checkAndAwardBadges, syncBadgesFromCloud, recordInitialScore, getInitialScore } from '../lib/badges';
import { getPreQualifiedPrograms } from '../utils/fundingEligibility';
import { evaluateProducts } from './business-assessment/productEligibility';
import { getPipelineCounts, type PipelineCounts } from '../lib/funding-service';
import { complianceModules, getComplianceProgress } from '../utils/lenderComplianceModules';

// ════════════════════════════════════════════════════════════════════════════════
// STATUS SYSTEM - Matches Elon's 5-tier progression
// ════════════════════════════════════════════════════════════════════════════════

type StatusTier = 'Unprepared' | 'Fundable' | 'Progressing' | 'Bankable' | 'Elite';

interface StatusInfo {
  tier: StatusTier;
  color: string;
  bgColor: string;
  capitalRange: string;
  description: string;
}

function getStatusInfo(bankableScore: number): StatusInfo {
  // Using FundReady design system colors
  if (bankableScore < 80) {
    return {
      tier: 'Unprepared',
      color: 'var(--destructive)', // #b04428
      bgColor: 'var(--destructive-bg)',
      capitalRange: '$0',
      description: 'Foundation building required'
    };
  } else if (bankableScore < 160) {
    return {
      tier: 'Fundable',
      color: 'var(--warning)', // #c89020
      bgColor: 'var(--warning-bg)',
      capitalRange: '$10K - $100K',
      description: 'Alternative capital eligible'
    };
  } else if (bankableScore < 190) {
    return {
      tier: 'Progressing',
      color: 'var(--warning)', // #c89020
      bgColor: 'var(--warning-bg)',
      capitalRange: '$100K - $500K',
      description: 'Growing bankability'
    };
  } else if (bankableScore < 210) {
    return {
      tier: 'Bankable',
      color: 'var(--success)', // #10b981
      bgColor: 'var(--success-bg)',
      capitalRange: '$500K - $1.5M',
      description: 'Bank capital eligible'
    };
  } else {
    return {
      tier: 'Elite',
      color: 'var(--primary)', // #8ab820
      bgColor: 'var(--primary-bg)',
      capitalRange: '$1.5M+',
      description: 'Premium borrower status'
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// CAPITAL PROJECTION SYSTEM
// ════════════════════════════════════════════════════════════════════════════════

// Parse product maxAmount strings like '$5M', '$500K', '$1M+', '$250K' → number
function parseMaxAmount(str: string): number {
  const s = str.replace(/[$,+\s]/g, '').toUpperCase();
  if (s.endsWith('M')) return parseFloat(s) * 1_000_000;
  if (s.endsWith('K')) return parseFloat(s) * 1_000;
  return parseInt(s) || 0;
}

// Compute real capital potential from actual qualifying products.
// Returns: { highest (top high-confidence product, revenue-capped), count, productLabel, confidenceLabel, isHighConfidence }
function computeRealCapital(assessment: UnifiedAnswers | null, score: number): {
  total: number; highest: number; count: number;
  productLabel: string; confidenceLabel: string; isHighConfidence: boolean;
} {
  if (!assessment) return { total: 0, highest: 0, count: 0, productLabel: '', confidenceLabel: '', isHighConfidence: false };
  const products = evaluateProducts(assessment, score);
  const eligible = products.filter(p => p.qualifies);
  if (eligible.length === 0) return { total: 0, highest: 0, count: 0, productLabel: '', confidenceLabel: '', isHighConfidence: false };

  // Revenue-based cap — prevents $5M Equipment Financing from appearing as
  // the headline number for a user doing $5K–$10K/month in revenue.
  const revenueMap: Record<string, number> = {
    under_5k: 2500, '5k_15k': 10000, '15k_40k': 27500, '40k_100k': 70000, over_100k: 125000,
  };
  const monthlyRev = revenueMap[(assessment as any).monthlyRevenue] || 0;
  const annualRev = monthlyRev * 12;

  const cappedAmt = (p: { maxAmount: string; category: string }) => {
    const raw = parseMaxAmount(p.maxAmount);
    if (annualRev === 0) return raw;
    // Asset-based products (equipment, PO, AR) can exceed annual revenue; working capital capped tighter
    const multiplier = p.category === 'Asset-Based' ? 4 : 2;
    return Math.min(raw, annualRev * multiplier);
  };

  // Prefer High confidence products for the headline dollar amount
  const highConf = eligible.filter(p => p.confidence === 'High');
  const medConf  = eligible.filter(p => p.confidence === 'Medium');
  const headlinePool = highConf.length > 0 ? highConf : medConf;
  const isHighConfidence = highConf.length > 0;

  // Find top capped amount inside the headline pool
  let topProduct = headlinePool[0];
  let highestCapped = 0;
  for (const p of headlinePool) {
    const capped = cappedAmt(p);
    if (capped > highestCapped) { highestCapped = capped; topProduct = p; }
  }

  const confidenceLabel = isHighConfidence
    ? `${highConf.length} high-confidence product${highConf.length !== 1 ? 's' : ''}`
    : `${medConf.length} product${medConf.length !== 1 ? 's' : ''} estimated`;

  return {
    total: eligible.map(p => parseMaxAmount(p.maxAmount)).reduce((a, b) => a + b, 0),
    highest: highestCapped,
    count: eligible.length,
    productLabel: topProduct?.name || '',
    confidenceLabel,
    isHighConfidence,
  };
}

// Fallback for when no assessment exists — score-band baseline
function scoreToAmount(score: number): number {
  if (score < 300) return 0;
  if (score < 500) return 10000;
  if (score < 600) return 50000;
  if (score < 700) return 150000;
  if (score < 800) return 350000;
  if (score < 900) return 750000;
  return 1500000;
}

// Maps audit item category → the correct app section to fix it
function getBlockerRoute(category: string): string {
  switch (category) {
    case 'credit-agencies':
    case 'owners-credibility':
      return '/app/status-reports';
    case 'business-credit':
      return '/app/status-reports';
    case 'business-documentation':
      return '/app/document-collection';
    case 'business-setup':
    case 'business-credibility':
    case 'lender-compliance':
    default:
      return '/app/lender-compliance';
  }
}

interface CapitalMilestone {
  label: string;
  days: number;
  amount: number;
  score: number;
  color: string;
}

function projectCapital(currentScore: number, blockerCount: number): CapitalMilestone[] {
  // Realistic progression based on completing blockers
  const scoreGainPer30Days = Math.min(blockerCount * 8, 40); // ~8 points per blocker, max 40/month

  const today = currentScore;
  const at30 = Math.min(today + scoreGainPer30Days, 1000);
  const at60 = Math.min(at30 + scoreGainPer30Days * 0.8, 1000);
  const at90 = Math.min(at60 + scoreGainPer30Days * 0.6, 1000);
  const at180 = Math.min(at90 + scoreGainPer30Days * 1.2, 1000);

  return [
    { label: 'Today', days: 0, amount: scoreToAmount(today), score: today, color: '#64748b' },
    { label: '30d', days: 30, amount: scoreToAmount(at30), score: at30, color: '#f59e0b' },
    { label: '60d', days: 60, amount: scoreToAmount(at60), score: at60, color: '#f97316' },
    { label: '90d', days: 90, amount: scoreToAmount(at90), score: at90, color: '#22c55e' },
    { label: '180d', days: 180, amount: scoreToAmount(at180), score: at180, color: '#10b981' },
  ];
}

// ════════════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

function formatMoney(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount}`;
}

// ════════════════════════════════════════════════════════════════════════════════
// DIMENSION STATUS SYSTEM — FFP-inspired Priority/Strong/Growing labels
// ════════════════════════════════════════════════════════════════════════════════

function getDimStatus(score: number) {
  if (score < 0.2) return { label: 'Barrier', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
  if (score < 0.4) return { label: 'Weak', color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)' };
  if (score < 0.6) return { label: 'Growing', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
  if (score < 0.8) return { label: 'Strong', color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' };
  return { label: 'Bankable', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' };
}

const DIM_CONFIG = [
  {
    key: 'P', label: 'Personal Credit', Icon: CreditCard,
    actions: {
      barrier: 'Check all 3 bureaus for errors — dispute inaccurate items immediately',
      weak: 'Pay down high-balance cards to get utilization below 30%',
      growing: 'Avoid new hard inquiries for 6 months to let your score recover',
      strong: 'Keep utilization below 10% and maintain zero late payments',
    },
  },
  {
    key: 'B', label: 'Business Profile', Icon: Building2,
    actions: {
      barrier: 'Register as LLC or Corp and get an EIN — sole proprietors face heavy lender scrutiny',
      weak: 'Build a professional website and dedicated business email address',
      growing: 'Establish 411 listing and Google Business Profile for NAP verification',
      strong: 'Ensure all filings are current and business address is consistent everywhere',
    },
  },
  {
    key: 'F', label: 'Financial Health', Icon: TrendingUp,
    actions: {
      barrier: 'Open a dedicated business bank account — required for every capital product',
      weak: 'Eliminate NSF events by keeping a $5K minimum buffer at all times',
      growing: 'Grow monthly deposits consistently to $15K+ for 3 consecutive months',
      strong: 'Maintain 3+ months of average daily balance above $25K',
    },
  },
  {
    key: 'C', label: 'Compliance', Icon: Shield,
    actions: {
      barrier: 'Resolve your tax lien or establish an IRS payment plan — this blocks all bank products',
      weak: 'File any overdue business tax returns before applying for capital',
      growing: 'Obtain all required industry licenses and permits',
      strong: 'Verify no active judgments, liens, or collections appear on business record',
    },
  },
  {
    key: 'S', label: 'Stability', Icon: Clock,
    actions: {
      barrier: 'Business is under 6 months — focus on documentation for 90 days before applying',
      weak: 'Show 2+ consecutive months of consistent revenue to signal stability',
      growing: 'Reach 12 months in business to unlock traditional lender products',
      strong: 'Document 2+ years of revenue growth to qualify for SBA loans',
    },
  },
  {
    key: 'N', label: 'Documentation', Icon: FileText,
    actions: {
      barrier: 'File your business tax returns — missing returns disqualify you from 90% of products',
      weak: 'Prepare a current P&L statement dated within the last 60 days',
      growing: 'Compile 12 months of business bank statements into one package',
      strong: 'Complete document folder: returns, P&L, bank statements, EIN, licenses — ready to send',
    },
  },
];

function getDimAction(key: string, score: number, dimConfig: typeof DIM_CONFIG): string {
  const dim = dimConfig.find(d => d.key === key);
  if (!dim) return '';
  if (score < 0.2) return dim.actions.barrier;
  if (score < 0.4) return dim.actions.weak;
  if (score < 0.6) return dim.actions.growing;
  return dim.actions.strong;
}

// ════════════════════════════════════════════════════════════════════════════════
// GAUGE HELPERS
// ════════════════════════════════════════════════════════════════════════════════

function describeArc(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(startDeg + sweepDeg));
  const y2 = cy + r * Math.sin(toRad(startDeg + sweepDeg));
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function getGaugeColor(score: number) {
  if (score < 200) return '#ef4444';
  if (score < 400) return '#f97316';
  if (score < 600) return '#f59e0b';
  if (score < 800) return '#22c55e';
  return '#10b981';
}

function getNextMilestone(score: number) {
  if (score < 300) return { label: 'First Capital', pts: 300 - score };
  if (score < 500) return { label: 'Alt. Capital', pts: 500 - score };
  if (score < 700) return { label: 'Capital Ready', pts: 700 - score };
  if (score < 800) return { label: 'Bankable', pts: 800 - score };
  if (score < 900) return { label: 'Elite Status', pts: 900 - score };
  return null;
}

function getLockedCapital(score: number) {
  if (score < 300) return '$500K+';
  if (score < 500) return '$300K+';
  if (score < 700) return '$150K+';
  if (score < 800) return '$100K+';
  return null;
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fundScore, setFundScore] = useState(0);
  const [bankableScore, setBankableScore] = useState(0);
  const [scoreBand, setScoreBand] = useState({ name: 'Not Assessed', color: '#64748b' });
  const [hasAssessment, setHasAssessment] = useState(false);
  const [dimAvg, setDimAvg] = useState<Record<string, number>>({});
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when data changes
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('fundready_welcomed'));
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [pipelineCounts, setPipelineCounts] = useState<PipelineCounts>({ applied: 0, under_review: 0, offer_received: 0, accepted: 0, funded: 0, declined: 0, total: 0 });
  const [napScore, setNapScore] = useState(0);
  const [storedAssessment, setStoredAssessment] = useState<UnifiedAnswers | null>(null);

  const dismissWelcome = () => {
    localStorage.setItem('fundready_welcomed', '1');
    setShowWelcome(false);
  };

  // Load scores from Supabase (if logged in) or localStorage
  useEffect(() => {
    const loadScores = async () => {
      // Increment refresh key to force recalculation of audit items
      setRefreshKey(prev => prev + 1);
      try {
        // Sync badges from Supabase for logged-in users (keeps localStorage up-to-date)
        if (user) {
          await syncBadgesFromCloud();
        }

        // Try to load from Supabase first if user is logged in
        let assessmentJson = null;

        if (user) {
          assessmentJson = await getDataItem('unified_assessment');
        } else {
          assessmentJson = localStorage.getItem('unified_assessment');
        }

        if (assessmentJson) {
          const assessmentData = JSON.parse(assessmentJson) as UnifiedAnswers;

          // Use the same engine as Results page for consistent scoring
          const scoreResult = computeScore(assessmentData);
          const extendedResults = computeExtendedResults(assessmentData);
          const band = getBand(scoreResult.score);

          const bs = extendedResults.sbssScore ?? Math.round(scoreResult.score * 0.18);
          setFundScore(scoreResult.score);
          setDimAvg(scoreResult.dimAvg || {});
          setBankableScore(bs);
          setScoreBand(band);
          setNapScore(scoreResult.napScore || 0);
          setStoredAssessment(assessmentData);
          setHasAssessment(true);

          // Load funding pipeline counts
          getPipelineCounts().then(setPipelineCounts).catch(() => {});

          const resultsViewed = localStorage.getItem('fundready_results_viewed') === '1';

          // Record initial score baseline for Score Climber badge (once, never overwritten)
          recordInitialScore(scoreResult.score);

          // Build compliance + pipeline context for action-based badges
          const complianceProgressSnapshot = getComplianceProgress();
          const completedModuleCount = complianceModules.filter(
            (m) => complianceProgressSnapshot[m.id]?.completed
          ).length;

          // Award any newly-earned badges
          const pipeSnap = await getPipelineCounts().catch(() => ({ total: 0, funded: 0 } as any));
          const newly = checkAndAwardBadges({
            hasAssessment: true,
            score: scoreResult.score,
            bankableScore: bs,
            dimAvg: scoreResult.dimAvg || {},
            resultsViewed,
            completedModuleCount,
            totalApplications: pipeSnap.total ?? 0,
            fundedCount: pipeSnap.funded ?? 0,
            initialScore: getInitialScore(),
          });
          if (newly.length > 0) setNewBadgeIds(newly);
        }
      } catch (error) {
        console.error('Error loading scores:', error);
      }
    };
    
    loadScores();

    // Listen for updates
    const handleUpdate = () => loadScores();
    window.addEventListener('fundscoreUpdated', handleUpdate);
    window.addEventListener('auditItemUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('fundingPipelineUpdated', handleUpdate);
    return () => {
      window.removeEventListener('fundscoreUpdated', handleUpdate);
      window.removeEventListener('auditItemUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fundingPipelineUpdated', handleUpdate);
    };
  }, [user]);

  // Get audit items for blockers/actions (using severity classification)
  // These are calculated fresh on each render, which means they update when state changes trigger re-render
  const allItems = getAllAuditItems();
  const incompleteItems = allItems.filter(i => i.status !== 'complete');
  
  // Hard blockers first (auto-decline issues), then suppressors
  const hardBlockers = incompleteItems
    .filter(i => i.severity === 'hard_blocker')
    .sort((a, b) => (b.ficoImpact || 0) - (a.ficoImpact || 0));
  
  const suppressors = incompleteItems
    .filter(i => i.severity === 'suppressor')
    .sort((a, b) => (b.ficoImpact || 0) - (a.ficoImpact || 0));
  
  // Critical blockers = hard blockers + top suppressors (total 5)
  const criticalBlockers = [...hardBlockers, ...suppressors].slice(0, 5);
  
  // Top actions = all incomplete sorted by impact
  const topActions = incompleteItems
    .sort((a, b) => (b.ficoImpact || 0) - (a.ficoImpact || 0))
    .slice(0, 4);

  // Status and capital projections
  const statusInfo = getStatusInfo(bankableScore);
  const capitalPath = projectCapital(fundScore, criticalBlockers.length);
  const distanceToBankable = Math.max(0, 160 - bankableScore);

  // Progress stats
  const progress = getOverallProgress();

  const firstName = user?.user_metadata?.first_name
    || storedAssessment?.ownerName
    || storedAssessment?.businessName
    || user?.email?.split('@')[0]
    || 'there';
  const emailVerified = user?.email_confirmed_at;

  // Gauge math
  const CX = 110, CY = 108, R = 82;
  const SWEEP = 270;
  const arcLen = 2 * Math.PI * R * (SWEEP / 360);
  const bgArcPath = describeArc(CX, CY, R, 225, SWEEP);
  const fillOffset = arcLen * (1 - Math.min(fundScore / 1000, 1));
  const gaugeColor = getGaugeColor(fundScore);
  const nextMilestone = getNextMilestone(fundScore);
  const lockedCapital = getLockedCapital(fundScore);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const DIM_ORDER = ['P', 'B', 'F', 'C', 'S', 'N'];
  const DIM_LABELS: Record<string, string> = { P: 'Personal Credit', B: 'Business Profile', F: 'Financial Health', C: 'Compliance', S: 'Stability', N: 'Documentation' };
  const preQualPrograms = getPreQualifiedPrograms();
  // Real capital potential from actual qualifying products — replaces static scoreToAmount lookup
  const realCapital = computeRealCapital(storedAssessment, fundScore);
  const capitalDisplay = realCapital.highest > 0 ? realCapital.highest : scoreToAmount(fundScore);
  const FEATURED_PROGRAMS = [
    { path: '/app/access-funding/business-credit-line', label: 'Business Credit Line', range: '$10K–$250K', icon: '💳' },
    { path: '/app/access-funding/revenue-based-loan', label: 'Revenue-Based Loan', range: '$5K–$500K', icon: '📈' },
    { path: '/app/access-funding/sba-business-loan', label: 'SBA Loans 7a & 504', range: '$50K–$5M', icon: '🏛️' },
    { path: '/app/access-funding/equipment-financing', label: 'Equipment Financing', range: '$5K–$5M', icon: '🔧' },
    { path: '/app/access-funding/merchant-advance', label: 'Merchant Advance', range: '$5K–$500K', icon: '⚡' },
    { path: '/app/access-funding/working-capital-loans', label: 'Working Capital', range: '$10K–$500K', icon: '💰' },
  ].slice(0, 3);
  const topBlocker = criticalBlockers[0];

  return (
    <div
      className="flex-1 min-h-screen overflow-auto"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {showWelcome && <WelcomeModal name={firstName} onDismiss={dismissWelcome} onNavigate={navigate} />}
      <BadgeToastContainer newBadgeIds={newBadgeIds} />

      {user && !emailVerified && (
        <div style={{ background: 'linear-gradient(135deg,#fef3c7,#fde68a)', borderBottom: '1px solid #f59e0b', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400e' }}>📧 Verify your email to save your FundScore and unlock your full capital report</span>
          <button onClick={() => navigate('/app/settings')} style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', background: 'rgba(146,64,14,0.12)', border: '1px solid rgba(146,64,14,0.25)', borderRadius: '6px', padding: '5px 14px', cursor: 'pointer' }}>Verify Now →</button>
        </div>
      )}
      <div style={{ padding: '32px 28px 48px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Good {timeOfDay}, {firstName}
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 34px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              Mission Control
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button onClick={() => navigate('/app/my-progress')} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
              My Progress
            </button>
            <button onClick={() => navigate('/business-assessment/results')} style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
              Full Report →
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════ */}

        {/* ── NO ASSESSMENT STATE ─────────────────────────────────────────────── */}
        {!hasAssessment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', padding: '60px 32px', background: 'var(--card)', border: '2px dashed var(--border)', borderRadius: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--foreground)', marginBottom: '10px' }}>Discover Your FundScore</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--muted-foreground)', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              33 questions · 10 minutes · See exactly where you stand with lenders and what capital you can access today.
            </p>
            <button onClick={() => navigate('/business-assessment')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', padding: '14px 32px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', boxShadow: '0 6px 20px rgba(16,185,129,0.3)' }}>
              Start Free Assessment →
            </button>
          </motion.div>
        )}

        {/* ── ASSESSED LAYOUT ────────────────────────────────────────────────── */}
        {hasAssessment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

            {/* ROW 1: CAPITAL POTENTIAL + PRIORITY ACTION — identity first, then action */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px, 270px) 1fr', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>

              {/* CAPITAL POTENTIAL CARD — dollar-first */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Hero: dollar number */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {capitalDisplay > 0 ? (
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 44px)', color: gaugeColor, lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {formatMoney(capitalDisplay)}
                        </div>
                        {realCapital.count > 0 && (
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                            <span style={{ fontWeight: 700, color: realCapital.isHighConfidence ? gaugeColor : '#f59e0b' }}>
                              {realCapital.confidenceLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '38px', color: '#ef4444', lineHeight: 1 }}>
                        $0
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px', fontWeight: 500 }}>
                      {realCapital.count > 0 ? `Best pre-qualified: ${realCapital.productLabel}` : 'Estimated Capital Potential'}
                    </div>
                  </motion.div>
                </div>

                {/* FundScore bar */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600 }}>FundScore</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: gaugeColor }}>{fundScore}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>/ 1,000</span>
                    </div>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: Math.min((fundScore / 1000) * 100, 100) + '%' }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                      style={{ height: '100%', background: `linear-gradient(90deg, ${gaugeColor}99, ${gaugeColor})`, borderRadius: '99px' }}
                    />
                  </div>
                  {/* Milestone labels — real product tier thresholds */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    {[{ v: 300, l: 'Alt Cap' }, { v: 500, l: 'Working Capital' }, { v: 700, l: 'Term Loans' }, { v: 900, l: 'SBA/Bank' }].map(m => (
                      <div key={m.v} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: fundScore >= m.v ? gaugeColor : 'var(--muted-foreground)', fontWeight: fundScore >= m.v ? 700 : 400, opacity: fundScore >= m.v ? 1 : 0.5 }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FICO SBSS Bankable Score — The Primary Goal */}
                {(() => {
                  const sbssTier = bankableScore >= 210 ? { label: 'Excellent', color: '#10b981', msg: 'You qualify for all bank and SBA products' }
                    : bankableScore >= 190 ? { label: 'Good', color: '#22c55e', msg: 'Bank-grade products are within reach' }
                    : bankableScore >= 160 ? { label: 'Fair', color: '#f59e0b', msg: 'You have reached minimum bankable threshold' }
                    : { label: 'Poor', color: '#ef4444', msg: `${160 - bankableScore} points away from bank approval` };
                  const sbssPct = Math.min((bankableScore / 300) * 100, 100);
                  const thresholdPct = (160 / 300) * 100;
                  return (
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      {/* Header row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Target size={11} style={{ color: '#3b82f6' }} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bank Readiness Score</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: sbssTier.color }}>{bankableScore}</span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>/300</span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'white', background: sbssTier.color, borderRadius: '4px', padding: '1px 6px', marginLeft: '2px' }}>{sbssTier.label}</span>
                        </div>
                      </div>
                      {/* What this means */}
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: sbssTier.color, fontWeight: 600, marginBottom: '8px' }}>
                        {sbssTier.msg}
                      </div>
                      {/* SBSS bar with 160 threshold marker */}
                      <div style={{ position: 'relative', height: '7px', background: 'var(--border)', borderRadius: '99px', overflow: 'visible' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: sbssPct + '%' }}
                          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                          style={{ height: '100%', background: `linear-gradient(90deg, ${sbssTier.color}99, ${sbssTier.color})`, borderRadius: '99px', position: 'absolute', top: 0, left: 0 }}
                        />
                        {/* 160 threshold marker */}
                        <div style={{ position: 'absolute', top: '-3px', left: `${thresholdPct}%`, width: '2px', height: '13px', background: '#3b82f6', borderRadius: '2px', transform: 'translateX(-50%)' }} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>Poor (0–159)</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#3b82f6', fontWeight: 700 }}>↑ 160 = Bank Approval</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>Excellent (300)</span>
                      </div>
                      {/* Footer explanation */}
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(59,130,246,0.15)', fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                        Banks use this 0–300 scale to approve business loans. Scores below 160 are typically declined by banks and the SBA.
                      </div>
                    </div>
                  );
                })()}

                {/* Status tier + next milestone */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: gaugeColor + '15', border: '1px solid ' + gaugeColor + '40' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: gaugeColor }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', color: gaugeColor }}>{statusInfo.tier}</span>
                  </div>
                  {nextMilestone && (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                      <span style={{ fontWeight: 700, color: gaugeColor }}>+{nextMilestone.pts} pts</span> → {nextMilestone.label}
                    </span>
                  )}
                </div>

                {/* Blocker count */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  {criticalBlockers.length > 0 ? (
                    <>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                        <span style={{ fontWeight: 700, color: '#f59e0b' }}>{criticalBlockers.length} blocker{criticalBlockers.length !== 1 ? 's' : ''}</span> limiting your potential
                      </span>
                      <button onClick={() => navigate('/app/my-progress')} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', whiteSpace: 'nowrap' }}>
                        See all →
                      </button>
                    </>
                  ) : (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                      No blockers · Full potential unlocked
                    </span>
                  )}
                </div>
              </div>

              {/* NEXT RED X */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    ⚡ Priority Action
                  </p>
                  {lockedCapital && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <Lock size={11} style={{ color: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>{lockedCapital} locked</span>
                    </div>
                  )}
                </div>

                {topBlocker ? (
                  <>
                    {/* Main blocker */}
                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '19px', color: 'var(--foreground)', marginBottom: '6px', lineHeight: 1.2 }}>{topBlocker.title}</h2>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '12px' }}>
                        {topBlocker.description || 'Fixing this unlocks the next tier of capital products for your business.'}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        {topBlocker.ficoImpact ? (
                          <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>+{topBlocker.ficoImpact} score pts</span>
                          </div>
                        ) : null}
                        {(() => {
                          const unlockAmount = scoreToAmount(fundScore + (topBlocker.ficoImpact || 0)) - scoreToAmount(fundScore);
                          return unlockAmount > 0 ? (
                            <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#ef4444' }}>Unlocks {formatMoney(unlockAmount)}</span>
                            </div>
                          ) : null;
                        })()}
                        <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#3b82f6' }}>
                            {topBlocker.severity === 'hard_blocker' ? '⛔ Blocks all lenders' : '~15 min to fix'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => navigate(getBlockerRoute(topBlocker.category))} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '11px 22px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>
                        Fix This Now <ArrowRight size={14} />
                      </button>
                    </div>

                    {/* Other blockers list */}
                    {criticalBlockers.length > 1 && (
                      <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                          Also blocking you ({criticalBlockers.length - 1} more)
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {criticalBlockers.slice(1, 4).map((blocker, idx) => (
                            <div
                              key={idx}
                              onClick={() => navigate(getBlockerRoute(blocker.category))}
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)', cursor: 'pointer', gap: '10px' }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: blocker.severity === 'hard_blocker' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blocker.title}</span>
                              </div>
                              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>
                                {blocker.ficoImpact ? `+${blocker.ficoImpact} pts` : 'Fix →'}
                              </span>
                            </div>
                          ))}
                        </div>
                        {criticalBlockers.length > 4 && (
                          <button onClick={() => navigate('/app/my-progress')} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', marginTop: '4px' }}>
                            + {criticalBlockers.length - 4} more blockers →
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle2 size={28} style={{ color: '#10b981' }} />
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--foreground)' }}>No critical blockers!</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)' }}>You are ready to apply for capital. Review qualifying products below.</div>
                      </div>
                    </div>
                    <button onClick={() => navigate('/app/access-funding')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
                      View Funding Options <ArrowRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ROW 1.5: CAPITAL PROJECTION TIMELINE */}
            {capitalPath.some(m => m.amount > capitalPath[0].amount) && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)', margin: 0 }}>
                      📈 Your Capital Trajectory
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', margin: '2px 0 0' }}>
                      Projected if you fix your top {criticalBlockers.length} blockers
                    </p>
                  </div>
                  <button onClick={() => navigate('/app/my-progress')} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                    Full plan →
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {capitalPath.map((milestone, i) => {
                    const isGrowth = milestone.amount > capitalPath[0].amount;
                    const isToday = i === 0;
                    return (
                      <div key={milestone.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '10px', background: isToday ? 'var(--background)' : milestone.amount > capitalPath[0].amount ? milestone.color + '10' : 'var(--background)', border: '1px solid ' + (isToday ? 'var(--border)' : isGrowth ? milestone.color + '40' : 'var(--border)'), position: 'relative' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px', color: isToday ? 'var(--foreground)' : isGrowth ? milestone.color : 'var(--muted-foreground)', marginBottom: '3px' }}>
                          {milestone.amount > 0 ? formatMoney(milestone.amount) : '$0'}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: isToday ? 700 : 400 }}>
                          {milestone.label}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: milestone.color, marginTop: '2px', fontWeight: 600 }}>
                          {Math.round(milestone.score)} pts
                        </div>
                        {!isToday && milestone.amount > capitalPath[i - 1].amount && (
                          <div style={{ position: 'absolute', top: '50%', left: '-5px', transform: 'translateY(-50%)', fontSize: '10px', color: milestone.color }}>▶</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── YOUR CAPITAL ROADMAP — context after user knows their status ── */}
            {(() => {
              const isBankable = bankableScore >= 160;

              // ── Goal 01: Pre-Bankable Funding ─────────────────────────────
              // "Done" = user has ACTUALLY received or accepted funding via pipeline.
              // SBSS score alone does NOT complete this goal — SBSS measures creditworthiness,
              // not whether funding was obtained. Showing "Done" based on SBSS while
              // compliance is 0% creates a direct contradiction in the UI.
              const goal01Done = pipelineCounts.funded > 0 || pipelineCounts.accepted > 0;
              const goal01Metric = goal01Done
                ? `${pipelineCounts.funded + pipelineCounts.accepted} funding${(pipelineCounts.funded + pipelineCounts.accepted) !== 1 ? 's' : ''} received`
                : capitalDisplay > 0
                  ? `${formatMoney(capitalDisplay)} available · ${realCapital.count} product${realCapital.count !== 1 ? 's' : ''} ready`
                  : preQualPrograms.length > 0
                    ? `${preQualPrograms.length} program${preQualPrograms.length !== 1 ? 's' : ''} pre-qualified — apply now`
                    : 'Complete compliance modules to unlock products';

              // ── Goal 02: Become Bankable ──────────────────────────────────
              // "Done" = SBSS 160+ threshold crossed. This is correctly isolated.
              // SBSS is calculated from assessment answers (credit, revenue, age, entity)
              // and is independent of compliance module completion.

              // ── Goal 03: Bankable Funding ─────────────────────────────────
              // "Active" = SBSS >= 160. Correctly gated on bankability, not compliance.

              const phases = [
                {
                  num: '01',
                  title: 'Pre-Bankable Funding',
                  desc: 'Get funded now with non-bank programs — loan packaging included',
                  status: goal01Done ? 'complete' : 'active',
                  metric: goal01Metric,
                  color: '#10b981',
                  cta: '/app/access-funding',
                  ctaLabel: goal01Done ? 'View Funded' : capitalDisplay > 0 ? 'Apply Now' : 'See What You Qualify For',
                },
                {
                  num: '02',
                  title: 'Become Bankable',
                  desc: 'Reach FICO® SBSS 160+ to unlock bank loans and SBA programs',
                  status: isBankable ? 'complete' : 'active',
                  metric: isBankable ? `SBSS ${bankableScore}/300 ✓ — threshold crossed` : `SBSS ${bankableScore}/300 — ${160 - bankableScore} pts to 160`,
                  color: '#3b82f6',
                  cta: '/app/my-progress',
                  ctaLabel: isBankable ? 'View Score' : 'Fix My Blockers',
                },
                {
                  num: '03',
                  title: 'Bankable Funding',
                  desc: 'Larger loans, lower rates, longer repayment — the full capital stack',
                  status: isBankable ? 'active' : 'locked',
                  metric: isBankable ? `Full access unlocked · 8–15% APR` : `Requires SBSS 160+ (${160 - bankableScore} pts away)`,
                  color: '#f59e0b',
                  cta: '/app/access-funding',
                  ctaLabel: 'Access Bank Products',
                },
              ];
              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                  {phases.map((phase, i) => {
                    const isComplete = phase.status === 'complete';
                    const isActive = phase.status === 'active';
                    const isLocked = phase.status === 'locked';
                    return (
                      <motion.div
                        key={phase.num}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        style={{
                          background: isActive ? `${phase.color}08` : 'var(--card)',
                          border: isActive ? `1.5px solid ${phase.color}35` : isComplete ? `1px solid ${phase.color}20` : '1px solid var(--border)',
                          borderRadius: '14px',
                          padding: '18px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          opacity: isLocked ? 0.55 : 1,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {isActive && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${phase.color}00, ${phase.color}, ${phase.color}00)` }} />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '11px', color: isLocked ? 'var(--muted-foreground)' : phase.color, letterSpacing: '0.08em' }}>
                            GOAL {phase.num}
                          </span>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '99px', background: isComplete ? `${phase.color}15` : isActive ? `${phase.color}12` : 'var(--border)', border: `1px solid ${isLocked ? 'transparent' : phase.color + '30'}` }}>
                            <span style={{ fontSize: '9px', fontWeight: 700, color: isLocked ? 'var(--muted-foreground)' : phase.color }}>
                              {isComplete ? '✓ Done' : isActive ? '● Active' : '🔒 Locked'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '14px', color: isLocked ? 'var(--muted-foreground)' : 'var(--foreground)', lineHeight: 1.2, marginBottom: '4px' }}>
                            {phase.title}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                            {phase.desc}
                          </div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: isLocked ? 'var(--muted-foreground)' : phase.color }}>
                          {phase.metric}
                        </div>
                        {isActive && (
                          <button
                            onClick={() => navigate(phase.cta)}
                            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', padding: '8px 14px', background: phase.color, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', marginTop: '2px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            {phase.ctaLabel} <ArrowRight size={12} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── LENDER COMPLIANCE — single unified bankability card ── */}
            {(() => {
              const complianceProgress = getComplianceProgress();
              const totalModules = complianceModules.length;
              const completedModules = complianceModules.filter(m => complianceProgress[m.id]?.completed).length;
              const compPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
              const nextModule = complianceModules.find(m => !complianceProgress[m.id]?.completed);
              const compColor = compPct === 100 ? '#10b981' : compPct >= 60 ? '#f59e0b' : '#3b82f6';
              const napUrgent = napScore < 80;
              const napColor = napScore >= 80 ? '#10b981' : napScore >= 60 ? '#f59e0b' : '#ef4444';

              // Segment label — Chase identity framing
              const statusLabel = compPct === 100 ? 'Lender-Ready' : compPct >= 60 ? 'In Progress' : 'Needs Action';

              return (
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>

                  {/* Header: identity framing — "You are X% bankable" */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                        Lender Compliance
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', lineHeight: 1.15 }}>
                        You are{' '}
                        <span style={{ color: compColor }}>{compPct}% bankable</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '3px' }}>
                        {completedModules} of {totalModules} compliance modules complete
                      </div>
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', flexShrink: 0,
                      padding: '4px 10px', borderRadius: '99px',
                      background: `${compColor}15`, border: `1px solid ${compColor}35`,
                    }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: compColor }}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Dominant progress bar */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${compPct}%`,
                        background: `linear-gradient(90deg, ${compColor}, ${compColor}cc)`,
                        borderRadius: '99px', transition: 'width 0.8s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>
                        {completedModules} complete
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>
                        {totalModules - completedModules} remaining
                      </span>
                    </div>
                  </div>

                  {/* Business Visibility row — compact always, urgent styling when <80 */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: '8px', marginBottom: '14px',
                    background: napUrgent ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.05)',
                    border: `1px solid ${napUrgent ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px' }}>{napUrgent ? '⚠️' : '✓'}</span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: napColor }}>
                        Business Visibility
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                        {napScore}/100 · NAP consistency
                      </span>
                    </div>
                    {napUrgent ? (
                      <button
                        onClick={() => navigate('/app/lender-compliance')}
                        style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}
                      >
                        Fix now →
                      </button>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                        Verified ✓
                      </span>
                    )}
                  </div>

                  {/* Hero CTA — one action, one benefit statement */}
                  {nextModule ? (
                    <button
                      onClick={() => navigate(`/app${nextModule.route}`)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.07), rgba(16,185,129,0.07))',
                        border: '1px solid rgba(59,130,246,0.22)', marginBottom: '10px',
                        transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6', marginBottom: '3px' }}>
                          Continue
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>
                          {nextModule.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
                          Est. 5 min · unlocks more funding programs
                        </div>
                      </div>
                      <ArrowRight size={18} style={{ color: '#3b82f6', flexShrink: 0 }} />
                    </button>
                  ) : (
                    <div style={{
                      padding: '14px 16px', borderRadius: '12px', marginBottom: '10px', textAlign: 'center',
                      background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                    }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: '#10b981' }}>
                        ✓ All compliance modules complete
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '3px' }}>
                        You're lender-ready — access funding now
                      </div>
                    </div>
                  )}

                  {/* Subtle escape hatch */}
                  <button
                    onClick={() => navigate('/app/lender-compliance')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                  >
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      View all {totalModules} modules
                    </span>
                    <ChevronRight size={11} color="var(--muted-foreground)" />
                  </button>
                </div>
              );
            })()}

            {/* ROW 2: CAPITAL ACCESS */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: pipelineCounts.total > 0 ? '14px' : '0' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>
                      {preQualPrograms.length > 0 ? '💰 Funding Pipeline' : '🔑 Capital Products'}
                    </h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '3px 0 0' }}>
                      {preQualPrograms.length > 0
                        ? `${preQualPrograms.length} pre-qualified · up to ${formatMoney(scoreToAmount(fundScore))} accessible today`
                        : 'Improve your score to unlock funding products'}
                    </p>
                  </div>
                  <button onClick={() => navigate('/app/access-funding')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--primary)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {pipelineCounts.total > 0 ? 'View Pipeline →' : `View All ${preQualPrograms.length > 0 ? preQualPrograms.length : ''} →`}
                  </button>
                </div>

                {/* Live pipeline strip — only shows once user has applied to something */}
                {pipelineCounts.total > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {[
                      { label: 'Applied', count: pipelineCounts.applied, color: '#3b82f6' },
                      { label: 'Reviewing', count: pipelineCounts.under_review, color: '#f59e0b' },
                      { label: 'Offers', count: pipelineCounts.offer_received, color: '#10b981', highlight: pipelineCounts.offer_received > 0 },
                      { label: 'Accepted', count: pipelineCounts.accepted, color: '#10b981' },
                      { label: 'Funded', count: pipelineCounts.funded, color: '#10b981' },
                    ].map((stage, i) => (
                      <div
                        key={stage.label}
                        onClick={() => navigate('/app/access-funding')}
                        style={{
                          padding: '8px 10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer',
                          background: stage.highlight ? `${stage.color}15` : 'var(--background)',
                          border: `1px solid ${stage.count > 0 ? stage.color + '30' : 'var(--border)'}`,
                          position: 'relative',
                        }}
                      >
                        {stage.highlight && stage.count > 0 && (
                          <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--card)' }} />
                        )}
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: stage.count > 0 ? stage.color : 'var(--muted-foreground)' }}>
                          {stage.count}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                          {stage.label}
                        </div>
                        {i < 4 && (
                          <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', fontSize: '8px', color: 'var(--muted-foreground)', zIndex: 1 }}>▶</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Offer alert */}
                {pipelineCounts.offer_received > 0 && (
                  <div onClick={() => navigate('/app/access-funding')} style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>💰</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: '#10b981' }}>
                      {pipelineCounts.offer_received} funding offer{pipelineCounts.offer_received !== 1 ? 's' : ''} waiting — tap to review
                    </span>
                    <ArrowRight size={13} style={{ color: '#10b981', marginLeft: 'auto' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {FEATURED_PROGRAMS.map((prog, i) => {
                  const isPreQual = preQualPrograms.some((p: { path: string }) => p.path === prog.path);
                  return (
                    <div key={prog.path} onClick={() => navigate(prog.path)} style={{ padding: '16px 20px', borderRight: i < 2 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--background)')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>{prog.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{prog.label}</span>
                            {isPreQual && <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>{prog.range}</div>
                          {(() => {
                            // Score threshold per product type
                            const thresholds: Record<string, number> = {
                              '/app/access-funding/business-credit-line': 450,
                              '/app/access-funding/revenue-based-loan': 400,
                              '/app/access-funding/sba-business-loan': 750,
                              '/app/access-funding/equipment-financing': 500,
                              '/app/access-funding/merchant-advance': 350,
                              '/app/access-funding/working-capital-loans': 450,
                            };
                            const threshold = thresholds[prog.path] || 500;
                            const ptsNeeded = Math.max(0, threshold - fundScore);
                            return (
                              <div style={{ marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: isPreQual ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', border: '1px solid ' + (isPreQual ? 'rgba(16,185,129,0.25)' : 'var(--border)') }}>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: isPreQual ? '#10b981' : 'var(--muted-foreground)' }}>
                                  {isPreQual ? 'Pre-Qualified ✓' : ptsNeeded === 0 ? 'Almost there' : `+${ptsNeeded} pts needed`}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ROW 3: READINESS + TOOLS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Readiness Breakdown</h3>
                  <button onClick={() => navigate('/app/my-progress')} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>Full detail →</button>
                </div>
                <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {DIM_ORDER.map((key, idx) => {
                    const val = (dimAvg as Record<string, number>)[key] ?? 0;
                    const st = getDimStatus(val);
                    const dim = DIM_CONFIG.find(d => d.key === key);
                    const Icon = dim ? dim.Icon : Zap;
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Icon size={13} style={{ color: st.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', flex: 1 }}>{DIM_LABELS[key]}</span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: st.color }}>{st.label}</span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', minWidth: '32px', textAlign: 'right' }}>{Math.round(val * 100)}%</span>
                        </div>
                        <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: (val * 100) + '%' }} transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.08 }} style={{ height: '100%', background: st.color, borderRadius: '99px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Quick actions — continue momentum, not redundant nav */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Quick Actions</p>
                {[
                  { label: '📊 View Capital Intelligence', desc: 'FundScore · SBSS · Funding range', path: '/app/status-reports', color: '#3b82f6' },
                  { label: '🛡️ Continue Compliance', desc: 'Work through your lender checklist', path: '/app/lender-compliance', color: '#10b981' },
                  { label: '💰 Access Funding', desc: `${preQualPrograms.length > 0 ? preQualPrograms.length + ' products pre-qualified' : 'See products you qualify for'}`, path: '/app/access-funding', color: '#f59e0b' },
                ].map(item => (
                  <div
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = item.color + '50')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{item.label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 4: ACHIEVEMENTS STRIP — compact, actionable, links to full page */}
            <BadgeStrip newBadgeIds={newBadgeIds} onViewAll={() => navigate('/app/my-progress')} />

          </motion.div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// WELCOME MODAL — FORGE™ 3-Step Onboarding
// Step 1: Goal selection (identity anchor)
// Step 2: 3 quick profile questions (credit · age · revenue)
// Step 3: Estimated starting position + single CTA
// ════════════════════════════════════════════════════════════════════════════════

function estimateStartingTier(creditRange: string, bizAge: string, revenue: string) {
  let pts = 0;
  if (creditRange === '740+') pts += 3; else if (creditRange === '670–739') pts += 2; else if (creditRange === '580–669') pts += 1;
  if (bizAge === '2+ years') pts += 3; else if (bizAge === '1–2 years') pts += 2; else pts += 1;
  if (revenue === '$40K+/mo') pts += 3; else if (revenue === '$10K–$40K/mo') pts += 2; else pts += 1;
  if (pts >= 7) return { tier: 'Bankable', range: '$250K – $1.5M+', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)', note: 'You may already qualify for SBA and bank products — take the full scan to confirm.', cta: '/business-assessment' };
  if (pts >= 5) return { tier: 'Approaching', range: '$50K – $500K', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', note: 'Alternative capital is likely available now. The scan will pinpoint your #1 blocker.', cta: '/business-assessment' };
  return { tier: 'Building', range: '$0 – $100K', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', note: 'Foundation work needed first. The scan builds your exact 90-day roadmap.', cta: '/business-assessment' };
}

function WelcomeModal({ name, onDismiss, onNavigate }: { name: string; onDismiss: () => void; onNavigate: (path: string) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [goal, setGoal] = useState('');
  const [creditRange, setCreditRange] = useState('');
  const [bizAge, setBizAge] = useState('');
  const [revenue, setRevenue] = useState('');

  const goals = [
    { id: 'fast', label: 'Get funded fast', sub: 'I need capital in the next 30–90 days', icon: '🚀', color: '#10b981' },
    { id: 'credit', label: 'Build credit & qualify for more', sub: 'I want better rates and bigger amounts', icon: '📈', color: '#3b82f6' },
    { id: 'sba', label: 'Qualify for SBA / bank loans', sub: 'I want traditional capital at bank rates', icon: '🏛️', color: '#8b5cf6' },
    { id: 'understand', label: 'Understand exactly where I stand', sub: 'Show me the full picture first', icon: '🎯', color: '#f59e0b' },
  ];

  const creditOptions = ['Under 580', '580–669', '670–739', '740+'];
  const ageOptions = ['Under 1 year', '1–2 years', '2+ years'];
  const revenueOptions = ['Under $10K/mo', '$10K–$40K/mo', '$40K+/mo'];

  const canAdvance2 = creditRange && bizAge && revenue;
  const tier = (step === 3 && canAdvance2) ? estimateStartingTier(creditRange, bizAge, revenue) : null;

  const TOTAL_STEPS = 3;
  const progressPct = ((step - 1) / TOTAL_STEPS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--background)', borderRadius: '22px', overflow: 'hidden', width: '100%', maxWidth: '500px', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}
      >
        {/* Progress bar */}
        <div style={{ height: '3px', background: 'var(--border)' }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '99px' }} />
        </div>

        {/* ── STEP 1: Goal selection ───────────────────────────────────────── */}
        {step === 1 && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', padding: '28px 28px 24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>👋</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'white', lineHeight: 1.2, marginBottom: '6px' }}>
                Welcome{name ? `, ${name}` : ' to FundReady™'}!
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
                What's your #1 goal right now?
              </p>
            </div>
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {goals.map(g => (
                <div
                  key={g.id}
                  onClick={() => { setGoal(g.id); setStep(2); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                    borderRadius: '12px', cursor: 'pointer',
                    background: goal === g.id ? `${g.color}10` : 'var(--card)',
                    border: `1px solid ${goal === g.id ? g.color + '40' : 'var(--border)'}`,
                    transition: 'all 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = g.color + '60'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = goal === g.id ? g.color + '40' : 'var(--border)'}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: g.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {g.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>{g.label}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{g.sub}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                </div>
              ))}
              <button onClick={onDismiss} style={{ marginTop: '4px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}>
                Skip for now →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: 3 quick profile questions ──────────────────────────── */}
        {step === 2 && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', padding: '24px 28px 20px' }}>
              <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', cursor: 'pointer', marginBottom: '12px' }}>← Back</button>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'white', lineHeight: 1.2, marginBottom: '6px' }}>Quick profile — 3 questions</h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0 }}>Takes 30 seconds · Gets you a real starting estimate</p>
            </div>
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Q1: Credit range */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '8px' }}>1. Your personal credit score range?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {creditOptions.map(opt => (
                    <button key={opt} onClick={() => setCreditRange(opt)} style={{ padding: '9px 12px', borderRadius: '9px', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: creditRange === opt ? 'rgba(59,130,246,0.12)' : 'var(--card)', border: `1px solid ${creditRange === opt ? '#3b82f6' : 'var(--border)'}`, color: creditRange === opt ? '#3b82f6' : 'var(--foreground)', transition: 'all 0.12s' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {/* Q2: Business age */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '8px' }}>2. How long has your business been operating?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {ageOptions.map(opt => (
                    <button key={opt} onClick={() => setBizAge(opt)} style={{ padding: '9px 8px', borderRadius: '9px', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: bizAge === opt ? 'rgba(139,92,246,0.12)' : 'var(--card)', border: `1px solid ${bizAge === opt ? '#8b5cf6' : 'var(--border)'}`, color: bizAge === opt ? '#8b5cf6' : 'var(--foreground)', transition: 'all 0.12s', lineHeight: 1.3 }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              {/* Q3: Monthly revenue */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '8px' }}>3. Average monthly revenue?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  {revenueOptions.map(opt => (
                    <button key={opt} onClick={() => setRevenue(opt)} style={{ padding: '9px 8px', borderRadius: '9px', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: revenue === opt ? 'rgba(16,185,129,0.12)' : 'var(--card)', border: `1px solid ${revenue === opt ? '#10b981' : 'var(--border)'}`, color: revenue === opt ? '#10b981' : 'var(--foreground)', transition: 'all 0.12s', lineHeight: 1.3 }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => canAdvance2 && setStep(3)}
                disabled={!canAdvance2}
                style={{ padding: '13px', background: canAdvance2 ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : 'var(--border)', border: 'none', borderRadius: '12px', color: canAdvance2 ? 'white' : 'var(--muted-foreground)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', cursor: canAdvance2 ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
              >
                See My Starting Position →
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: Position reveal + CTA ────────────────────────────────── */}
        {step === 3 && tier && (
          <>
            <div style={{ background: `linear-gradient(135deg, ${tier.color}cc 0%, ${tier.color}88 100%)`, padding: '24px 28px 20px' }}>
              <button onClick={() => setStep(2)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px', color: 'white', fontSize: '11px', fontWeight: 600, padding: '4px 10px', cursor: 'pointer', marginBottom: '12px' }}>← Back</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>YOUR STARTING POSITION</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '32px', color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>{tier.tier}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'rgba(255,255,255,0.9)', marginTop: '4px' }}>{tier.range}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '8px', lineHeight: 1.5 }}>estimated capital range based on your profile</div>
            </div>
            <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* What this means */}
              <div style={{ background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: tier.color, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Next Move</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5 }}>{tier.note}</div>
              </div>

              {/* What the full scan adds */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  'Your exact FundScore across 6 capital dimensions',
                  'Which products you qualify for right now',
                  'Your 3 highest-impact blockers to fix first',
                  'A 90-day roadmap to your target capital stage',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <span style={{ fontSize: '9px', color: '#10b981', fontWeight: 800 }}>✓</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => { onDismiss(); onNavigate(tier.cta); }}
                style={{ padding: '14px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '12px', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }}
              >
                Start Business Success Scan (8 min) →
              </button>
              <button onClick={onDismiss} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                Explore platform first
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
