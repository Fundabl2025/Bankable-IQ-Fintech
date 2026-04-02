// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Estimated Funding Range & Capital Unlock Forecast
// Personalized capital intelligence view — aligned with strategic vision
// Score scale: 0–1000 FundScore. Projections based on real score + audit data.
// ════════════════════════════════════════════════════════════════════════════════

import { Download, TrendingUp, ArrowRight, CheckCircle, AlertCircle, Zap, Lock, Unlock, DollarSign } from 'lucide-react';
import { ExtendedResultsOutput, UnifiedAnswers } from '../business-assessment/types';
import { useEffect, useState } from 'react';
import { computeExtendedResults } from '../business-assessment/engine';
import { useNavigate } from 'react-router';
import { getAllAuditItems, AuditItem } from '../../utils/businessData';
import { evaluateProducts, Product } from '../business-assessment/productEligibility';

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
  // 0–1000 scale. Aligned with engine.ts getFundingRange and Elon's strategic notes
  // Reference: "$80K → $250K → $1.4M" capital unlock trajectory
  if (score >= 900) return { bizMin: 500000, bizMax: 1500000, personalMin: 750000, personalMax: 2500000 };
  if (score >= 800) return { bizMin: 100000, bizMax: 500000,  personalMin: 150000, personalMax: 750000  };
  if (score >= 700) return { bizMin: 50000,  bizMax: 150000,  personalMin: 75000,  personalMax: 250000  };
  if (score >= 600) return { bizMin: 25000,  bizMax: 75000,   personalMin: 40000,  personalMax: 125000  };
  if (score >= 500) return { bizMin: 10000,  bizMax: 30000,   personalMin: 15000,  personalMax: 60000   };
  return                   { bizMin: 5000,   bizMax: 25000,   personalMin: 10000,  personalMax: 50000   };
}

function projectScore(currentScore: number, daysOut: number, incompleteItems: AuditItem[]): number {
  // Realistic score gain estimates aligned with actual credit file update timelines.
  // Credit bureaus update on 30–45 day cycles; new trade lines need 2+ reporting cycles to register.
  // Timeline: Today → 60 days → 120 days → 240 days
  // 60 days:  EIN/bank/NAP quick wins reported + first credit card cycle completes
  // 120 days: 2–3 tradeline cycles established, utilization improvements showing, compliance modules done
  // 240 days: full bankability — 3 bank statement cycles, 3+ tradeline cycles, business credit profile built
  const criticalItems = incompleteItems.filter(i => i.priority === 'critical' || i.priority === 'high');
  const mediumItems   = incompleteItems.filter(i => i.priority === 'medium');

  let criticalCompleted: number;
  let mediumCompleted: number;

  if (daysOut <= 60) {
    // 60 days: quick wins — EIN, bank account, NAP, 1st credit card (~2 critical, 3 medium)
    criticalCompleted = Math.min(criticalItems.length, 2);
    mediumCompleted   = Math.min(mediumItems.length, 3);
  } else if (daysOut <= 120) {
    // 120 days: tradelines reporting, compliance modules complete (~4 critical, 6 medium)
    criticalCompleted = Math.min(criticalItems.length, 4);
    mediumCompleted   = Math.min(mediumItems.length, 6);
  } else {
    // 240 days: full bankability — all critical resolved, most medium done
    criticalCompleted = criticalItems.length;
    mediumCompleted   = Math.min(mediumItems.length, Math.ceil(mediumItems.length * 0.85));
  }

  const criticalGain = criticalCompleted * 40; // ~40 pts per critical item resolved
  const mediumGain   = mediumCompleted   * 15; // ~15 pts per medium item resolved
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
  const [products, setProducts] = useState<Product[]>([]);
  const [rawAssessment, setRawAssessment] = useState<UnifiedAnswers | null>(null);

  useEffect(() => {
    if (!propData) {
      try {
        const saved = localStorage.getItem('unified_assessment');
        if (saved) {
          const assessmentData = JSON.parse(saved) as UnifiedAnswers;
          const extended = computeExtendedResults(assessmentData);
          setData(extended);
          setRawAssessment(assessmentData);
          // Evaluate products with raw assessment data
          const prods = evaluateProducts(assessmentData, extended.fundScore);
          setProducts(prods);
        } else {
          navigate('/business-assessment');
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
        navigate('/business-assessment');
      }
    } else {
      // If propData is provided, try to load raw assessment for product evaluation
      try {
        const saved = localStorage.getItem('unified_assessment');
        if (saved) {
          const assessmentData = JSON.parse(saved) as UnifiedAnswers;
          setRawAssessment(assessmentData);
          const prods = evaluateProducts(assessmentData, propData.fundScore);
          setProducts(prods);
        }
      } catch (error) {
        console.error('Error loading assessment for products:', error);
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
  // Timeline: Today → 60 days → 120 days → 240 days
  // Reflects real credit file update cycles (bureaus report every 30–45 days;
  // trade lines need 2+ cycles; bank statements need 3 monthly cycles for SBA)
  const incompleteItems = auditItems.filter(i => i.status !== 'complete');
  const currentScore    = data.fundScore;
  const score60         = projectScore(currentScore, 60,  incompleteItems);
  const score120        = projectScore(currentScore, 120, incompleteItems);
  const score240        = projectScore(currentScore, 240, incompleteItems);

  // Get eligible products for comparison - THIS IS ACTUAL FUNDING AVAILABLE TODAY
  const eligibleProducts = products.filter(p => p.qualifies);

  // Calculate ACTUAL funding from eligible products (not theoretical tier potential)
  const actualMaxFunding = eligibleProducts.length > 0
    ? Math.max(...eligibleProducts.map(p => {
        const amt = p.maxAmount.replace(/[$,KM+]/g, '');
        return amt.includes('.') ? parseFloat(amt) * 1000000 : parseInt(amt) * 1000;
      }))
    : 0;

  // Tier potentials for future projections
  const tierAt60        = scoreToBizFunding(score60);
  const tierAt120       = scoreToBizFunding(score120);
  const tierAt240       = scoreToBizFunding(score240);

  // Today shows ACTUAL eligible funding, future shows projected tier potential
  const snapshots: FundingSnapshot[] = [
    {
      label: 'Today',
      projectedScore: currentScore,
      bizMin: actualMaxFunding > 0 ? Math.round(actualMaxFunding * 0.5) : 0,
      bizMax: actualMaxFunding,
      personalMin: actualMaxFunding > 0 ? Math.round(actualMaxFunding * 0.75) : 0,
      personalMax: actualMaxFunding > 0 ? Math.round(actualMaxFunding * 1.25) : 0,
      color: '#64748b',
      border: '#94a3b8',
      isCurrent: true,
    },
    {
      label: '60 Days',
      projectedScore: score60,
      ...tierAt60,
      color: '#3b82f6',
      border: '#60a5fa',
      isCurrent: false,
    },
    {
      label: '120 Days',
      projectedScore: score120,
      ...tierAt120,
      color: '#10b981',
      border: '#34d399',
      isCurrent: false,
    },
    {
      label: '240 Days',
      projectedScore: score240,
      ...tierAt240,
      color: '#8b5cf6',
      border: '#a78bfa',
      isCurrent: false,
    },
  ];

  const topActions = getTopActions(incompleteItems, actualMaxFunding);
  const totalPotentialUplift = tierAt240.bizMax - actualMaxFunding;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 28px 48px' }}>

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

      {/* ── TWO-SYSTEM IDENTITY FRAME (Elon's Core Thesis + Chase Identity) ─── */}
      {(() => {
        const isBankable = currentScore >= 800;
        const isApproaching = currentScore >= 650 && currentScore < 800;
        const tierLabel = isBankable ? 'Bankable' : isApproaching ? 'Approaching Bankable' : 'Fundable';
        const tierColor = isBankable ? '#10b981' : isApproaching ? '#f59e0b' : '#3b82f6';
        const tierBg = isBankable ? 'rgba(16,185,129,0.06)' : isApproaching ? 'rgba(245,158,11,0.06)' : 'rgba(59,130,246,0.06)';
        const aprToday = isBankable ? '8–15%' : isApproaching ? '15–25%' : '35%+';
        const aprPotential = '8–12%';
        // Cost comparison on $250K: expensive vs bank
        const expensiveCost = isBankable ? 250000 * 0.10 : 250000 * 0.35;
        const bankCost = 250000 * 0.10;
        const annualSavings = expensiveCost - bankCost;

        return (
          <div style={{ marginBottom: '20px' }}>
            {/* Identity banner */}
            <div style={{
              padding: '20px 24px', borderRadius: '14px',
              background: tierBg, border: `1.5px solid ${tierColor}40`,
              marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                      color: tierColor, textTransform: 'uppercase', letterSpacing: '0.1em',
                      background: `${tierColor}18`, border: `1px solid ${tierColor}30`,
                      padding: '2px 8px', borderRadius: '4px',
                    }}>
                      {tierLabel}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      Current Capital Tier
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {isBankable
                      ? 'You have reached bankable status — institutional capital is available to you.'
                      : `You're currently in the Fundable tier. Your path to Bankable capital starts here.`}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    Today's APR
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800, color: isBankable ? '#10b981' : '#ef4444' }}>
                    {aprToday}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {isBankable ? 'institutional rate' : 'expensive capital'}
                  </div>
                </div>
              </div>
            </div>

            {/* APR cost comparison — Elon: tie status to money */}
            {!isBankable && (
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0', borderRadius: '12px',
                border: '1px solid var(--border-subtle)', overflow: 'hidden',
              }}>
                <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.05)' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Expensive Capital — Today
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>
                    {aprToday} APR
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    $250K loan = <strong style={{ color: '#ef4444' }}>${Math.round(expensiveCost / 1000)}K/yr</strong> in interest
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    MCA · Revenue-Based · Working Capital
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', background: 'var(--bg-surface-2)', borderLeft: '1px solid var(--border-subtle)', borderRight: '1px solid var(--border-subtle)' }}>
                  <ArrowRight style={{ width: '18px', height: '18px', color: 'var(--text-muted)' }} />
                </div>
                <div style={{ padding: '16px 20px', background: 'rgba(16,185,129,0.05)' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                    Bank Capital — 240 Days
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
                    {aprPotential} APR
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    $250K loan = <strong style={{ color: '#10b981' }}>${Math.round(bankCost / 1000)}K/yr</strong> in interest
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                    Save ${Math.round(annualSavings / 1000)}K/year on every $250K borrowed
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── CURRENT ELIGIBILITY HERO ─────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1.5px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Zap style={{ width: '16px', height: '16px', color: 'var(--primary)', flexShrink: 0 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Your Funding Today
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div
            style={{
              background: 'var(--bg-surface-2)',
              borderRadius: '8px', padding: '16px',
              border: '2px solid var(--success)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Available Today
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--success)' }}>
              {actualMaxFunding > 0 ? fmtMoney(actualMaxFunding) : '$0'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              From {eligibleProducts.length} product{eligibleProducts.length !== 1 ? 's' : ''} you qualify for
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
              Tier Potential (Long-Term)
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {fmtMoney(tierAt240.bizMax)}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Unlocked by addressing all blockers
            </div>
          </div>
        </div>

        {/* Clarifying note - dynamic based on actual funding */}
        <div
          style={{
            marginTop: '12px', padding: '10px 14px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '6px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#3b82f6' }}>Your path:</strong> Today you can access {fmtMoney(actualMaxFunding)} from {eligibleProducts.length} product{eligibleProducts.length !== 1 ? 's' : ''}. By completing the actions below, you unlock more products and higher funding tiers—up to {fmtMoney(tierAt240.bizMax)} long-term.
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
              With consistent improvements, you could unlock an additional {fmtMoney(totalPotentialUplift)} in funding capacity long-term.
            </span>
          </div>
        )}
      </div>

      {/* ── CAPITAL PROGRESSION SEQUENCE ─────────────────────────────────────── */}
      {/* Elon: precise milestones tied to capital cost. Chase: identity per stage. */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Your Capital Progression Sequence
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            After first funding, this is your path from expensive capital to institutional bank capital — each milestone unlocks cheaper funding at higher amounts.
          </p>
        </div>

        {/* Connector line behind stages on desktop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[
            {
              label: 'TODAY',
              sublabel: 'First Funding Unlocked',
              tierName: 'Fundable Capital',
              tierColor: '#3b82f6',
              tierBg: 'rgba(59,130,246,0.06)',
              tierBorder: 'rgba(59,130,246,0.25)',
              isCurrent: true,
              score: currentScore,
              capitalRange: fmtRange(
                actualMaxFunding > 0 ? Math.round(actualMaxFunding * 0.4) : 5000,
                actualMaxFunding > 0 ? actualMaxFunding : 50000
              ),
              apr: '35–50%+',
              aprColor: '#ef4444',
              aprLabel: 'EXPENSIVE CAPITAL',
              products: ['Merchant Cash Advance', 'Working Capital Loan', 'Revenue-Based Loan', 'Credit Cards (Business)', 'Invoice Factoring'],
              whatHappens: 'You have access to alternative funding now. These are fast-approval products with higher cost. Use this capital to build cash flow history and fund growth.',
              milestone: 'Start here — apply for first product',
              icon: <Zap style={{ width: '14px', height: '14px' }} />,
            },
            {
              label: '60 DAYS',
              sublabel: 'After First Funding',
              tierName: 'Building Phase',
              tierColor: '#06b6d4',
              tierBg: 'rgba(6,182,212,0.06)',
              tierBorder: 'rgba(6,182,212,0.25)',
              isCurrent: false,
              score: score60,
              capitalRange: fmtRange(tierAt60.bizMin, tierAt60.bizMax),
              apr: '25–35%',
              aprColor: '#f97316',
              aprLabel: 'IMPROVING',
              products: ['Business Credit Line', 'Credit Union Loans', 'Equipment Financing', 'Purchase Order Finance', '+ All Day 1 products'],
              whatHappens: 'EIN registered and reporting. Business bank account established with 60 days of history. NAP consistency confirmed. First credit card opened — completing 1st reporting cycle. Lenders can now verify your business exists.',
              milestone: 'Complete: EIN · Business Bank · NAP · First Credit Card',
              icon: <TrendingUp style={{ width: '14px', height: '14px' }} />,
            },
            {
              label: '120 DAYS',
              sublabel: 'Approaching Bankable',
              tierName: 'Approaching Bankable',
              tierColor: '#10b981',
              tierBg: 'rgba(16,185,129,0.06)',
              tierBorder: 'rgba(16,185,129,0.25)',
              isCurrent: false,
              score: score120,
              capitalRange: fmtRange(tierAt120.bizMin, tierAt120.bizMax),
              apr: '15–25%',
              aprColor: '#f59e0b',
              aprLabel: 'TRANSITIONING',
              products: ['Business Term Loan', 'AR Finance', 'Inventory Line of Credit', 'SBA Loan (approaching)', '+ All prior products'],
              whatHappens: '2–3 tradeline cycles complete. 3 months of bank statements available. Compliance modules 3–6 done. Business credit profile forming with Dun & Bradstreet and Experian Business. SBSS score climbing toward 160 threshold.',
              milestone: 'Complete: 6 compliance modules · 3 bank statement months · 3 tradeline cycles',
              icon: <Unlock style={{ width: '14px', height: '14px' }} />,
            },
            {
              label: '240 DAYS',
              sublabel: 'Full Bankability Achieved',
              tierName: 'Bankable — Institutional Capital',
              tierColor: '#8b5cf6',
              tierBg: 'rgba(139,92,246,0.06)',
              tierBorder: 'rgba(139,92,246,0.25)',
              isCurrent: false,
              score: score240,
              capitalRange: fmtRange(tierAt240.bizMin, tierAt240.bizMax),
              apr: '8–15%',
              aprColor: '#10b981',
              aprLabel: 'BANK CAPITAL',
              products: ['SBA 7(a) & 504 Loans', 'Bank Term Loans', 'DSCR / Real Estate Loans', 'Construction Financing', 'Full institutional suite'],
              whatHappens: 'SBSS score 160+ threshold crossed. 8+ months bank statements on file. Full compliance suite complete. Business credit established with 3+ reporting agencies. You now qualify for the lowest-cost, longest-term institutional capital available to businesses.',
              milestone: 'Complete: All 13 compliance modules · SBSS 160+ · 3 tradeline agencies',
              icon: <DollarSign style={{ width: '14px', height: '14px' }} />,
            },
          ].map((stage, idx, arr) => (
            <div key={stage.label}>
              {/* Stage card */}
              <div style={{
                display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0',
                border: `1.5px solid ${stage.isCurrent ? stage.tierColor : stage.tierBorder}`,
                borderRadius: '12px', overflow: 'hidden',
                background: stage.isCurrent ? stage.tierBg : 'var(--bg-surface-1)',
                boxShadow: stage.isCurrent ? `0 0 0 2px ${stage.tierColor}20` : 'none',
              }}>
                {/* Left: stage identity */}
                <div style={{
                  padding: '20px 16px',
                  background: stage.tierBg,
                  borderRight: `1.5px solid ${stage.tierBorder}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center', gap: '6px',
                }}>
                  {stage.isCurrent && (
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 700,
                      color: stage.tierColor, textTransform: 'uppercase', letterSpacing: '0.1em',
                      background: `${stage.tierColor}20`, border: `1px solid ${stage.tierColor}40`,
                      padding: '2px 6px', borderRadius: '3px', marginBottom: '2px',
                    }}>
                      You are here
                    </div>
                  )}
                  <div style={{ color: stage.tierColor }}>
                    {stage.icon}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: stage.tierColor, lineHeight: 1.1 }}>
                    {stage.label}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {stage.sublabel}
                  </div>
                  <div style={{
                    marginTop: '4px', padding: '3px 8px', borderRadius: '4px',
                    background: `${stage.aprColor}18`, border: `1px solid ${stage.aprColor}30`,
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: stage.aprColor }}>
                      {stage.apr}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: stage.aprColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {stage.aprLabel}
                    </div>
                  </div>
                </div>

                {/* Right: content */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: stage.tierColor, marginBottom: '2px' }}>
                        {stage.tierName}
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                        {stage.capitalRange}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--text-muted)' }}>FundScore</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: stage.tierColor }}>
                        {stage.score}
                      </div>
                    </div>
                  </div>

                  {/* What happens at this stage */}
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                    {stage.whatHappens}
                  </div>

                  {/* Products that unlock */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                    {stage.products.map(p => (
                      <span key={p} style={{
                        fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500,
                        color: stage.tierColor, background: `${stage.tierColor}12`,
                        border: `1px solid ${stage.tierColor}25`,
                        padding: '2px 7px', borderRadius: '4px',
                      }}>
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Milestone */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 10px', borderRadius: '6px',
                    background: stage.isCurrent ? `${stage.tierColor}10` : 'var(--bg-surface-2)',
                    border: `1px solid ${stage.isCurrent ? stage.tierColor + '30' : 'var(--border-subtle)'}`,
                  }}>
                    {stage.isCurrent
                      ? <CheckCircle style={{ width: '12px', height: '12px', color: stage.tierColor, flexShrink: 0 }} />
                      : <Lock style={{ width: '12px', height: '12px', color: 'var(--text-muted)', flexShrink: 0 }} />
                    }
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: stage.isCurrent ? stage.tierColor : 'var(--text-muted)', fontWeight: 600 }}>
                      {stage.milestone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connector arrow between stages */}
              {idx < arr.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px',
                    color: 'var(--text-muted)',
                  }}>
                    <div style={{ width: '1px', height: '8px', background: 'var(--border-subtle)' }} />
                    <ArrowRight style={{ width: '14px', height: '14px', transform: 'rotate(90deg)' }} />
                    <div style={{ width: '1px', height: '8px', background: 'var(--border-subtle)' }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ marginTop: '12px', padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Timeline basis:</strong> Credit bureaus update on 30–45 day cycles. New tradelines need 2+ reporting cycles to register. SBA underwriters require 3 months of bank statements. The 60/120/240-day sequence is calibrated to these real-world cycles — not arbitrary intervals. Actual results depend on lender appetite, industry, and your specific credit profile.
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
