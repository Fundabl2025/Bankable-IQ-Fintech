// Capital Intelligence Report — unified view matching Dashboard data
// Reads from unified_assessment via computeScore() + computeExtendedResults()

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, TrendingUp, Target, DollarSign } from 'lucide-react';
import { computeScore, computeExtendedResults } from './business-assessment/engine';
import type { ScoreResult, ExtendedResultsOutput } from './business-assessment/types';

function fmt(n: number) {
  return n >= 1000000
    ? `$${(n / 1000000).toFixed(1)}M`
    : `$${(n / 1000).toFixed(0)}K`;
}

function getScoreBand(score: number): { label: string; color: string } {
  if (score >= 900) return { label: 'Prime', color: '#10b981' };
  if (score >= 750) return { label: 'Ready', color: '#10b981' };
  if (score >= 650) return { label: 'Approaching', color: '#f59e0b' };
  if (score >= 550) return { label: 'Developing', color: '#f59e0b' };
  if (score >= 400) return { label: 'Low', color: '#ef4444' };
  return { label: 'Critical', color: '#ef4444' };
}

function getSbssBand(sbss: number): { label: string; color: string } {
  if (sbss >= 200) return { label: 'Bankable', color: '#10b981' };
  if (sbss >= 160) return { label: 'Bankable', color: '#10b981' };
  if (sbss >= 120) return { label: 'Near Bankable', color: '#f59e0b' };
  return { label: 'Building', color: '#ef4444' };
}

const DIM_LABELS: Record<string, string> = {
  P: 'Personal Credit',
  B: 'Business Profile',
  F: 'Financials',
  C: 'Compliance',
  S: 'Stability',
  N: 'File Strength',
};

export function StatusReports() {
  const navigate = useNavigate();
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [extended, setExtended] = useState<ExtendedResultsOutput | null>(null);
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('unified_assessment');
        if (!raw) { setHasData(false); return; }
        const data = JSON.parse(raw);
        setScore(computeScore(data));
        setExtended(computeExtendedResults(data));
        setHasData(true);
      } catch {
        setHasData(false);
      }
    };
    load();
    window.addEventListener('storage', load);
    window.addEventListener('fundscoreUpdated', load);
    return () => {
      window.removeEventListener('storage', load);
      window.removeEventListener('fundscoreUpdated', load);
    };
  }, []);

  if (hasData === null) return null;

  if (!hasData || !score || !extended) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--foreground)', marginBottom: '10px' }}>No assessment data yet</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '24px' }}>Complete the business assessment to generate your Capital Intelligence Report.</p>
          <button
            onClick={() => navigate('/app/business-assessment')}
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 22px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer' }}
          >
            Start Assessment →
          </button>
        </div>
      </div>
    );
  }

  const band = getScoreBand(score.score);
  const sbss = extended.sbssScore;
  const sband = getSbssBand(sbss);
  const passCount = extended.bankableItems.filter(i => i.status === 'pass').length;
  const totalCount = extended.bankableItems.length;
  const bankablePct = Math.round((passCount / totalCount) * 100);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 28px 48px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
          <button
            onClick={() => navigate('/app/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', padding: 0, marginBottom: '14px' }}
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>My Tools</p>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 34px)', color: 'var(--foreground)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.1 }}>
                Capital Intelligence
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '5px' }}>
                Real-time funding readiness — synced with your assessment
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
              Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {/* ── SCORE HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px 28px', marginBottom: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px' }}>
            {/* FundScore */}
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>FundScore™</p>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '52px', lineHeight: 1, color: band.color }}>{score.score}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: band.color, marginTop: '4px' }}>{band.label}</div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score.score / 10}%`, background: band.color, borderRadius: '99px', transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>0</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>1000</span>
              </div>
            </div>

            {/* SBSS */}
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>FICO SBSS Score</p>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '52px', lineHeight: 1, color: sband.color }}>{sbss}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: sband.color, marginTop: '4px' }}>{sband.label}</div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(sbss / 300) * 100}%`, background: sband.color, borderRadius: '99px', transition: 'width 1s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>0</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#f59e0b' }}>160 bankable</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)' }}>300</span>
              </div>
            </div>

            {/* Bankable Items */}
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Bankable Items</p>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '52px', lineHeight: 1, color: bankablePct >= 85 ? '#10b981' : bankablePct >= 60 ? '#f59e0b' : '#ef4444' }}>{passCount}<span style={{ fontSize: '24px', fontWeight: 500, color: 'var(--muted-foreground)' }}>/{totalCount}</span></div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--muted-foreground)', marginTop: '4px' }}>{bankablePct}% compliant</div>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '99px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${bankablePct}%`, background: bankablePct >= 85 ? '#10b981' : bankablePct >= 60 ? '#f59e0b' : '#ef4444', borderRadius: '99px', transition: 'width 1s ease' }} />
              </div>
            </div>

            {/* Funding Range */}
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Funding Range</p>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', lineHeight: 1.2, color: 'var(--foreground)', marginBottom: '4px' }}>
                {fmt(extended.fundingRange.businessOnlyMin)}–{fmt(extended.fundingRange.businessOnlyMax)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '6px' }}>Business only</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: '#3b82f6' }}>
                {fmt(extended.fundingRange.personalAndBusinessMin)}–{fmt(extended.fundingRange.personalAndBusinessMax)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>With personal credit</div>
            </div>
          </div>
        </motion.div>

        {/* ── DIMENSION BREAKDOWN ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '16px' }}>Score Breakdown</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            {(Object.entries(score.dimAvg) as [string, number][]).map(([dim, val]) => {
              const pct = Math.round(val * 100);
              const color = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
              return (
                <div key={dim}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--foreground)' }}>{DIM_LABELS[dim]}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── TWO COLUMN: BANKABLE STATUS + FUNDING ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '20px' }}>

          {/* Bankable Status */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={16} style={{ color: '#10b981' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>Bankable Status</span>
              </div>
              <Link to="/app/status-reports/bankable-status" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
                Full report <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {extended.bankableItems.slice(0, 10).map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.status === 'pass'
                    ? <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                    : <XCircle size={13} style={{ color: '#ef4444', flexShrink: 0 }} />
                  }
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: item.status === 'pass' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                    {item.name}
                  </span>
                </div>
              ))}
              {extended.bankableItems.length > 10 && (
                <Link to="/app/status-reports/bankable-status" style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#3b82f6', textDecoration: 'none', marginTop: '4px' }}>
                  + {extended.bankableItems.length - 10} more items →
                </Link>
              )}
            </div>
          </motion.div>

          {/* Capital Projections */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} style={{ color: '#3b82f6' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>Capital Trajectory</span>
              </div>
              <Link to="/app/status-reports/estimated-funding" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
                Full report <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Today', min: extended.fundingRange.businessOnlyMin, max: extended.fundingRange.businessOnlyMax, highlight: true },
                { label: '30 Days', min: Math.round(extended.fundingRange.businessOnlyMin * 1.12), max: Math.round(extended.fundingRange.businessOnlyMax * 1.12), highlight: false },
                { label: '90 Days', min: Math.round(extended.fundingRange.businessOnlyMin * 1.3), max: Math.round(extended.fundingRange.businessOnlyMax * 1.3), highlight: false },
                { label: '180 Days', min: Math.round(extended.fundingRange.businessOnlyMin * 1.6), max: Math.round(extended.fundingRange.businessOnlyMax * 1.6), highlight: false },
              ].map(({ label, min, max, highlight }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '8px', background: highlight ? 'rgba(16,185,129,0.06)' : 'transparent', border: highlight ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: highlight ? 700 : 500, color: highlight ? '#10b981' : 'var(--muted-foreground)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: highlight ? '#10b981' : 'var(--foreground)' }}>
                    {fmt(min)}–{fmt(max)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── FICO SBSS BREAKDOWN ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} style={{ color: '#f59e0b' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)' }}>FICO SBSS Breakdown</span>
            </div>
            <Link to="/app/status-reports/business-fico" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
              Full report <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { label: 'Owner Credit', weight: '35%', desc: 'Personal FICO score drives the largest component', value: Math.round(score.dimAvg.P * 100) },
              { label: 'Bank / Revenue / Debt', weight: '30%', desc: 'Bank rating, revenue, and debt load', value: Math.round(score.dimAvg.F * 100) },
              { label: 'Industry / Location / Web', weight: '20%', desc: 'NAICS, address, online presence', value: Math.round(((score.dimAvg.B + score.dimAvg.C) / 2) * 100) },
              { label: 'Business Credit Bureaus', weight: '15%', desc: 'Dun & Bradstreet, Experian, Equifax', value: Math.round(score.dimAvg.N * 100) },
            ].map(({ label, weight, desc, value }) => {
              const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
              return (
                <div key={label} style={{ padding: '12px 14px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--foreground)' }}>{label}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 800, color }}>{value}%</span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', margin: '0 0 8px 0', lineHeight: 1.4 }}>{desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginRight: '8px' }}>
                      <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '99px' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--muted-foreground)', flexShrink: 0 }}>{weight} of SBSS</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '8px', background: sbss >= 160 ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', border: `1px solid ${sbss >= 160 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--foreground)', margin: 0 }}>
              {sbss >= 160
                ? `Your SBSS score of ${sbss} meets the 160+ threshold — you are bankable. SBA lenders can approve your application without a full credit review.`
                : `Your SBSS score of ${sbss} is below the 160 threshold. You need ${160 - sbss} more points to become bankable. Focus on Personal Credit and Financials — they account for 65% of your score.`
              }
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
