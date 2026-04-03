// ════════════════════════════════════════════════════════════════════════════════
// CreditPath Phase 3 Tool 2: Business Tradeline Starter List
// Assessment-Aware · Confidence Tier 1 · No AI · No uploads
//
// Shows a tiered list of vendor accounts that report to business credit bureaus.
// Personalized based on bizCreditFile status from the assessment:
//   - 'none'     → full starter list, D-U-N-S setup first
//   - 'building' → intermediate accounts to deepen the file
//   - 'below_80' → early-pay strategy accounts + Paydex coaching
//
// Does not modify any assessment data or scoring engine.
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Info, Building2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type TradlineApprovalDifficulty = 'easy' | 'moderate' | 'established';
type BureauReporting = 'D&B' | 'Experian Biz' | 'Equifax Biz' | 'D&B + Experian';

interface Tradeline {
  id: string;
  vendor: string;
  type: string;                        // e.g. "Net-30 office supplies"
  approxTerms: string;                 // e.g. "Net-30"
  approvalDifficulty: TradlineApprovalDifficulty;
  reports: BureauReporting;
  why: string;
  firstStep: string;
  disclosures?: string;
}

// ── Tradeline data ────────────────────────────────────────────────────────────
// Sources: widely-documented Net-30 vendor programs. No specific approval
// guarantees. Approval criteria and reporting behavior change over time.

const STARTER_TRADELINES: Tradeline[] = [
  {
    id: 'uline',
    vendor: 'Uline',
    type: 'Net-30 · Shipping & packaging supplies',
    approxTerms: 'Net-30',
    approvalDifficulty: 'easy',
    reports: 'D&B',
    why: 'One of the most commonly cited D&B reporters. Purchases shipping, packaging, and warehouse supplies.',
    firstStep: 'Apply for a business account at uline.com with your EIN and business address. Make a small first order.',
    disclosures: 'Approval and reporting are not guaranteed. Uline may require an initial cash order before extending Net-30.',
  },
  {
    id: 'quill',
    vendor: 'Quill',
    type: 'Net-30 · Office supplies',
    approxTerms: 'Net-30',
    approvalDifficulty: 'easy',
    reports: 'D&B + Experian',
    why: 'Reports to both D&B and Experian Business. Office supply purchases are easy to justify for any business type.',
    firstStep: 'Create a business account at quill.com. Request Net-30 terms when placing your first order.',
    disclosures: 'Net-30 may not be available to all new accounts. A first purchase may be required on prepaid terms.',
  },
  {
    id: 'grainger',
    vendor: 'Grainger',
    type: 'Net-30 · Industrial & maintenance supplies',
    approxTerms: 'Net-30',
    approvalDifficulty: 'easy',
    reports: 'D&B',
    why: 'Long-established D&B reporter with broad product selection. Particularly relevant for service, trades, or facilities businesses.',
    firstStep: 'Apply for a business account at grainger.com with your EIN. Request credit terms on the application.',
    disclosures: 'Net-30 availability varies by business history and order volume.',
  },
  {
    id: 'summa_office',
    vendor: 'Summa Office Supplies',
    type: 'Net-30 · Office supplies (credit-builder focused)',
    approxTerms: 'Net-30',
    approvalDifficulty: 'easy',
    reports: 'D&B + Experian',
    why: 'Designed specifically for businesses building their credit file. Easier approval requirements than general commercial vendors.',
    firstStep: 'Apply at summaofficesupplies.com using your business EIN and DUNS number.',
  },
  {
    id: 'amazon_business',
    vendor: 'Amazon Business',
    type: 'Net-30 · General business purchasing',
    approxTerms: 'Net-30 (Pay by Invoice)',
    approvalDifficulty: 'moderate',
    reports: 'D&B',
    why: 'Broadest product selection. Amazon Business Pay by Invoice extends Net-30 terms and reporting after account history is established.',
    firstStep: 'Set up an Amazon Business account at amazon.com/business. Enable Pay by Invoice once eligible.',
    disclosures: 'Pay by Invoice eligibility typically requires 3–6 months of business account history and spending activity.',
  },
  {
    id: 'home_depot_commercial',
    vendor: 'Home Depot Commercial Account',
    type: 'Net-30 · Construction, maintenance, tools',
    approxTerms: 'Net-30',
    approvalDifficulty: 'moderate',
    reports: 'Experian Biz',
    why: 'Reports to Experian Business Credit. Particularly useful for contractors, property management, or service businesses with supply needs.',
    firstStep: 'Apply for a Home Depot Commercial Account at homedepot.com. Requires EIN and business documentation.',
    disclosures: 'Commercial account approval depends on business credit history and may require a personal guarantee.',
  },
  {
    id: 'crown_office',
    vendor: 'Crown Office Supplies',
    type: 'Net-30 · Office supplies (credit-builder focused)',
    approxTerms: 'Net-30',
    approvalDifficulty: 'easy',
    reports: 'D&B + Experian',
    why: 'Another starter-friendly Net-30 vendor that reports to both major business bureaus. Good second or third account.',
    firstStep: 'Apply at crownofficeinc.com with your business EIN.',
  },
  {
    id: 'brex',
    vendor: 'Brex Business Credit',
    type: 'Business charge card · No personal guarantee (revenue-based)',
    approxTerms: 'Monthly',
    approvalDifficulty: 'established',
    reports: 'Experian Biz + D&B',
    why: 'No personal credit pull or personal guarantee required. Approval based on business revenue and bank balance. Ideal once business has cash flow history.',
    firstStep: 'Apply at brex.com. Requires business bank account with meaningful balance and revenue history.',
    disclosures: 'Brex requires a meaningful business bank balance. Not a fit for businesses under 6 months or without consistent revenue.',
  },
  {
    id: 'nav_business',
    vendor: 'Nav Business Boost',
    type: 'Business credit builder subscription',
    approxTerms: 'Monthly subscription',
    approvalDifficulty: 'easy',
    reports: 'D&B + Experian + Equifax Biz',
    why: 'Nav reports your subscription payment as a tradeline to all three business bureaus. Fast way to start file-building if you have no other accounts.',
    firstStep: 'Sign up at nav.com. The paid tier reports your payment history as a tradeline.',
    disclosures: 'This is a subscription product with a monthly fee. Weigh the cost against the tradeline benefit.',
  },
];

// ── Filtering logic ───────────────────────────────────────────────────────────

type BizCreditFileStatus = 'none' | 'building' | 'below_80' | 'strong' | undefined;

function getRelevantTradelines(bizCreditFile: BizCreditFileStatus): {
  primary: Tradeline[];
  secondary: Tradeline[];
  heading: string;
  subheading: string;
} {
  if (bizCreditFile === 'none') {
    return {
      primary: STARTER_TRADELINES.filter(t => t.approvalDifficulty === 'easy').slice(0, 4),
      secondary: STARTER_TRADELINES.filter(t => t.approvalDifficulty === 'moderate'),
      heading: 'Start Your Business Credit File',
      subheading: 'Open 2–3 of these Net-30 accounts and pay every invoice early. Each one builds a positive payment record on your business credit file.',
    };
  }

  if (bizCreditFile === 'building') {
    return {
      primary: STARTER_TRADELINES.filter(t =>
        t.approvalDifficulty === 'easy' || t.approvalDifficulty === 'moderate'
      ).slice(0, 5),
      secondary: STARTER_TRADELINES.filter(t => t.approvalDifficulty === 'established'),
      heading: 'Deepen Your Business Credit File',
      subheading: 'You\'ve started — now add depth. More reporting accounts and consistent early payment is what moves your Paydex toward 80+.',
    };
  }

  if (bizCreditFile === 'below_80') {
    return {
      primary: STARTER_TRADELINES.filter(t =>
        t.approvalDifficulty === 'easy' || t.approvalDifficulty === 'moderate'
      ).slice(0, 5),
      secondary: STARTER_TRADELINES.filter(t => t.approvalDifficulty === 'established'),
      heading: 'Improve Your Paydex Score',
      subheading: 'To push Paydex toward 80, pay every account at least 10 days before the due date. D&B rewards early payment — not just on-time.',
    };
  }

  // Default / fallback
  return {
    primary: STARTER_TRADELINES.filter(t => t.approvalDifficulty === 'easy').slice(0, 3),
    secondary: [],
    heading: 'Business Tradeline Options',
    subheading: 'Vendor accounts that report to business credit bureaus can strengthen your business credit profile over time.',
  };
}

// ── Difficulty badge ──────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<TradlineApprovalDifficulty, { label: string; color: string }> = {
  easy: { label: 'Easy approval', color: '#10b981' },
  moderate: { label: 'Moderate', color: '#f59e0b' },
  established: { label: 'Needs history', color: '#64748b' },
};

// ── Tradeline card ────────────────────────────────────────────────────────────

function TradlineCard({ tradeline }: { tradeline: Tradeline }) {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFFICULTY_CONFIG[tradeline.approvalDifficulty];

  return (
    <div style={{
      borderRadius: '10px',
      border: '1px solid var(--border)',
      background: 'var(--card)',
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          gap: '10px',
          textAlign: 'left' as const,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap' as const,
            marginBottom: '3px',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--foreground)',
            }}>
              {tradeline.vendor}
            </span>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              fontWeight: 700,
              color: diff.color,
              padding: '1px 6px',
              borderRadius: '4px',
              background: `${diff.color}14`,
              border: `1px solid ${diff.color}28`,
              flexShrink: 0,
            }}>
              {diff.label}
            </span>
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--muted-foreground)',
          }}>
            {tradeline.type}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--muted-foreground)',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '5px',
            padding: '2px 7px',
          }}>
            {tradeline.reports}
          </span>
          {expanded
            ? <ChevronUp size={13} style={{ color: 'var(--muted-foreground)' }} />
            : <ChevronDown size={13} style={{ color: 'var(--muted-foreground)' }} />
          }
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          padding: '0 14px 14px',
          borderTop: '1px solid var(--border)',
          paddingTop: '12px',
        }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
            marginBottom: '10px',
          }}>
            {tradeline.why}
          </div>

          <div style={{
            padding: '9px 12px',
            borderRadius: '7px',
            background: 'rgba(16,185,129,0.05)',
            border: '1px solid rgba(16,185,129,0.15)',
            marginBottom: tradeline.disclosures ? '8px' : '0',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.08em',
              color: '#10b981',
              marginBottom: '4px',
            }}>
              First Step
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--foreground)',
              lineHeight: 1.5,
            }}>
              {tradeline.firstStep}
            </div>
          </div>

          {tradeline.disclosures && (
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--muted-foreground)',
              lineHeight: 1.4,
              marginTop: '8px',
            }}>
              * {tradeline.disclosures}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface TradlineStarterListProps {
  bizCreditFile: BizCreditFileStatus;
}

export function TradlineStarterList({ bizCreditFile }: TradlineStarterListProps) {
  const [expanded, setExpanded] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);
  const { primary, secondary, heading, subheading } = getRelevantTradelines(bizCreditFile);

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
          <Building2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}>
            Tradeline Starter List
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'var(--muted-foreground)',
          }}>
            — vendor accounts that build your business credit file
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

          <div style={{ marginBottom: '14px' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--foreground)',
              marginBottom: '6px',
            }}>
              {heading}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--muted-foreground)',
              lineHeight: 1.6,
            }}>
              {subheading}
            </div>
          </div>

          {/* Paydex early-pay tip — shown when below_80 */}
          {bizCreditFile === 'below_80' && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 13px',
              borderRadius: '8px',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              marginBottom: '14px',
            }}>
              <Info size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--foreground)',
                lineHeight: 1.5,
              }}>
                <strong>Paydex rewards early payment, not just on-time.</strong>{' '}
                Paying 10 or more days before the due date may score higher than paying on the due date.
                Even one account where you consistently pay 10 days early can move your Paydex.
              </div>
            </div>
          )}

          {/* D-U-N-S setup reminder — shown when no file */}
          {bizCreditFile === 'none' && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 13px',
              borderRadius: '8px',
              background: 'rgba(16,185,129,0.05)',
              border: '1px solid rgba(16,185,129,0.15)',
              marginBottom: '14px',
            }}>
              <Info size={12} style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }} />
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--foreground)',
                lineHeight: 1.5,
              }}>
                <strong>Get your D-U-N-S number first.</strong>{' '}
                Register free at dnb.com before opening these accounts. Most Net-30 vendors
                require a DUNS to report your payment history to D&B.
              </div>
            </div>
          )}

          {/* Primary tradelines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: secondary.length > 0 ? '12px' : '0' }}>
            {primary.map(t => (
              <TradlineCard key={t.id} tradeline={t} />
            ))}
          </div>

          {/* Secondary tradelines — collapsible */}
          {secondary.length > 0 && (
            <div>
              <button
                onClick={() => setShowSecondary(s => !s)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 0',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#10b981',
                }}
              >
                {showSecondary ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {showSecondary ? 'Hide' : 'Show'} additional options once your file is established
              </button>

              {showSecondary && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {secondary.map(t => (
                    <TradlineCard key={t.id} tradeline={t} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Global disclosure */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            marginTop: '14px',
          }}>
            <Info size={10} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10px',
              color: 'var(--muted-foreground)',
              lineHeight: 1.4,
            }}>
              Vendor approval criteria, reporting behavior, and terms change over time.
              This list is for informational purposes only — verify current terms directly
              with each vendor. FundReady has no affiliation with any vendor listed.
              Based on self-reported assessment data · Confidence Tier 1
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
