// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — FINANCES PAGE
// ZenBusiness-inspired layout · FundReady branding · Capital-readiness framing
// All data sourced from assessment (real) + simulated trend (labeled clearly)
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, AlertCircle,
  CheckCircle2, ArrowRight, Building2, CreditCard,
  FileText, BarChart3, Zap, ChevronRight, Wallet,
  AlertTriangle, Lock,
} from 'lucide-react';
import { getDataItem } from '../lib/data-adapter';
import { useAuth } from '../contexts/AuthContext';
import { computeScore } from './business-assessment/engine';
import type { UnifiedAnswers } from './business-assessment/types';

// ── Value converters ──────────────────────────────────────────────────────────

function revenueToMidpoint(v: string): number {
  switch (v) {
    case 'under_5k': return 3000;
    case '5k_15k': return 10000;
    case '15k_40k': return 27500;
    case '40k_100k': return 70000;
    case 'over_100k': return 125000;
    default: return 0;
  }
}

function revenueToLabel(v: string): string {
  switch (v) {
    case 'under_5k': return '< $5K / mo';
    case '5k_15k': return '$5K – $15K / mo';
    case '15k_40k': return '$15K – $40K / mo';
    case '40k_100k': return '$40K – $100K / mo';
    case 'over_100k': return '$100K+ / mo';
    default: return 'Not reported';
  }
}

function balanceToMidpoint(v: string): number {
  switch (v) {
    case 'near_zero': return 400;
    case '500_2k': return 1250;
    case '2k_10k': return 6000;
    case '10k_25k': return 17500;
    case 'over_25k': return 35000;
    default: return 0;
  }
}

function balanceToLabel(v: string): string {
  switch (v) {
    case 'near_zero': return '~$0';
    case '500_2k': return '$500 – $2K';
    case '2k_10k': return '$2K – $10K';
    case '10k_25k': return '$10K – $25K';
    case 'over_25k': return '$25K+';
    default: return 'Not reported';
  }
}

function nsfToLabel(v: string): string {
  switch (v) {
    case '0': return '0 events';
    case '1_2': return '1 – 2 events';
    case '3_5': return '3 – 5 events';
    case '5plus': return '5+ events';
    default: return 'Not reported';
  }
}

function nsfToCount(v: string): number {
  switch (v) { case '0': return 0; case '1_2': return 1; case '3_5': return 4; case '5plus': return 7; default: return 0; }
}

function arToLabel(v: string): string {
  switch (v) {
    case 'none': return 'None';
    case 'under_10k': return '< $10K';
    case '10k_50k': return '$10K – $50K';
    case '50k_250k': return '$50K – $250K';
    case 'over_250k': return '$250K+';
    default: return 'Not reported';
  }
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function getYearsInBusiness(startDate?: { month: number; year: number }): number {
  if (!startDate?.year) return 0;
  const months = (new Date().getFullYear() - startDate.year) * 12 + (new Date().getMonth() + 1 - startDate.month);
  return Math.max(0, Math.round(months / 12 * 10) / 10);
}

// Generate 8-month simulated cash flow from balance midpoint
function generateCashFlow(baseMid: number, revMid: number): { month: string; balance: number; revenue: number }[] {
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const seed = baseMid || 5000;
  return months.map((month, i) => {
    const drift = 1 + (i * 0.02); // slight upward trend
    const noise = 0.85 + Math.sin(i * 1.7) * 0.12;
    return {
      month,
      balance: Math.round(seed * drift * noise),
      revenue: Math.round(revMid * (0.9 + Math.sin(i * 2.1 + 1) * 0.12)),
    };
  });
}

// ── Custom tooltip for AreaChart ──────────────────────────────────────────────
function CashTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#111827', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
      <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: 'white', fontWeight: 800, fontSize: '15px' }}>{formatMoney(payload[0].value)}</div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function Finances() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<UnifiedAnswers | null>(null);
  const [dimF, setDimF] = useState(0);
  const [hasAssessment, setHasAssessment] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);
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

      // Read cross-platform flags set by Document Portal + Integrate Reports
      setBankStatementsUploaded(localStorage.getItem('fundready_bank_statements_uploaded') === '1');
      setTaxReturnsUploaded(localStorage.getItem('fundready_tax_returns_uploaded') === '1');
      setCreditIntegrated(localStorage.getItem('fundready_integrate_visited') === '1');
    };

    load();

    // Re-run when any platform page updates data
    window.addEventListener('fundscoreUpdated', load);
    window.addEventListener('auditItemUpdated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('fundscoreUpdated', load);
      window.removeEventListener('auditItemUpdated', load);
      window.removeEventListener('storage', load);
    };
  }, [user]);

  // Derived values
  const revMid = revenueToMidpoint(data?.monthlyRevenue ?? '');
  const balMid = balanceToMidpoint(data?.avgDailyBalance ?? '');
  const nsfCount = nsfToCount(data?.nsfCount ?? '');
  const cashFlow = generateCashFlow(balMid, revMid);
  const latestBalance = cashFlow[cashFlow.length - 1]?.balance ?? 0;
  const prevBalance = cashFlow[cashFlow.length - 2]?.balance ?? 0;
  const balanceTrend = latestBalance >= prevBalance;
  const years = getYearsInBusiness(data?.startDate);

  const fHealthColor = dimF >= 0.75 ? '#10b981' : dimF >= 0.5 ? '#f59e0b' : dimF >= 0.25 ? '#f97316' : '#ef4444';
  const fHealthLabel = dimF >= 0.75 ? 'Strong' : dimF >= 0.5 ? 'Growing' : dimF >= 0.25 ? 'Weak' : 'Barrier';

  // Checklist items — each tied to assessment answers
  const checklist = [
    {
      id: 'assessment',
      label: 'Complete Business Success Scan',
      detail: 'Generates your FundScore and financial health baseline',
      done: hasAssessment,
      action: () => navigate('/business-assessment'),
      actionLabel: 'Start Scan',
    },
    {
      id: 'bank_account',
      label: 'Open a dedicated business bank account',
      detail: 'Required for every capital product. Lenders verify account age + activity.',
      done: data?.bankAccount === 'dedicated',
      warning: data?.bankAccount === 'personal',
      action: () => navigate('/app/lender-compliance'),
      actionLabel: 'Learn more',
    },
    {
      id: 'bank_statements',
      label: 'Upload last 3 months of bank statements',
      detail: 'Lenders use statements to verify revenue and average daily balance.',
      done: bankStatementsUploaded,
      action: () => navigate('/app/document-collection'),
      actionLabel: 'Upload docs',
    },
    {
      id: 'tax_returns',
      label: 'Upload last 2 years of business tax returns',
      detail: 'Required for SBA loans and most bank products.',
      done: taxReturnsUploaded,
      warning: !taxReturnsUploaded && data?.hasTaxLiens !== 'no' && !!data?.hasTaxLiens,
      action: () => navigate('/app/document-collection'),
      actionLabel: 'Upload returns',
    },
    {
      id: 'credit',
      label: 'Integrate personal credit reports',
      detail: 'Pulls all 3 bureaus so lenders see your middle FICO score.',
      done: creditIntegrated,
      action: () => navigate('/app/integrate-reports'),
      actionLabel: 'Connect now',
    },
  ];

  const doneCount = checklist.filter(c => c.done).length;

  // Revenue bar data (simulated monthly variance)
  const revBars = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m, i) => ({
    month: m,
    revenue: Math.round(revMid * (0.88 + Math.sin(i * 1.9 + 0.5) * 0.1)),
  }));

  if (!hasAssessment) {
    return (
      <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-10">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: 'var(--foreground)', marginBottom: '8px' }}>Finances</h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '60px 32px', background: 'var(--card)', border: '2px dashed var(--border)', borderRadius: '20px', marginTop: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '10px' }}>Complete your assessment first</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', maxWidth: '380px', margin: '0 auto 24px', lineHeight: 1.6 }}>
              Your Finances dashboard is built from your Business Success Scan — revenue, banking health, and lending metrics in one place.
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
      <div className="max-w-[1200px] mx-auto px-6 py-8 lg:px-8 lg:py-10">

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Financial Health
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(22px, 3vw, 32px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
              Finances
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: fHealthColor + '12', border: '1px solid ' + fHealthColor + '30' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: fHealthColor }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: fHealthColor }}>Financial Health: {fHealthLabel}</span>
            </div>
            <button onClick={() => navigate('/app/integrate-reports')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--primary)', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Connect Bank →
            </button>
          </div>
        </div>

        {/* ROW 1: KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          {/* Monthly Revenue */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Monthly Revenue</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={15} style={{ color: '#10b981' }} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', color: 'var(--foreground)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {revMid > 0 ? formatMoney(revMid) : '—'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>{revenueToLabel(data?.monthlyRevenue ?? '')}</div>
            {revMid > 0 && (
              <div style={{ marginTop: '14px', height: '40px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revBars.slice(-5)} barSize={8}>
                    <Bar dataKey="revenue" fill="#10b98140" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* Avg Daily Balance */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Avg Daily Balance</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wallet size={15} style={{ color: '#3b82f6' }} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', color: 'var(--foreground)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {balMid > 0 ? formatMoney(balMid) : '—'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>{balanceToLabel(data?.avgDailyBalance ?? '')}</div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {balanceTrend ? <TrendingUp size={12} style={{ color: '#10b981' }} /> : <TrendingDown size={12} style={{ color: '#ef4444' }} />}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: balanceTrend ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {balanceTrend ? 'Trending up' : 'Trending down'}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>· Lenders want $25K+</span>
            </div>
          </motion.div>

          {/* NSF Events */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>NSF Events</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: nsfCount === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {nsfCount === 0 ? <CheckCircle2 size={15} style={{ color: '#10b981' }} /> : <AlertTriangle size={15} style={{ color: '#ef4444' }} />}
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '26px', color: nsfCount === 0 ? '#10b981' : '#ef4444', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {nsfToLabel(data?.nsfCount ?? '')}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
              {nsfCount === 0 ? 'Clean account · No negative marks' : 'NSFs signal cash flow risk to lenders'}
            </div>
            <div style={{ marginTop: '10px', padding: '5px 10px', borderRadius: '6px', display: 'inline-block', background: nsfCount === 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: '1px solid ' + (nsfCount === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)') }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: nsfCount === 0 ? '#10b981' : '#ef4444' }}>
                {nsfCount === 0 ? '✓ Lender-approved' : '⚠ Review with lender'}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ROW 2: CASH FLOW CHART */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 20px 12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Cash Flow Overview</h3>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>Based on reported data</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>
                Estimated balance trend · Connect your bank for live data
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '3px', borderRadius: '99px', background: '#10b981' }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>Balance</span>
              </div>
              <button onClick={() => navigate('/app/integrate-reports')} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer' }}>
                Connect Bank →
              </button>
            </div>
          </div>
          {/* Large balance display */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '36px', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              {formatMoney(latestBalance)}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>estimated balance</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: balanceTrend ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
              {balanceTrend ? <TrendingUp size={11} style={{ color: '#10b981' }} /> : <TrendingDown size={11} style={{ color: '#ef4444' }} />}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: balanceTrend ? '#10b981' : '#ef4444' }}>
                {balanceTrend ? '+' : ''}{Math.round(((latestBalance - prevBalance) / Math.max(prevBalance, 1)) * 100)}%
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cashFlow} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-body)', fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => formatMoney(v)} tick={{ fontFamily: 'var(--font-body)', fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CashTooltip />} />
              <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2.5} fill="url(#balGrad)" dot={false} activeDot={{ r: 5, fill: '#10b981', stroke: 'white', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ROW 3: 3-COLUMN DETAILS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>

          {/* Revenue by Month */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>Revenue</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>Estimated</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: 'var(--foreground)', marginBottom: '2px' }}>
              {revMid > 0 ? formatMoney(revMid * 12) : '—'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '14px' }}>Annual estimated revenue</div>
            <ResponsiveContainer width="100%" height={70}>
              <BarChart data={revBars} barSize={8} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                  {revBars.map((_, i) => (
                    <Cell key={i} fill={i === revBars.length - 1 ? '#94a3b8' : '#10b98155'} />
                  ))}
                </Bar>
                <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-body)', fontSize: 9, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              </BarChart>
            </ResponsiveContainer>
            {data?.ccSales && data.ccSales !== 'no_cards' && (
              <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                CC Sales: <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                  {data.ccSales === 'under_5k' ? '< $5K' : data.ccSales === '5k_15k' ? '$5K–$15K' : data.ccSales === '15k_50k' ? '$15K–$50K' : '$50K+'}
                </span> / mo
              </div>
            )}
          </div>

          {/* Account Health */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>Account Health</span>
            </div>
            {[
              { label: 'Account Type', value: data?.bankAccount === 'dedicated' ? 'Dedicated Business' : data?.bankAccount === 'personal' ? 'Personal (needs fix)' : 'No account', ok: data?.bankAccount === 'dedicated', warn: data?.bankAccount === 'personal' },
              { label: 'Account Age', value: data?.bankAge === '0_6mo' ? '< 6 months' : data?.bankAge === '6_12mo' ? '6–12 months' : data?.bankAge === '12_24mo' ? '1–2 years' : data?.bankAge === '24plus' ? '2+ years' : '—', ok: data?.bankAge === '12_24mo' || data?.bankAge === '24plus' },
              { label: 'Avg Daily Balance', value: balanceToLabel(data?.avgDailyBalance ?? ''), ok: (data?.avgDailyBalance === '10k_25k' || data?.avgDailyBalance === 'over_25k') },
              { label: 'NSF Events', value: nsfToLabel(data?.nsfCount ?? ''), ok: data?.nsfCount === '0', warn: data?.nsfCount !== '0' && !!data?.nsfCount },
              { label: 'Years in Business', value: years > 0 ? `${years} years` : 'New business', ok: years >= 2 },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>{row.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {row.ok ? <CheckCircle2 size={11} style={{ color: '#10b981' }} /> : row.warn ? <AlertTriangle size={11} style={{ color: '#f59e0b' }} /> : null}
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: row.ok ? '#10b981' : row.warn ? '#f59e0b' : 'var(--foreground)' }}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Assets & Liabilities */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>Assets &amp; Receivables</span>
            </div>
            {[
              { label: 'Accounts Receivable', value: arToLabel(data?.arBalance ?? ''), icon: '📋' },
              { label: 'Equipment Value', value: arToLabel(data?.equipmentValue ?? ''), icon: '⚙️' },
              { label: 'Real Property', value: data?.ownsProperty === 'yes' ? 'Owns property' : data?.ownsProperty === 'planning' ? 'Planning to buy' : 'No property', icon: '🏠' },
              { label: 'Tax Liens', value: data?.hasTaxLiens === 'no' || !data?.hasTaxLiens ? 'None' : data?.hasTaxLiens === 'federal' ? 'Federal lien' : data?.hasTaxLiens === 'state' ? 'State lien' : 'Federal + State', ok: data?.hasTaxLiens === 'no', warn: data?.hasTaxLiens !== 'no' && !!data?.hasTaxLiens, icon: '⚖️' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px' }}>{row.icon}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>{row.label}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: (row as { warn?: boolean }).warn ? '#f59e0b' : (row as { ok?: boolean }).ok ? '#10b981' : 'var(--foreground)' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#3b82f6', fontWeight: 700, marginBottom: '3px' }}>Lender tip</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                AR &amp; equipment can serve as collateral, increasing loan size by 20–40%.
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: GET STARTED CHECKLIST */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)', margin: 0 }}>Get Lender-Ready</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', margin: '3px 0 0' }}>
                {doneCount} of {checklist.length} items complete
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '100px', height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(doneCount / checklist.length) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', borderRadius: '99px' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px', color: 'var(--muted-foreground)' }}>{Math.round((doneCount / checklist.length) * 100)}%</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {checklist.map((item, i) => (
              <div
                key={item.id}
                style={{ padding: '14px 20px', borderBottom: i < checklist.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'background 0.15s', background: activeChecklist === item.id ? 'var(--background)' : 'transparent' }}
                onClick={() => setActiveChecklist(activeChecklist === item.id ? null : item.id)}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--background)')}
                onMouseLeave={e => (e.currentTarget.style.background = activeChecklist === item.id ? 'var(--background)' : 'transparent')}
              >
                <div style={{ flexShrink: 0 }}>
                  {item.done ? (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                    </div>
                  ) : item.warning ? (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={15} style={{ color: '#f59e0b' }} />
                    </div>
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: item.done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.label}</div>
                  {activeChecklist === item.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px', lineHeight: 1.5 }}>{item.detail}</div>
                    </motion.div>
                  )}
                </div>
                {!item.done && (
                  <button onClick={e => { e.stopPropagation(); item.action(); }} style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ROW 5: QUICK TOOLS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { icon: BarChart3, label: 'Status Reports', desc: 'Bankable status, FICO score, estimated funding range', path: '/app/status-reports', color: '#3b82f6', cta: 'View Reports' },
            { icon: FileText, label: 'Document Portal', desc: 'Upload bank statements, tax returns, and financial docs', path: '/app/document-collection', color: '#8b5cf6', cta: 'Manage Docs' },
            { icon: TrendingUp, label: 'Integrate Reports', desc: 'Connect bank data and credit reports for live scoring', path: '/app/integrate-reports', color: '#10b981', cta: 'Connect Now' },
          ].map(tool => (
            <div
              key={tool.path}
              onClick={() => navigate(tool.path)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = tool.color + '50'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: tool.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <tool.icon size={18} style={{ color: tool.color }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '5px' }}>{tool.label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: '14px' }}>{tool.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: tool.color }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px' }}>{tool.cta}</span>
                <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Finances;
