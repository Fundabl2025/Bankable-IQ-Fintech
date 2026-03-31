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
import { getPreQualifiedPrograms } from '../utils/fundingEligibility';

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
      <div className="max-w-[1200px] mx-auto px-6 py-8 lg:px-8 lg:py-10">
        
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

            {/* ROW 1: GAUGE HERO + NEXT RED X */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(230px, 270px) 1fr', gap: '20px', marginBottom: '20px', alignItems: 'stretch' }}>

              {/* BANKABLE GAUGE */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg viewBox="0 0 220 190" style={{ width: '100%', maxWidth: '200px' }}>
                  <path d={bgArcPath} stroke="var(--border)" strokeWidth="14" fill="none" strokeLinecap="round" />
                  {[300,500,700,800].map(val => {
                    const deg = 225 + 270*(val/1000);
                    const toRad2 = (d: number) => ((d-90)*Math.PI/180);
                    const ix = CX + (R+10)*Math.cos(toRad2(deg)), iy = CY + (R+10)*Math.sin(toRad2(deg));
                    const ox = CX + (R-2)*Math.cos(toRad2(deg)), oy = CY + (R-2)*Math.sin(toRad2(deg));
                    return <line key={val} x1={ix.toFixed(1)} y1={iy.toFixed(1)} x2={ox.toFixed(1)} y2={oy.toFixed(1)} stroke="var(--muted-foreground)" strokeWidth="1.5" opacity="0.4" />;
                  })}
                  <motion.path
                    d={bgArcPath}
                    stroke={gaugeColor}
                    strokeWidth="14"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={arcLen}
                    initial={{ strokeDashoffset: arcLen }}
                    animate={{ strokeDashoffset: fillOffset }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                  />
                  <text x="110" y="100" textAnchor="middle" fill="var(--foreground)" fontSize="40" fontWeight="800" fontFamily="var(--font-display)">{fundScore}</text>
                  <text x="110" y="118" textAnchor="middle" fill="var(--muted-foreground)" fontSize="11" fontFamily="var(--font-body)">out of 1,000</text>
                </svg>
                <div style={{ display: 'inline-block', padding: '3px 12px', borderRadius: '20px', background: gaugeColor + '20', border: '1px solid ' + gaugeColor + '50', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: gaugeColor }}>{scoreBand.name}</span>
                </div>
                {nextMilestone && (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', textAlign: 'center', lineHeight: 1.4, margin: 0 }}>
                    <span style={{ fontWeight: 700, color: gaugeColor }}>+{nextMilestone.pts} pts</span> to {nextMilestone.label}
                  </p>
                )}
                {nextMilestone && (() => {
                  const prevMs = fundScore < 300 ? 0 : fundScore < 500 ? 300 : fundScore < 700 ? 500 : fundScore < 800 ? 700 : 800;
                  const range = nextMilestone.pts + (fundScore - prevMs);
                  const pct = range > 0 ? Math.round(((fundScore - prevMs) / range) * 100) : 0;
                  return (
                    <div style={{ width: '100%', marginTop: '10px' }}>
                      <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: pct + '%' }} transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }} style={{ height: '100%', background: gaugeColor, borderRadius: '99px' }} />
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '4px' }}>{pct}% to {nextMilestone.label}</p>
                    </div>
                  );
                })()}
              </div>

              {/* NEXT RED X */}
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {lockedCapital && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', alignSelf: 'flex-start' }}>
                    <Lock size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: '#ef4444' }}>{lockedCapital} in capital currently locked</span>
                  </div>
                )}
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                    ⚡ Your Next Action
                  </p>
                  {topBlocker ? (
                    <>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--foreground)', marginBottom: '8px', lineHeight: 1.2 }}>{topBlocker.title}</h2>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '16px' }}>
                        {topBlocker.description || 'Fixing this unlocks the next tier of capital products for your business.'}
                      </p>
                      {topBlocker.ficoImpact && (
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                          <div style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: '#10b981' }}>+{topBlocker.ficoImpact} score pts</span>
                          </div>
                          <div style={{ padding: '5px 12px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: '#3b82f6' }}>~15 min to complete</span>
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/app/lender-compliance')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(16,185,129,0.25)' }}>
                          Fix This Now <ArrowRight size={15} />
                        </button>
                        <button onClick={() => navigate('/app/my-progress')} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                          See all {criticalBlockers.length} blockers →
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
                    {Object.values(dimAvg as Record<string,number>).filter((v) => v >= 0.6).length} of 6 dimensions Green · Most businesses reach Bankable in 45 days
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 2: CAPITAL ACCESS */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>
                    {preQualPrograms.length > 0 ? '💰 Capital You Qualify For Now' : '🔑 Capital Products'}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '3px 0 0' }}>
                    {preQualPrograms.length > 0 ? preQualPrograms.length + ' products you pre-qualify for' : 'Improve your score to unlock funding products'}
                  </p>
                </div>
                <button onClick={() => navigate('/app/access-funding')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--primary)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  View All {preQualPrograms.length > 0 ? preQualPrograms.length : ''} →
                </button>
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
                          <div style={{ marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: isPreQual ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', border: '1px solid ' + (isPreQual ? 'rgba(16,185,129,0.25)' : 'var(--border)') }}>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: isPreQual ? '#10b981' : 'var(--muted-foreground)' }}>{isPreQual ? 'Pre-Qualified ✓' : '+' + Math.max(0, 500 - fundScore) + ' pts needed'}</span>
                          </div>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {([
                  { Icon: BarChart3, label: 'Status Reports', desc: 'Bankable status, FICO, estimated funding', path: '/app/status-reports', color: '#3b82f6' },
                  { Icon: FileText, label: 'Document Portal', desc: 'Upload and organize your financial documents', path: '/app/document-collection', color: '#8b5cf6' },
                  { Icon: TrendingUp, label: 'Integrate Reports', desc: 'Connect bank data and credit reports', path: '/app/integrate-reports', color: '#10b981' },
                ] as const).map(tool => (
                  <div key={tool.path} onClick={() => navigate(tool.path)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', flex: 1, transition: 'border-color 0.15s' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = tool.color + '60')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: tool.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <tool.Icon size={18} style={{ color: tool.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{tool.label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>{tool.desc}</div>
                    </div>
                    <ArrowRight size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 4: ACHIEVEMENTS */}
            <BadgeGrid newBadgeIds={newBadgeIds} />

          </motion.div>
        )}
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
