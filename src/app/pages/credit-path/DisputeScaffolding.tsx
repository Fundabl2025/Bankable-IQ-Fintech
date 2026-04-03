// ════════════════════════════════════════════════════════════════════════════════
// CreditPath Phase 3 Tool 4: Dispute Workflow Scaffolding
// Assessment-Aware · Confidence Tier 1 scaffold · Tier 2 gate on personalization
//
// Shows the dispute process structure and bureau contact information.
// Personalized dispute letter generation is gated behind Tier 2 (uploaded
// credit report) — this is the correct Tier 1 → Tier 2 transition point.
//
// Tier 1 (this file): process education, bureau contacts, dispute types
// Tier 2 (future):    account-specific dispute letters with real bureau data
//
// Only rendered for users with derogatory items (collections, chargeoffs,
// judgments, late pays, or tax liens).
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Info, Lock, ExternalLink } from 'lucide-react';

// ── Dispute process steps ─────────────────────────────────────────────────────

interface DisputeStep {
  id: string;
  number: number;
  title: string;
  description: string;
  timeEstimate: string;
  tip?: string;
}

const DISPUTE_STEPS: DisputeStep[] = [
  {
    id: 'pull_reports',
    number: 1,
    title: 'Pull your official credit reports',
    description: 'Get your free reports from all three bureaus at AnnualCreditReport.com. This is the government-mandated free report — not a paid monitoring service.',
    timeEstimate: '15–30 min',
    tip: 'Download and save all three PDF reports. You\'ll reference them throughout the dispute process.',
  },
  {
    id: 'identify_errors',
    number: 2,
    title: 'Identify items to dispute',
    description: 'Review each report for inaccurate information: wrong account status, incorrect balances, accounts that aren\'t yours, duplicate accounts, or items past the 7-year reporting limit.',
    timeEstimate: '30–60 min',
    tip: 'Only dispute items that are genuinely inaccurate. Disputing accurate negative items is not effective and may be counterproductive.',
  },
  {
    id: 'document_evidence',
    number: 3,
    title: 'Gather supporting documentation',
    description: 'Collect proof of your claim: payment receipts, settlement letters, account statements, bankruptcy discharge papers, or identity theft reports if applicable.',
    timeEstimate: '30 min–2 hrs',
    tip: 'More documentation = stronger dispute. The burden of proof is on you to show the item is inaccurate.',
  },
  {
    id: 'submit_dispute',
    number: 4,
    title: 'Submit your dispute to each bureau',
    description: 'Submit disputes online, by mail, or by phone to each bureau reporting the inaccuracy. Online is fastest. Mail is the strongest paper trail.',
    timeEstimate: '30–60 min per bureau',
    tip: 'If mailing, send certified mail with return receipt. Keep copies of everything.',
  },
  {
    id: 'wait_investigation',
    number: 5,
    title: 'Wait for the investigation (30 days)',
    description: 'Bureaus are legally required to investigate within 30 days (45 days if you provide additional information after submission). The bureau contacts the creditor on your behalf.',
    timeEstimate: '30–45 days',
  },
  {
    id: 'review_results',
    number: 6,
    title: 'Review results and follow up',
    description: 'The bureau will send you a written result. If the item was corrected, get an updated report to confirm. If denied, you can re-dispute with additional evidence or add a 100-word consumer statement to your file.',
    timeEstimate: '1–2 weeks after result',
    tip: 'A denial is not final. Re-disputing with stronger documentation is a legitimate next step.',
  },
];

// ── Bureau contacts ───────────────────────────────────────────────────────────

interface BureauContact {
  name: string;
  onlineDispute: string;
  mailAddress: string;
  phone: string;
  color: string;
}

const BUREAU_CONTACTS: BureauContact[] = [
  {
    name: 'Experian',
    onlineDispute: 'experian.com/disputes',
    mailAddress: 'Experian, P.O. Box 4500, Allen, TX 75013',
    phone: '1-888-397-3742',
    color: '#0066cc',
  },
  {
    name: 'TransUnion',
    onlineDispute: 'transunion.com/credit-disputes',
    mailAddress: 'TransUnion LLC, Consumer Dispute Center, P.O. Box 2000, Chester, PA 19016',
    phone: '1-800-916-8800',
    color: '#00a0b0',
  },
  {
    name: 'Equifax',
    onlineDispute: 'equifax.com/personal/credit-report-services',
    mailAddress: 'Equifax Information Services LLC, P.O. Box 740256, Atlanta, GA 30374',
    phone: '1-866-349-5191',
    color: '#cc0000',
  },
];

// ── Dispute type guide ────────────────────────────────────────────────────────

const DISPUTE_TYPES = [
  {
    type: 'Inaccurate account status',
    example: 'Account shows "open" but was closed; shows "delinquent" but is current',
    strength: 'strong',
  },
  {
    type: 'Account not yours',
    example: 'Identity theft, mixed file, or authorized user error',
    strength: 'strong',
  },
  {
    type: 'Incorrect balance or limit',
    example: 'Balance is wrong; credit limit is understated',
    strength: 'strong',
  },
  {
    type: 'Outdated negative item',
    example: 'Collections, charge-offs, or late pays older than 7 years (bankruptcies 10 years)',
    strength: 'strong',
  },
  {
    type: 'Resolved item still showing active',
    example: 'Paid collection still showing unpaid; settled debt still showing balance',
    strength: 'moderate',
  },
  {
    type: 'Accurate negative item',
    example: 'Late payment that actually happened; collection that is yours',
    strength: 'weak',
  },
];

const STRENGTH_CONFIG: Record<string, { label: string; color: string }> = {
  strong: { label: 'Strong basis', color: '#10b981' },
  moderate: { label: 'Moderate basis', color: '#f59e0b' },
  weak: { label: 'Unlikely to succeed', color: '#b04428' },
};

// ── Main component ────────────────────────────────────────────────────────────

interface DisputeScaffoldingProps {
  hasDerog: boolean;              // only render if user has derogatory items
  hasCollections?: boolean;
  hasTaxLiens?: boolean;
  hasJudgments?: boolean;
  hasChargeoffs?: boolean;
  hasLatePay?: boolean;
}

export function DisputeScaffolding({
  hasDerog,
  hasCollections,
  hasTaxLiens,
  hasJudgments,
  hasChargeoffs,
  hasLatePay,
}: DisputeScaffoldingProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'process' | 'bureaus' | 'types'>('process');

  if (!hasDerog) return null;

  // Build a personalized context note based on what blockers are present
  const contextItems: string[] = [];
  if (hasCollections) contextItems.push('collections');
  if (hasTaxLiens) contextItems.push('tax liens');
  if (hasJudgments) contextItems.push('judgments');
  if (hasChargeoffs) contextItems.push('charge-offs');
  if (hasLatePay) contextItems.push('late payment history');

  const contextNote = contextItems.length > 0
    ? `Your assessment flagged: ${contextItems.join(', ')}. Review your official reports to verify accuracy before disputing.`
    : 'Review your official reports for any inaccuracies before disputing.';

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
          <FileText size={14} style={{ color: '#10b981', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}>
            Dispute Workflow Guide
          </span>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '10px',
            color: 'var(--muted-foreground)',
          }}>
            — how to challenge inaccurate items
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

          {/* Context note */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 13px',
            borderRadius: '8px',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.15)',
            marginBottom: '16px',
          }}>
            <Info size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--foreground)',
              lineHeight: 1.5,
            }}>
              <strong>Important:</strong> Disputes are only effective for <em>inaccurate</em> information.
              {' '}{contextNote}
            </div>
          </div>

          {/* Tab navigation */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '16px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0',
          }}>
            {(['process', 'bureaus', 'types'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 12px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #10b981' : '2px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: activeTab === tab ? 700 : 400,
                  color: activeTab === tab ? '#10b981' : 'var(--muted-foreground)',
                  marginBottom: '-1px',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize' as const,
                }}
              >
                {tab === 'process' ? 'Process' : tab === 'bureaus' ? 'Bureau Contacts' : 'What to Dispute'}
              </button>
            ))}
          </div>

          {/* Tab: Process */}
          {activeTab === 'process' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DISPUTE_STEPS.map(step => (
                <div key={step.id} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#10b981',
                    flexShrink: 0,
                  }}>
                    {step.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                      }}>
                        {step.title}
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        color: 'var(--muted-foreground)',
                        flexShrink: 0,
                      }}>
                        {step.timeEstimate}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--muted-foreground)',
                      lineHeight: 1.5,
                      marginBottom: step.tip ? '6px' : '0',
                    }}>
                      {step.description}
                    </div>
                    {step.tip && (
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#10b981',
                        lineHeight: 1.4,
                      }}>
                        → {step.tip}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Tier 2 gate */}
              <Tier2Gate />
            </div>
          )}

          {/* Tab: Bureau contacts */}
          {activeTab === 'bureaus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {BUREAU_CONTACTS.map(bureau => (
                <div key={bureau.name} style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 800,
                    color: bureau.color,
                    marginBottom: '10px',
                  }}>
                    {bureau.name}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <ContactRow label="Online" value={bureau.onlineDispute} isLink />
                    <ContactRow label="Mail" value={bureau.mailAddress} />
                    <ContactRow label="Phone" value={bureau.phone} />
                  </div>
                </div>
              ))}
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.4,
              }}>
                * Contact information current as of 2024. Verify current addresses at each bureau's website before mailing.
              </div>
            </div>
          )}

          {/* Tab: What to dispute */}
          {activeTab === 'types' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {DISPUTE_TYPES.map((dt, i) => {
                const sc = STRENGTH_CONFIG[dt.strength];
                return (
                  <div key={i} style={{
                    padding: '11px 13px',
                    borderRadius: '8px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '4px',
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--foreground)',
                      }}>
                        {dt.type}
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: sc.color,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: `${sc.color}14`,
                        border: `1px solid ${sc.color}28`,
                        flexShrink: 0,
                      }}>
                        {sc.label}
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      color: 'var(--muted-foreground)',
                      lineHeight: 1.4,
                    }}>
                      {dt.example}
                    </div>
                  </div>
                );
              })}

              {/* Tier 2 gate */}
              <Tier2Gate />
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
              This is educational guidance only — not legal advice.
              For complex disputes involving identity theft, fraud, or legal judgments,
              consult a qualified credit counselor or attorney.
              Based on self-reported assessment data · Confidence Tier 1
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ContactRow({ label, value, isLink = false }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--muted-foreground)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.06em',
        flexShrink: 0,
        marginTop: '1px',
        minWidth: '36px',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        color: isLink ? '#10b981' : 'var(--foreground)',
        lineHeight: 1.4,
      }}>
        {value}
      </span>
    </div>
  );
}

function Tier2Gate() {
  return (
    <div style={{
      marginTop: '4px',
      padding: '14px',
      borderRadius: '10px',
      background: 'var(--background)',
      border: '1px solid var(--border)',
      borderStyle: 'dashed',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
      }}>
        <Lock size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--foreground)',
        }}>
          Personalized dispute letters — coming with Tier 2
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        color: 'var(--muted-foreground)',
        lineHeight: 1.6,
        marginBottom: '10px',
      }}>
        To generate dispute letters with your actual account details, creditor names,
        and specific inaccuracy language, FundReady needs to read your official credit report.
        Uploading or connecting your report unlocks Confidence Tier 2 — giving you
        account-specific guidance instead of general templates.
      </div>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '7px 12px',
        borderRadius: '7px',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.2)',
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 600,
        color: '#10b981',
      }}>
        <Lock size={11} />
        Upload your credit report to unlock — coming soon
      </div>
    </div>
  );
}
