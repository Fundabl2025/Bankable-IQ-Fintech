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
  ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { 
  getBusinessProfile, 
  getAllAuditItems,
  getOverallProgress 
} from '../utils/businessData';
import { computeScore, getBand, computeExtendedResults } from './business-assessment/engine';
import type { UnifiedAnswers } from './business-assessment/types';

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
// MAIN DASHBOARD COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function Dashboard() {
  const navigate = useNavigate();
  const [fundScore, setFundScore] = useState(0);
  const [bankableScore, setBankableScore] = useState(0);
  const [scoreBand, setScoreBand] = useState({ name: 'Not Assessed', color: '#64748b' });
  const [hasAssessment, setHasAssessment] = useState(false);

  // Load scores from unified_assessment (same source as Results page)
  useEffect(() => {
    const loadScores = () => {
      try {
        const stored = localStorage.getItem('unified_assessment');
        if (stored) {
          const assessmentData = JSON.parse(stored) as UnifiedAnswers;
          
          // Use the same engine as Results page for consistent scoring
          const scoreResult = computeScore(assessmentData);
          const extendedResults = computeExtendedResults(assessmentData);
          const band = getBand(scoreResult.score);
          
          setFundScore(scoreResult.score);
          setBankableScore(extendedResults.sbssScore || Math.round(scoreResult.score * 0.18));
          setScoreBand(band);
          setHasAssessment(true);
          
          console.log('[v0] Dashboard loaded scores:', { 
            fundScore: scoreResult.score, 
            bankableScore: extendedResults.sbssScore,
            band: band.name 
          });
        }
      } catch (error) {
        console.error('[v0] Error loading scores:', error);
      }
    };
    loadScores();

    // Listen for updates
    const handleUpdate = () => loadScores();
    window.addEventListener('fundscoreUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('fundscoreUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Get audit items for blockers/actions (using severity classification)
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

  return (
    <div 
      className="flex-1 min-h-screen overflow-auto"
      style={{ backgroundColor: 'var(--background)' }}
    >
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
            { label: 'Items Complete', value: `${progress.completedItems}/${progress.totalItems}`, icon: CheckCircle2, color: 'var(--success)' },
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

      </div>
    </div>
  );
}

export default Dashboard;
