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
import { BadgeGrid, BadgeToastContainer } from '../components/BadgeGrid';
import { checkAndAwardBadges } from '../lib/badges';

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

  const scoreToAmount = (score: number): number => {
    if (score < 500) return 0;
    if (score < 600) return 50000;
    if (score < 700) return 150000;
    if (score < 800) return 350000;
    if (score < 900) return 750000;
    return 1500000;
  };

  return [
    { label: 'Today', days: 0, amount: scoreToAmount(today), score: today, color: 'var(--muted-foreground)' },
    { label: '30 Days', days: 30, amount: scoreToAmount(at30), score: at30, color: 'var(--warning)' },
    { label: '60 Days', days: 60, amount: scoreToAmount(at60), score: at60, color: 'var(--warning)' },
    { label: '90 Days', days: 90, amount: scoreToAmount(at90), score: at90, color: 'var(--success)' },
    { label: '180 Days', days: 180, amount: scoreToAmount(at180), score: at180, color: 'var(--primary)' },
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
        // Try to load from Supabase first if user is logged in
        let assessmentJson = null;
        
        if (user) {
          assessmentJson = await getDataItem('unified_assessment');
          console.log('[v0] Dashboard: Loaded from Supabase/localStorage:', !!assessmentJson);
        } else {
          assessmentJson = localStorage.getItem('unified_assessment');
          console.log('[v0] Dashboard: No user, loaded from localStorage:', !!assessmentJson);
        }
        
        if (assessmentJson) {
          const assessmentData = JSON.parse(assessmentJson) as UnifiedAnswers;
          
          // Use the same engine as Results page for consistent scoring
          const scoreResult = computeScore(assessmentData);
          const extendedResults = computeExtendedResults(assessmentData);
          const band = getBand(scoreResult.score);
          
          const bs = extendedResults.sbssScore || Math.round(scoreResult.score * 0.18);
          setFundScore(scoreResult.score);
          setDimAvg(scoreResult.dimAvg || {});
          setBankableScore(bs);
          setScoreBand(band);
          setHasAssessment(true);

          // Award any newly-earned badges
          const newly = checkAndAwardBadges({
            hasAssessment: true,
            score: scoreResult.score,
            bankableScore: bs,
            dimAvg: scoreResult.dimAvg || {},
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
    return () => {
      window.removeEventListener('fundscoreUpdated', handleUpdate);
      window.removeEventListener('auditItemUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
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

  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'there';
  const emailVerified = user?.email_confirmed_at;

  return (
    <div
      className="flex-1 min-h-screen overflow-auto"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Welcome modal */}
      {showWelcome && <WelcomeModal name={firstName} onDismiss={dismissWelcome} onNavigate={navigate} />}

      {/* Badge unlock toasts */}
      <BadgeToastContainer newBadgeIds={newBadgeIds} />

      {/* Email verification banner */}
      {user && !emailVerified && (
        <div style={{
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderBottom: '1px solid #f59e0b',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>📧</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#92400e' }}>
              Verify your email to save your FundScore and unlock your full capital report
            </span>
          </div>
          <button
            onClick={() => navigate('/app/settings')}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#92400e',
              background: 'rgba(146,64,14,0.12)',
              border: '1px solid rgba(146,64,14,0.25)',
              borderRadius: '6px',
              padding: '5px 14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Verify Now →
          </button>
        </div>
      )}
      <div className="max-w-[1400px] mx-auto px-6 py-8 lg:px-8 lg:py-10">
        
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* PAGE HEADER - Clean, premium typography                                */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <h1 
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 800,
              fontSize: 'clamp(28px, 4vw, 40px)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--foreground)'
            }}
          >
            Mission Control
          </h1>
          <p 
            className="mt-2"
            style={{ 
              fontFamily: 'var(--font-body)', 
              fontWeight: 400,
              fontSize: '15px',
              lineHeight: 1.6,
              color: 'var(--muted-foreground)'
            }}
          >
            Your capital readiness at a glance. Complete blockers to unlock more funding.
          </p>
        </motion.header>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* FEATURE 1: NEXT ACTION HERO BANNER                                     */}
        {/* Single most important action — FFP "Step 2: Required before unlock"    */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {hasAssessment && criticalBlockers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-8 cursor-pointer"
            onClick={() => navigate('/app/lender-compliance')}
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(59,130,246,0.06) 100%)',
              border: '2px solid var(--primary)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '22px' }}>🎯</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '4px',
              }}>
                Your Next Move — Required Before More Capital Opens
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px',
                color: 'var(--foreground)', lineHeight: 1.3,
              }}>
                {criticalBlockers[0]?.title}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: 'var(--muted-foreground)', marginTop: '3px',
              }}>
                {hardBlockers.length > 0
                  ? `This is a hard blocker — lenders auto-decline while this is unresolved`
                  : `Fixing this unlocks better rates and higher loan amounts`}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              color: 'white', padding: '9px 20px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Fix Now →
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ASSESSMENT CTA (if no assessment taken)                                */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {!hasAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => navigate('/app/business-assessment')}
            className="mb-8 cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(138,184,32,0.1) 0%, rgba(138,184,32,0.05) 100%)',
              border: '1px solid var(--primary)',
              borderRadius: '2px',
              padding: '24px 28px',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Zap style={{ color: 'var(--primary)', width: 20, height: 20 }} />
                  <span style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700, 
                    fontSize: '16px',
                    color: 'var(--foreground)' 
                  }}>
                    Start Your FundScore Assessment
                  </span>
                </div>
                <p style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '14px', 
                  color: 'var(--muted-foreground)' 
                }}>
                  24 questions. 10 minutes. See exactly what capital you qualify for today.
                </p>
              </div>
              <ArrowRight 
                className="transition-transform group-hover:translate-x-1" 
                style={{ color: 'var(--primary)', width: 24, height: 24 }} 
              />
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* CORE VALUE PROP: Fundable vs Bankable - The Capital Cost Narrative     */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {hasAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mb-8"
            style={{
              background: 'var(--surface-1)',
              border: '2px solid var(--primary)',
              borderRadius: '2px',
              padding: '28px',
            }}
          >
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '12px', 
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--muted-foreground)',
                marginBottom: '8px'
              }}>
                Capital Access Path
              </div>
              <h2 style={{ 
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--foreground)',
                lineHeight: 1.2
              }}>
                Move from expensive to bank capital
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current: Fundable Capital */}
              <div style={{
                padding: '20px',
                background: 'var(--surface-2)',
                borderRadius: '2px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--muted-foreground)',
                    marginBottom: '4px'
                  }}>
                    Today: Fundable
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--foreground)'
                  }}>
                    $50K-$250K
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: 'var(--destructive-bg)',
                  borderRadius: '2px',
                  border: '1px solid var(--destructive-border)',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--destructive)'
                  }}>
                    35%+ APR
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    marginTop: '4px'
                  }}>
                    MCA, factoring, credit cards
                  </div>
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.5
                }}>
                  Your current funding options. Fast approval, high cost.
                </div>
              </div>

              {/* Arrow/Progression */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <TrendingUp style={{ 
                    color: 'var(--primary)',
                    width: 32,
                    height: 32,
                    margin: '0 auto 8px'
                  }} />
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--muted-foreground)',
                    whiteSpace: 'nowrap'
                  }}>
                    90-180 days
                  </div>
                </div>
              </div>

              {/* Future: Bankable Capital */}
              <div style={{
                padding: '20px',
                background: 'var(--surface-2)',
                borderRadius: '2px',
                border: '1px solid var(--border)',
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--muted-foreground)',
                    marginBottom: '4px'
                  }}>
                    Potential: Bankable
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--primary)'
                  }}>
                    $250K-$1M+
                  </div>
                </div>
                <div style={{
                  padding: '12px',
                  background: 'var(--success-bg)',
                  borderRadius: '2px',
                  border: '1px solid var(--success-border)',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--success)'
                  }}>
                    12-15% APR
                  </div>
                  <div style={{ 
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    marginTop: '4px'
                  }}>
                    SBA, bank loans, equipment
                  </div>
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.5
                }}>
                  Institutional capital. Lower cost, longer terms, larger amounts.
                </div>
              </div>
            </div>

            {/* Savings calculation */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(138,184,32,0.1)',
              borderRadius: '2px',
              border: '1px solid rgba(138,184,32,0.2)'
            }}>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--foreground)',
                lineHeight: 1.6
              }}>
                <strong>On a $250K loan over 5 years:</strong> Expensive capital = $112,500 interest. Bank capital = $37,500 interest. <strong style={{ color: 'var(--primary)' }}>Your potential savings: $75,000</strong>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* CARD 1: Status + FundScore                                          */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group cursor-pointer"
            onClick={() => navigate('/app/business-assessment/results')}
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              padding: '28px',
              transition: 'border-color 200ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-6">
              <div 
                className="px-3 py-1.5"
                style={{ 
                  backgroundColor: statusInfo.bgColor,
                  border: `1px solid ${statusInfo.color}`,
                  borderRadius: '2px'
                }}
              >
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '11px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: statusInfo.color 
                }}>
                  {statusInfo.tier}
                </span>
              </div>
              <ChevronRight style={{ color: 'var(--muted-foreground)', width: 18, height: 18 }} />
            </div>

            {/* Score Display */}
            <div className="mb-4">
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: 'clamp(32px, 5vw, 56px)',
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: hasAssessment ? scoreBand.color : 'var(--muted-foreground)'
              }}>
                {hasAssessment ? fundScore : '—'}
              </div>
              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                marginTop: '6px'
              }}>
                FundScore out of 1000
              </div>
            </div>

            {/* Score Bar */}
            <div 
              className="h-1.5 w-full overflow-hidden"
              style={{ backgroundColor: 'var(--border)', borderRadius: '1px' }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(fundScore / 1000) * 100}%` }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
                style={{ backgroundColor: scoreBand.color }}
              />
            </div>

            {/* Band Name */}
            <div style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '12px',
              color: scoreBand.color,
              marginTop: '8px',
              fontWeight: 600
            }}>
              {scoreBand.name}
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* CARD 2: Capital Access                                              */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="group cursor-pointer"
            onClick={() => navigate('/app/status-reports/estimated-funding')}
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              padding: '28px',
              transition: 'border-color 200ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <DollarSign style={{ color: 'var(--primary)', width: 18, height: 18 }} />
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                  color: 'var(--foreground)' 
                }}>
                  Capital Access
                </span>
              </div>
              <ChevronRight style={{ color: 'var(--muted-foreground)', width: 18, height: 18 }} />
            </div>

            {/* Current Amount */}
            <div className="mb-5">
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: 'clamp(28px, 4vw, 40px)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: 'var(--primary)'
              }}>
                {formatMoney(capitalPath[0].amount)}
              </div>
              <div style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                marginTop: '4px'
              }}>
                Available today
              </div>
            </div>

            {/* Tier Potential */}
            <div 
              className="flex items-center justify-between p-3"
              style={{ 
                backgroundColor: 'var(--muted)',
                borderRadius: '2px'
              }}
            >
              <div>
                <div style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '2px'
                }}>
                  Tier Potential
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '18px',
                  color: 'var(--foreground)'
                }}>
                  {statusInfo.capitalRange}
                </div>
              </div>
              <ArrowRight style={{ color: 'var(--muted-foreground)', width: 16, height: 16 }} />
              <div>
                <div style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '2px'
                }}>
                  At 180 Days
                </div>
                <div style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '18px',
                  color: 'var(--success)'
                }}>
                  {formatMoney(capitalPath[4].amount)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* CARD 3: Top Blockers                                                */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group cursor-pointer"
            onClick={() => navigate('/app/lender-compliance')}
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              padding: '28px',
              transition: 'border-color 200ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--destructive)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle style={{ color: 'var(--destructive)', width: 18, height: 18 }} />
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '13px',
                  letterSpacing: '0.02em',
                  color: 'var(--foreground)' 
                }}>
                  Top Blockers
                </span>
              </div>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700, 
                fontSize: '12px',
                color: hardBlockers.length > 0 ? 'var(--destructive)' : 'var(--warning)' 
              }}>
                {hardBlockers.length > 0 ? `${hardBlockers.length} Blockers` : `${suppressors.length} Suppressors`}
              </span>
            </div>

            {/* Blocker List */}
            <div className="space-y-3">
              {criticalBlockers.slice(0, 4).map((blocker, idx) => {
                const isHardBlocker = blocker.severity === 'hard_blocker';
                const severityColor = isHardBlocker ? 'var(--destructive)' : 'var(--warning)';
                const severityBg = isHardBlocker ? 'var(--destructive-bg)' : 'var(--warning-bg)';
                
                return (
                  <div 
                    key={blocker.id}
                    className="flex items-start gap-3"
                  >
                    <div 
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center"
                      style={{ 
                        backgroundColor: severityBg,
                        borderRadius: '2px',
                        marginTop: '1px'
                      }}
                    >
                      <span style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontWeight: 700, 
                        fontSize: '10px',
                        color: severityColor 
                      }}>
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span style={{ 
                          fontFamily: 'var(--font-body)', 
                          fontSize: '13px',
                          color: 'var(--foreground)',
                          lineHeight: 1.4
                        }}>
                          {blocker.title}
                        </span>
                        {isHardBlocker && (
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '8px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: severityColor,
                            padding: '2px 4px',
                            backgroundColor: severityBg,
                            borderRadius: '2px',
                          }}>
                            Blocker
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontFamily: 'var(--font-body)', 
                        fontSize: '11px',
                        color: 'var(--muted-foreground)',
                        marginTop: '2px'
                      }}>
                        +{blocker.ficoImpact || 10} pts when resolved
                      </div>
                    </div>
                  </div>
                );
              })}
              {criticalBlockers.length === 0 && (
                <div 
                  className="flex items-center gap-2 p-3"
                  style={{ backgroundColor: 'var(--success-bg)', borderRadius: '2px' }}
                >
                  <CheckCircle2 style={{ color: 'var(--success)', width: 16, height: 16 }} />
                  <span style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontSize: '13px',
                    color: 'var(--success)' 
                  }}>
                    No critical blockers
                  </span>
                </div>
              )}
            </div>

            {/* View All Link */}
            <Link
              to="/app/denial-diagnosis"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px',
                marginTop: '16px',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                fontFamily: 'var(--font-display)',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--muted-foreground)',
                textDecoration: 'none',
              }}
            >
              View Full Diagnosis
              <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* CARD 4: Top Actions + Distance to Bankable                          */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '2px',
              padding: '28px',
            }}
          >
            {/* Distance to Bankable */}
            <div className="mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target style={{ color: 'var(--primary)', width: 18, height: 18 }} />
                  <span style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700, 
                    fontSize: '13px',
                    letterSpacing: '0.02em',
                    color: 'var(--foreground)' 
                  }}>
                    Distance to Bankable
                  </span>
                </div>
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '14px',
                  color: distanceToBankable === 0 ? 'var(--success)' : 'var(--primary)' 
                }}>
                  {distanceToBankable === 0 ? 'Achieved!' : `${distanceToBankable} pts`}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div 
                className="h-2 w-full overflow-hidden"
                style={{ backgroundColor: 'var(--border)', borderRadius: '1px' }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((bankableScore / 160) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                  style={{ 
                    backgroundColor: distanceToBankable === 0 ? 'var(--success)' : 'var(--primary)' 
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                  Bankable Score: {bankableScore}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                  Threshold: 160
                </span>
              </div>
            </div>

            {/* Priority Actions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap style={{ color: 'var(--warning)', width: 16, height: 16 }} />
                <span style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700, 
                  fontSize: '12px',
                  letterSpacing: '0.02em',
                  color: 'var(--foreground)' 
                }}>
                  Priority Actions
                </span>
              </div>
              <div className="space-y-2">
                {topActions.slice(0, 3).map((action) => (
                  <div 
                    key={action.id}
                    className="flex items-center justify-between p-2.5 cursor-pointer transition-colors"
                    style={{ 
                      backgroundColor: 'var(--muted)',
                      borderRadius: '2px'
                    }}
                    onClick={() => navigate('/app/lender-compliance')}
                  >
                    <span style={{ 
                      fontFamily: 'var(--font-body)', 
                      fontSize: '12px',
                      color: 'var(--foreground)'
                    }}>
                      {action.title}
                    </span>
                    <span style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700, 
                      fontSize: '11px',
                      color: 'var(--primary)'
                    }}>
                      +{action.ficoImpact || 10}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* CARD 5: Capital Path Timeline (Full Width)                             */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="cursor-pointer"
          onClick={() => navigate('/app/status-reports/estimated-funding')}
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '2px',
            padding: '28px',
            transition: 'border-color 200ms ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp style={{ color: 'var(--primary)', width: 18, height: 18 }} />
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700, 
                fontSize: '13px',
                letterSpacing: '0.02em',
                color: 'var(--foreground)' 
              }}>
                Your Capital Path
              </span>
            </div>
            <span style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '12px',
              color: 'var(--muted-foreground)' 
            }}>
              Projected growth over 180 days
            </span>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Connection Line */}
            <div 
              className="absolute top-6 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'var(--border)' }}
            />
            
            {/* Milestones */}
            <div className="grid grid-cols-5 gap-4 relative">
              {capitalPath.map((milestone, idx) => (
                <div key={milestone.label} className="text-center">
                  {/* Dot */}
                  <div 
                    className="w-3 h-3 mx-auto mb-3 relative z-10"
                    style={{ 
                      backgroundColor: milestone.color,
                      borderRadius: '50%',
                      boxShadow: idx === 0 ? `0 0 0 4px ${milestone.color}30` : 'none'
                    }}
                  />
                  
                  {/* Label */}
                  <div style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    color: milestone.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px'
                  }}>
                    {milestone.label}
                  </div>
                  
                  {/* Amount */}
                  <div style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 800, 
                    fontSize: '20px',
                    color: 'var(--foreground)',
                    lineHeight: 1.2
                  }}>
                    {formatMoney(milestone.amount)}
                  </div>
                  
                  {/* Score */}
                  <div style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontSize: '11px',
                    color: 'var(--muted-foreground)',
                    marginTop: '2px'
                  }}>
                    Score: {milestone.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div 
            className="mt-6 pt-5 flex items-center justify-center gap-2"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <span style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '13px',
              color: 'var(--primary)'
            }}>
              View full capital roadmap
            </span>
            <ArrowRight style={{ color: 'var(--primary)', width: 14, height: 14 }} />
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* QUICK STATS ROW                                                        */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5"
        >
          {[
            { label: 'Items Complete', value: `${progress.completed}/${progress.total}`, icon: CheckCircle2, color: 'var(--success)' },
            { label: 'Overall Progress', value: `${progress.percentage}%`, icon: TrendingUp, color: 'var(--primary)' },
            { label: 'Hard Blockers', value: hardBlockers.length.toString(), icon: AlertTriangle, color: hardBlockers.length > 0 ? 'var(--destructive)' : 'var(--success)' },
            { label: 'Days to Bankable', value: distanceToBankable > 0 ? '~60' : '0', icon: Clock, color: 'var(--muted-foreground)' },
          ].map((stat) => (
            <div 
              key={stat.label}
              className="p-4"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '2px'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon style={{ color: stat.color, width: 14, height: 14 }} />
                <span style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontSize: '11px',
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {stat.label}
                </span>
              </div>
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '24px',
                color: 'var(--foreground)'
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* FEATURE 2 + 5: CAPITAL READINESS BY DIMENSION                          */}
        {/* Status labels (Barrier/Weak/Growing/Strong/Bankable) + action messages  */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {hasAssessment && Object.keys(dimAvg).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5"
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px',
                  color: 'var(--foreground)', letterSpacing: '-0.01em',
                }}>
                  Capital Readiness by Dimension
                </h2>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: 'var(--muted-foreground)', marginTop: '3px',
                }}>
                  Where you are and exactly what to do next in each area
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIM_CONFIG.map((dim) => {
                const score = dimAvg[dim.key] ?? 0.5;
                const status = getDimStatus(score);
                const action = getDimAction(dim.key, score, DIM_CONFIG);
                const { Icon } = dim;
                const pct = Math.round(score * 100);

                return (
                  <div
                    key={dim.key}
                    style={{
                      background: 'var(--card)',
                      border: `1px solid ${status.border}`,
                      borderRadius: '14px',
                      padding: '18px',
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: status.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={15} style={{ color: status.color }} />
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
                          color: 'var(--foreground)',
                        }}>
                          {dim.label}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 9px',
                        borderRadius: '10px', background: status.bg,
                        color: status.color, border: `1px solid ${status.border}`,
                      }}>
                        {status.label}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginBottom: '12px' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: status.color, borderRadius: '2px',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>

                    {/* Action message */}
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '12px',
                      color: 'var(--muted-foreground)', lineHeight: 1.5,
                    }}>
                      {action}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* FEATURE 6: SEQUENTIAL CAPITAL UNLOCK PATH                              */}
        {/* FFP-inspired badge/step progression showing what each action unlocks   */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {hasAssessment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-5 mb-5"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px 28px',
            }}
          >
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px',
              color: 'var(--foreground)', marginBottom: '4px',
            }}>
              Your Capital Unlock Path
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'var(--muted-foreground)', marginBottom: '20px',
            }}>
              Complete each step to unlock the next tier of capital products
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                {
                  label: 'FundScore Assessment',
                  desc: 'Know your baseline across all 6 capital readiness dimensions',
                  unlocks: 'Personalized capital map + product eligibility',
                  done: hasAssessment,
                  cta: '/business-assessment',
                },
                {
                  label: 'Dedicated Business Bank Account',
                  desc: 'Separate business and personal finances — required by every lender',
                  unlocks: 'Working Capital Loans, LOC, Merchant Advance',
                  done: (dimAvg['F'] ?? 0) >= 0.4,
                  cta: '/app/lender-compliance/business-banking',
                },
                {
                  label: 'Personal Credit Score 680+',
                  desc: 'FICO above 680 across all 3 bureaus',
                  unlocks: 'Business Term Loans, SBA Express, Credit Union Loans',
                  done: (dimAvg['P'] ?? 0) >= 0.6,
                  cta: '/app/building-credit',
                },
                {
                  label: '2 Years of Filed Tax Returns',
                  desc: 'Business tax returns on file with the IRS',
                  unlocks: 'SBA 7(a), Bank Term Loans, Full Product Suite',
                  done: (dimAvg['N'] ?? 0) >= 0.6,
                  cta: '/app/document-collection',
                },
                {
                  label: 'Clear All Hard Blockers',
                  desc: 'No active tax liens, judgments, or recent bankruptcies',
                  unlocks: 'Elite borrower status — best rates and largest loan amounts',
                  done: hardBlockers.length === 0,
                  cta: '/app/lender-compliance',
                },
              ].map((step, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <div key={i} style={{ display: 'flex', gap: '16px' }}>
                    {/* Timeline column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0 }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                        background: step.done ? 'var(--primary)' : 'var(--card)',
                        border: step.done ? '2px solid var(--primary)' : '2px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1,
                      }}>
                        {step.done
                          ? <CheckCircle2 size={14} style={{ color: 'white' }} />
                          : <Lock size={12} style={{ color: 'var(--muted-foreground)' }} />
                        }
                      </div>
                      {!isLast && (
                        <div style={{
                          width: '2px', flex: 1, minHeight: '32px',
                          background: step.done ? 'var(--primary)' : 'var(--border)',
                          margin: '4px 0',
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        flex: 1, paddingBottom: isLast ? '0' : '20px', cursor: step.done ? 'default' : 'pointer',
                      }}
                      onClick={() => !step.done && navigate(step.cta)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
                          color: step.done ? 'var(--muted-foreground)' : 'var(--foreground)',
                          textDecoration: step.done ? 'line-through' : 'none',
                        }}>
                          {step.label}
                        </span>
                        {step.done && (
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                            borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981',
                          }}>
                            Done
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '12px',
                        color: 'var(--muted-foreground)', lineHeight: 1.4, marginBottom: '4px',
                      }}>
                        {step.desc}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Zap size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{
                          fontFamily: 'var(--font-body)', fontSize: '11px',
                          fontWeight: 600, color: 'var(--primary)',
                        }}>
                          Unlocks: {step.unlocks}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* POTENTIAL SCORE CARD — How high your score can go + what to fix       */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {hasAssessment && (() => {
          const DIM_WEIGHTS: Record<string, number> = { P: 0.20, B: 0.10, F: 0.25, C: 0.20, S: 0.15, N: 0.10 };
          const DIM_NAMES: Record<string, string> = { P: 'Personal Credit', B: 'Business Profile', F: 'Financial Health', C: 'Compliance', S: 'Stability', N: 'File Strength' };
          const weakDims = Object.entries(dimAvg).filter(([, v]) => v < 0.8).sort(([, a], [, b]) => a - b).slice(0, 3);
          const potentialDimAvg = { ...dimAvg };
          weakDims.forEach(([k]) => { potentialDimAvg[k] = 0.8; });
          const potentialBase = Object.entries(potentialDimAvg).reduce((sum, [k, v]) => sum + v * (DIM_WEIGHTS[k] || 0), 0);
          const potentialScore = Math.min(1000, Math.round(potentialBase * 1000 + 80));
          const scoreGap = potentialScore - fundScore;
          if (scoreGap <= 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ marginTop: '24px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}
            >
              {/* Header bar */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px', color: 'var(--foreground)', margin: 0 }}>
                    Your Score Ceiling
                  </h2>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', margin: '4px 0 0' }}>
                    Fix your 3 weakest dimensions to reach {potentialScore}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)' }}>{fundScore}</div>
                  </div>
                  <div style={{ fontSize: '18px', color: 'var(--muted-foreground)' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Potential</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: '#10b981' }}>{potentialScore}</div>
                  </div>
                  <div style={{ padding: '5px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#10b981' }}>+{scoreGap} pts</span>
                  </div>
                </div>
              </div>

              {/* Progress visual */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', minWidth: '28px' }}>{fundScore}</span>
                  <div style={{ flex: 1, height: '10px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, borderRadius: '99px', background: 'var(--border)' }} />
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(fundScore / 1000) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ position: 'absolute', height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
                    />
                    {/* Potential marker */}
                    <div style={{ position: 'absolute', top: '-2px', bottom: '-2px', width: '3px', borderRadius: '2px', background: '#10b981', left: `${(potentialScore / 1000) * 100}%`, boxShadow: '0 0 6px #10b981' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#10b981', minWidth: '28px', textAlign: 'right' }}>{potentialScore}</span>
                </div>
              </div>

              {/* Fix list */}
              <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>
                  Top moves to close the gap:
                </div>
                {weakDims.map(([key, val], i) => {
                  const gain = Math.round((0.8 - val) * (DIM_WEIGHTS[key] || 0) * 1000);
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: 'white' }}>{i + 1}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>
                          Improve {DIM_NAMES[key] || key}
                        </div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                          Currently {Math.round(val * 100)}% — reach 80% to unlock this gain
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#10b981', whiteSpace: 'nowrap' }}>
                        +{gain} pts
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* ACHIEVEMENTS — Badge grid                                              */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ marginTop: '24px' }}
        >
          <BadgeGrid newBadgeIds={newBadgeIds} />
        </motion.div>

      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// WELCOME MODAL — First-login onboarding with gradient header
// ════════════════════════════════════════════════════════════════════════════════

function WelcomeModal({ name, onDismiss, onNavigate }: { name: string; onDismiss: () => void; onNavigate: (path: string) => void }) {
  const steps = [
    {
      emoji: '🎯',
      title: 'Take Your Assessment',
      description: 'Answer 33 questions to get your FundScore and capital readiness rating.',
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.25)',
      action: () => { onDismiss(); onNavigate('/business-assessment'); },
      cta: 'Start Now',
    },
    {
      emoji: '📊',
      title: 'Review Your FundScore',
      description: 'Understand your 0–1000 score across 6 capital readiness dimensions.',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.25)',
    },
    {
      emoji: '🔑',
      title: 'Address Capital Gaps',
      description: 'Tackle your top blockers to unlock more capital products.',
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.25)',
    },
    {
      emoji: '📈',
      title: 'Track Your Path',
      description: 'Watch your score improve as you complete each recommended action.',
      color: '#9333ea',
      bg: 'rgba(147,51,234,0.08)',
      border: 'rgba(147,51,234,0.25)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--background)',
          borderRadius: '20px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
        }}
      >
        {/* Gradient header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
            padding: '32px 28px 28px',
          }}
        >
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>👋</div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '26px',
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '8px',
            }}
          >
            Welcome, {name}!
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
            FundReady™ maps your business to real capital. Here's how to get the most out of the platform.
          </p>
        </div>

        {/* Step cards */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {steps.map((step, i) => (
            <div
              key={i}
              onClick={step.action}
              style={{
                background: step.bg,
                border: `1px solid ${step.border}`,
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: step.action ? 'pointer' : 'default',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => step.action && ((e.currentTarget as HTMLElement).style.transform = 'scale(1.01)')}
              onMouseLeave={e => step.action && ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: step.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  flexShrink: 0,
                }}
              >
                {step.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>
                    {step.title}
                  </span>
                  {step.cta && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: step.color, whiteSpace: 'nowrap' }}>
                      {step.cta} →
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '3px', lineHeight: 1.4 }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 28px 24px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { onDismiss(); onNavigate('/business-assessment'); }}
            style={{
              flex: 1,
              padding: '13px',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
            }}
          >
            Take My Assessment
          </button>
          <button
            onClick={onDismiss}
            style={{
              padding: '13px 18px',
              background: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Skip
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Dashboard;
