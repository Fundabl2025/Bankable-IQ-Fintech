// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Assessment Results
// Brand-aligned · Behavioral design (Fogg / Eyal / Hughes) · CreditPath gateway
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, useSpring } from 'motion/react';
import { UnifiedAnswers, ExtendedResultsOutput } from './types';
import { computeScore, getBand, computeExtendedResults } from './engine';
import { evaluateProducts } from './productEligibility';
import { extractCreditBlockers, selectTopThree } from '../credit-path/creditBlockers';
import { PRODUCT_TO_PROGRAM_ID } from '../../utils/fundingEligibility';
import { EstimatedFunding } from '../StatusReports/EstimatedFunding';
import { syncAssessmentToBusinessProfile } from '../../utils/businessData';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowRight, Check, AlertCircle, ChevronRight, Lock } from 'lucide-react';
import { logEvent } from '../../lib/analytics/events';

// ── Helper maps ───────────────────────────────────────────────────────────────

function mapCreditScore(category: string): string {
  const map: Record<string, string> = {
    exceptional: '820', very_good: '770', good: '700',
    fair: '620', poor: '550', unknown: 'Not provided',
  };
  return map[category] || 'Not provided';
}

function mapUtilization(category: string): string {
  const map: Record<string, string> = {
    under_10: 'Under 10%', '10_30': '10%–30%', '30_50': '30%–50%',
    '50_75': '50%–75%', over_75: 'Over 75%',
  };
  return map[category] || 'Not provided';
}

function mapRevenue(category: string): string {
  const map: Record<string, string> = {
    under_5k: 'Under $5K/mo', '5k_15k': '$5K–$15K/mo', '15k_40k': '$15K–$40K/mo',
    '40k_100k': '$40K–$100K/mo', over_100k: 'Over $100K/mo',
  };
  return map[category] || 'Not provided';
}

function mapInquiries(category: string): string {
  const map: Record<string, string> = { '0': '0', '1_2': '1–2', '3_4': '3–4', '5plus': '5+' };
  return map[category] || 'Not provided';
}

// ── Status system ─────────────────────────────────────────────────────────────

interface StatusInfo {
  status: 'Unprepared' | 'Fundable' | 'Progressing' | 'Bankable' | 'Elite';
  bankableScore: number;
  bankableThreshold: number;
  pointsToBankable: number;
  statusColor: string;
  statusBgColor: string;
  capitalTier: string;
}

function computeStatus(extendedResults: ExtendedResultsOutput): StatusInfo {
  const bankableScore = extendedResults.sbssScore || 0;
  const bankableThreshold = 160;
  const pointsToBankable = Math.max(0, bankableThreshold - bankableScore);

  let status: StatusInfo['status'];
  let statusColor: string;
  let statusBgColor: string;
  let capitalTier: string;

  if (bankableScore < 80) {
    status = 'Unprepared'; statusColor = '#ef4444'; statusBgColor = 'rgba(239,68,68,0.12)';
    capitalTier = 'Tier 0 — Building Foundation';
  } else if (bankableScore < 160) {
    status = 'Fundable'; statusColor = '#f97316'; statusBgColor = 'rgba(249,115,22,0.12)';
    capitalTier = 'Tier 1 — Alternative Capital';
  } else if (bankableScore < 190) {
    status = 'Progressing'; statusColor = '#eab308'; statusBgColor = 'rgba(234,179,8,0.12)';
    capitalTier = 'Tier 2 — Growing Bankability';
  } else if (bankableScore < 210) {
    status = 'Bankable'; statusColor = '#10b981'; statusBgColor = 'rgba(16,185,129,0.12)';
    capitalTier = 'Tier 3 — Bank Capital Eligible';
  } else {
    status = 'Elite'; statusColor = '#8ab820'; statusBgColor = 'rgba(138,184,32,0.12)';
    capitalTier = 'Tier 4 — Elite Borrower';
  }

  return { status, bankableScore, bankableThreshold, pointsToBankable, statusColor, statusBgColor, capitalTier };
}

// ── Goal options for micro-commitment ────────────────────────────────────────

const GOAL_OPTIONS = [
  { id: 'capital', label: 'Get capital fast', icon: '⚡' },
  { id: 'credit', label: 'Build my credit profile', icon: '📈' },
  { id: 'bankable', label: 'Qualify for bank financing', icon: '🏦' },
];

// ════════════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════════════

export function Results() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<UnifiedAnswers | null>(null);
  const [result, setResult] = useState<ReturnType<typeof computeScore> | null>(null);
  const [extendedResults, setExtendedResults] = useState<ExtendedResultsOutput | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'capital'>('overview');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const springScore = useSpring(0, { stiffness: 40, damping: 12 });
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    localStorage.setItem('fundready_results_viewed', '1');
    window.dispatchEvent(new Event('fundscoreUpdated'));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('unified_assessment');
    if (!saved?.trim()) {
      navigate('/business-assessment?message=Please complete the assessment first to see your results');
      return;
    }
    try {
      const assessmentData = JSON.parse(saved);
      if (!assessmentData || Object.keys(assessmentData).length === 0) {
        navigate('/business-assessment?message=Please complete the assessment first to see your results');
        return;
      }
      setData(assessmentData);
      syncAssessmentToBusinessProfile(assessmentData);
      const scoreResult = computeScore(assessmentData);
      setResult(scoreResult);
      logEvent({ event_name: 'assessment_completed', payload: { scoring_version: scoreResult.scoringVersion, fund_score: scoreResult.score, bankable_score: scoreResult.bankableScore } });
      if (!localStorage.getItem('fundready_initial_score')) {
        localStorage.setItem('fundready_initial_score', String(scoreResult.score));
      }
      const extended = computeExtendedResults(assessmentData);
      setExtendedResults(extended);
      springScore.set(scoreResult.score);
    } catch {
      navigate('/business-assessment?message=Error loading assessment data');
    }
  }, [navigate]);

  useEffect(() => {
    const unsub = springScore.on('change', (v) => setDisplayScore(Math.round(v)));
    return unsub;
  }, [springScore]);

  if (!result || !data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0f0a' }}>
        <div style={{ fontFamily: 'var(--font-body)', color: '#8ab820', fontSize: '14px', letterSpacing: '0.1em' }}>Calculating your score…</div>
      </div>
    );
  }

  const band = getBand(result.score);
  const products = evaluateProducts(data, result.score);
  const eligibleProducts = products.filter(p => p.qualifies);
  const qualifiedProgramIds = [...new Set(eligibleProducts.map(p => PRODUCT_TO_PROGRAM_ID[p.id]).filter(Boolean))];
  localStorage.setItem('preQualifiedPrograms', JSON.stringify(qualifiedProgramIds));
  window.dispatchEvent(new Event('fundscoreUpdated'));

  const allCreditBlockers = extractCreditBlockers(data);
  const topBlockers = selectTopThree(allCreditBlockers);
  const ownerName = [data.ownerFirstName, data.ownerLastName].filter(Boolean).join(' ') || 'Business Owner';
  const businessName = data.businessName || 'Your Business';
  const statusInfo = extendedResults ? computeStatus(extendedResults) : null;

  // Products — show 4 to non-users, all to users (information gap / Eyal)
  const VISIBLE_COUNT = user ? eligibleProducts.length : Math.min(4, eligibleProducts.length);
  const lockedCount = user ? 0 : Math.max(0, eligibleProducts.length - VISIBLE_COUNT);
  const visibleProducts = eligibleProducts.slice(0, VISIBLE_COUNT);

  // CTA copy personalized by status + goal selected
  const goalCtaMap: Record<string, Record<string, string>> = {
    capital:   { Elite: 'Deploy capital immediately', Bankable: 'Access bank-rate capital now', Progressing: 'Unlock faster capital', Fundable: 'Access your first products', Unprepared: 'See what to unlock first' },
    credit:    { Elite: 'Protect your Elite credit standing', Bankable: 'Expand your credit profile', Progressing: 'Close the gap to bankable', Fundable: 'Build toward better rates', Unprepared: 'Start building your credit file' },
    bankable:  { Elite: 'Maintain Elite bankability', Bankable: 'Optimize for prime bank terms', Progressing: 'Reach bankable status', Fundable: 'Map your path to bankability', Unprepared: 'Build the foundation lenders require' },
  };
  const ctaAction = selectedGoal && statusInfo ? (goalCtaMap[selectedGoal]?.[statusInfo.status] || 'Save My Score') : 'Save My Score';

  // Score expires copy (loss framing / Hughes)
  const scoreExpiresNote = !user ? 'Your results clear in 7 days without an account.' : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* ── Save status ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '12px' }}>
          {user ? (
            <><Check size={13} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--success)' }}>Results saved to your account</span></>
          ) : (
            <><AlertCircle size={13} style={{ color: 'var(--warning)' }} /><span style={{ color: 'var(--warning)' }}>Results not saved — create account to keep them</span></>
          )}
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* SCORE HERO — dark, brand-aligned, identity-first                   */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#0d0f0a',
            borderRadius: '16px',
            border: '1px solid rgba(138,184,32,0.25)',
            padding: '48px 32px 40px',
            textAlign: 'center',
            marginBottom: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}>

          {/* Subtle radial glow behind number */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: '320px', height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(138,184,32,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Authority frame — Chase Hughes: pre-authority before the reveal */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(138,184,32,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Assessed against institutional lending standards
          </motion.div>

          {/* Score label */}
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>
            Your Capital Readiness Score
          </div>

          {/* Animated score number */}
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 60 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(80px, 18vw, 128px)', fontWeight: 900, color: '#8ab820', lineHeight: 1, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {displayScore || '—'}
          </motion.div>

          {/* Band label */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: band.color, marginBottom: '24px' }}>
            {band.name}
          </motion.div>

          {/* Identity declaration — Hughes: identity label drives compliance */}
          {statusInfo && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              style={{ marginBottom: '28px' }}>
              <div style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: statusInfo.statusBgColor,
                borderRadius: '8px',
                border: `1px solid ${statusInfo.statusColor}40`,
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: statusInfo.statusColor }}>
                  {data.ownerFirstName ? `${data.ownerFirstName}, you are a` : 'You are a'}{' '}
                  <strong style={{ fontWeight: 900 }}>{statusInfo.status} Business Owner.</strong>
                </span>
              </div>
              <div style={{ marginTop: '8px', fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.45)', fontStyle: 'italic' }}>
                {statusInfo.status === 'Elite' && 'Your profile ranks in the top tier of fundable businesses.'}
                {statusInfo.status === 'Bankable' && 'Banks seek out businesses at your level.'}
                {statusInfo.status === 'Progressing' && 'The right moves now compound quickly into bankability.'}
                {statusInfo.status === 'Fundable' && 'You qualify for alternative capital — this is the starting point most businesses never reach.'}
                {statusInfo.status === 'Unprepared' && 'Every bankable business started here. Your path is clear.'}
              </div>
            </motion.div>
          )}

          {/* SBSS bar — 0-300 scale, threshold tick at 53.3% */}
          {statusInfo && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              style={{ maxWidth: '480px', margin: '0 auto 20px auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>Business SBSS Score</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: statusInfo.bankableScore >= 160 ? '#8ab820' : '#f59e0b' }}>
                  {statusInfo.bankableScore} / 300
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', position: 'relative' }}>
                <div style={{
                  width: `${Math.min(100, (statusInfo.bankableScore / 300) * 100)}%`,
                  height: '100%',
                  background: statusInfo.bankableScore >= 160 ? '#8ab820' : '#f59e0b',
                  borderRadius: '3px',
                  transition: 'width 0.8s ease-out',
                }} />
                {/* Threshold tick */}
                <div style={{ position: 'absolute', left: `${(160 / 300) * 100}%`, top: '-4px', width: '1px', height: '14px', background: 'rgba(255,255,255,0.3)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>0</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                  {statusInfo.bankableScore >= 160 ? '✓ Bankable threshold crossed' : `${statusInfo.pointsToBankable} pts to bankable threshold`}
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>300</span>
              </div>
            </motion.div>
          )}

          {/* 2-metric row */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
            style={{ display: 'flex', gap: '1px', maxWidth: '400px', margin: '0 auto', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(138,184,32,0.15)' }}>
            {[
              { label: 'Products Eligible', value: `${eligibleProducts.length}/17`, color: '#8ab820' },
              { label: statusInfo?.capitalTier || 'Capital Tier', value: statusInfo?.status || band.name, color: statusInfo?.statusColor || band.color },
            ].map((m, i) => (
              <div key={i} style={{ flex: 1, padding: '14px 12px', background: 'rgba(255,255,255,0.04)', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.35)', marginBottom: '6px' }}>{m.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: m.color }}>{m.value}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* WHAT THIS MEANS — narrative */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}
          style={{ background: 'var(--bg-surface-1)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '28px 32px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            What Your Profile Reveals
          </h2>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            {(() => {
              const tierColor = result.score >= 900 ? 'var(--success)' : result.score >= 800 ? '#8ab820' : 'var(--warning)';
              const tier = result.score >= 900 ? 'Prime' : result.score >= 800 ? 'Ready' : result.score >= 700 ? 'Approaching' : result.score >= 600 ? 'Developing' : 'Building';
              const blockedCount = products.filter(p => !p.qualifies).length;
              const maxFunding = eligibleProducts.length > 0
                ? Math.max(...eligibleProducts.map(p => { const a = p.maxAmount.replace(/[$,KM+]/g, ''); return a.includes('.') ? parseFloat(a) * 1e6 : parseInt(a) * 1000; })) : 0;
              const maxFundingText = maxFunding >= 1e6 ? `$${(maxFunding / 1e6).toFixed(1)}M` : maxFunding >= 1000 ? `$${Math.round(maxFunding / 1000)}K` : '$0';
              if (eligibleProducts.length === 0) return <p style={{ margin: 0 }}>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. Address the blockers below to unlock your first capital products.</p>;
              return <p style={{ margin: 0 }}>Your FundScore of <strong style={{ color: tierColor }}>{result.score}</strong> places you in the <strong>{tier}</strong> tier. You qualify for <strong style={{ color: '#8ab820' }}>{eligibleProducts.length} financing products</strong> with up to <strong>{maxFundingText}</strong> available. {blockedCount > 0 ? `Addressing ${blockedCount} blockers unlocks the full product set.` : 'Your profile is clean — lenders will compete for your business.'}</p>;
            })()}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* CAPITAL PRODUCTS — visible + locked (information gap / Eyal)       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
          style={{ background: 'var(--bg-surface-1)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '28px 32px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Capital Products Available Now
            </h2>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#8ab820' }}>
              {eligibleProducts.length} / 17
            </span>
          </div>

          {eligibleProducts.length === 0 ? (
            <div style={{ padding: '20px', background: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px solid var(--warning)', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--warning)' }}>Address the blockers below to unlock capital products.</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: lockedCount > 0 ? '12px' : '0' }}>
                {visibleProducts.map((product) => (
                  <div key={product.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', background: 'var(--bg-surface-2)', borderRadius: '8px',
                    border: '1px solid rgba(138,184,32,0.2)',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{product.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Up to {product.maxAmount} · {product.speed}</div>
                    </div>
                    <div style={{
                      fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '4px',
                      background: product.confidence === 'High' ? 'rgba(138,184,32,0.1)' : 'rgba(245,158,11,0.1)',
                      color: product.confidence === 'High' ? '#8ab820' : '#f59e0b',
                    }}>
                      {product.confidence} Confidence
                    </div>
                  </div>
                ))}
              </div>

              {/* Locked products — information gap for non-users */}
              {lockedCount > 0 && (
                <button onClick={() => navigate('/signup')} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '14px 20px', background: 'rgba(138,184,32,0.06)', borderRadius: '8px',
                  border: '1px dashed rgba(138,184,32,0.3)', cursor: 'pointer',
                }}>
                  <Lock size={14} style={{ color: '#8ab820' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: '#8ab820' }}>
                    {lockedCount} more product{lockedCount !== 1 ? 's' : ''} locked — create account to unlock
                  </span>
                </button>
              )}

              {/* Near-miss products */}
              {(() => {
                const nearMiss = products.filter(p => !p.qualifies && p.blockers.length >= 1 && p.blockers.length <= 2).slice(0, 3);
                if (!nearMiss.length) return null;
                return (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      🔒 Close to qualifying — fix 1–2 items to unlock
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {nearMiss.map(product => (
                        <div key={product.id} style={{ padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px solid var(--border-subtle)', opacity: 0.85 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{product.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>Up to {product.maxAmount} · {product.speed}</div>
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', whiteSpace: 'nowrap', flexShrink: 0 }}>
                              {product.blockers.length === 1 ? '1 blocker away' : `${product.blockers.length} blockers`}
                            </span>
                          </div>
                          {product.blockers.map((b, i) => (
                            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                              <span style={{ fontSize: '10px', color: '#ef4444', marginTop: '2px' }}>✗</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{b}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* CREDIT BLOCKERS — assessment-derived, CreditPath gateway           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
          style={{ background: 'var(--bg-surface-1)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '28px 32px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {topBlockers.length > 0 ? "What's Holding Your Score Back" : 'Your Credit Profile Is Clean'}
            </h2>
            {allCreditBlockers.length > 0 && (
              <span style={{ padding: '3px 10px', background: 'rgba(176,68,40,0.1)', color: '#b04428', borderRadius: '6px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {allCreditBlockers.length} blocker{allCreditBlockers.length !== 1 ? 's' : ''} detected
              </span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            {topBlockers.length > 0
              ? 'Derived from your assessment — same engine as CreditPath. Ranked by impact.'
              : 'No credit blockers found. Run CreditPath to confirm and build further.'}
          </p>

          {topBlockers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {topBlockers.map((blocker, idx) => {
                const sc = blocker.severity === 'critical' ? '#ef4444' : blocker.severity === 'high' ? '#f97316' : '#f59e0b';
                const sb = blocker.severity === 'critical' ? 'rgba(239,68,68,0.08)' : blocker.severity === 'high' ? 'rgba(249,115,22,0.08)' : 'rgba(245,158,11,0.08)';
                const sl = blocker.severity === 'critical' ? 'Approval Barrier' : blocker.severity === 'high' ? 'High Priority' : 'Moderate';
                return (
                  <div key={idx} style={{ padding: '14px 16px', background: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px solid var(--border-subtle)', borderLeft: `3px solid ${sc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>{blocker.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '6px' }}>{blocker.why}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>First step: {blocker.firstStep} · {blocker.timeToResult}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: sb, color: sc, whiteSpace: 'nowrap', flexShrink: 0, textTransform: 'uppercase' as const }}>{sl}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={() => navigate('/app/credit-path')}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'linear-gradient(135deg, rgba(176,68,40,0.06), rgba(245,158,11,0.06))', border: '1px solid rgba(176,68,40,0.2)', borderRadius: '10px', cursor: 'pointer' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1px' }}>Get Your Full CreditPath Analysis</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{allCreditBlockers.length > 0 ? `All ${allCreditBlockers.length} blockers with step-by-step action plans and Phase 3 tools` : 'Confirm clean profile and get tools to build further'}</div>
            </div>
            <ChevronRight size={16} style={{ color: '#b04428', flexShrink: 0 }} />
          </button>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* WHAT LENDERS ACTUALLY SEE                                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {(() => {
          const revMap: Record<string, string> = { under_5k: '$2,500/mo', '5k_15k': '$10,000/mo', '15k_40k': '$27,500/mo', '40k_100k': '$70,000/mo', over_100k: '$125,000/mo' };
          const nsfHaircut: Record<string, number> = { '0': 0, '1_2': 0.10, '3_5': 0.25, '5plus': 0.40 };
          const revLabel = revMap[data.monthlyRevenue] || 'Not reported';
          const haircut = nsfHaircut[data.nsfCount] || 0;
          const revNum = ({ under_5k: 2500, '5k_15k': 10000, '15k_40k': 27500, '40k_100k': 70000, over_100k: 125000 } as Record<string, number>)[data.monthlyRevenue] || 0;
          const effectiveRev = haircut > 0 ? `$${Math.round(revNum * (1 - haircut)).toLocaleString()}/mo` : revLabel;
          const mc = (c: string) => ({ exceptional: 825, very_good: 770, good: 700, fair: 620, poor: 520, unknown: 580 }[c] || 0);
          const scores = [mc(data.experian), mc(data.transunion), mc(data.equifax)].filter(Boolean).sort((a, b) => a - b);
          const middleScore = scores.length >= 2 ? scores[Math.floor(scores.length / 2)] : null;
          const rows = [
            { label: 'Monthly Revenue', reported: revLabel, lenderSees: effectiveRev, note: haircut > 0 ? `${Math.round(haircut * 100)}% haircut for NSF/overdraft history` : 'No haircut — clean bank history', flag: haircut > 0 },
            { label: 'Personal Credit', reported: scores.length ? `${scores[scores.length - 1]} (highest)` : 'Not reported', lenderSees: middleScore ? `${middleScore} (middle score)` : 'Not reported', note: 'Lenders use the middle score of all 3 bureaus', flag: middleScore !== null && middleScore < scores[scores.length - 1] },
            { label: 'Business Entity', reported: ({ sole_prop: 'Sole Proprietorship', llc_single: 'Single-Member LLC', llc_multi: 'Multi-Member LLC', corp: 'Corporation' } as Record<string, string>)[data.entityType] || 'Not reported', lenderSees: data.entityType === 'sole_prop' ? 'High personal liability exposure' : data.entityType ? 'Acceptable entity structure' : 'Not reported', note: data.entityType === 'sole_prop' ? 'Sole proprietors need personal guarantee + pay higher rates' : 'Entity structure meets lender standards', flag: data.entityType === 'sole_prop' },
            { label: 'Banking History', reported: ({ '0_6mo': 'Under 6 months', '6_12mo': '6–12 months', '12_24mo': '1–2 years', '24plus': '2+ years' } as Record<string, string>)[data.bankAge] || 'Not reported', lenderSees: data.bankAge === '0_6mo' ? 'Too new — 6+ months required' : data.bankAge === '6_12mo' ? 'Borderline — some lenders want 12+ months' : 'Acceptable history', note: 'Banks evaluate statements month-by-month — gaps reset the clock', flag: data.bankAge === '0_6mo' || data.bankAge === '6_12mo' },
          ];
          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 }}
              style={{ background: 'var(--bg-surface-1)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '28px 32px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                🔍 What Lenders Actually See
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>Your self-reported answers vs. how underwriters interpret the same data</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rows.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: '8px', border: `1px solid ${row.flag ? 'rgba(245,158,11,0.25)' : 'var(--border-subtle)'}` }}>
                    <div>
                      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '3px' }}>You Reported: {row.label}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>{row.reported}</div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '12px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: row.flag ? '#f59e0b' : '#8ab820', marginBottom: '3px' }}>
                        {row.flag ? '⚠ Lender Sees' : '✓ Lender Sees'}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: row.flag ? '#f59e0b' : 'var(--text-primary)' }}>{row.lenderSees}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>{row.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* CAPITAL PATH BUTTON */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }} style={{ marginBottom: '20px' }}>
          <button onClick={() => setActiveTab(activeTab === 'capital' ? 'overview' : 'capital')}
            style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.08))', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.25)', fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {activeTab === 'capital' ? 'Hide' : 'See Your Path to Capital (30 / 90 / 180 Days)'}
            <ArrowRight size={16} />
          </button>
        </motion.div>
        {activeTab === 'capital' && extendedResults && <EstimatedFunding data={extendedResults} />}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* YOUR BUSINESS PROFILE — compact snapshot                           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
          style={{ background: 'var(--bg-surface-1)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '24px 32px', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Your Business Profile</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Owner', value: ownerName },
              { label: 'Business', value: businessName },
              { label: 'Revenue', value: mapRevenue(data.monthlyRevenue) },
              { label: 'Utilization', value: mapUtilization(data.utilization) },
              { label: 'Experian', value: mapCreditScore(data.experian) },
              { label: 'TransUnion', value: mapCreditScore(data.transunion) },
              { label: 'Equifax', value: mapCreditScore(data.equifax) },
              { label: '30-Day Inquiries', value: mapInquiries(data.inquiries30d) },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* MICRO-COMMITMENT — goal selection before CTA (Fogg / Eyal)        */}
        {/* Only shown to non-logged-in users                                  */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {!user && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.6 }}
            style={{ background: 'var(--bg-surface-1)', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '24px 32px', marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
              What's your most important funding goal right now?
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {GOAL_OPTIONS.map(g => (
                <button key={g.id} onClick={() => setSelectedGoal(selectedGoal === g.id ? null : g.id)}
                  style={{
                    padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    background: selectedGoal === g.id ? '#8ab820' : 'var(--bg-surface-2)',
                    color: selectedGoal === g.id ? '#0d0f0a' : 'var(--text-secondary)',
                    border: selectedGoal === g.id ? '1px solid #8ab820' : '1px solid var(--border-subtle)',
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                  <span>{g.icon}</span> {g.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* HOW THIS WORKS — transparency, bottom placement                    */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px 20px', background: 'rgba(59,130,246,0.04)', borderRadius: '10px', border: '1px solid rgba(59,130,246,0.15)', marginBottom: '20px' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '4px' }}>How This Works</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              This assessment is based on your self-reported answers. As you connect bank statements and upload documents, your FundScore updates to verified data — most businesses discover they qualify for more than they expected. <strong style={{ color: 'var(--text-primary)' }}>Your score is a starting point, not a verdict.</strong>
            </p>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* CONVERSION CTA — loss-framed, identity-driven, goal-personalized   */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {!user && extendedResults && statusInfo && (() => {
          const ctaHeadlines: Record<string, string> = {
            Elite: `Lock In Your ${result.score} Score — Claim Elite Status`,
            Bankable: `You're Bankable — Save Your Score Before It Expires`,
            Progressing: `${statusInfo.pointsToBankable} Points From Bankable — Don't Lose Your Progress`,
            Fundable: `You Qualify for Capital — Save Your Results`,
            Unprepared: `Your Foundation Plan Is Ready — Claim It Now`,
          };
          return (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
              style={{ padding: '48px 32px', background: '#0d0f0a', border: '2px solid #8ab820', borderRadius: '16px', textAlign: 'center' }}>

              {/* Identity label */}
              <div style={{ display: 'inline-block', padding: '5px 14px', background: statusInfo.statusBgColor, borderRadius: '20px', border: `1px solid ${statusInfo.statusColor}40`, marginBottom: '20px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: statusInfo.statusColor, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {statusInfo.status} Business Owner
                </span>
              </div>

              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, color: '#e8ecda', marginBottom: '12px', lineHeight: 1.2 }}>
                {ctaHeadlines[statusInfo.status]}
              </h2>

              {/* Loss framing — Hughes */}
              {scoreExpiresNote && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'rgba(245,158,11,0.1)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '20px' }}>
                  <AlertCircle size={12} style={{ color: '#f59e0b' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>{scoreExpiresNote}</span>
                </div>
              )}

              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#9ea28e', lineHeight: 1.65, marginBottom: '32px', maxWidth: '520px', margin: '0 auto 32px' }}>
                {statusInfo.status === 'Elite' && `Save your ${eligibleProducts.length}-product eligibility, run your full CreditPath analysis, and maintain your position at the top of the fundable tier.`}
                {statusInfo.status === 'Bankable' && `You've crossed the bankable threshold. Create an account to track your ${eligibleProducts.length} qualified products and see the ${17 - eligibleProducts.length} remaining unlockable.`}
                {statusInfo.status === 'Progressing' && `You're ${statusInfo.pointsToBankable} SBSS points from bank-rate capital. Save your blockers and access your 90-day action plan to close the gap.`}
                {statusInfo.status === 'Fundable' && `You qualify for alternative capital right now. Save your results and see the step-by-step path to bankability from where you stand today.`}
                {statusInfo.status === 'Unprepared' && `Your foundation plan is ready. Create an account to save your results and see the exact first steps to start qualifying.`}
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/signup')}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 700, padding: '14px 32px', background: '#8ab820', color: '#0d0f0a', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#9bc832'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#8ab820'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  {ctaAction} <ArrowRight size={16} />
                </button>
                <button onClick={() => navigate('/login')}
                  style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, padding: '14px 28px', background: 'transparent', color: '#8ab820', border: '1px solid #8ab820', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(138,184,32,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  Sign In
                </button>
              </div>
            </motion.div>
          );
        })()}

      </div>
    </div>
  );
}

export default Results;
