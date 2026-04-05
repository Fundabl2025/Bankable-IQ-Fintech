// ════════════════════════════════════════════════════════════════════════════════
// CreditPath Capacity Tool: DTI Estimator
// Assessment-Aware · Confidence Tier 1 · No AI · No uploads
//
// DTI (Debt-to-Income Ratio) = Monthly Total Debt Payments ÷ Gross Monthly Income
// Personal guarantee underwriting standard:
//   < 36%   Strong  — preferred by most lenders
//   36–43%  Passing — most lenders' ceiling for personal guarantee
//   > 43%   Hard stop — fails standard personal guarantee underwriting
//
// Seeds monthly income from assessment personalIncome field if available.
// Saves result to localStorage when calculated so CreditPath can pass it
// into the blocker engine without the domain layer reading storage.
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Percent, Info, AlertTriangle } from 'lucide-react';
import type { DTIResult } from './creditBlockers';

export { DTIResult };

// ── Storage key ───────────────────────────────────────────────────────────────
// Exported so CreditPath can read the result without coupling to this component.
export const DTI_RESULT_KEY = 'creditpath_dti_result';

// ── Income seed midpoints (monthly, $) ────────────────────────────────────────
// Maps personalIncome categorical bands → approximate monthly midpoint.
// Conservative: uses midpoint of annual range ÷ 12.
const INCOME_MIDPOINTS: Record<string, number> = {
  under_35k: 2_083,    // ~$25K/yr midpoint → /12
  '35_75k':  4_583,    // ~$55K/yr midpoint → /12
  '75_125k': 8_333,    // ~$100K/yr midpoint → /12
  '125_250k': 15_625,  // ~$187.5K/yr midpoint → /12
  over_250k: 25_000,   // conservative floor
};

// ── Types ─────────────────────────────────────────────────────────────────────

type DTIStatus = 'no_data' | 'strong' | 'passing' | 'critical';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function parseDollar(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DTIStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  message: string;
}> = {
  no_data: {
    label: 'Enter values',
    color: 'var(--muted-foreground)',
    bgColor: 'var(--background)',
    borderColor: 'var(--border)',
    message: 'Enter your monthly income and total debt payments above to calculate your DTI.',
  },
  strong: {
    label: 'Strong — below 36%',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.06)',
    borderColor: 'rgba(16,185,129,0.15)',
    message: "Your DTI is in the preferred range. Most lenders look for a ratio below 36% when evaluating a personal guarantee — you're in a favorable position.",
  },
  passing: {
    label: 'Borderline — 36–43%',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.06)',
    borderColor: 'rgba(245,158,11,0.2)',
    message: "Your DTI is above the preferred threshold but within what many lenders allow. Some lenders cap personal guarantees at 43%. Reducing monthly debt payments before applying may improve approval odds.",
  },
  critical: {
    label: 'High — above 43%',
    color: '#b04428',
    bgColor: 'rgba(176,68,40,0.06)',
    borderColor: 'rgba(176,68,40,0.2)',
    message: 'Your DTI exceeds the 43% standard threshold used in personal guarantee underwriting. Most lenders will flag this as a Capacity concern. Reducing monthly debt obligations before applying is recommended.',
  },
};

// ── DTI Gauge ─────────────────────────────────────────────────────────────────

function DTIGauge({ dti }: { dti: number | null }) {
  // Scale: 0 to 80% DTI (capped visually — anything above 80% is off the chart)
  const MAX = 0.80;
  const pct = dti !== null ? Math.min(100, (dti / MAX) * 100) : 0;

  const threshold36 = (0.36 / MAX) * 100;
  const threshold43 = (0.43 / MAX) * 100;

  const fillColor =
    dti === null ? 'var(--border)'
    : dti < 0.36 ? '#10b981'
    : dti < 0.43 ? '#f59e0b'
    : '#b04428';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
        }}>
          DTI Gauge
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 900,
          color: fillColor === 'var(--border)' ? 'var(--muted-foreground)' : fillColor,
          lineHeight: 1,
        }}>
          {dti !== null ? `${Math.round(dti * 100)}%` : '—'}
        </div>
      </div>

      {/* Track */}
      <div style={{
        position: 'relative',
        height: '10px',
        borderRadius: '5px',
        overflow: 'hidden',
        background: 'var(--border)',
        marginBottom: '4px',
      }}>
        {/* Zone backgrounds */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${threshold36}%`,
          background: '#10b981',
          opacity: 0.2,
        }} />
        <div style={{
          position: 'absolute',
          left: `${threshold36}%`, top: 0, bottom: 0,
          width: `${threshold43 - threshold36}%`,
          background: '#f59e0b',
          opacity: 0.25,
        }} />
        <div style={{
          position: 'absolute',
          left: `${threshold43}%`, top: 0, bottom: 0,
          right: 0,
          background: '#b04428',
          opacity: 0.2,
        }} />

        {/* Fill to current DTI */}
        {dti !== null && (
          <div style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: fillColor,
            borderRadius: '5px',
            transition: 'width 0.4s ease',
          }} />
        )}

        {/* Threshold markers */}
        <div style={{
          position: 'absolute',
          left: `${threshold36}%`,
          top: '-2px', bottom: '-2px',
          width: '2px',
          background: 'white',
          zIndex: 2,
          transform: 'translateX(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          left: `${threshold43}%`,
          top: '-2px', bottom: '-2px',
          width: '2px',
          background: 'white',
          zIndex: 2,
          transform: 'translateX(-50%)',
        }} />
      </div>

      {/* Labels */}
      <div style={{ position: 'relative', height: '14px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#10b981', position: 'absolute', left: 0 }}>0%</span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '9px', color: '#f59e0b', fontWeight: 700,
          position: 'absolute', left: `${threshold36}%`, transform: 'translateX(-50%)',
        }}>36% ▲</span>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '9px', color: '#b04428', fontWeight: 700,
          position: 'absolute', left: `${threshold43}%`, transform: 'translateX(-50%)',
        }}>43% ▲</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#b04428', position: 'absolute', right: 0 }}>80%+</span>
      </div>
    </div>
  );
}

// ── Gap closer ────────────────────────────────────────────────────────────────

function GapCloser({ income, debt, dti }: { income: number; debt: number; dti: number }) {
  if (dti <= 0.43) return null;

  // Path 1: reduce debt to hit 43%
  const maxDebt = income * 0.43;
  const debtReduction = Math.max(0, debt - maxDebt);

  // Path 2: increase income to hit 43%
  const reqIncome = debt / 0.43;
  const incomeIncrease = Math.max(0, reqIncome - income);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '8px',
      marginBottom: '12px',
    }}>
      <div style={{
        padding: '11px 12px',
        borderRadius: '8px',
        background: 'rgba(245,158,11,0.05)',
        border: '1px solid rgba(245,158,11,0.15)',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '9px',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: '#f59e0b',
          marginBottom: '5px',
        }}>
          Path 1 — Reduce Debt
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 800,
          color: '#f59e0b',
          lineHeight: 1,
          marginBottom: '3px',
        }}>
          −{formatCurrency(debtReduction)}/mo
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.4,
        }}>
          Target: {formatCurrency(maxDebt)}/mo max debt
        </div>
      </div>
      <div style={{
        padding: '11px 12px',
        borderRadius: '8px',
        background: 'rgba(16,185,129,0.05)',
        border: '1px solid rgba(16,185,129,0.15)',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '9px',
          fontWeight: 700,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          color: '#10b981',
          marginBottom: '5px',
        }}>
          Path 2 — Increase Income
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 800,
          color: '#10b981',
          lineHeight: 1,
          marginBottom: '3px',
        }}>
          +{formatCurrency(incomeIncrease)}/mo
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.4,
        }}>
          Required: {formatCurrency(reqIncome)}/mo gross income
        </div>
      </div>
    </div>
  );
}

// ── Dollar input ──────────────────────────────────────────────────────────────

function DollarInput({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--foreground)',
        marginBottom: '2px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        color: 'var(--muted-foreground)',
        marginBottom: '6px',
        lineHeight: 1.4,
      }}>
        {sublabel}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'var(--background)',
      }}>
        <div style={{
          padding: '9px 10px',
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--muted-foreground)',
          flexShrink: 0,
        }}>
          $
        </div>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={e => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="0"
          style={{
            flex: 1,
            padding: '9px 10px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--foreground)',
          }}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface DTIEstimatorProps {
  /** Monthly gross income seed from assessment (personalIncome field) */
  seedIncome?: number;
}

export function DTIEstimator({ seedIncome }: DTIEstimatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [income, setIncome] = useState(seedIncome ? String(seedIncome) : '');
  const [debt, setDebt] = useState('');

  // Sync seed if prop changes
  useEffect(() => {
    if (seedIncome && !income) setIncome(String(seedIncome));
  }, [seedIncome]);

  const incomeNum = parseDollar(income);
  const debtNum = parseDollar(debt);
  const dti = incomeNum > 0 ? debtNum / incomeNum : null;

  const status: DTIStatus =
    dti === null ? 'no_data'
    : dti < 0.36 ? 'strong'
    : dti < 0.43 ? 'passing'
    : 'critical';

  const cfg = STATUS_CONFIG[status];

  // Persist result to localStorage whenever both inputs are filled
  // CreditPath reads this on mount to pass into blocker extraction
  useEffect(() => {
    if (dti !== null && incomeNum > 0 && debtNum > 0) {
      const result: DTIResult = {
        monthlyIncome: incomeNum,
        monthlyDebt: debtNum,
        dti,
        status: status as 'strong' | 'passing' | 'critical',
        calculatedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(DTI_RESULT_KEY, JSON.stringify(result));
        // Notify page layer that DTI result changed
        window.dispatchEvent(new Event('dtiResultUpdated'));
      } catch { /* non-fatal */ }
    }
  }, [dti, incomeNum, debtNum, status]);

  return (
    <div style={{
      marginTop: '14px',
      borderRadius: '10px',
      border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 14px',
          background: expanded ? 'rgba(16,185,129,0.04)' : 'var(--background)',
          border: 'none',
          cursor: 'pointer',
          gap: '8px',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Percent size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}>
            DTI Estimator
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'var(--muted-foreground)',
          }}>
            — check your debt-to-income ratio
          </span>
        </div>
        {expanded
          ? <ChevronUp size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          : <ChevronDown size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        }
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)' }}>

          {/* Definition */}
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
            marginBottom: '14px',
          }}>
            <strong style={{ color: 'var(--foreground)' }}>DTI = Monthly Debt Payments ÷ Gross Monthly Income.</strong>
            {' '}Lenders use this ratio when evaluating personal guarantees — the owner's personal obligation to repay. Most lenders cap DTI at 43%. A ratio below 36% is the preferred range.
          </div>

          {/* Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <DollarInput
              label="Gross Monthly Income"
              sublabel="Total income before taxes (salary, business distributions, all sources)"
              value={income}
              onChange={setIncome}
            />
            <DollarInput
              label="Monthly Debt Payments"
              sublabel="All recurring debt: mortgage/rent, car loans, student loans, credit cards (minimum payments)"
              value={debt}
              onChange={setDebt}
            />
          </div>

          {/* Gauge */}
          <DTIGauge dti={dti} />

          {/* Status pill */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '11px 13px',
            borderRadius: '8px',
            background: cfg.bgColor,
            border: `1px solid ${cfg.borderColor}`,
            marginBottom: '12px',
            marginTop: '8px',
          }}>
            {status === 'critical' || status === 'passing'
              ? <AlertTriangle size={12} style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }} />
              : <Info size={12} style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }} />
            }
            <div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 700,
                color: cfg.color,
                marginBottom: '3px',
              }}>
                {cfg.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--foreground)',
                lineHeight: 1.5,
              }}>
                {cfg.message}
              </div>
            </div>
          </div>

          {/* Gap closer — only when DTI is above 43% */}
          {dti !== null && dti > 0.43 && incomeNum > 0 && debtNum > 0 && (
            <>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--muted-foreground)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                marginBottom: '8px',
              }}>
                To reach 43% — two paths
              </div>
              <GapCloser income={incomeNum} debt={debtNum} dti={dti} />
            </>
          )}

          {/* How lenders use DTI */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            marginBottom: '10px',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: 'var(--muted-foreground)',
              marginBottom: '6px',
            }}>
              How lenders use DTI
            </div>
            {[
              { label: '< 36%',   note: 'Preferred range — strong personal guarantee profile for most lender programs', color: '#10b981' },
              { label: '36–43%',  note: 'Borderline — within acceptable range but may require compensating factors', color: '#f59e0b' },
              { label: '43–50%',  note: 'Above standard threshold — some lenders allow with strong business cash flow', color: '#c89020' },
              { label: '> 50%',   note: 'Hard stop for most programs — personal guarantee underwriting typically fails at this level', color: '#b04428' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: i < 3 ? '5px' : 0,
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: row.color,
                  minWidth: '55px',
                  flexShrink: 0,
                }}>
                  {row.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'var(--foreground)',
                  lineHeight: 1.4,
                }}>
                  {row.note}
                </span>
              </div>
            ))}
          </div>

          {/* Disclosure */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
          }}>
            <Info size={10} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--muted-foreground)',
              lineHeight: 1.4,
            }}>
              DTI calculations are based on values you entered. Income and debt figures are estimates — actual lender calculations use verified tax returns, pay stubs, and full debt schedules.
              Based on self-reported data · Confidence Tier 1 · Personal guarantee underwriting standard
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Income seed helper ────────────────────────────────────────────────────────
// Exported for use in CreditPath to compute seedIncome from assessment data.

export function getIncomeSeedFromAssessment(
  personalIncome: string | undefined,
): number | undefined {
  if (!personalIncome) return undefined;
  return INCOME_MIDPOINTS[personalIncome] ?? undefined;
}
