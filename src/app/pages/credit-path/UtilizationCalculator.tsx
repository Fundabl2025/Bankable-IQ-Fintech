// ════════════════════════════════════════════════════════════════════════════════
// CreditPath Phase 3 Tool 1: Utilization Payoff Calculator
// Assessment-Only · Confidence Tier 1 · No AI · No uploads
//
// Dual-leverage tool: improving utilization strengthens both:
//   - Character (personal credit score)
//   - Capacity (DTI, lender repayment assessment)
//
// User enters actual balances and limits to get a concrete paydown target.
// All output uses estimate-safe language — no guaranteed outcomes.
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { Calculator, ChevronDown, ChevronUp, Info, TrendingDown } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UtilizationResult {
  currentPct: number;
  currentBalance: number;
  totalLimit: number;
  paydownTo30: number;         // amount to pay to reach 30%
  paydownTo10: number;         // amount to pay to reach 10% (optimal)
  balanceAt30: number;         // target balance at 30%
  balanceAt10: number;         // target balance at 10%
  monthsTo30_aggressive: number; // paying $500/mo
  monthsTo30_moderate: number;   // paying $200/mo
  dtiMonthlyReduction: number;   // estimated minimum payment reduction at 30%
}

// ── Calculation logic ─────────────────────────────────────────────────────────

function calculate(
  balance: number,
  limit: number,
): UtilizationResult | null {
  if (limit <= 0 || balance < 0 || balance > limit) return null;

  const currentPct = Math.round((balance / limit) * 100);
  const balanceAt30 = Math.floor(limit * 0.30);
  const balanceAt10 = Math.floor(limit * 0.10);
  const paydownTo30 = Math.max(0, balance - balanceAt30);
  const paydownTo10 = Math.max(0, balance - balanceAt10);

  // Monthly payment estimates — aggressive ($500/mo) and moderate ($200/mo)
  // Only calculate if there's actually something to pay down
  const monthsTo30_aggressive = paydownTo30 > 0 ? Math.ceil(paydownTo30 / 500) : 0;
  const monthsTo30_moderate = paydownTo30 > 0 ? Math.ceil(paydownTo30 / 200) : 0;

  // Estimated monthly minimum payment reduction: credit cards typically charge
  // ~2% of balance as minimum payment. Reducing from current to 30% target
  // reduces that minimum payment accordingly.
  const currentMinEstimate = Math.round(balance * 0.02);
  const targetMinEstimate = Math.round(balanceAt30 * 0.02);
  const dtiMonthlyReduction = Math.max(0, currentMinEstimate - targetMinEstimate);

  return {
    currentPct,
    currentBalance: balance,
    totalLimit: limit,
    paydownTo30,
    paydownTo10,
    balanceAt30,
    balanceAt10,
    monthsTo30_aggressive,
    monthsTo30_moderate,
    dtiMonthlyReduction,
  };
}

// ── Severity band for current utilization ────────────────────────────────────

function utilizationBand(pct: number): { label: string; color: string } {
  if (pct <= 10) return { label: 'Excellent', color: '#10b981' };
  if (pct <= 30) return { label: 'Good', color: '#8ab820' };
  if (pct <= 50) return { label: 'Moderate', color: '#f59e0b' };
  if (pct <= 75) return { label: 'High', color: '#b04428' };
  return { label: 'Very High', color: '#b04428' };
}

// ── Input field component ─────────────────────────────────────────────────────

function DollarInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  hint?: string;
}) {
  return (
    <div>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--muted-foreground)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        marginBottom: '6px',
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--muted-foreground)',
          pointerEvents: 'none',
        }}>$</span>
        <input
          type="number"
          min={0}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '9px 10px 9px 22px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--background)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--foreground)',
            boxSizing: 'border-box' as const,
            outline: 'none',
          }}
        />
      </div>
      {hint && (
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--muted-foreground)',
          marginTop: '4px',
          lineHeight: 1.4,
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface UtilizationCalculatorProps {
  /** Pre-seed balance from utilization band if known (0 = unknown) */
  seedBalance?: number;
  /** Pre-seed limit from utilization band if known (0 = unknown) */
  seedLimit?: number;
}

export function UtilizationCalculator({ seedBalance = 0, seedLimit = 0 }: UtilizationCalculatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [balance, setBalance] = useState(seedBalance > 0 ? String(seedBalance) : '');
  const [limit, setLimit] = useState(seedLimit > 0 ? String(seedLimit) : '');

  const result = useCallback(() => {
    const b = parseFloat(balance);
    const l = parseFloat(limit);
    if (isNaN(b) || isNaN(l)) return null;
    return calculate(b, l);
  }, [balance, limit])();

  const band = result ? utilizationBand(result.currentPct) : null;
  const alreadyAt30 = result !== null && result.currentPct <= 30;
  const alreadyOptimal = result !== null && result.currentPct <= 10;

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
          <Calculator size={14} style={{ color: '#10b981', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}>
            Payoff Calculator
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'var(--muted-foreground)',
          }}>
            — see exactly how much to pay down
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

          {/* Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '14px',
          }}>
            <DollarInput
              label="Total Revolving Balance"
              value={balance}
              onChange={setBalance}
              placeholder="e.g. 8500"
              hint="Total balance across all credit cards and revolving lines"
            />
            <DollarInput
              label="Total Credit Limit"
              value={limit}
              onChange={setLimit}
              placeholder="e.g. 15000"
              hint="Sum of all credit card and revolving line limits"
            />
          </div>

          {/* Results */}
          {result && band && (
            <div>
              {/* Current utilization display */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 13px',
                borderRadius: '8px',
                background: `${band.color}10`,
                border: `1px solid ${band.color}28`,
                marginBottom: '14px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--muted-foreground)',
                }}>
                  Your current utilization
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: band.color,
                  }}>
                    {result.currentPct}%
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: band.color,
                    padding: '2px 7px',
                    borderRadius: '5px',
                    background: `${band.color}14`,
                    border: `1px solid ${band.color}28`,
                  }}>
                    {band.label}
                  </span>
                </div>
              </div>

              {alreadyOptimal ? (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16,185,129,0.06)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: '#10b981',
                  fontWeight: 600,
                }}>
                  Already at optimal utilization — keep maintaining this level
                </div>
              ) : alreadyAt30 ? (
                <div>
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16,185,129,0.06)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: '#10b981',
                    fontWeight: 600,
                    marginBottom: '10px',
                  }}>
                    Already at or below the 30% lender benchmark
                  </div>
                  {result.paydownTo10 > 0 && (
                    <PaydownTarget
                      label="Pay down to reach 10% (optimal)"
                      amount={result.paydownTo10}
                      targetBalance={result.balanceAt10}
                      color="#10b981"
                    />
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Primary target: 30% */}
                  <PaydownTarget
                    label="Pay down to reach 30% lender benchmark"
                    amount={result.paydownTo30}
                    targetBalance={result.balanceAt30}
                    color="#10b981"
                    primary
                  />

                  {/* Secondary target: 10% */}
                  {result.paydownTo10 > 0 && (
                    <PaydownTarget
                      label="Or pay down to reach 10% (optimal)"
                      amount={result.paydownTo10}
                      targetBalance={result.balanceAt10}
                      color="#8ab820"
                    />
                  )}

                  {/* Timeline estimates */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  }}>
                    <TimelineCard
                      label="At $200/mo extra"
                      months={result.monthsTo30_moderate}
                      amount={200}
                    />
                    <TimelineCard
                      label="At $500/mo extra"
                      months={result.monthsTo30_aggressive}
                      amount={500}
                    />
                  </div>

                  {/* DTI impact */}
                  {result.dtiMonthlyReduction > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 13px',
                      borderRadius: '8px',
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                    }}>
                      <TrendingDown size={14} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
                      <div>
                        <div style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: 'var(--foreground)',
                          marginBottom: '2px',
                        }}>
                          Estimated DTI benefit
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--muted-foreground)',
                          lineHeight: 1.4,
                        }}>
                          Reaching 30% may reduce your estimated minimum monthly
                          payments by ~${result.dtiMonthlyReduction}/mo — which can
                          improve your debt-to-income ratio in lender evaluations.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Disclosures */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '6px',
                marginTop: '12px',
              }}>
                <Info size={10} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10px',
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.4,
                }}>
                  Calculations are estimates based on inputs you provided.
                  Actual credit score impact varies by profile, bureau model, and timing.
                  DTI estimates use a 2% minimum payment approximation — your actual
                  minimum payments may differ.
                </div>
              </div>
            </div>
          )}

          {/* Empty state — inputs present but invalid */}
          {!result && balance !== '' && limit !== '' && (
            <div style={{
              padding: '10px 13px',
              borderRadius: '8px',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: '#f59e0b',
            }}>
              Check your inputs — balance cannot exceed total limit
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PaydownTarget({
  label,
  amount,
  targetBalance,
  color,
  primary = false,
}: {
  label: string;
  amount: number;
  targetBalance: number;
  color: string;
  primary?: boolean;
}) {
  return (
    <div style={{
      padding: '12px 14px',
      borderRadius: '8px',
      background: primary ? `${color}08` : 'var(--background)',
      border: `1px solid ${primary ? color + '28' : 'var(--border)'}`,
    }}>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--muted-foreground)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        marginBottom: '6px',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: primary ? '24px' : '18px',
          fontWeight: 900,
          color,
        }}>
          ${amount.toLocaleString()}
        </span>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--muted-foreground)',
        }}>
          paydown target → ${targetBalance.toLocaleString()} remaining
        </span>
      </div>
    </div>
  );
}

function TimelineCard({
  label,
  months,
  amount,
}: {
  label: string;
  months: number;
  amount: number;
}) {
  const display = months <= 1
    ? '~1 month'
    : months <= 12
      ? `~${months} months`
      : `~${Math.round(months / 12 * 10) / 10} years`;

  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: '8px',
      background: 'var(--background)',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--muted-foreground)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        marginBottom: '5px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '17px',
        fontWeight: 800,
        color: 'var(--foreground)',
        lineHeight: 1,
        marginBottom: '3px',
      }}>
        {display}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        color: 'var(--muted-foreground)',
      }}>
        to reach 30% benchmark
      </div>
    </div>
  );
}
