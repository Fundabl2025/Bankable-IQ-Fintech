// ════════════════════════════════════════════════════════════════════════════════
// CreditPath Phase 3 Tool 5: DSCR Estimator
// Assessment-Aware · Confidence Tier 1 · No AI · No uploads
//
// DSCR (Debt Service Coverage Ratio) = Annual NOI / Annual Debt Service
// Lender threshold: ≥ 1.25x (SBA standard; most conventional lenders match)
// Below 1.0x = cannot cover debt = hard stop in lender pipeline
//
// Rendered when capacity blocker fires (DSCR < 1.25 based on assessment data).
// Seeds from assessment data midpoints if available; accepts manual override.
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, Info, AlertTriangle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type DSCRStatus = 'no_data' | 'critical' | 'below' | 'passing' | 'strong';

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

function formatDollarInput(raw: string): string {
  // Allow typing — only format non-empty strings
  if (!raw) return '';
  const num = parseDollar(raw);
  if (isNaN(num) || num === 0) return raw;
  return num.toLocaleString('en-US');
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DSCRStatus, {
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
    message: 'Enter your annual NOI and debt service above to see your DSCR.',
  },
  critical: {
    label: 'Critical — below 1.0x',
    color: '#b04428',
    bgColor: 'rgba(176,68,40,0.06)',
    borderColor: 'rgba(176,68,40,0.2)',
    message: 'Your NOI does not cover your debt obligations. This is a hard stop in most lender pipelines. Focus on increasing NOI or reducing debt service before applying.',
  },
  below: {
    label: 'Below threshold — under 1.25x',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.06)',
    borderColor: 'rgba(245,158,11,0.2)',
    message: 'You\'re covering your debt but below the 1.25x lender threshold. Most SBA and conventional lenders will flag this. Closing the gap before applying improves approval odds.',
  },
  passing: {
    label: 'Passing — at threshold',
    color: '#8ab820',
    bgColor: 'rgba(138,184,32,0.06)',
    borderColor: 'rgba(138,184,32,0.2)',
    message: 'You\'re at or just above the 1.25x minimum. This may pass automated screening but is a thin margin. A lender reviewing manually may still flag it. Building to 1.35x+ adds a buffer.',
  },
  strong: {
    label: 'Strong — 1.35x or above',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.06)',
    borderColor: 'rgba(16,185,129,0.15)',
    message: 'Your DSCR is in a strong range for most lender programs. This is a positive signal for both SBA and conventional products.',
  },
};

// ── DSCR Gauge ────────────────────────────────────────────────────────────────

function DSCRGauge({ dscr }: { dscr: number | null }) {
  // Scale: 0 to 2.5x, capped visually
  const MAX = 2.5;
  const pct = dscr !== null ? Math.min(100, (dscr / MAX) * 100) : 0;

  const zones = [
    { end: 1.0 / MAX * 100, color: '#b04428', label: '<1.0x' },
    { end: 1.25 / MAX * 100, color: '#f59e0b', label: '1.0–1.25x' },
    { end: 1.35 / MAX * 100, color: '#8ab820', label: '1.25–1.35x' },
    { end: 100, color: '#10b981', label: '1.35x+' },
  ];

  const thresholdPct = (1.25 / MAX) * 100;

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
          DSCR Gauge
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 900,
          color: dscr === null
            ? 'var(--muted-foreground)'
            : dscr >= 1.35 ? '#10b981'
            : dscr >= 1.25 ? '#8ab820'
            : dscr >= 1.0 ? '#f59e0b'
            : '#b04428',
          lineHeight: 1,
        }}>
          {dscr !== null ? `${dscr.toFixed(2)}x` : '—'}
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
        {/* Colored zones */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: `${zones[0].end}%`,
          background: zones[0].color,
          opacity: 0.25,
        }} />
        <div style={{
          position: 'absolute',
          left: `${zones[0].end}%`, top: 0, bottom: 0,
          width: `${zones[1].end - zones[0].end}%`,
          background: zones[1].color,
          opacity: 0.25,
        }} />
        <div style={{
          position: 'absolute',
          left: `${zones[1].end}%`, top: 0, bottom: 0,
          width: `${zones[2].end - zones[1].end}%`,
          background: zones[2].color,
          opacity: 0.35,
        }} />
        <div style={{
          position: 'absolute',
          left: `${zones[2].end}%`, top: 0, bottom: 0,
          right: 0,
          background: zones[3].color,
          opacity: 0.2,
        }} />

        {/* Fill to current DSCR */}
        {dscr !== null && (
          <div style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: dscr >= 1.35 ? '#10b981'
              : dscr >= 1.25 ? '#8ab820'
              : dscr >= 1.0 ? '#f59e0b'
              : '#b04428',
            borderRadius: '5px',
            transition: 'width 0.4s ease',
          }} />
        )}

        {/* Threshold marker at 1.25x */}
        <div style={{
          position: 'absolute',
          left: `${thresholdPct}%`,
          top: '-2px',
          bottom: '-2px',
          width: '2px',
          background: 'white',
          zIndex: 2,
          transform: 'translateX(-50%)',
        }} />
      </div>

      {/* Zone labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '2px',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#b04428' }}>0x</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#f59e0b', position: 'absolute', left: `${(1.0 / MAX * 100)}%`, transform: 'translateX(-50%)' }}>1.0x</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'white', fontWeight: 700, position: 'absolute', left: `${thresholdPct}%`, transform: 'translateX(-50%)' }}>1.25x ▲</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#10b981' }}>2.5x+</span>
      </div>
    </div>
  );
}

// ── Gap closer targets ────────────────────────────────────────────────────────

function GapCloser({ noi, debtService, dscr }: { noi: number; debtService: number; dscr: number }) {
  if (dscr >= 1.25) return null;

  const noiTarget = debtService * 1.25;
  const noiGap = Math.max(0, noiTarget - noi);
  const maxDebt = noi / 1.25;
  const debtGap = Math.max(0, debtService - maxDebt);

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
          Path 1 — Increase NOI
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 800,
          color: '#10b981',
          lineHeight: 1,
          marginBottom: '3px',
        }}>
          +{formatCurrency(noiGap)}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.4,
        }}>
          Annual NOI needed: {formatCurrency(noiTarget)}
        </div>
      </div>
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
          Path 2 — Reduce Debt
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '15px',
          fontWeight: 800,
          color: '#f59e0b',
          lineHeight: 1,
          marginBottom: '3px',
        }}>
          −{formatCurrency(debtGap)}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.4,
        }}>
          Max annual debt service: {formatCurrency(maxDebt)}
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
        gap: '0',
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

interface DSCREstimatorProps {
  seedNOI?: number;
  seedDebtService?: number;
}

export function DSCREstimator({ seedNOI, seedDebtService }: DSCREstimatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [noi, setNoi] = useState(seedNOI ? String(seedNOI) : '');
  const [debtService, setDebtService] = useState(seedDebtService ? String(seedDebtService) : '');

  // Sync seeds if props change
  useEffect(() => {
    if (seedNOI && !noi) setNoi(String(seedNOI));
  }, [seedNOI]);
  useEffect(() => {
    if (seedDebtService && !debtService) setDebtService(String(seedDebtService));
  }, [seedDebtService]);

  const noiNum = parseDollar(noi);
  const dsNum = parseDollar(debtService);
  const dscr = dsNum > 0 ? noiNum / dsNum : null;

  const status: DSCRStatus =
    dscr === null ? 'no_data'
    : dscr >= 1.35 ? 'strong'
    : dscr >= 1.25 ? 'passing'
    : dscr >= 1.0 ? 'below'
    : 'critical';

  const cfg = STATUS_CONFIG[status];

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
          <TrendingDown size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}>
            DSCR Estimator
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'var(--muted-foreground)',
          }}>
            — check your debt coverage ratio
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
            <strong style={{ color: 'var(--foreground)' }}>DSCR = Annual NOI ÷ Annual Debt Service.</strong>
            {' '}Lenders require ≥ 1.25x — meaning your business generates $1.25 for every $1.00 in debt
            payments. This is the single most common reason commercial loan applications are declined.
          </div>

          {/* Inputs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <DollarInput
              label="Annual Net Operating Income"
              sublabel="Revenue minus operating expenses (before loan payments)"
              value={noi}
              onChange={setNoi}
            />
            <DollarInput
              label="Annual Debt Service"
              sublabel="Total annual principal + interest payments on all loans"
              value={debtService}
              onChange={setDebtService}
            />
          </div>

          {/* Gauge */}
          <div style={{ position: 'relative' }}>
            <DSCRGauge dscr={dscr} />
          </div>

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
            {status === 'critical' || status === 'below'
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

          {/* Gap closer targets — only if below threshold */}
          {dscr !== null && dscr < 1.25 && noiNum > 0 && dsNum > 0 && (
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
                To reach 1.25x — two paths
              </div>
              <GapCloser noi={noiNum} debtService={dsNum} dscr={dscr} />
            </>
          )}

          {/* What DSCR measures */}
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
              How lenders use DSCR
            </div>
            {[
              { label: '< 1.0x', note: 'Hard stop — NOI cannot cover debt; most lenders auto-decline', color: '#b04428' },
              { label: '1.0–1.25x', note: 'Below threshold — flags Capacity module; may require exception review', color: '#f59e0b' },
              { label: '1.25–1.35x', note: 'Passing — meets minimum; thin margin may still draw lender scrutiny', color: '#8ab820' },
              { label: '1.35x+', note: 'Strong — comfortable buffer; auto-approval in most programs', color: '#10b981' },
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
                  minWidth: '60px',
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
              Calculations are based on values you entered. NOI and debt service inputs are estimates —
              actual lender calculations will use verified tax returns and full debt schedules.
              Based on self-reported data · Confidence Tier 1
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
