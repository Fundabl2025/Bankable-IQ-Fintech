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
  Info,
  Percent,
  Landmark,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { logEvent } from '../lib/analytics/events';
import { 
  getBusinessProfile, 
  getAllAuditItems,
  getOverallProgress 
} from '../utils/businessData';
import { computeScore, getBand, computeExtendedResults } from './business-assessment/engine';
import { getDataItem } from '../lib/data-adapter';
import { useAuth } from '../contexts/AuthContext';
import { DIM_LABELS, NOI_MIDPOINTS, DEBT_SERVICE_MIDPOINTS } from './business-assessment/types';
import type { UnifiedAnswers } from './business-assessment/types';
import { computeBestFirstMove, type BestFirstMove } from '../utils/capitalSequencing';
import { type DTIResult } from './credit-path/creditBlockers';
import { DTI_RESULT_KEY } from './credit-path/DTIEstimator';
import { BadgeStrip, BadgeToastContainer } from '../components/BadgeGrid';
import { checkAndAwardBadges, syncBadgesFromCloud, recordInitialScore, getInitialScore } from '../lib/badges';
import { getPreQualifiedPrograms } from '../utils/fundingEligibility';
import { evaluateProducts } from './business-assessment/productEligibility';
import { getPipelineCounts, type PipelineCounts } from '../lib/funding-service';
import { complianceModules, getComplianceProgress } from '../utils/lenderComplianceModules';
import { getMembershipTier, canAccessGoal2, type MembershipTier } from '../lib/membership';

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

  // T-11: Asset guard — exclude asset-based products from the headline pool when the
  // user explicitly reported 'none' for the underlying asset. Equipment Financing at
  // $5M is a misleading ceiling for a business with no equipment.
  const hasRelevantAsset = (p: { id: string }) => {
    const a = assessment;
    if (p.id === 'equipment'    && (a as any).equipmentValue === 'none') return false;
    if (p.id === 'factoring'    && (a as any).arBalance      === 'none') return false;
    if (p.id === 'po_financing' && (a as any).poBalance      === 'none') return false;
    if (p.id === 'cre'          && (a as any).ownsProperty   !== 'yes')  return false;
    return true;
  };
  // headlineEligible = products that (a) qualify and (b) have backing assets
  const headlineEligible = eligible.filter(hasRelevantAsset);
  const headlineBase = headlineEligible.length > 0 ? headlineEligible : eligible;

  // Prefer High confidence products for the headline dollar amount
  const highConf = headlineBase.filter(p => p.confidence === 'High');
  const medConf  = headlineBase.filter(p => p.confidence === 'Medium');
  const headlinePool = highConf.length > 0 ? highConf : medConf;
  const isHighConfidence = highConf.length > 0;

  // Median capped amount across headline pool (same calc as engine.ts fundingRange)
  const poolAmts = headlinePool.map(p => cappedAmt(p)).sort((a, b) => a - b);
  const mid = Math.floor(poolAmts.length / 2);
  const medianCapped = poolAmts.length === 0 ? 0
    : poolAmts.length % 2 === 0 ? Math.round((poolAmts[mid - 1] + poolAmts[mid]) / 2)
    : poolAmts[mid];
  // Label: product closest to the median amount
  const topProduct = headlinePool.reduce((best, p) =>
    Math.abs(cappedAmt(p) - medianCapped) < Math.abs(cappedAmt(best) - medianCapped) ? p : best,
    headlinePool[0]);

  const confidenceLabel = isHighConfidence
    ? `${highConf.length} high-confidence product${highConf.length !== 1 ? 's' : ''}`
    : `${medConf.length} product${medConf.length !== 1 ? 's' : ''} estimated`;

  return {
    total: eligible.map(p => parseMaxAmount(p.maxAmount)).reduce((a, b) => a + b, 0),
    highest: medianCapped,
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

// Display order for the 6 readiness dimensions — module-level so all components can access it
const DIM_ORDER = ['P', 'B', 'F', 'C', 'S', 'N'];

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
// DASHBOARD SUB-COMPONENTS
// These receive props from the Dashboard parent — no internal state except where
// noted (tooltip). All computation stays in the parent.
// ════════════════════════════════════════════════════════════════════════════════

// ── DashboardHeader ───────────────────────────────────────────────────────────

interface DashboardHeaderProps {
  timeOfDay: string;
  firstName: string;
  hasAssessment: boolean;
  criticalBlockersCount: number;
  capitalDisplay: number;
  navigate: (path: string) => void;
}

function DashboardHeader({ timeOfDay, firstName, hasAssessment, criticalBlockersCount, capitalDisplay, navigate }: DashboardHeaderProps) {
  const subtitle = !hasAssessment
    ? 'Take the Business Success Scan to see your capital ceiling'
    : criticalBlockersCount > 0
    ? `${criticalBlockersCount} blocker${criticalBlockersCount !== 1 ? 's' : ''} limiting your capital access — fix to unlock more`
    : capitalDisplay > 0
    ? `No blockers — you're positioned for ${formatMoney(capitalDisplay)}`
    : 'Complete your assessment to see your full capital potential';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '36px', gap: '16px', flexWrap: 'wrap' }}>
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Good {timeOfDay}, {firstName}
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(30px, 4.5vw, 44px)', color: 'var(--foreground)', lineHeight: 1.0, letterSpacing: '-0.03em', margin: 0 }}>
          Mission Control
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', margin: '8px 0 0', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      </div>
      <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
        <button onClick={() => { logEvent({ event_name: 'my_progress_clicked', payload: { source: 'header' } }); navigate('/app/my-progress'); }} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
          My Progress
        </button>
        {hasAssessment && (
          <button onClick={() => { logEvent({ event_name: 'full_report_clicked', payload: {} }); navigate('/business-assessment/results'); }} style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
            Full Report →
          </button>
        )}
      </div>
    </div>
  );
}

// ── ReadinessSnapshotCard ─────────────────────────────────────────────────────

interface ReadinessSnapshotCardProps {
  fundScore: number;
  bankableScore: number;
  bankablePassPct: number;
  bankablePassCount: number;
  capitalDisplay: number;
  realCapital: ReturnType<typeof computeRealCapital>;
  criticalBlockers: any[];
  statusInfo: ReturnType<typeof getStatusInfo>;
  nextMilestone: ReturnType<typeof getNextMilestone>;
  gaugeColor: string;
  topBlocker: any;
  navigate: (path: string) => void;
}

function ReadinessSnapshotCard({
  fundScore, bankableScore, bankablePassPct, bankablePassCount,
  capitalDisplay, realCapital, criticalBlockers, statusInfo,
  nextMilestone, gaugeColor, topBlocker, navigate,
}: ReadinessSnapshotCardProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Closest Unlock — only show if delta is positive and non-trivial
  const closestUnlock = (() => {
    if (!topBlocker || !topBlocker.ficoImpact || topBlocker.ficoImpact <= 0) return null;
    const currentTier = scoreToAmount(fundScore);
    const unlockedTier = scoreToAmount(fundScore + topBlocker.ficoImpact);
    const delta = unlockedTier - currentTier;
    if (delta <= 0) return null;
    return { delta, label: topBlocker.title };
  })();

  // SBSS block internals (same logic as before, moved from IIFE)
  const scoreTier = bankableScore >= 210 ? { label: 'Excellent', color: '#10b981' }
    : bankableScore >= 190 ? { label: 'Good', color: '#22c55e' }
    : bankableScore >= 160 ? { label: 'Fair', color: '#f59e0b' }
    :                        { label: 'Poor', color: '#ef4444' };
  const isCompliant   = bankablePassPct >= 85;
  const isApproaching = bankablePassPct >= 60;
  const approxFail    = Math.max(1, Math.round(((100 - bankablePassPct) / 100) * 20));
  const sbssMsg = bankableScore < 160
    ? `${160 - bankableScore} points from bank approval threshold`
    : isCompliant && bankableScore >= 210
    ? 'Score and compliance clear — bank & SBA products accessible'
    : isCompliant
    ? 'Score qualifies — verify compliance items to apply'
    : isApproaching
    ? `Score clears threshold · ${approxFail} compliance item${approxFail !== 1 ? 's' : ''} still needed`
    : `Score clears threshold · Significant compliance work needed before applying`;
  const sbssTier = { ...scoreTier, msg: sbssMsg };
  const sbssPct = Math.min((bankableScore / 300) * 100, 100);
  const thresholdPct = (160 / 300) * 100;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

      {/* Hero dollar */}
      <div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {capitalDisplay > 0 ? (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(34px, 5.5vw, 48px)', color: gaugeColor, lineHeight: 1, letterSpacing: '-0.03em' }}>
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
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '38px', color: '#ef4444', lineHeight: 1 }}>$0</div>
          )}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
            <span>
              {realCapital.count > 0
                ? `Estimated capital ceiling · ${realCapital.productLabel}`
                : 'Estimated Capital Potential'}
            </span>
            <button
              onMouseEnter={() => setTooltipVisible(true)}
              onMouseLeave={() => setTooltipVisible(false)}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', color: 'var(--muted-foreground)', opacity: 0.55, flexShrink: 0 }}
              aria-label="How this estimate is calculated"
            >
              <Info style={{ width: '11px', height: '11px' }} />
            </button>
            {tooltipVisible && (
              <div style={{ position: 'absolute', bottom: '20px', left: 0, zIndex: 50, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px', width: '240px', fontSize: '11px', lineHeight: 1.6, color: 'var(--muted-foreground)', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', fontWeight: 400 }}>
                Revenue-capped ceiling based on your highest qualifying product. Actual loan offers depend on lender underwriting, documentation, and full credit review.
              </div>
            )}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          {[{ v: 300, l: 'Alt Cap' }, { v: 500, l: 'Working Capital' }, { v: 700, l: 'Term Loans' }, { v: 900, l: 'SBA/Bank' }].map(m => (
            <div key={m.v} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: fundScore >= m.v ? gaugeColor : 'var(--muted-foreground)', fontWeight: fundScore >= m.v ? 700 : 400, opacity: fundScore >= m.v ? 1 : 0.5 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Readiness Score (SBSS) */}
      <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
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
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: sbssTier.color, fontWeight: 600, marginBottom: '8px' }}>{sbssTier.msg}</div>
        <div style={{ position: 'relative', height: '7px', background: 'var(--border)', borderRadius: '99px', overflow: 'visible' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: sbssPct + '%' }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            style={{ height: '100%', background: `linear-gradient(90deg, ${sbssTier.color}99, ${sbssTier.color})`, borderRadius: '99px', position: 'absolute', top: 0, left: 0 }}
          />
          <div style={{ position: 'absolute', top: '-3px', left: `${thresholdPct}%`, width: '2px', height: '13px', background: '#3b82f6', borderRadius: '2px', transform: 'translateX(-50%)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>Poor (0–159)</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#3b82f6', fontWeight: 700 }}>↑ 160 = Bank Approval</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>Excellent (300)</span>
        </div>
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(59,130,246,0.15)', fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
          Banks use this 0–300 scale to approve business loans. Scores below 160 are typically declined by banks and the SBA.
        </div>
      </div>

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

      {/* Closest Unlock — gated: only show when delta is real and positive */}
      {closestUnlock ? (
        <div style={{ padding: '8px 12px', borderRadius: '8px', background: gaugeColor + '08', border: '1px solid ' + gaugeColor + '25' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: gaugeColor, fontWeight: 700 }}>
            Fix 1 item → unlock {formatMoney(closestUnlock.delta)} more
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
            {' '}via {closestUnlock.label}
          </span>
        </div>
      ) : topBlocker ? (
        <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--background)', border: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
            Fix your top blocker to strengthen access to more advanced products
          </span>
        </div>
      ) : null}

      {/* Blocker count */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {criticalBlockers.length > 0 ? (
          <>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
              <span style={{ fontWeight: 700, color: '#f59e0b' }}>{criticalBlockers.length} blocker{criticalBlockers.length !== 1 ? 's' : ''}</span> limiting your potential
            </span>
            <button onClick={() => { logEvent({ event_name: 'my_progress_clicked', payload: { source: 'readiness_card' } }); navigate('/app/my-progress'); }} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', whiteSpace: 'nowrap' }}>
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
  );
}

// ── FollowOnBlockersCard ─────────────────────────────────────────────────────

interface FollowOnBlockersCardProps {
  hardBlockers: any[];
  suppressors: any[];
  incompleteItems: any[];
  dimAvg: Record<string, number>;
  preQualPrograms: ReturnType<typeof getPreQualifiedPrograms>;
  pipelineCounts: PipelineCounts;
  fundScore: number;
  realCapital: ReturnType<typeof computeRealCapital>;
  capitalPath: CapitalMilestone[];
  navigate: (path: string) => void;
}

function FollowOnBlockersCard({
  hardBlockers, suppressors, incompleteItems, dimAvg,
  preQualPrograms, pipelineCounts, fundScore, realCapital, capitalPath, navigate,
}: FollowOnBlockersCardProps) {
  const [trajectoryOpen, setTrajectoryOpen] = useState(false);

  // View event — fires once per mount when Capital Access section renders
  useEffect(() => {
    logEvent({ event_name: 'capital_access_viewed', payload: { pre_qual_count: preQualPrograms.length, pipeline_total: pipelineCounts.total } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Now / Next / Later grouping
  const nowBlockers = hardBlockers.slice(0, 3);         // hard blockers = act immediately
  const nextBlockers = suppressors.slice(0, 2);          // top 2 suppressors = act soon
  const laterBlockers = suppressors.slice(2);             // the rest

  // Capital Access
  const FEATURED_PROGRAMS = [
    { path: '/app/access-funding/business-credit-line', label: 'Business Credit Line', range: '$10K–$250K', icon: '💳' },
    { path: '/app/access-funding/revenue-based-loan', label: 'Revenue-Based Loan', range: '$5K–$500K', icon: '📈' },
    { path: '/app/access-funding/sba-business-loan', label: 'SBA Loans 7a & 504', range: '$50K–$5M', icon: '🏛️' },
  ];

  const gaugeColor = getGaugeColor(fundScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── CAPITAL ACCESS — opportunity-first, visually hopeful ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
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

          {pipelineCounts.total > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {[
                { label: 'Applied', count: pipelineCounts.applied, color: '#3b82f6' },
                { label: 'Reviewing', count: pipelineCounts.under_review, color: '#f59e0b' },
                { label: 'Offers', count: pipelineCounts.offer_received, color: '#10b981', highlight: pipelineCounts.offer_received > 0 },
                { label: 'Accepted', count: pipelineCounts.accepted, color: '#10b981' },
                { label: 'Funded', count: pipelineCounts.funded, color: '#10b981' },
              ].map((stage, i) => (
                <div key={stage.label} onClick={() => navigate('/app/access-funding')} style={{ padding: '8px 10px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: (stage as any).highlight ? `${stage.color}15` : 'var(--background)', border: `1px solid ${stage.count > 0 ? stage.color + '30' : 'var(--border)'}`, position: 'relative' }}>
                  {(stage as any).highlight && stage.count > 0 && (
                    <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--card)' }} />
                  )}
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: stage.count > 0 ? stage.color : 'var(--muted-foreground)' }}>{stage.count}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600 }}>{stage.label}</div>
                  {i < 4 && <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', fontSize: '8px', color: 'var(--muted-foreground)', zIndex: 1 }}>▶</div>}
                </div>
              ))}
            </div>
          )}

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

        {/* Featured programs grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {FEATURED_PROGRAMS.map((prog, i) => {
            const isPreQual = preQualPrograms.some((p: { path: string }) => p.path === prog.path);
            const thresholds: Record<string, number> = {
              '/app/access-funding/business-credit-line': 450,
              '/app/access-funding/revenue-based-loan': 400,
              '/app/access-funding/sba-business-loan': 750,
            };
            const threshold = thresholds[prog.path] || 500;
            const ptsNeeded = Math.max(0, threshold - fundScore);
            return (
              <div key={prog.path} onClick={() => { logEvent({ event_name: 'featured_program_clicked', payload: { program_path: prog.path, is_pre_qual: isPreQual } }); navigate(prog.path); }} style={{ padding: '16px 20px', borderRight: i < 2 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--background)')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{prog.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{prog.label}</span>
                      {isPreQual && <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>{prog.range}</div>
                    <div style={{ marginTop: '6px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: isPreQual ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', border: '1px solid ' + (isPreQual ? 'rgba(16,185,129,0.25)' : 'var(--border)') }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: isPreQual ? '#10b981' : 'var(--muted-foreground)' }}>
                        {isPreQual ? 'Pre-Qualified ✓' : ptsNeeded === 0 ? 'Almost there' : `+${ptsNeeded} pts needed`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── NOW / NEXT / LATER BLOCKERS — subordinated under opportunity ── */}
      {(nowBlockers.length > 0 || nextBlockers.length > 0) && (
        <div style={{ padding: '4px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Blockers</span>
            <button onClick={() => { logEvent({ event_name: 'my_progress_clicked', payload: { source: 'blockers_section' } }); navigate('/app/my-progress'); }} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>Full detail →</button>
          </div>

          {/* NOW */}
          {nowBlockers.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444', marginBottom: '8px' }}>
                Now — fix first
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {nowBlockers.map((blocker, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(getBlockerRoute(blocker.category))}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '9px', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.18)', cursor: 'pointer', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blocker.title}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#ef4444', flexShrink: 0 }}>Fix →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEXT */}
          {nextBlockers.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#f59e0b', marginBottom: '8px' }}>
                Next — after the above
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {nextBlockers.map((blocker, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(getBlockerRoute(blocker.category))}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '9px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.18)', cursor: 'pointer', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blocker.title}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#10b981', flexShrink: 0 }}>
                      {blocker.ficoImpact ? `+${blocker.ficoImpact} pts` : 'Fix →'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LATER */}
          {laterBlockers.length > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '6px' }}>
                Later — {laterBlockers.length} more blocker{laterBlockers.length !== 1 ? 's' : ''}
              </div>
              <button onClick={() => { logEvent({ event_name: 'my_progress_clicked', payload: { source: 'blockers_section' } }); navigate('/app/my-progress'); }} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                View all blockers →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── READINESS BREAKDOWN ── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Readiness Breakdown</h3>
          <button onClick={() => { logEvent({ event_name: 'my_progress_clicked', payload: { source: 'breakdown_card' } }); navigate('/app/my-progress'); }} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>Full detail →</button>
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {DIM_ORDER.map((key, idx) => {
            const val = dimAvg[key] ?? 0;
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

      {/* ── CAPITAL TRAJECTORY (moved lower — context, not above fold) ── */}
      {capitalPath.some(m => m.amount > capitalPath[0].amount) && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          <button
            onClick={() => { if (!trajectoryOpen) logEvent({ event_name: 'trajectory_accordion_opened', payload: {} }); setTrajectoryOpen(v => !v); }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>📈</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>Your Projected Capital Path</span>
            </div>
            <ChevronRight size={14} style={{ color: 'var(--muted-foreground)', transform: trajectoryOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {trajectoryOpen && (
            <div style={{ padding: '0 20px 16px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', margin: '0 0 12px' }}>
                Projected if you fix your top blockers
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                {capitalPath.map((milestone, i) => {
                  const isGrowth = milestone.amount > capitalPath[0].amount;
                  const isToday = i === 0;
                  return (
                    <div key={milestone.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: '10px', background: isToday ? 'var(--background)' : isGrowth ? milestone.color + '10' : 'var(--background)', border: '1px solid ' + (isToday ? 'var(--border)' : isGrowth ? milestone.color + '40' : 'var(--border)') }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px', color: isToday ? 'var(--foreground)' : isGrowth ? milestone.color : 'var(--muted-foreground)', marginBottom: '3px' }}>
                        {milestone.amount > 0 ? formatMoney(milestone.amount) : '$0'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: isToday ? 700 : 400 }}>{milestone.label}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: milestone.color, marginTop: '2px', fontWeight: 600 }}>{Math.round(milestone.score)} pts</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ProgressMarkerCard ───────────────────────────────────────────────────────

interface ProgressMarkerCardProps {
  bankableScore: number;
  bankablePassCount: number;
  pipelineCounts: PipelineCounts;
  membershipTier: MembershipTier;
  napScore: number;
  capitalDisplay: number;
  realCapital: ReturnType<typeof computeRealCapital>;
  preQualPrograms: ReturnType<typeof getPreQualifiedPrograms>;
  fundScore: number;
  navigate: (path: string) => void;
}

function ProgressMarkerCard({
  bankableScore, bankablePassCount, pipelineCounts, membershipTier,
  napScore, capitalDisplay, realCapital, preQualPrograms, fundScore, navigate,
}: ProgressMarkerCardProps) {
  const hasPaidMembership = canAccessGoal2(membershipTier);
  const complianceProgress = getComplianceProgress();
  const totalModules = complianceModules.length;
  const completedModules = complianceModules.filter(m => complianceProgress[m.id]?.completed).length;
  const compPct = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  const nextModule = complianceModules.find(m => !complianceProgress[m.id]?.completed);
  const compColor = compPct === 100 ? '#10b981' : compPct >= 60 ? '#f59e0b' : '#3b82f6';
  const napUrgent = napScore < 80;
  const napColor = napScore >= 80 ? '#10b981' : napScore >= 60 ? '#f59e0b' : '#ef4444';

  // Stage determination
  const GOAL_02_MIN_MODULES = 10;
  const scoreGateMet = bankableScore >= 160;
  const modulesGateMet = completedModules >= GOAL_02_MIN_MODULES;
  const goal01Done = pipelineCounts.funded > 0 || pipelineCounts.accepted > 0;
  const goal02Done = scoreGateMet && modulesGateMet;

  // Which stage is active?
  // Stage 1 is active if not done and no membership lock
  // Stage 2 is active if Stage 1 done and membership available
  // Stage 3 is active when goal02Done
  const activeStage = goal02Done ? 3 : (goal01Done && hasPaidMembership) ? 2 : 1;

  // View event — fires once per mount with current active stage
  useEffect(() => {
    logEvent({ event_name: 'progress_stage_viewed', payload: { active_stage: activeStage } });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stage1Metric = goal01Done
    ? `${pipelineCounts.funded + pipelineCounts.accepted} funding${(pipelineCounts.funded + pipelineCounts.accepted) !== 1 ? 's' : ''} received`
    : capitalDisplay > 0
      ? `${formatMoney(capitalDisplay)} available · ${realCapital.count} product${realCapital.count !== 1 ? 's' : ''} ready`
      : preQualPrograms.length > 0
        ? `${preQualPrograms.length} program${preQualPrograms.length !== 1 ? 's' : ''} pre-qualified`
        : 'Complete compliance modules to unlock products';

  const stages = [
    {
      num: 1,
      label: 'Stage 1: Initial Funding',
      desc: 'Non-bank programs available now — smaller amounts, faster approval',
      done: goal01Done,
      active: activeStage === 1,
      locked: false,
      metric: stage1Metric,
      color: '#10b981',
      ctaLabel: goal01Done ? 'View Funded' : capitalDisplay > 0 ? 'Apply Now' : 'See What You Qualify For',
      ctaPath: '/app/access-funding',
    },
    {
      num: 2,
      label: 'Stage 2: Build Bankability',
      desc: 'Complete compliance modules and build your SBSS score to 160+',
      done: goal02Done,
      active: activeStage === 2,
      locked: !hasPaidMembership,
      metric: !hasPaidMembership
        ? 'Requires Virtual or Live membership'
        : goal02Done
          ? `SBSS ${bankableScore}/300 ✓ · ${bankablePassCount}/20 items · ${completedModules}/${totalModules} modules ✓`
          : `SBSS ${bankableScore}/300 ${scoreGateMet ? '✓' : `— need 160+`} · ${completedModules}/${totalModules} modules verified`,
      color: '#3b82f6',
      ctaLabel: !hasPaidMembership ? 'Upgrade to Unlock' : goal02Done ? 'View Compliance' : completedModules > 0 ? 'Continue Modules' : 'Start Compliance',
      ctaPath: '/app/lender-compliance',
      membershipLocked: !hasPaidMembership,
    },
    {
      num: 3,
      label: 'Stage 3: Bank & SBA Capital',
      desc: 'Up to $5M · 9–12% APR · up to 25-year terms',
      done: false,
      active: activeStage === 3,
      locked: !goal02Done,
      metric: goal02Done
        ? 'Full bank access unlocked · 9–12% APR'
        : !hasPaidMembership
          ? 'Requires membership + Stage 2 completion'
          : `Complete Stage 2 to unlock bank products`,
      color: '#f59e0b',
      ctaLabel: 'Access Bank Products',
      ctaPath: '/app/access-funding',
    },
  ];

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', marginBottom: '0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '3px' }}>
            Your Capital Journey
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>
            Stage {activeStage} of 3 — {stages[activeStage - 1].label.replace(`Stage ${activeStage}: `, '')}
          </div>
        </div>
      </div>

      {/* Stage spine */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {stages.map((stage, i) => {
          const isActive = stage.active;
          const isDone = stage.done;
          const isLocked = stage.locked && !isActive && !isDone;
          const isMembershipLocked = (stage as any).membershipLocked && !isDone;

          return (
            <div
              key={stage.num}
              style={{
                borderRadius: '12px',
                border: isDone ? `1px solid ${stage.color}20` : isActive ? `1.5px solid ${stage.color}35` : isMembershipLocked ? '1px solid rgba(99,102,241,0.25)' : '1px solid var(--border)',
                background: isActive ? `${stage.color}06` : isDone ? `${stage.color}04` : 'var(--background)',
                overflow: 'hidden',
                opacity: isLocked && !isMembershipLocked ? 0.5 : 1,
              }}
            >
              {/* Stage row header */}
              <div style={{ padding: isActive ? '14px 16px 0' : '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  {/* Stage indicator dot/check */}
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: isDone ? stage.color : isActive ? `${stage.color}20` : 'var(--border)',
                    border: `2px solid ${isDone ? stage.color : isActive ? stage.color : 'transparent'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isDone
                      ? <span style={{ fontSize: '10px', color: 'white', fontWeight: 900 }}>✓</span>
                      : isActive
                        ? <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: stage.color }} />
                        : <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--muted-foreground)', opacity: 0.4 }} />
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: isDone || isActive ? 700 : 600, fontSize: '13px', color: isLocked && !isMembershipLocked ? 'var(--muted-foreground)' : 'var(--foreground)', lineHeight: 1.2 }}>
                      {stage.label}
                    </div>
                    {!isActive && (
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: isDone ? stage.color : 'var(--muted-foreground)', fontWeight: isDone ? 700 : 400, marginTop: '2px' }}>
                        {isDone ? stage.metric : isLocked ? stage.metric : null}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '99px', background: isDone ? `${stage.color}15` : isActive ? `${stage.color}12` : isMembershipLocked ? 'rgba(99,102,241,0.1)' : 'var(--border)', border: `1px solid ${isDone || isActive ? stage.color + '30' : isMembershipLocked ? 'rgba(99,102,241,0.3)' : 'transparent'}`, flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: isMembershipLocked ? '#6366f1' : isDone ? stage.color : isActive ? stage.color : 'var(--muted-foreground)' }}>
                    {isDone ? '✓ Done' : isActive ? '● Active' : isMembershipLocked ? '🔒 Members' : '🔒 Locked'}
                  </span>
                </div>
              </div>

              {/* Expanded body — only for active stage */}
              {isActive && (
                <div style={{ padding: '12px 16px 14px' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '10px' }}>
                    {stage.desc}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: stage.color, marginBottom: '12px' }}>
                    {stage.metric}
                  </div>

                  {/* Stage 2: show compliance progress inline */}
                  {stage.num === 2 && !isMembershipLocked && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${compPct}%`, background: `linear-gradient(90deg, ${compColor}, ${compColor}cc)`, borderRadius: '99px', transition: 'width 0.8s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>{completedModules} complete</span>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>{totalModules - completedModules} remaining</span>
                      </div>
                      {/* NAP row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '7px', marginTop: '8px', background: napUrgent ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.05)', border: `1px solid ${napUrgent ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px' }}>{napUrgent ? '⚠️' : '✓'}</span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: napColor }}>Business Visibility · {napScore}/100</span>
                        </div>
                        {napUrgent && (
                          <button onClick={() => navigate('/app/lender-compliance')} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Fix now →</button>
                        )}
                      </div>
                      {/* Next module CTA */}
                      {nextModule && (
                        <button
                          onClick={() => navigate(`/app${nextModule.route}`)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', background: 'linear-gradient(135deg, rgba(59,130,246,0.07), rgba(16,185,129,0.07))', border: '1px solid rgba(59,130,246,0.22)', marginTop: '10px', transition: 'opacity 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                        >
                          <div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#3b82f6', marginBottom: '2px' }}>Continue</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{nextModule.title}</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '1px' }}>Est. 5 min · unlocks more funding programs</div>
                          </div>
                          <ArrowRight size={16} style={{ color: '#3b82f6', flexShrink: 0 }} />
                        </button>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button
                      onClick={() => { logEvent({ event_name: 'progress_stage_cta_clicked', payload: { stage: stage.num, cta_label: stage.ctaLabel, membership_locked: !!isMembershipLocked } }); navigate(stage.ctaPath); }}
                      style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', padding: '8px 16px', background: isMembershipLocked ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : stage.color, border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isMembershipLocked && <Lock size={11} />}
                      {stage.ctaLabel} <ArrowRight size={12} />
                    </button>
                    {stage.num === 2 && !isMembershipLocked && (
                      <button onClick={() => navigate('/app/lender-compliance')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>View all {totalModules} modules</span>
                        <ChevronRight size={11} color="var(--muted-foreground)" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── NextBestMoveCard ──────────────────────────────────────────────────────────

interface NextBestMoveCardProps {
  criticalBlockers: any[];
  topBlocker: any;
  fundScore: number;
  capitalDisplay: number;
  lockedCapital: string | null;
  navigate: (path: string) => void;
}

function NextBestMoveCard({ criticalBlockers, topBlocker, fundScore, capitalDisplay, lockedCapital, navigate }: NextBestMoveCardProps) {
  // View event — fires once per mount when a blocker is present
  useEffect(() => {
    if (topBlocker) {
      logEvent({ event_name: 'next_best_move_viewed', payload: { blocker_title: topBlocker.title, blocker_severity: topBlocker.severity, fico_impact: topBlocker.ficoImpact ?? 0 } });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

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
          {/* Zone A — Why this matters (trust-aligned, non-absolute wording) */}
          <div style={{ marginBottom: '14px', padding: '8px 12px', borderRadius: '8px', background: topBlocker.severity === 'hard_blocker' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${topBlocker.severity === 'hard_blocker' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: topBlocker.severity === 'hard_blocker' ? '#ef4444' : '#f59e0b' }}>
              {topBlocker.severity === 'hard_blocker'
                ? '⚠ Top lender-confidence blocker — many lenders will stop here until this is resolved'
                : 'Score suppressor — addressing this strengthens your position with lenders'}
            </span>
          </div>

          {/* Zone B — Do this now */}
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: 'var(--foreground)', marginBottom: '8px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>{topBlocker.title}</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '12px' }}>
              {topBlocker.description || 'Fixing this unlocks the next tier of capital products for your business.'}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {topBlocker.ficoImpact ? (
                <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#10b981' }}>+{topBlocker.ficoImpact} score pts</span>
                </div>
              ) : null}
              <div style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#3b82f6' }}>~15 min to fix</span>
              </div>
            </div>
            <button onClick={() => { logEvent({ event_name: 'top_blocker_cta_clicked', payload: { blocker_title: topBlocker.title, blocker_category: topBlocker.category, fico_impact: topBlocker.ficoImpact ?? 0 } }); navigate(getBlockerRoute(topBlocker.category)); }} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', padding: '13px 28px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '11px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 24px rgba(16,185,129,0.35)', letterSpacing: '-0.01em' }}>
              Fix This Now <ArrowRight size={15} />
            </button>
          </div>

          {/* Zone C — What this unlocks (gated: only show if delta is real) */}
          {(() => {
            const unlockAmount = topBlocker.ficoImpact
              ? scoreToAmount(fundScore + topBlocker.ficoImpact) - scoreToAmount(fundScore)
              : 0;
            return (
              <div style={{ marginBottom: '16px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.18)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#10b981', marginBottom: '4px' }}>What this unlocks</p>
                {unlockAmount > 0 ? (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', fontWeight: 600, margin: 0 }}>
                    Fixing this adds <span style={{ color: '#10b981' }}>{formatMoney(unlockAmount)}</span> of additional capital potential
                  </p>
                ) : (
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
                    Resolving this strengthens your lender profile and improves access to more capital products
                  </p>
                )}
              </div>
            );
          })()}

          {/* Next after that — sequenced secondary blockers */}
          {criticalBlockers.length > 1 && (
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                Next after that ({criticalBlockers.length - 1} more)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criticalBlockers.slice(1, 4).map((blocker, idx) => (
                  <div
                    key={idx}
                    onClick={() => { logEvent({ event_name: 'next_after_that_clicked', payload: { blocker_title: blocker.title, blocker_category: blocker.category, position: idx + 1 } }); navigate(getBlockerRoute(blocker.category)); }}
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
  );
}

// ── CapacityCard ──────────────────────────────────────────────────────────────

interface CapacityCardProps {
  dscrValue: number | null;
  dtiResult: DTIResult | null;
  navigate: (path: string) => void;
}

function CapacityCard({ dscrValue, dtiResult, navigate }: CapacityCardProps) {
  const dscrStatus =
    dscrValue === null ? null
    : dscrValue >= 1.35 ? 'strong'
    : dscrValue >= 1.25 ? 'passing'
    : dscrValue >= 1.0 ? 'below'
    : 'critical';

  const dtiStatus = dtiResult?.status ?? null;

  const dscrColor =
    dscrStatus === 'strong' ? '#10b981'
    : dscrStatus === 'passing' ? '#8ab820'
    : dscrStatus === 'below' ? '#f59e0b'
    : dscrStatus === 'critical' ? '#b04428'
    : 'var(--muted-foreground)';

  const dtiColor =
    dtiStatus === 'strong' ? '#10b981'
    : dtiStatus === 'passing' ? '#f59e0b'
    : dtiStatus === 'critical' ? '#b04428'
    : 'var(--muted-foreground)';

  // Fire analytics event on mount
  useEffect(() => {
    logEvent({ event_name: 'capacity_card_viewed', payload: {
      dscr_status: dscrStatus ?? 'not_assessed',
      dti_status: dtiStatus ?? 'not_assessed',
    }});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px 22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <Percent size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
          color: 'var(--muted-foreground)', textTransform: 'uppercase',
          letterSpacing: '0.08em', margin: 0,
        }}>
          Capacity Readiness
        </p>
      </div>

      {/* DSCR row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)' }}>
          DSCR
        </span>
        {dscrValue !== null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: dscrColor }}>
              {dscrValue.toFixed(2)}x
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
              fontFamily: 'var(--font-body)',
              background: `${dscrColor}15`, color: dscrColor, border: `1px solid ${dscrColor}30`,
            }}>
              {dscrStatus === 'strong' ? 'Strong' : dscrStatus === 'passing' ? 'At threshold' : dscrStatus === 'below' ? 'Below 1.25x' : 'Critical'}
            </span>
          </div>
        ) : (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            — Not assessed
          </span>
        )}
      </div>

      {/* DTI row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 0', borderBottom: '1px solid var(--border)',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--foreground)' }}>
          DTI
        </span>
        {dtiResult ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: dtiColor }}>
              {Math.round(dtiResult.dti * 100)}%
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
              fontFamily: 'var(--font-body)',
              background: `${dtiColor}15`, color: dtiColor, border: `1px solid ${dtiColor}30`,
            }}>
              {dtiStatus === 'strong' ? 'Strong' : dtiStatus === 'passing' ? 'Borderline' : 'High'}
            </span>
          </div>
        ) : (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            — Not assessed
          </span>
        )}
      </div>

      {/* Callout + CTA */}
      <div style={{ paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)',
          lineHeight: 1.5, margin: 0, flex: 1,
        }}>
          Capacity issues can block approval even with strong credit.
        </p>
        <button
          onClick={() => navigate('/app/credit-path')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '7px 14px', borderRadius: '8px', flexShrink: 0,
            background: 'transparent', border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
            color: 'var(--foreground)', cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}
        >
          Review in CreditPath <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── BestFirstCapitalMoveCard ──────────────────────────────────────────────────

interface BestFirstCapitalMoveCardProps {
  bestFirstMove: BestFirstMove | null;
  navigate: (path: string) => void;
}

function BestFirstCapitalMoveCard({ bestFirstMove, navigate }: BestFirstCapitalMoveCardProps) {
  const viewedRef = useRef(false);

  useEffect(() => {
    if (bestFirstMove && !viewedRef.current) {
      viewedRef.current = true;
      logEvent({ event_name: 'best_first_move_viewed', payload: {
        product: bestFirstMove.product,
        blocked_by: bestFirstMove.blockedBy ?? 'none',
      }});
    }
  }, [bestFirstMove]);

  if (!bestFirstMove) return null;

  const blockedByColor =
    bestFirstMove.blockedBy === 'character' ? '#f59e0b'
    : bestFirstMove.blockedBy === 'capacity' ? '#b04428'
    : bestFirstMove.blockedBy === 'compliance' ? '#a0a020'
    : null;

  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px 22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Landmark size={14} style={{ color: '#10b981', flexShrink: 0 }} />
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
          color: 'var(--muted-foreground)', textTransform: 'uppercase',
          letterSpacing: '0.08em', margin: 0,
        }}>
          Best First Capital Move
        </p>
      </div>

      {/* Product name */}
      <div>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 900,
          color: 'var(--foreground)', margin: '0 0 6px', lineHeight: 1.1,
          letterSpacing: '-0.02em',
        }}>
          {bestFirstMove.product}
        </h3>
        {blockedByColor && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '3px 9px', borderRadius: '6px', marginBottom: '8px',
            background: `${blockedByColor}12`, border: `1px solid ${blockedByColor}30`,
          }}>
            <AlertCircle size={10} style={{ color: blockedByColor }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: blockedByColor }}>
              {bestFirstMove.blockedBy === 'character' ? 'Credit improvement may strengthen odds'
               : bestFirstMove.blockedBy === 'capacity' ? 'Capacity review recommended first'
               : 'Compliance module may be required'}
            </span>
          </div>
        )}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)',
          lineHeight: 1.6, margin: 0,
        }}>
          {bestFirstMove.reasoning}
        </p>
      </div>

      {/* Next after */}
      <div style={{
        padding: '10px 12px', borderRadius: '8px',
        background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: '#10b981', margin: '0 0 4px',
        }}>
          What opens next
        </p>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--foreground)',
          lineHeight: 1.5, margin: 0,
        }}>
          {bestFirstMove.nextAfter}
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          logEvent({ event_name: 'best_first_move_clicked', payload: {
            product: bestFirstMove.product,
            route: bestFirstMove.route,
          }});
          navigate(bestFirstMove.route);
        }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '11px 20px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #10b981, #3b82f6)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
          color: 'white', letterSpacing: '-0.01em',
          boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
          transition: 'opacity 0.15s',
        }}
      >
        View {bestFirstMove.product} <ArrowRight size={14} />
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fundScore, setFundScore] = useState(0);
  const [bankableScore, setBankableScore] = useState(0);
  const [bankablePassPct, setBankablePassPct] = useState(0);   // % of bankable items passing (assessment-based)
  const [bankablePassCount, setBankablePassCount] = useState(0); // raw pass count (out of 20)
  const [scoreBand, setScoreBand] = useState({ name: 'Not Assessed', color: '#64748b' });
  const [hasAssessment, setHasAssessment] = useState(false);
  const [dimAvg, setDimAvg] = useState<Record<string, number>>({});
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when data changes
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('fundready_welcomed'));
  const [newBadgeIds, setNewBadgeIds] = useState<string[]>([]);
  const [pipelineCounts, setPipelineCounts] = useState<PipelineCounts>({ applied: 0, under_review: 0, offer_received: 0, accepted: 0, funded: 0, declined: 0, total: 0 });
  const [napScore, setNapScore] = useState(0);
  const [membershipTier, setMembershipTier] = useState<MembershipTier>(() => getMembershipTier());
  const [storedAssessment, setStoredAssessment] = useState<UnifiedAnswers | null>(null);
  const [dtiResult, setDtiResult] = useState<DTIResult | null>(() => {
    try {
      const raw = localStorage.getItem(DTI_RESULT_KEY);
      return raw ? JSON.parse(raw) as DTIResult : null;
    } catch { return null; }
  });
  // Ref-guard: fire dashboard_viewed once per component mount, not on every storage refresh
  const dashboardViewedFiredRef = useRef(false);
  const dismissWelcome = () => {
    localStorage.setItem('fundready_welcomed', '1');
    setShowWelcome(false);
  };

  // Keep DTI result in sync when user updates it in CreditPath
  useEffect(() => {
    const handleDtiUpdate = () => {
      try {
        const raw = localStorage.getItem(DTI_RESULT_KEY);
        if (raw) setDtiResult(JSON.parse(raw) as DTIResult);
      } catch { /* non-fatal */ }
    };
    window.addEventListener('dtiResultUpdated', handleDtiUpdate);
    return () => window.removeEventListener('dtiResultUpdated', handleDtiUpdate);
  }, []);

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
          const bItems = extendedResults.bankableItems || [];
          const bPass = bItems.filter((i: any) => i.status === 'pass').length;
          setBankablePassCount(bPass);
          setBankablePassPct(bItems.length > 0 ? Math.round((bPass / bItems.length) * 100) : 0);
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

          // dashboard_viewed — fires once per page mount (ref-guarded against storage re-fires)
          if (!dashboardViewedFiredRef.current) {
            dashboardViewedFiredRef.current = true;
            const allAuditSnap = getAllAuditItems();
            const hardBlockerCountSnap = allAuditSnap.filter(i => i.status !== 'complete' && (i as any).severity === 'hard_blocker').length;
            const goal01DoneSnap = pipeSnap.funded > 0 || pipeSnap.accepted > 0;
            const goal02DoneSnap = bs >= 160 && completedModuleCount >= 10;
            const hasPaidSnap = canAccessGoal2(getMembershipTier());
            const activeStageSnap = goal02DoneSnap ? 3 : (goal01DoneSnap && hasPaidSnap) ? 2 : 1;
            logEvent({ event_name: 'dashboard_viewed', payload: { has_assessment: true, fund_score: scoreResult.score, active_stage: activeStageSnap, blocker_count: hardBlockerCountSnap } });
          }
        } else if (!dashboardViewedFiredRef.current) {
          // No assessment — still record the visit
          dashboardViewedFiredRef.current = true;
          logEvent({ event_name: 'dashboard_viewed', payload: { has_assessment: false, fund_score: 0, active_stage: 1, blocker_count: 0 } });
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

    const handleMembershipUpdate = () => setMembershipTier(getMembershipTier());
    window.addEventListener('membershipUpdated', handleMembershipUpdate);
    return () => {
      window.removeEventListener('fundscoreUpdated', handleUpdate);
      window.removeEventListener('auditItemUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('fundingPipelineUpdated', handleUpdate);
      window.removeEventListener('membershipUpdated', handleMembershipUpdate);
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
  // DIM_LABELS imported from business-assessment/types — derived from DIMENSION_INFO
  // DIM_ORDER is defined at module scope (above FollowOnBlockersCard)
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

  // Capacity card: compute DSCR inline from assessment fields (no component import needed)
  const dscrValue: number | null = (() => {
    if (!storedAssessment?.annualNOI || !storedAssessment?.annualDebtService) return null;
    const noi = NOI_MIDPOINTS[storedAssessment.annualNOI] ?? 0;
    const ds = DEBT_SERVICE_MIDPOINTS[storedAssessment.annualDebtService] ?? 0;
    return ds > 0 ? noi / ds : null;
  })();

  // Best First Capital Move: computed from current profile
  const bestFirstMove: BestFirstMove | null = storedAssessment
    ? computeBestFirstMove(storedAssessment, fundScore, bankableScore)
    : null;

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
      <div className="dashboard-main-padding" style={{ padding: '40px 32px 60px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <DashboardHeader
          timeOfDay={timeOfDay}
          firstName={firstName}
          hasAssessment={hasAssessment}
          criticalBlockersCount={criticalBlockers.length}
          capitalDisplay={capitalDisplay}
          navigate={navigate}
        />

        {/* ══════════════════════════════════════════════════════════════════════ */}

        {/* ── NO ASSESSMENT STATE ─────────────────────────────────────────────── */}
        {!hasAssessment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', padding: '72px 32px', background: 'var(--card)', border: '2px dashed var(--border)', borderRadius: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
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

            {/* ROW 1: CAPITAL POTENTIAL + PRIORITY ACTION — Command band */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '24px', marginBottom: '36px', alignItems: 'stretch' }}>
              <ReadinessSnapshotCard
                fundScore={fundScore}
                bankableScore={bankableScore}
                bankablePassPct={bankablePassPct}
                bankablePassCount={bankablePassCount}
                capitalDisplay={capitalDisplay}
                realCapital={realCapital}
                criticalBlockers={criticalBlockers}
                statusInfo={statusInfo}
                nextMilestone={nextMilestone}
                gaugeColor={gaugeColor}
                topBlocker={topBlocker}
                navigate={navigate}
              />
              <NextBestMoveCard
                criticalBlockers={criticalBlockers}
                topBlocker={topBlocker}
                fundScore={fundScore}
                capitalDisplay={capitalDisplay}
                lockedCapital={lockedCapital}
                navigate={navigate}
              />
            </div>

            {/* ROW 2: CAPACITY READINESS + BEST FIRST CAPITAL MOVE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
              <CapacityCard
                dscrValue={dscrValue}
                dtiResult={dtiResult}
                navigate={navigate}
              />
              <BestFirstCapitalMoveCard
                bestFirstMove={bestFirstMove}
                navigate={navigate}
              />
            </div>

            {/* ── PROGRESS MARKER — stage-aware capital journey (Progress band) ── */}
            <div style={{ marginBottom: '28px' }}>
            <ProgressMarkerCard
              bankableScore={bankableScore}
              bankablePassCount={bankablePassCount}
              pipelineCounts={pipelineCounts}
              membershipTier={membershipTier}
              napScore={napScore}
              capitalDisplay={capitalDisplay}
              realCapital={realCapital}
              preQualPrograms={preQualPrograms}
              fundScore={fundScore}
              navigate={navigate}
            />
            </div>

            {/* FOLLOW-ON BLOCKERS + READINESS + CAPITAL ACCESS — Opportunity / Intelligence / Forecast bands */}
            <FollowOnBlockersCard
              hardBlockers={hardBlockers}
              suppressors={suppressors}
              incompleteItems={incompleteItems}
              dimAvg={dimAvg}
              preQualPrograms={preQualPrograms}
              pipelineCounts={pipelineCounts}
              fundScore={fundScore}
              realCapital={realCapital}
              capitalPath={capitalPath}
              navigate={navigate}
            />

            {/* ACHIEVEMENTS STRIP */}
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
