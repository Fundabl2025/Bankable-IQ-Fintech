// ════════════════════════════════════════════════════════════════════════════════
// CreditPath Phase 3 Tool 3: Inquiry Aging Tracker
// Assessment-Aware · Confidence Tier 1 · No AI · No uploads
//
// Hard inquiries affect credit scores for up to 12 months and remain on file
// for 24 months. This tool shows the aging timeline and the "stop applying"
// strategy that resolves inquiry load without any payment.
//
// Only rendered when inquiries30d is '3_4' or '5plus'.
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type InquiryBand = '0' | '1_2' | '3_4' | '5plus';

// ── Aging data by band ────────────────────────────────────────────────────────

interface InquiryAgingProfile {
  estimatedCount: string;        // human-readable count estimate
  scoringImpactMonths: number;   // months until score impact fades (~12 mo)
  fileRemovalMonths: number;     // months until removed from file (~24 mo)
  urgency: 'high' | 'medium' | 'low';
  headline: string;
  strategy: string;
}

const INQUIRY_PROFILES: Record<Exclude<InquiryBand, '0' | '1_2'>, InquiryAgingProfile> = {
  '3_4': {
    estimatedCount: '3–4 inquiries',
    scoringImpactMonths: 12,
    fileRemovalMonths: 24,
    urgency: 'medium',
    headline: 'Moderate inquiry load — manageable with a pause',
    strategy: 'Pause new credit applications for 90–120 days. Each inquiry you don\'t add shortens the recovery window.',
  },
  '5plus': {
    estimatedCount: '5 or more inquiries',
    scoringImpactMonths: 12,
    fileRemovalMonths: 24,
    urgency: 'high',
    headline: 'Elevated inquiry load — active suppressor right now',
    strategy: 'Stop all new credit applications for at least 90–180 days. This is the only lever available — inquiries age off on their own and cannot be removed early (unless inaccurate).',
  },
};

// ── Timeline visualization ────────────────────────────────────────────────────

function AgingTimeline({ band }: { band: Exclude<InquiryBand, '0' | '1_2'> }) {
  const profile = INQUIRY_PROFILES[band];
  const today = new Date();

  // Reference point: treat all current inquiries as if clustered "today"
  // (we don't know exact dates — this is the conservative estimate)
  const scoreImpactEnd = new Date(today);
  scoreImpactEnd.setMonth(scoreImpactEnd.getMonth() + profile.scoringImpactMonths);

  const fileRemovalEnd = new Date(today);
  fileRemovalEnd.setMonth(fileRemovalEnd.getMonth() + profile.fileRemovalMonths);

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const milestones = [
    {
      label: 'Now',
      sublabel: 'Inquiries at peak impact',
      date: formatDate(today),
      color: band === '5plus' ? '#b04428' : '#f59e0b',
      position: 0,
    },
    {
      label: '~90 days',
      sublabel: 'Recent applications stopped',
      date: '',
      color: '#f59e0b',
      position: 25,
    },
    {
      label: '~12 months',
      sublabel: 'Score impact fades significantly',
      date: formatDate(scoreImpactEnd),
      color: '#8ab820',
      position: 50,
    },
    {
      label: '~24 months',
      sublabel: 'Inquiries removed from file',
      date: formatDate(fileRemovalEnd),
      color: '#10b981',
      position: 100,
    },
  ];

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--muted-foreground)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        marginBottom: '14px',
      }}>
        Inquiry Aging Timeline (from today)
      </div>

      {/* Timeline bar */}
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        {/* Base track */}
        <div style={{
          height: '4px',
          background: 'var(--border)',
          borderRadius: '2px',
          position: 'relative',
        }}>
          {/* Progress segments */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '50%',
            background: 'linear-gradient(to right, #b04428, #f59e0b)',
            borderRadius: '2px 0 0 2px',
          }} />
          <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            height: '100%',
            width: '50%',
            background: 'linear-gradient(to right, #f59e0b, #10b981)',
            borderRadius: '0 2px 2px 0',
          }} />
        </div>

        {/* Milestone dots */}
        {milestones.map((m, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '-6px',
              left: `${m.position}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: m.color,
              border: '2px solid var(--card)',
              margin: '0 auto',
            }} />
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center' as const,
              width: '70px',
            }}>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 700,
                color: m.color,
                lineHeight: 1.2,
                marginBottom: '1px',
              }}>
                {m.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.3,
              }}>
                {m.sublabel}
              </div>
              {m.date && (
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '9px',
                  color: 'var(--muted-foreground)',
                  fontWeight: 600,
                  marginTop: '1px',
                }}>
                  ({m.date})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Key fact callouts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '8px',
      }}>
        <FactCard
          label="Score impact fades by"
          value={formatDate(scoreImpactEnd)}
          note="~12 months from inquiry date"
          color="#8ab820"
        />
        <FactCard
          label="Removed from file by"
          value={formatDate(fileRemovalEnd)}
          note="~24 months from inquiry date"
          color="#10b981"
        />
      </div>
    </div>
  );
}

function FactCard({
  label,
  value,
  note,
  color,
}: {
  label: string;
  value: string;
  note: string;
  color: string;
}) {
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: '8px',
      background: 'var(--background)',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '9px',
        fontWeight: 700,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
        color: 'var(--muted-foreground)',
        marginBottom: '5px',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '14px',
        fontWeight: 800,
        color,
        lineHeight: 1,
        marginBottom: '3px',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        color: 'var(--muted-foreground)',
      }}>
        {note}
      </div>
    </div>
  );
}

// ── Rate-shopping note ────────────────────────────────────────────────────────

function RateShoppingNote() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      padding: '10px 13px',
      borderRadius: '8px',
      background: 'rgba(16,185,129,0.05)',
      border: '1px solid rgba(16,185,129,0.15)',
      marginBottom: '12px',
    }}>
      <Info size={12} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        color: 'var(--foreground)',
        lineHeight: 1.5,
      }}>
        <strong>Exception: rate-shopping inquiries.</strong>{' '}
        Multiple mortgage, auto, or student loan inquiries within a 14–45 day window
        are typically grouped into a single inquiry by most credit models.
        This does not apply to credit card applications.
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface InquiryTrackerProps {
  inquiryBand: InquiryBand;
}

export function InquiryTracker({ inquiryBand }: InquiryTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  // Only render for elevated inquiry bands
  if (inquiryBand === '0' || inquiryBand === '1_2') return null;

  const profile = INQUIRY_PROFILES[inquiryBand as Exclude<InquiryBand, '0' | '1_2'>];
  const urgencyColor = profile.urgency === 'high' ? '#b04428' : '#f59e0b';

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
          <Clock size={14} style={{ color: urgencyColor, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}>
            Inquiry Aging Tracker
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'var(--muted-foreground)',
          }}>
            — when your inquiry load fades
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

          {/* Headline */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '13px',
            fontWeight: 700,
            color: urgencyColor,
            marginBottom: '6px',
          }}>
            {profile.headline}
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}>
            {profile.strategy}
          </div>

          {/* Timeline */}
          <AgingTimeline band={inquiryBand as Exclude<InquiryBand, '0' | '1_2'>} />

          {/* Rate shopping exception */}
          <RateShoppingNote />

          {/* What you can and cannot do */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <div style={{
              padding: '10px 12px',
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
                marginBottom: '6px',
              }}>
                What helps
              </div>
              {[
                'Stop new credit applications',
                'Let existing inquiries age naturally',
                'Dispute inaccurate inquiries only',
                'Build score through other factors',
              ].map((item, i) => (
                <div key={i} style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--foreground)',
                  lineHeight: 1.5,
                  paddingLeft: '8px',
                }}>
                  · {item}
                </div>
              ))}
            </div>
            <div style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(176,68,40,0.05)',
              border: '1px solid rgba(176,68,40,0.15)',
            }}>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: '#b04428',
                marginBottom: '6px',
              }}>
                What does not help
              </div>
              {[
                'Applying for more credit "just to look"',
                'Opening store cards to save 20%',
                'Applying for cards you won\'t use',
                'Attempting to dispute accurate inquiries',
              ].map((item, i) => (
                <div key={i} style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--foreground)',
                  lineHeight: 1.5,
                  paddingLeft: '8px',
                }}>
                  · {item}
                </div>
              ))}
            </div>
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
              Timeline estimates are based on standard industry aging patterns.
              Actual scoring impact varies by credit model and full profile context.
              Based on self-reported inquiry count · Confidence Tier 1
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
