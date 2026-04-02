// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — FINANCES  /  Lender Financial Profile
// Purpose: Show the user EXACTLY how an underwriter reads their finances,
//          where they stand vs. lender thresholds, and the one move to make next.
//
// Elon  → No fake data. Show what we know (reported ranges), clearly labelled.
//          Threshold bars > fabricated charts. Numbers mean nothing without
//          benchmarks. One primary action per metric.
//
// Chase → Identity language: "A lender sees you as..." creates belief + urgency.
//          Every number paired with "what this unlocks" or "what this blocks".
//          Completion pull on the document checklist.
//
// Data sources (100% real, no simulation):
//   - unified_assessment → categorical ranges (rev, balance, NSF, age, etc.)
//   - computeScore()     → dimAvg.F (Financial Health score 0-1)
//   - localStorage flags → doc upload status, integrate_visited
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  TrendingUp, DollarSign, AlertCircle, CheckCircle2,
  ArrowRight, Wallet, FileText, BarChart3, ChevronRight,
  AlertTriangle, Zap, Building2, CreditCard,
} from 'lucide-react';
import { getDataItem } from '../lib/data-adapter';
import { useAuth } from '../contexts/AuthContext';
import { computeScore } from './business-assessment/engine';
import type { UnifiedAnswers } from './business-assessment/types';

// ── Value label helpers (no fake midpoints — show honest ranges) ──────────────

function revenueToLabel(v: string): string {
  switch (v) {
    case 'under_5k':  return '< $5K / mo';
    case '5k_15k':    return '$5K – $15K / mo';
    case '15k_40k':   return '$15K – $40K / mo';
    case '40k_100k':  return '$40K – $100K / mo';
    case 'over_100k': return '$100K+ / mo';
    default: return 'Not reported';
  }
}

function revenueTierIndex(v: string): number {
  switch (v) {
    case 'under_5k': return 0; case '5k_15k': return 1;
    case '15k_40k': return 2; case '40k_100k': return 3;
    case 'over_100k': return 4;
    default: return -1;
  }
}

function balanceToLabel(v: string): string {
  switch (v) {
    case 'near_zero': return '~$0';
    case '500_2k':    return '$500 – $2K';
    case '2k_10k':    return '$2K – $10K';
    case '10k_25k':   return '$10K – $25K';
    case 'over_25k':  return '$25K+';
    default: return 'Not reported';
  }
}

function balanceTierIndex(v: string): number {
  switch (v) {
    case 'near_zero': return 0; case '500_2k': return 1;
    case '2k_10k': return 2; case '10k_25k': return 3;
    case 'over_25k': return 4;
    default: return -1;
  }
}

function nsfToLabel(v: string): string {
  switch (v) {
    case '0': return '0 events'; case '1_2': return '1 – 2';
    case '3_5': return '3 – 5'; case '5plus': return '5+';
    default: return 'Not reported';
  }
}

function nsfTierIndex(v: string): number {
  switch (v) {
    case '0': return 4; case '1_2': return 2;
    case '3_5': return 1; case '5plus': return 0;
    default: return -1;
  }
}

function getYearsInBusiness(startDate?: { month: number; year: number }): number {
  if (!startDate?.year) return 0;
  const months = (new Date().getFullYear() - startDate.year) * 12 + (new Date().getMonth() + 1 - startDate.month);
  return Math.max(0, Math.round(months / 12 * 10) / 10);
}

function ageTierIndex(years: number): number {
  if (years >= 2) return 4;
  if (years >= 1) return 3;
  if (years >= 0.5) return 2;
  if (years >= 0.25) return 1;
  return 0;
}

// ── Threshold Bar ─────────────────────────────────────────────────────────────
// Shows user position on a 5-step lender threshold scale.
// tierIndex: 0 = worst, 4 = best. minViable = first tier that qualifies.

function ThresholdBar({
  tierIndex, minViable, labels, color, notReported,
}: {
  tierIndex: number; minViable: number;
  labels: string[]; color: string; notReported?: boolean;
}) {
  const pct = notReported || tierIndex < 0 ? 0 : ((tierIndex + 1) / labels.length) * 100;
  const meetsMin = !notReported && tierIndex >= minViable;

  return (
    <div>
      <div style={{ position: 'relative', height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '6px' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          style={{ height: '100%', background: meetsMin ? color : '#ef4444', borderRadius: '99px' }}
        />
        {/* Minimum viable threshold marker */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${((minViable) / labels.length) * 100}%`, width: '2px', background: 'rgba(255,255,255,0.7)' }} />
      </div>
      {/* Tier labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {labels.map((l, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '9px',
              color: i === tierIndex ? color : 'var(--muted-foreground)',
              fontWeight: i === tierIndex ? 800 : 400,
            }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon, iconColor, title, value, status, statusColor,
  lenderRead, threshold, action, actionLabel, actionPath,
  thresholdBar,
}: {
  icon: any; iconColor: string; title: string; value: string;
  status: string; statusColor: string;
  lenderRead: string; threshold: string;
  action?: string; actionLabel?: string; actionPath?: string;
  thresholdBar: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${iconColor}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={17} style={{ color: iconColor }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{title}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: 'var(--foreground)', lineHeight: 1.1, marginTop: '1px' }}>{value}</div>
          </div>
        </div>
        <div style={{ padding: '3px 10px', borderRadius: '8px', background: `${statusColor}12`, border: `1px solid ${statusColor}30` }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 800, color: statusColor }}>{status}</span>
        </div>
      </div>

      {/* Threshold bar */}
      {thresholdBar}

      {/* Lender read */}
      <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '8px', padding: '10px 12px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>How a lender sees this</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', lineHeight: 1.5 }}>{lenderRead}</div>
      </div>

      {/* Threshold */}
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
        <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>Lender target: </span>{threshold}
      </div>

      {/* Action */}
      {action && actionPath && (
        <button
          onClick={() => navigate(actionPath)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', background: `${iconColor}10`, border: `1px solid ${iconColor}30`, borderRadius: '9px', color: iconColor, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-start', transition: 'all 0.12s' }}
        >
          {actionLabel || 'Fix This'} <ArrowRight size={12} />
        </button>
      )}
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export function Finances() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<UnifiedAnswers | null>(null);
  const [dimF, setDimF] = useState(0);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [bankStatementsUploaded, setBankStatementsUploaded] = useState(false);
  const [taxReturnsUploaded, setTaxReturnsUploaded] = useState(false);
  const [creditIntegrated, setCreditIntegrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = user ? await getDataItem('unified_assessment') : localStorage.getItem('unified_assessment');
        if (raw) {
          const parsed = JSON.parse(raw) as UnifiedAnswers;
          setData(parsed);
          setHasAssessment(true);
          const result = computeScore(parsed);
          setDimF(result.dimAvg?.F ?? 0);
        }
      } catch { /* non-fatal */ }
      setBankStatementsUploaded(localStorage.getItem('fundready_bank_statements_uploaded') === '1');
      setTaxReturnsUploaded(localStorage.getItem('fundready_tax_returns_uploaded') === '1');
      setCreditIntegrated(localStorage.getItem('fundready_integrate_visited') === '1');
    };
    load();
    window.addEventListener('fundscoreUpdated', load);
    window.addEventListener('auditItemUpdated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('fundscoreUpdated', load);
      window.removeEventListener('auditItemUpdated', load);
      window.removeEventListener('storage', load);
    };
  }, [user]);

  const years = getYearsInBusiness(data?.startDate);
  const fHealthPct = Math.round(dimF * 100);
  const fHealthColor = dimF >= 0.75 ? '#10b981' : dimF >= 0.5 ? '#f59e0b' : dimF >= 0.25 ? '#f97316' : '#ef4444';
  const fHealthLabel = dimF >= 0.75 ? 'Strong' : dimF >= 0.5 ? 'Growing' : dimF >= 0.25 ? 'Weak' : 'Barrier';

  // Lender document checklist
  const docs = [
    { label: '3 months business bank statements', done: bankStatementsUploaded, required: 'All products', path: '/app/document-collection', actionLabel: 'Upload' },
    { label: '2 years business tax returns', done: taxReturnsUploaded, required: 'SBA & bank loans', path: '/app/document-collection', actionLabel: 'Upload' },
    { label: 'Personal credit reports (all 3 bureaus)', done: creditIntegrated, required: 'All products', path: '/app/integrate-reports', actionLabel: 'Connect' },
    { label: 'Dedicated business bank account', done: data?.bankAccount === 'dedicated', required: 'All products', path: '/app/lender-compliance/business-banking', actionLabel: 'Open Account' },
    { label: 'EIN (Employer Identification Number)', done: data?.hasEIN === true, required: 'All products', path: '/app/lender-compliance/ein-licenses', actionLabel: 'Get EIN' },
  ];
  const docsDone = docs.filter(d => d.done).length;

  // Derive revenue context
  const revIdx = revenueTierIndex(data?.monthlyRevenue ?? '');
  const revColor = revIdx >= 3 ? '#10b981' : revIdx >= 2 ? '#f59e0b' : revIdx >= 1 ? '#f97316' : '#ef4444';
  const revStatus = revIdx >= 3 ? 'Excellent' : revIdx >= 2 ? 'Qualifies' : revIdx >= 1 ? 'Limited' : revIdx === 0 ? 'Below Min' : '—';
  const revLenderRead = revIdx >= 3 ? 'Strong revenue — qualifies for SBA, term loans, and most bank products. Monthly deposits confirm business viability.'
    : revIdx === 2 ? 'Qualifies for term loans and many alternative products. Lenders want 3+ months at this level consistently.'
    : revIdx === 1 ? 'MCA and some credit lines are possible. Below the threshold most traditional lenders require ($15K+/mo).'
    : revIdx === 0 ? 'Most lenders require minimum $5K/month in deposits. This is the first threshold to cross.'
    : 'Complete the assessment to show revenue.';
  const revAction = revIdx < 2 ? 'How to grow deposits' : undefined;
  const revActionPath = revIdx < 2 ? '/app/ai-coach' : undefined;

  // Balance context
  const balIdx = balanceTierIndex(data?.avgDailyBalance ?? '');
  const balColor = balIdx >= 3 ? '#10b981' : balIdx >= 2 ? '#f59e0b' : '#ef4444';
  const balStatus = balIdx >= 3 ? 'Strong' : balIdx >= 2 ? 'Acceptable' : balIdx >= 1 ? 'Low' : balIdx === 0 ? 'Critical' : '—';
  const balLenderRead = balIdx >= 4 ? 'Bank-grade average daily balance. Signals financial stability and disciplined cash management.'
    : balIdx === 3 ? 'Acceptable for most products. Lenders want to see $25K+ for the best rates. Close to the strong tier.'
    : balIdx === 2 ? 'Meets the minimum for alternative capital. Below the $10K floor most banks require.'
    : balIdx === 1 ? 'Below $2K average daily balance signals cash flow stress. May trigger manual review.'
    : balIdx === 0 ? 'Near-zero balance is an automatic red flag. Lenders see this as inability to service debt.'
    : 'Complete the assessment to show bank balance.';
  const balAction = balIdx < 3 ? 'Strategies to raise ADB' : undefined;
  const balActionPath = balIdx < 3 ? '/app/ai-coach' : undefined;

  // NSF context
  const nsfIdx = nsfTierIndex(data?.nsfCount ?? '');
  const nsfColor = nsfIdx >= 4 ? '#10b981' : nsfIdx >= 2 ? '#f59e0b' : '#ef4444';
  const nsfStatus = nsfIdx >= 4 ? 'Clean' : nsfIdx >= 3 ? 'Caution' : nsfIdx >= 2 ? 'Flagged' : nsfIdx >= 1 ? 'Serious' : data?.nsfCount ? 'Blocker' : '—';
  const nsfLenderRead = data?.nsfCount === '0' ? 'Zero NSF events. Clean cash management — lenders view this as a strong positive signal.'
    : data?.nsfCount === '1_2' ? '1-2 NSF events is flagged by most lenders. Explainable if isolated, but often triggers extra scrutiny.'
    : data?.nsfCount === '3_5' ? '3-5 NSF events is a serious concern. Many lenders will decline or demand explanation + 6 months clean history.'
    : data?.nsfCount === '5plus' ? '5+ NSF events is an automatic red flag at most institutions. Requires a sustained clean period before applying.'
    : 'Complete the assessment to show NSF history.';
  const nsfAction = (data?.nsfCount && data.nsfCount !== '0') ? 'How to clear NSF history' : undefined;
  const nsfActionPath = nsfAction ? '/app/ai-coach' : undefined;

  // Business age context
  const ageColor = years >= 2 ? '#10b981' : years >= 1 ? '#f59e0b' : '#ef4444';
  const ageStatus = years >= 2 ? 'SBA Ready' : years >= 1 ? 'Term Eligible' : years >= 0.5 ? 'Alt Only' : 'Very Limited';
  const ageLenderRead = years >= 2 ? '2+ years in business — qualifies for SBA loans, conventional bank products, and most lender programs.'
    : years >= 1 ? '1-2 years unlocks term loans and many non-bank programs. SBA requires 2 years minimum.'
    : years >= 0.5 ? '6-12 months: alternative capital (MCA, revenue-based) is available. Traditional lenders require 1+ year minimum.'
    : 'Under 6 months limits most products. Focus on building revenue history and opening a dedicated business bank account.';
  const ageAction = years < 2 ? 'See products available now' : undefined;
  const ageActionPath = ageAction ? '/app/access-funding' : undefined;

  // ── No assessment state ─────────────────────────────────────────────────────
  if (!hasAssessment) {
    return (
      <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
        <div style={{ padding: '32px 28px 48px', width: '100%', boxSizing: 'border-box' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: 'var(--foreground)', marginBottom: '8px' }}>Lender Financial Profile</h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '60px 32px', background: 'var(--card)', border: '2px dashed var(--border)', borderRadius: '20px', marginTop: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '10px' }}>Complete your assessment first</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              Your Lender Financial Profile is built from your Business Success Scan — showing exactly how a lender reads your revenue, balance, and cash flow health.
            </p>
            <button onClick={() => navigate('/business-assessment')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', padding: '12px 28px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}>
              Start Free Assessment →
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div style={{ padding: '32px 28px 48px', width: '100%', boxSizing: 'border-box' }}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Lender Financial Profile
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(24px, 3.5vw, 34px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              How A Lender Sees Your Finances
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '10px', background: fHealthColor + '12', border: '1px solid ' + fHealthColor + '30' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '18px', color: fHealthColor, lineHeight: 1 }}>{fHealthPct}%</div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Financial Health</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: fHealthColor }}>{fHealthLabel}</div>
              </div>
            </div>
            <button onClick={() => navigate('/app/integrate-reports')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Connect Live Data →
            </button>
          </div>
        </div>

        {/* ── DATA SOURCE BANNER ──────────────────────────────────────────── */}
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '10px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
            <strong style={{ color: 'var(--foreground)' }}>Based on your reported ranges</strong> from the Business Success Scan. Connect live bank data via Integrate Reports for real-time numbers.{' '}
            <span style={{ color: '#f59e0b', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/business-assessment')}>Update scan →</span>
          </span>
        </div>

        {/* ── 4 LENDER METRICS ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>

          {/* Monthly Revenue */}
          <MetricCard
            icon={TrendingUp} iconColor={revColor}
            title="Monthly Revenue"
            value={revenueToLabel(data?.monthlyRevenue ?? '')}
            status={revStatus} statusColor={revColor}
            lenderRead={revLenderRead}
            threshold="$15K+/mo for term loans · $40K+ for SBA/bank"
            action={revAction} actionLabel="Build Revenue Strategy" actionPath={revActionPath}
            thresholdBar={
              <ThresholdBar
                tierIndex={revIdx} minViable={2}
                labels={['<$5K', '$5–15K', '$15–40K', '$40–100K', '$100K+']}
                color={revColor} notReported={revIdx < 0}
              />
            }
          />

          {/* Avg Daily Balance */}
          <MetricCard
            icon={Wallet} iconColor={balColor}
            title="Avg Daily Balance"
            value={balanceToLabel(data?.avgDailyBalance ?? '')}
            status={balStatus} statusColor={balColor}
            lenderRead={balLenderRead}
            threshold="$10K minimum · $25K+ for bank-grade rates"
            action={balAction} actionLabel="Raise My Balance" actionPath={balActionPath}
            thresholdBar={
              <ThresholdBar
                tierIndex={balIdx} minViable={2}
                labels={['~$0', '$500-2K', '$2-10K', '$10-25K', '$25K+']}
                color={balColor} notReported={balIdx < 0}
              />
            }
          />

          {/* NSF Events */}
          <MetricCard
            icon={AlertTriangle} iconColor={nsfColor}
            title="NSF Events (12 months)"
            value={nsfToLabel(data?.nsfCount ?? '')}
            status={nsfStatus} statusColor={nsfColor}
            lenderRead={nsfLenderRead}
            threshold="0 events required for bank products · Even 1 triggers review"
            action={nsfAction} actionLabel="Clear NSF History" actionPath={nsfActionPath}
            thresholdBar={
              <ThresholdBar
                tierIndex={nsfIdx} minViable={4}
                labels={['5+', '3–5', '1–2', 'Caution', '0 ✓']}
                color={nsfColor} notReported={!data?.nsfCount}
              />
            }
          />

          {/* Business Age */}
          <MetricCard
            icon={Building2} iconColor={ageColor}
            title="Time in Business"
            value={years > 0 ? `${years} yr${years !== 1 ? 's' : ''}` : data?.startDate?.year ? '< 1 year' : 'Not reported'}
            status={ageStatus} statusColor={ageColor}
            lenderRead={ageLenderRead}
            threshold="6 months = alt capital · 1 yr = term loans · 2 yrs = SBA/bank"
            action={ageAction} actionLabel="See Products Now" actionPath={ageActionPath}
            thresholdBar={
              <ThresholdBar
                tierIndex={ageTierIndex(years)} minViable={2}
                labels={['<3mo', '3–6mo', '6–12mo', '1–2yr', '2yr+ ✓']}
                color={ageColor} notReported={!data?.startDate?.year}
              />
            }
          />
        </div>

        {/* ── ACCOUNT HEALTH BREAKDOWN ─────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>

          {/* Account health table */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)', marginBottom: '14px' }}>Account Health Details</div>
            {[
              {
                label: 'Account type',
                value: data?.bankAccount === 'dedicated' ? 'Dedicated business' : data?.bankAccount === 'personal' ? '⚠ Personal (fix required)' : '—',
                ok: data?.bankAccount === 'dedicated',
                warn: data?.bankAccount === 'personal',
              },
              {
                label: 'Account age',
                value: data?.bankAge === '0_6mo' ? '< 6 months' : data?.bankAge === '6_12mo' ? '6–12 months' : data?.bankAge === '12_24mo' ? '1–2 years' : data?.bankAge === '24plus' ? '2+ years' : '—',
                ok: data?.bankAge === '12_24mo' || data?.bankAge === '24plus',
                warn: data?.bankAge === '0_6mo',
              },
              {
                label: 'Credit card sales',
                value: !data?.ccSales || data.ccSales === 'no_cards' ? 'None reported' : data.ccSales === 'under_5k' ? '< $5K/mo' : data.ccSales === '5k_15k' ? '$5K–$15K/mo' : data.ccSales === '15k_50k' ? '$15K–$50K/mo' : '$50K+/mo',
                ok: data?.ccSales === '15k_50k' || data?.ccSales === 'over_50k',
              },
              {
                label: 'Tax liens',
                value: !data?.hasTaxLiens || data.hasTaxLiens === 'no' ? '✓ None' : data.hasTaxLiens === 'federal' ? 'Federal lien' : data.hasTaxLiens === 'state' ? 'State lien' : 'Federal + State',
                ok: !data?.hasTaxLiens || data.hasTaxLiens === 'no',
                warn: data?.hasTaxLiens && data.hasTaxLiens !== 'no',
              },
              {
                label: 'Bankruptcy',
                value: !data?.hasBankruptcy || data.hasBankruptcy === 'none' ? '✓ None' : data.hasBankruptcy === 'recent' ? 'Recent (< 7 yrs)' : 'Discharged (> 7 yrs)',
                ok: !data?.hasBankruptcy || data.hasBankruptcy === 'none',
                warn: data?.hasBankruptcy === 'recent',
              },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)' }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {row.ok && <CheckCircle2 size={12} style={{ color: '#10b981' }} />}
                  {row.warn && <AlertTriangle size={12} style={{ color: '#f59e0b' }} />}
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: row.ok ? '#10b981' : row.warn ? '#f59e0b' : 'var(--foreground)' }}>
                    {row.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Assets & receivables */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)', marginBottom: '14px' }}>Assets & Collateral</div>
            {[
              { icon: '📋', label: 'Accounts Receivable', value: !data?.arBalance || data.arBalance === 'none' ? 'None' : data.arBalance === 'under_10k' ? '< $10K' : data.arBalance === '10k_50k' ? '$10K–$50K' : data.arBalance === '50k_250k' ? '$50K–$250K' : '$250K+', tip: data?.arBalance && data.arBalance !== 'none' ? 'Can be used as collateral for AR financing' : undefined },
              { icon: '⚙️', label: 'Equipment Value', value: !data?.equipmentValue || data.equipmentValue === 'none' ? 'None' : data.equipmentValue === 'under_10k' ? '< $10K' : data.equipmentValue === '10k_50k' ? '$10K–$50K' : data.equipmentValue === '50k_250k' ? '$50K–$250K' : '$250K+', tip: data?.equipmentValue && data.equipmentValue !== 'none' ? 'Equipment value supports equipment financing & SBA collateral' : undefined },
              { icon: '🏠', label: 'Real Property', value: data?.ownsProperty === 'yes' ? 'Owned' : data?.ownsProperty === 'planning' ? 'Planning to buy' : 'None / Renting', tip: data?.ownsProperty === 'yes' ? 'Property as collateral expands SBA and bank loan options significantly' : undefined },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>{row.icon}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)' }}>{row.label}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>{row.value}</span>
                </div>
                {row.tip && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#10b981', marginTop: '3px', paddingLeft: '22px', lineHeight: 1.4 }}>
                    ↑ {row.tip}
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>Collateral tip</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                AR and equipment as collateral can increase loan size by 20–40% and lower your interest rate. Disclose all assets upfront.
              </div>
            </div>
          </div>
        </div>

        {/* ── DOCUMENT READINESS ────────────────────────────────────────────── */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Document Readiness</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '3px 0 0' }}>
                {docsDone} of {docs.length} items ready · A complete file closes 40% faster and at better terms
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '100px', height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(docsDone / docs.length) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '99px' }}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--muted-foreground)' }}>
                {Math.round((docsDone / docs.length) * 100)}%
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {docs.map((doc, i) => (
              <div
                key={doc.label}
                style={{ padding: '13px 20px', borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '14px' }}
              >
                <div style={{ flexShrink: 0 }}>
                  {doc.done ? (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                    </div>
                  ) : (
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--background)' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: doc.done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: doc.done ? 'line-through' : 'none' }}>
                    {doc.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '1px' }}>
                    Required for: {doc.required}
                  </div>
                </div>
                {!doc.done && (
                  <button
                    onClick={() => navigate(doc.path)}
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    {doc.actionLabel} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CONNECT LIVE DATA CTA ─────────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.06))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={22} style={{ color: '#10b981' }} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: 'var(--foreground)', marginBottom: '4px' }}>
              Connect Live Bank &amp; Credit Data
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              Right now these metrics are based on ranges you reported. Connecting your bank and credit data gives lenders verified, real-time numbers — which dramatically increases approval confidence.
            </div>
          </div>
          <button
            onClick={() => navigate('/app/integrate-reports')}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', padding: '12px 24px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            Connect Now →
          </button>
        </div>

      </div>
    </div>
  );
}

export default Finances;
