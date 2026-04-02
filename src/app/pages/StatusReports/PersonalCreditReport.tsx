// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Personal Credit Report  (T-15)
// 3-bureau FICO display · disclosure banner · derogatory flags with SBSS impact
// Optimization guide · reads from personalCreditSummary (computed T-12A)
// ════════════════════════════════════════════════════════════════════════════════

import { Download, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { ExtendedResultsOutput } from '../business-assessment/types';
import { useEffect, useState } from 'react';
import { computeExtendedResults } from '../business-assessment/engine';
import { useNavigate, Link } from 'react-router';

interface PersonalCreditReportProps {
  data?: ExtendedResultsOutput;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ficoColor(score: number): string {
  if (score >= 800) return '#c8f040';
  if (score >= 740) return '#8ab820';
  if (score >= 670) return '#38a880';
  if (score >= 580) return '#f59e0b';
  return '#b04428';
}

function ficoLabel(score: number): string {
  if (score >= 800) return 'Exceptional';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
}

function utilizationLabel(u: string): string {
  const map: Record<string, string> = {
    under_10: 'Under 10%', '10_30': '10–30%', '30_50': '30–50%', '50_75': '50–75%', over_75: 'Over 75%',
  };
  return map[u] ?? u;
}

function inquiriesLabel(i: string): string {
  const map: Record<string, string> = {
    '0': 'None', '1_2': '1–2', '3_4': '3–4', '5plus': '5+', unknown: 'Unknown',
  };
  return map[i] ?? i;
}

function inquiriesImpact(i: string): { label: string; color: string } {
  if (i === '0')    return { label: '✓ No impact', color: 'var(--primary)' };
  if (i === '1_2')  return { label: 'Minor', color: '#f59e0b' };
  if (i === '3_4')  return { label: '−5 pts SBSS', color: '#b04428' };
  if (i === '5plus') return { label: '−10 pts SBSS', color: '#b04428' };
  return { label: 'Unknown', color: 'var(--text-muted)' };
}

function utilizationImpact(u: string): { label: string; color: string } {
  if (u === 'under_10') return { label: '+12 pts SBSS', color: 'var(--primary)' };
  if (u === '10_30')    return { label: '+8 pts SBSS',  color: 'var(--primary)' };
  if (u === '30_50')    return { label: 'Neutral',       color: '#f59e0b' };
  if (u === '50_75')    return { label: '−8 pts SBSS',  color: '#b04428' };
  if (u === 'over_75')  return { label: '−15 pts SBSS', color: '#b04428' };
  return { label: 'Unknown', color: 'var(--text-muted)' };
}

// ── Bureau Score Card ─────────────────────────────────────────────────────────
function BureauCard({ name, score, accentColor }: { name: string; score: number; accentColor: string }) {
  const color    = ficoColor(score);
  const label    = ficoLabel(score);
  const pct      = Math.max(0, Math.min(100, ((score - 300) / (850 - 300)) * 100));
  const isMet    = score >= 700;

  return (
    <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderTop: `3px solid ${accentColor}`, borderRadius: '6px', padding: '16px' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
        {name}
      </div>
      {/* Score */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 900, color, lineHeight: 1, marginBottom: '4px' }}>
        {score}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 500, color, marginBottom: '10px' }}>
        {label}
      </div>
      {/* Progress bar 300–850 */}
      <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px' }} />
      </div>
      {/* Gate indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontFamily: 'var(--font-body)', color: isMet ? 'var(--primary)' : '#b04428' }}>
        {isMet
          ? <CheckCircle2 style={{ width: '11px', height: '11px' }} />
          : <XCircle style={{ width: '11px', height: '11px' }} />}
        {isMet ? '700+ target met' : `${700 - score} pts below target`}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PersonalCreditReport({ data: propData }: PersonalCreditReportProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<ExtendedResultsOutput | null>(propData || null);

  useEffect(() => {
    if (!propData) {
      try {
        const saved = localStorage.getItem('unified_assessment');
        if (saved) {
          const assessmentData = JSON.parse(saved);
          setData(computeExtendedResults(assessmentData));
        } else {
          navigate('/business-assessment');
        }
      } catch {
        navigate('/business-assessment');
      }
    }
  }, [propData, navigate]);

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-primary)' }}>Loading report...</div>
      </div>
    );
  }

  const pc          = data.personalCreditSummary;
  const compositeColor = ficoColor(pc.composite);
  const utilImpact  = utilizationImpact(pc.utilization);
  const inqImpact   = inquiriesImpact(pc.inquiries30d);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px' }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Personal Credit Report
              </h1>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Owner's Credit Profile · SBSS Section 1 (35%)
              </div>
            </div>
            <button
              onClick={() => window.print()}
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, padding: '8px 16px', background: 'transparent', border: '1px solid var(--primary)', borderRadius: '6px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
              className="no-print"
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Download PDF
            </button>
          </div>

          {/* Results For / Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Results For: <strong>{data.ownerName || data.businessName}</strong>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Report Date: {data.reportDate}
            </div>
          </div>
        </div>

        {/* ── Disclosure Banner ── */}
        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #f59e0b', borderRadius: '4px', padding: '12px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Info style={{ width: '15px', height: '15px', color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Estimated scores — not bureau pulls.</strong>{' '}
            These scores are midpoint estimates derived from your self-reported credit ranges during assessment. Actual bureau scores may vary. This report is for planning purposes only and does not constitute a credit check or official credit report.
          </div>
        </div>

        {/* ── Composite Score Card ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: `1px solid var(--border-subtle)`, borderLeft: `4px solid ${compositeColor}`, borderRadius: '8px', padding: '20px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 900, color: compositeColor, lineHeight: 1 }}>{pc.composite}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-secondary)' }}>/ 850 composite</span>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: compositeColor }}>{ficoLabel(pc.composite)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              SBSS owner component: <strong style={{ color: 'var(--text-primary)' }}>35% of 300 pts</strong>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
              Median of Experian · TransUnion · Equifax
            </div>
            <div style={{ marginTop: '6px' }}>
              {pc.composite >= 700
                ? <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}>✓ Meets 700+ bankable threshold</span>
                : <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#b04428', fontWeight: 600 }}>{700 - pc.composite} pts below 700 target</span>}
            </div>
          </div>
        </div>

        {/* ── 3-Bureau Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <BureauCard name="Experian"   score={pc.experian}   accentColor="#e44c2b" />
          <BureauCard name="TransUnion" score={pc.transunion} accentColor="#1a5fac" />
          <BureauCard name="Equifax"    score={pc.equifax}    accentColor="#cc0000" />
        </div>

        {/* ── Credit Factors Table ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '12px', padding: '12px 16px', background: 'var(--primary)', borderBottom: '1px solid var(--border-subtle)' }}>
            {['Credit Factor', 'Current', 'Target', 'SBSS Impact'].map((h, i) => (
              <div key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#000', textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* Utilization */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '12px', padding: '12px 16px', alignItems: 'center', background: 'var(--bg-surface-1)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Credit Utilization</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>{utilizationLabel(pc.utilization)}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Under 30%</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: utilImpact.color }}>{utilImpact.label}</div>
          </div>

          {/* Inquiries */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '12px', padding: '12px 16px', alignItems: 'center', background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Inquiries (30 days)</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>{inquiriesLabel(pc.inquiries30d)}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>0–2</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: inqImpact.color }}>{inqImpact.label}</div>
          </div>

          {/* Bankruptcy */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '12px', padding: '12px 16px', alignItems: 'center', background: 'var(--bg-surface-1)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Bankruptcy</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {pc.bankruptcyStatus === 'no' ? 'None' : pc.bankruptcyStatus === 'recent' ? 'Recent' : pc.bankruptcyStatus === 'aging' ? 'Aging' : 'Old (7+ yrs)'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>None</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: pc.bankruptcyStatus === 'no' ? 'var(--primary)' : pc.bankruptcyStatus === 'old' ? '#f59e0b' : '#b04428' }}>
              {pc.bankruptcyStatus === 'no' ? '✓ Clear' : pc.bankruptcyStatus === 'recent' ? 'Severe — may disqualify' : pc.bankruptcyStatus === 'aging' ? 'Negative — improving' : 'Minor — aging out'}
            </div>
          </div>

          {/* Collections */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '12px', padding: '12px 16px', alignItems: 'center', background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Collections</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              {pc.collectionsStatus === 'no' ? 'None' : pc.collectionsStatus === 'active' ? 'Active' : 'Resolved'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>None</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: pc.collectionsStatus === 'no' ? 'var(--primary)' : pc.collectionsStatus === 'active' ? '#b04428' : '#f59e0b' }}>
              {pc.collectionsStatus === 'no' ? '✓ Clear' : pc.collectionsStatus === 'active' ? '−10 pts SBSS est.' : 'Resolved — still on record'}
            </div>
          </div>

          {/* Derog summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '12px', padding: '12px 16px', alignItems: 'center', background: 'var(--bg-surface-1)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Derogatory Items</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: pc.hasAnyDerog ? '#b04428' : 'var(--primary)', fontWeight: 600, textAlign: 'center' }}>{pc.derogItems.length}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>0</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: pc.hasAnyDerog ? '#b04428' : 'var(--primary)' }}>
              {pc.hasAnyDerog ? `${pc.derogItems.length} flag${pc.derogItems.length !== 1 ? 's' : ''} reducing SBSS` : '✓ No derogatory items'}
            </div>
          </div>
        </div>

        {/* ── Derogatory Flags (only if any) ── */}
        {pc.hasAnyDerog && (
          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #b04428', borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle style={{ width: '15px', height: '15px', color: '#b04428', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#b04428' }}>
                {pc.derogItems.length} Derogatory Flag{pc.derogItems.length !== 1 ? 's' : ''} Detected
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pc.derogItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', background: 'var(--bg-surface-2)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <XCircle style={{ width: '14px', height: '14px', color: '#b04428', flexShrink: 0, marginTop: '1px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{item}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {item.toLowerCase().includes('bankruptcy') && 'Reduces owner component of SBSS. Recent bankruptcies may prevent approval from most bankable lenders for 2–3 years.'}
                      {item.toLowerCase().includes('collections') && 'Active collections signal payment risk. Resolving before application strengthens SBSS owner component.'}
                      {item.toLowerCase().includes('judgment') && 'Judgments are public records reviewed by lenders. May require pay-off or satisfaction letter before approval.'}
                      {item.toLowerCase().includes('charge-off') && 'Charge-offs remain on file 7 years. Paying settled amount shows good faith and may improve lender response.'}
                      {item.toLowerCase().includes('late payment') && 'Late payment history reduces FICO payment history component (35% of FICO). Time and consistent on-time payments heal this.'}
                      {item.toLowerCase().includes('tax lien') && 'Federal/state tax liens are serious public records. Releasing the lien through IRS/state payment is necessary before most lenders approve.'}
                      {!item.toLowerCase().includes('bankruptcy') && !item.toLowerCase().includes('collections') && !item.toLowerCase().includes('judgment') && !item.toLowerCase().includes('charge-off') && !item.toLowerCase().includes('late payment') && !item.toLowerCase().includes('tax lien') && 'Negatively impacts owner credit component. Address with the relevant credit bureau or creditor.'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Optimization Guide ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Personal Credit Optimization Guide
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
            Owner credit accounts for <strong>35% of your FICO SBSS score</strong>. For any owner with 20%+ ownership, lenders expect a personal FICO of 700+ and a clean file. These are the highest-impact moves ranked by time to result.
          </p>

          {/* Priority action rows */}
          {[
            {
              priority: '1',
              timeframe: 'Immediate',
              action: 'Pay down revolving utilization',
              detail: 'Get all individual cards below 45%. Get total utilization below 30%. Optimal is under 10%. This is the single fastest FICO lever — results in 30–60 days.',
              relevant: pc.utilization !== 'under_10',
              color: '#b04428',
            },
            {
              priority: '2',
              timeframe: '30 days',
              action: 'Stop all new credit applications',
              detail: 'Every hard inquiry costs 3–5 FICO points and signals credit-seeking behavior. Lenders look back 6 months on inquiries. Wait until after funding.',
              relevant: pc.inquiries30d !== '0',
              color: '#f59e0b',
            },
            {
              priority: '3',
              timeframe: '30–90 days',
              action: 'Resolve any active collections',
              detail: 'Negotiate pay-for-delete agreements where possible. At minimum, get written confirmation of resolution. Active collections block most bankable lenders.',
              relevant: pc.collectionsStatus === 'active',
              color: '#b04428',
            },
            {
              priority: '4',
              timeframe: '60–180 days',
              action: 'Dispute bureau errors on all 3 reports',
              detail: 'Request reports from AnnualCreditReport.com. Dispute inaccurate balances, duplicate entries, or accounts you don\'t recognize. CFPB process takes 30–45 days per dispute.',
              relevant: true,
              color: '#38a880',
            },
            {
              priority: '5',
              timeframe: '3–12 months',
              action: 'Build open tradeline count to 5+',
              detail: 'Lenders want to see 5–10 open, active accounts. If your file is thin, add a secured card or become an authorized user on a well-managed account.',
              relevant: true,
              color: '#38a880',
            },
            {
              priority: '6',
              timeframe: '6–24 months',
              action: 'Let aging derogatory items age',
              detail: 'Derogatory items fall off after 7 years (bankruptcy 10 years). Time is the only remedy. Focus on positive payment history while waiting. Consistent on-time payments accelerate recovery.',
              relevant: pc.hasAnyDerog,
              color: 'var(--text-muted)',
            },
          ].filter(r => r.relevant).map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 28px', height: '28px', borderRadius: '50%', background: row.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 800, color: row.color === '#c8f040' ? '#000' : '#fff', flexShrink: 0 }}>
                {row.priority}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.action}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.timeframe}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{row.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── SBSS Connection Callout ── */}
        <div style={{ background: 'var(--bg-surface-2)', borderLeft: '3px solid var(--primary)', borderRadius: '4px', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Owner credit is <strong style={{ color: 'var(--text-primary)' }}>35% of your FICO SBSS score</strong>. Improving your personal composite from 650 to 720+ can add 20–35 points to your SBSS — enough to move from non-bankable to bankable.
            <br />
            <Link to="/app/status-reports/business-fico" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              View your full Business FICO SBSS Report →
            </Link>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', textAlign: 'right', marginTop: '24px' }}>
          Estimated report · not a bureau pull · Report Generated: {data.reportDate}
        </div>

      </div>
    </div>
  );
}

export default PersonalCreditReport;
