// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Estimated Funding Range & Capital Unlock Forecast
// Personalized capital intelligence view — aligned with strategic vision
// Score scale: 0–1000 FundScore. Projections based on real score + audit data.
// ════════════════════════════════════════════════════════════════════════════════

import { Download, TrendingUp, ArrowRight, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { ExtendedResultsOutput } from '../business-assessment/types';
import { useEffect, useState } from 'react';
import { computeExtendedResults } from '../business-assessment/engine';
import { useNavigate } from 'react-router';
import { getAllAuditItems, AuditItem } from '../../utils/businessData';

interface EstimatedFundingProps {
  data?: ExtendedResultsOutput;
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPITAL UNLOCK ENGINE
// Maps FundScore (0–1000) to real funding eligibility ranges, then projects
// 30/60/90-day upside based on incomplete audit items.
// ─────────────────────────────────────────────────────────────────────────────

interface FundingSnapshot {
  label: string;
  projectedScore: number;
  bizMin: number;
  bizMax: number;
  personalMin: number;
  personalMax: number;
  color: string;
  border: string;
  isCurrent: boolean;
}

function scoreToBizFunding(score: number): { bizMin: number; bizMax: number; personalMin: number; personalMax: number } {
  // 0–1000 scale. Ranges derived from real lending thresholds.
  if (score >= 900) return { bizMin: 250000, bizMax: 500000, personalMin: 350000, personalMax: 750000 };
  if (score >= 800) return { bizMin: 100000, bizMax: 250000, personalMin: 150000, personalMax: 400000 };
  if (score >= 700) return { bizMin: 50000,  bizMax: 100000, personalMin: 75000,  personalMax: 175000 };
  if (score >= 600) return { bizMin: 25000,  bizMax: 50000,  personalMin: 35000,  personalMax: 80000  };
  if (score >= 500) return { bizMin: 10000,  bizMax: 25000,  personalMin: 15000,  personalMax: 40000  };
  return               { bizMin: 0,      bizMax: 0,      personalMin: 0,     personalMax: 0      };
}

function projectScore(currentScore: number, daysOut: number, incompleteItems: AuditItem[]): number {
  // Estimate score gain from completing high-priority incomplete items
  const criticalItems = incompleteItems.filter(i => i.priority === 'critical' || i.priority === 'high');
  const mediumItems   = incompleteItems.filter(i => i.priority === 'medium');

  // Assume user completes ~2 critical items per 30 days and ~3 medium items
  const periodsOf30 = daysOut / 30;
  const criticalGain = Math.min(criticalItems.length, periodsOf30 * 2) * 40; // ~40 pts per critical
  const mediumGain   = Math.min(mediumItems.length,   periodsOf30 * 3) * 15; // ~15 pts per medium
  const totalGain    = criticalGain + mediumGain;

  return Math.min(currentScore + Math.round(totalGain), 1000);
}

function getTopActions(incompleteItems: AuditItem[], currentBizMin: number): Array<{
  title: string;
  why: string;
  capitalImpact: string;
  days: number;
  priority: string;
}> {
  // Rank by priority + FICO impact
  const ranked = [...incompleteItems]
    .sort((a, b) => {
      const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const pA = pOrder[a.priority as keyof typeof pOrder] ?? 3;
      const pB = pOrder[b.priority as keyof typeof pOrder] ?? 3;
      if (pA !== pB) return pA - pB;
      return (b.ficoImpact || 0) - (a.ficoImpact || 0);
    })
    .slice(0, 5);

  return ranked.map(item => {
    const impact = item.priority === 'critical' ? 40 : item.priority === 'high' ? 25 : 10;
    const nextScore = Math.min(item.ficoImpact || impact, 200);
    const nextFunding = scoreToBizFunding(currentBizMin + nextScore * 3);
    const uplift = nextFunding.bizMax - currentBizMin;

    return {
      title: item.title,
      why: item.description || 'Improves lender confidence and fundability score.',
      capitalImpact: uplift > 0 ? `+$${Math.round(uplift / 1000)}K` : '+Score',
      days: item.priority === 'critical' ? 7 : item.priority === 'high' ? 14 : 21,
      priority: item.priority,
    };
  });
}

function fmtMoney(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
}

function fmtRange(min: number, max: number): string {
  if (min === 0 && max === 0) return 'Not yet eligible';
  return `${fmtMoney(min)} – ${fmtMoney(max)}`;
}

export function EstimatedFunding({ data: propData }: EstimatedFundingProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<ExtendedResultsOutput | null>(propData || null);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);

  useEffect(() => {
    if (!propData) {
      try {
        const saved = localStorage.getItem('unified_assessment');
        if (saved) {
          const assessmentData = JSON.parse(saved);
          const extended = computeExtendedResults(assessmentData);
          setData(extended);
        } else {
          navigate('/business-assessment');
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
        navigate('/business-assessment');
      }
    }

    // Load audit items for action prioritization
    const items = getAllAuditItems();
    setAuditItems(items);
  }, [propData, navigate]);

  if (!data) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading your capital report...</div>
      </div>
    );
  }

  // ── Compute projections ────────────────────────────────────────────────────
  const incompleteItems = auditItems.filter(i => i.status !== 'complete');
  const currentScore    = data.fundScore;
  const score30         = projectScore(currentScore, 30,  incompleteItems);
  const score90         = projectScore(currentScore, 90,  incompleteItems);
  const score180        = projectScore(currentScore, 180, incompleteItems);

  const current  = scoreToBizFunding(currentScore);
  const at30     = scoreToBizFunding(score30);
  const at90     = scoreToBizFunding(score90);
  const at180    = scoreToBizFunding(score180);

  const snapshots: FundingSnapshot[] = [
    {
      label: 'Today',
      projectedScore: currentScore,
      ...current,
      color: '#64748b',
      border: '#94a3b8',
      isCurrent: true,
    },
    {
      label: '30 Days',
      projectedScore: score30,
      ...at30,
      color: '#0ea5e9',
      border: '#38bdf8',
      isCurrent: false,
    },
    {
      label: '90 Days',
      projectedScore: score90,
      ...at90,
      color: '#10b981',
      border: '#34d399',
      isCurrent: false,
    },
    {
      label: '6 Months',
      projectedScore: score180,
      ...at180,
      color: '#8b5cf6',
      border: '#a78bfa',
      isCurrent: false,
    },
  ];

  const topActions = getTopActions(incompleteItems, current.bizMin);
  const totalPotentialUplift = at180.bizMax - current.bizMax;

  return (
    <div style={{ background: 'var(--bg-base)', padding: '32px 24px', maxWidth: '820px', margin: '0 auto' }}>

      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Estimated Funding Range & Capital Forecast
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {data.businessName} &nbsp;·&nbsp; FundScore™ {currentScore}/1000 &nbsp;·&nbsp; {data.reportDate}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500,
            padding: '8px 14px', background: 'transparent',
            border: '1px solid var(--border-subtle)', borderRadius: '6px',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          <Download style={{ width: '14px', height: '14px' }} />
          Download PDF
        </button>
      </div>

      {/* ── CURRENT ELIGIBILITY HERO ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '2px solid var(--primary)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Zap style={{ width: '18px', height: '18px', color: '#000' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Your Funding Potential
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
              Maximum available at FundScore™ {currentScore}/1000 tier (requires meeting product-specific criteria)
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg-surface-2)',
              borderRadius: '8px', padding: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Business Only
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--primary)' }}>
              {fmtRange(current.bizMin, current.bizMax)}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Available when all business criteria are met
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-surface-2)',
              borderRadius: '8px', padding: '16px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Personal + Business Combined
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {fmtRange(current.personalMin, current.personalMax)}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Includes personal guarantee options
            </div>
          </div>
        </div>

        {/* Note about actual vs potential */}
        <div
          style={{
            marginTop: '12px', padding: '10px 14px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '6px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#f59e0b' }}>Note:</strong> These ranges show your tier's maximum potential. Actual eligibility depends on meeting specific product requirements. Check the "Your FundScore" tab to see which products you currently qualify for.
          </span>
        </div>

        {totalPotentialUplift > 0 && (
          <div
            style={{
              marginTop: '16px', padding: '12px 16px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            <TrendingUp style={{ width: '16px', height: '16px', color: '#10b981', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#10b981', fontWeight: 500 }}>
              With consistent improvements, you could unlock an additional {fmtMoney(totalPotentialUplift)} in funding capacity over 6 months.
            </span>
          </div>
        )}
      </div>

      {/* ── CAPITAL GROWTH TIMELINE ──────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '24px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          Your Capital Growth Path
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
          Projected funding eligibility as you complete audit items and improve your FundScore.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {snapshots.map((snap) => (
            <div
              key={snap.label}
              style={{
                borderRadius: '8px',
                padding: '16px',
                border: `2px solid ${snap.isCurrent ? 'var(--primary)' : snap.border}`,
                background: snap.isCurrent ? 'var(--primary-alpha)' : 'var(--bg-surface-2)',
                position: 'relative',
              }}
            >
              {snap.isCurrent && (
                <div
                  style={{
                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--primary)', borderRadius: '4px',
                    fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                    color: '#000', padding: '2px 8px', whiteSpace: 'nowrap',
                  }}
                >
                  YOU ARE HERE
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: snap.isCurrent ? 'var(--primary)' : snap.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                {snap.label}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '4px' }}>
                {snap.bizMin === 0 ? 'Not eligible' : fmtMoney(snap.bizMax)}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                {snap.bizMin === 0 ? 'Take action to unlock' : `Biz only: ${fmtRange(snap.bizMin, snap.bizMax)}`}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600,
                  color: snap.isCurrent ? 'var(--primary)' : snap.color,
                  background: snap.isCurrent ? 'var(--primary-alpha)' : `${snap.border}20`,
                  borderRadius: '4px', padding: '3px 6px', display: 'inline-block',
                }}
              >
                Score: {snap.projectedScore}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-surface-2)', borderRadius: '6px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Projections assume consistent completion of audit items at approximately 2 critical items + 3 medium items per 30 days. Actual results depend on lender appetite, industry, and credit profile changes.
          </p>
        </div>
      </div>

      {/* ── TOP ACTIONS THAT UNLOCK CAPITAL ──────────────────────────────────── */}
      {topActions.length > 0 && (
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            Actions That Unlock Capital Fastest
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
            Complete these items in order of impact to accelerate your funding eligibility.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topActions.map((action, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '14px', borderRadius: '8px',
                  background: 'var(--bg-surface-2)',
                  border: `1px solid ${action.priority === 'critical' ? '#ef444440' : 'var(--border-subtle)'}`,
                }}
              >
                <div
                  style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                    background: action.priority === 'critical' ? '#ef4444' : action.priority === 'high' ? '#f97316' : '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 700, color: 'white',
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {action.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700,
                          color: '#10b981',
                          background: 'rgba(16,185,129,0.1)',
                          borderRadius: '4px', padding: '2px 8px',
                        }}
                      >
                        {action.capitalImpact}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        ~{action.days} days
                      </span>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {action.why}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/lender-compliance')}
            style={{
              marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600,
              padding: '10px 20px', background: 'var(--primary)',
              border: 'none', borderRadius: '6px', color: '#000', cursor: 'pointer',
            }}
          >
            Start Working on These
            <ArrowRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}

      {/* ── CRITICAL VARIABLES ───────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '20px 24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Critical Variables
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
            Estimate expires: {data.estimateExpiry}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {[
            'Keep all revolving credit balances below 45% of credit limit',
            'Estimate assumes no previous derogatory account with target lenders',
            'No additional credit inquiries after date produced',
            'Business bank account must maintain positive daily balance',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle style={{ width: '13px', height: '13px', color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── BUSINESS OWNER STATUS ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: 'var(--bg-surface-2)', padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Business Owner Status
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
            {data.ownerStatus.name}
          </div>
        </div>
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Personal FICO</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>Experian: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.experian}</strong></div>
              <div>Equifax: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.equifax}</strong></div>
              <div>TransUnion: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.transunion}</strong></div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Inquiries</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>3 Months: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.inquiries3mo}</strong></div>
              <div>6 Months: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.inquiries6mo}</strong></div>
              <div>12 Months: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.inquiries12mo}</strong></div>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Profile</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <div>Income: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.personalIncome}</strong></div>
              <div>TIB: <strong style={{ color: 'var(--text-primary)' }}>{data.ownerStatus.timeInBusiness}</strong></div>
              <div>Utilization: <strong style={{ color: parseInt(data.ownerStatus.revolvingUsage) > 30 ? '#ef4444' : 'var(--text-primary)' }}>{data.ownerStatus.revolvingUsage}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FUNDING CONTINGENCIES ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <div style={{ background: 'var(--bg-surface-2)', padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Business Funding Contingencies
          </div>
        </div>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 2fr', gap: '12px', padding: '10px 20px', background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
            {['Item', 'Found', 'Cause / Notes'].map(h => (
              <div key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</div>
            ))}
          </div>
          {data.contingencies.map((c, i) => (
            <div
              key={c.item}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 2fr', gap: '12px',
                padding: '12px 20px',
                background: i % 2 === 0 ? 'var(--bg-surface-1)' : 'var(--bg-surface-2)',
                borderBottom: i < data.contingencies.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {c.status === 'clear'
                  ? <CheckCircle style={{ width: '13px', height: '13px', color: '#10b981', flexShrink: 0 }} />
                  : <AlertCircle  style={{ width: '13px', height: '13px', color: '#ef4444', flexShrink: 0 }} />
                }
                {c.item}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: c.found === 0 ? '#10b981' : '#ef4444' }}>
                {c.found}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {c.cause || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
