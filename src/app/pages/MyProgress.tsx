// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — My Progress Page
// Deep analytics: dimension cards, score ceiling, unlock path, badges
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'motion/react';
import {
  BarChart3, TrendingUp, ArrowLeft, Zap, Clock,
  Building2, CreditCard, Shield, FileText, CheckCircle2, Lock,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { computeScore, getBand, computeExtendedResults } from './business-assessment/engine';
import { getDataItem } from '../lib/data-adapter';
import { useAuth } from '../contexts/AuthContext';
import type { UnifiedAnswers } from './business-assessment/types';
import { BadgeGrid } from '../components/BadgeGrid';

// ── Dimension helpers ──────────────────────────────────────────────────────────

function getDimStatus(score: number) {
  if (score < 0.2) return { label: 'Barrier', color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' };
  if (score < 0.4) return { label: 'Weak', color: '#f97316', bg: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.2)' };
  if (score < 0.6) return { label: 'Growing', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' };
  if (score < 0.8) return { label: 'Strong', color: '#22c55e', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)' };
  return { label: 'Bankable', color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)' };
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

function getDimAction(key: string, score: number) {
  const dim = DIM_CONFIG.find(d => d.key === key);
  if (!dim) return '';
  if (score < 0.2) return dim.actions.barrier;
  if (score < 0.4) return dim.actions.weak;
  if (score < 0.6) return dim.actions.growing;
  return dim.actions.strong;
}

// ── Capital Unlock Path ────────────────────────────────────────────────────────

const UNLOCK_STEPS = [
  { label: 'Complete Assessment', desc: 'Get your baseline FundScore', cta: '/business-assessment', unlocks: 'Your personalized capital roadmap' },
  { label: 'Open Business Bank Account', desc: 'Dedicated account separate from personal', cta: '/app/lender-compliance/business-banking', unlocks: 'Revenue-based & merchant advance products' },
  { label: 'Build Credit to 680+', desc: 'Across all 3 bureaus', cta: '/app/building-credit', unlocks: 'Business credit lines up to $250K' },
  { label: 'Show 2 Years of Returns', desc: 'Business & personal tax returns on file', cta: '/app/document-collection', unlocks: 'SBA loans & bank term loans' },
  { label: 'Clear All Blockers', desc: 'No liens, judgments, or active collections', cta: '/app/lender-compliance', unlocks: 'Elite capital access: $500K–$5M+' },
];

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════

export function MyProgress() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fundScore, setFundScore] = useState(0);
  const [bankableScore, setBankableScore] = useState(0);
  const [scoreBand, setScoreBand] = useState({ name: 'Not Assessed', color: '#64748b' });
  const [hasAssessment, setHasAssessment] = useState(false);
  const [dimAvg, setDimAvg] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      try {
        let json = null;
        if (user) {
          json = await getDataItem('unified_assessment');
        } else {
          json = localStorage.getItem('unified_assessment');
        }
        if (json) {
          const data = JSON.parse(json) as UnifiedAnswers;
          const result = computeScore(data);
          const extended = computeExtendedResults(data);
          setFundScore(result.score);
          setDimAvg(result.dimAvg || {});
          setBankableScore(extended.sbssScore || Math.round(result.score * 0.18));
          setScoreBand(getBand(result.score));
          setHasAssessment(true);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [user]);

  // Potential score calculation
  const DIM_WEIGHTS: Record<string, number> = { P: 0.20, B: 0.10, F: 0.25, C: 0.20, S: 0.15, N: 0.10 };
  const weakDims = Object.entries(dimAvg).filter(([, v]) => v < 0.8).sort(([, a], [, b]) => a - b).slice(0, 3);
  const potentialAvg = { ...dimAvg };
  weakDims.forEach(([k]) => { potentialAvg[k] = 0.8; });
  const potentialBase = Object.entries(potentialAvg).reduce((s, [k, v]) => s + v * (DIM_WEIGHTS[k] || 0), 0);
  const potentialScore = Math.min(1000, Math.round(potentialBase * 1000 + 80));
  const scoreGap = potentialScore - fundScore;

  // Unlock path: determine completed steps
  const step0Done = hasAssessment;
  const step1Done = dimAvg['F'] > 0.3;
  const step2Done = dimAvg['P'] >= 0.65;
  const step3Done = dimAvg['N'] >= 0.7;
  const step4Done = Object.values(dimAvg).every(v => v >= 0.6);
  const stepDone = [step0Done, step1Done, step2Done, step3Done, step4Done];

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-[1100px] mx-auto px-6 py-8 lg:px-8 lg:py-10">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/app/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--card)')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'none')}
          >
            <ArrowLeft size={15} /> Dashboard
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 30px)', color: 'var(--foreground)', margin: 0, letterSpacing: '-0.02em' }}>
              My Progress
            </h1>
          </div>
          <button
            onClick={() => navigate('/business-assessment/results')}
            style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Full Report →
          </button>
        </div>

        {!hasAssessment && (
          <div style={{ textAlign: 'center', padding: '60px 32px', background: 'var(--card)', border: '2px dashed var(--border)', borderRadius: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--foreground)', marginBottom: '8px' }}>No assessment yet</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '20px' }}>Complete your FundScore assessment to see your progress analytics.</p>
            <button onClick={() => navigate('/business-assessment')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', padding: '12px 28px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>
              Start Assessment →
            </button>
          </div>
        )}

        {hasAssessment && (
          <>
            {/* SCORE CEILING */}
            {scoreGap > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}
              >
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Your Score Ceiling</h2>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '3px 0 0' }}>Fix your 3 weakest dimensions to reach {potentialScore}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Now</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: 'var(--foreground)' }}>{fundScore}</div>
                    </div>
                    <div style={{ color: 'var(--muted-foreground)' }}>→</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Potential</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: '#10b981' }}>{potentialScore}</div>
                    </div>
                    <div style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: '#10b981' }}>+{scoreGap} pts</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted-foreground)', minWidth: '28px' }}>{fundScore}</span>
                    <div style={{ flex: 1, height: '8px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden', position: 'relative' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(fundScore / 1000) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ position: 'absolute', height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
                      <div style={{ position: 'absolute', top: '-3px', bottom: '-3px', width: '3px', borderRadius: '2px', background: '#10b981', left: `${(potentialScore / 1000) * 100}%`, boxShadow: '0 0 6px #10b981' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#10b981', minWidth: '28px', textAlign: 'right' }}>{potentialScore}</span>
                  </div>
                </div>
                <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top moves to close the gap:</div>
                  {weakDims.map(([key, val], i) => {
                    const gain = Math.round((0.8 - val) * (DIM_WEIGHTS[key] || 0) * 1000);
                    const dim = DIM_CONFIG.find(d => d.key === key);
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '9px 14px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: 'white' }}>{i + 1}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--foreground)' }}>Improve {dim?.label || key}</div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>Currently {Math.round(val * 100)}% — reach 80%</div>
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: '#10b981' }}>+{gain} pts</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* DIMENSION DETAIL CARDS */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Capital Readiness by Dimension</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '3px 0 0' }}>Six factors lenders evaluate — each with a specific action to improve it</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0' }}>
                {DIM_CONFIG.map((dim, i) => {
                  const val = dimAvg[dim.key] ?? 0;
                  const st = getDimStatus(val);
                  const action = getDimAction(dim.key, val);
                  const Icon = dim.Icon;
                  const borderRight = i % 2 === 0 ? '1px solid var(--border)' : 'none';
                  const borderBottom = i < 4 ? '1px solid var(--border)' : 'none';
                  return (
                    <div key={dim.key} style={{ padding: '18px 20px', borderRight, borderBottom, background: st.bg }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Icon size={16} style={{ color: st.color, flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>{dim.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: st.color }}>{Math.round(val * 100)}%</span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: `${st.color}15`, border: `1px solid ${st.color}30`, color: st.color }}>{st.label}</span>
                        </div>
                      </div>
                      <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '10px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${val * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.06 }} style={{ height: '100%', background: st.color, borderRadius: '99px' }} />
                      </div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5, margin: 0 }}>
                        <Zap size={11} style={{ color: st.color, display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {action}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CAPITAL UNLOCK PATH */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Your Capital Unlock Path</h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '3px 0 0' }}>5 sequential milestones — each one unlocks a new tier of capital</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {UNLOCK_STEPS.map((step, i) => {
                  const done = stepDone[i] ?? false;
                  const isLast = i === UNLOCK_STEPS.length - 1;
                  return (
                    <div key={i} style={{ display: 'flex', gap: '14px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#10b981' : 'var(--border)', border: done ? 'none' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {done ? <CheckCircle2 size={16} style={{ color: 'white' }} /> : <Lock size={12} style={{ color: 'var(--muted-foreground)' }} />}
                        </div>
                        {!isLast && <div style={{ width: '2px', flex: 1, minHeight: '20px', background: done ? '#10b981' : 'var(--border)', margin: '3px 0' }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: isLast ? 0 : '18px', cursor: done ? 'default' : 'pointer' }} onClick={() => !done && navigate(step.cta)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: done ? 'line-through' : 'none' }}>{step.label}</span>
                          {done && <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Done</span>}
                        </div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '0 0 4px', lineHeight: 1.4 }}>{step.desc}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Zap size={11} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--primary)' }}>Unlocks: {step.unlocks}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* ACHIEVEMENTS */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <BadgeGrid />
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyProgress;
