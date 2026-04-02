// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Business FICO SBSS Report  (T-14)
// Numeric arc gauges · SBSS ruler · score history · bureau explainer
// ════════════════════════════════════════════════════════════════════════════════

import { Download, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ExtendedResultsOutput } from '../business-assessment/types';
import { useEffect, useState } from 'react';
import { computeExtendedResults, getSBSSTier } from '../business-assessment/engine';
import { useNavigate } from 'react-router';

interface BusinessFICOProps {
  data?: ExtendedResultsOutput;
}

// ── SBSS snapshot type (mirrors data-adapter.ts SBSSSnapshot) ────────────────
interface SBSSSnapshot { score: number; date: string; scoringVersion: string; }

// ── Numeric Arc Gauge ────────────────────────────────────────────────────────
// SVG semicircle (left → top → right) with score fill.
// max=300 → SBSS colours.  max=850 → personal FICO colours.
function NumericArcGauge({
  value, max, label, sublabel,
}: { value: number; max: number; label: string; sublabel: string }) {
  const pct      = Math.min(1, Math.max(0, value / max));
  const cx = 60, cy = 65, r = 52;

  // Fill angle: 180° (left) + pct×180°. Clockwise through top reaches right at 360°.
  const fillEndDeg  = 180 + pct * 180;
  const toRad       = (d: number) => (d * Math.PI) / 180;
  const bgX1        = (cx - r).toFixed(1);   // left  = 8
  const bgY1        = cy.toFixed(1);           // = 65
  const bgX2        = (cx + r).toFixed(1);   // right = 112
  const bgY2        = cy.toFixed(1);           // = 65
  const fillX2      = (cx + r * Math.cos(toRad(fillEndDeg))).toFixed(2);
  const fillY2      = (cy + r * Math.sin(toRad(fillEndDeg))).toFixed(2);
  const fillLargeArc = pct > 0.5 ? 1 : 0;

  // Colour
  let color: string;
  let tierLabel: string;
  if (max === 300) {
    // SBSS tiers
    const t = getSBSSTier(value);
    color     = t.color;
    tierLabel = t.label;
  } else {
    // Personal FICO (0-850)
    if (value >= 800) { color = '#c8f040'; tierLabel = 'Exceptional'; }
    else if (value >= 740) { color = '#8ab820'; tierLabel = 'Very Good'; }
    else if (value >= 670) { color = '#38a880'; tierLabel = 'Good'; }
    else if (value >= 580) { color = '#f59e0b'; tierLabel = 'Fair'; }
    else { color = '#b04428'; tierLabel = 'Poor'; }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="0 0 120 70" style={{ width: '100%', maxWidth: '200px', display: 'block', margin: '0 auto' }}>
        {/* Background arc: 180° → 0° clockwise (goes through 12 o'clock) */}
        <path
          d={`M ${bgX1} ${bgY1} A ${r} ${r} 0 0 1 ${bgX2} ${bgY2}`}
          fill="none" stroke="var(--border-subtle)" strokeWidth="10" strokeLinecap="round"
        />
        {/* Fill arc */}
        {pct > 0.01 && (
          <path
            d={`M ${bgX1} ${bgY1} A ${r} ${r} 0 ${fillLargeArc} 1 ${fillX2} ${fillY2}`}
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          />
        )}
        {/* Score */}
        <text x="60" y="54" textAnchor="middle"
          fontFamily="var(--font-display)" fontWeight="800" fontSize="22" fill={color}>
          {value}
        </text>
        <text x="60" y="66" textAnchor="middle"
          fontFamily="var(--font-body)" fontWeight="400" fontSize="9" fill="var(--text-secondary)">
          / {max} · {tierLabel}
        </text>
      </svg>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '6px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
        {sublabel}
      </div>
    </div>
  );
}

// ── SBSS Ruler ───────────────────────────────────────────────────────────────
// Horizontal 0-300 bar with 4 coloured tier zones + score needle.
function SBSSRuler({ score }: { score: number }) {
  const pct        = (score / 300) * 100;
  const tier       = getSBSSTier(score);
  const needleColor = tier.color;
  const textColor  = needleColor === '#c8f040' ? '#000' : '#fff';

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        SBSS Score Range · 0 to 300
      </div>
      <div style={{ position: 'relative', paddingTop: '26px' }}>
        {/* Score bubble */}
        <div style={{
          position: 'absolute',
          left: `${pct}%`,
          top: 0,
          transform: 'translateX(-50%)',
          background: needleColor,
          color: textColor,
          fontSize: '11px',
          fontWeight: 800,
          padding: '2px 7px',
          borderRadius: '4px',
          fontFamily: 'var(--font-display)',
          whiteSpace: 'nowrap',
        }}>
          {score}
        </div>
        {/* Bar */}
        <div style={{ display: 'flex', height: '18px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          {/* Poor: 0–159 = 53.0% */}
          <div style={{ flex: '0 0 53%', background: '#b04428', opacity: 0.8 }} />
          {/* Fair: 160–189 = 10% */}
          <div style={{ flex: '0 0 10%', background: '#38a880', opacity: 0.85 }} />
          {/* Good: 190–209 = 6.7% */}
          <div style={{ flex: '0 0 6.7%', background: '#8ab820', opacity: 0.9 }} />
          {/* Excellent: 210–300 = 30.3% */}
          <div style={{ flex: '1', background: '#c8f040', opacity: 0.9 }} />
          {/* Needle */}
          <div style={{
            position: 'absolute',
            left: `${pct}%`,
            top: 0,
            bottom: 0,
            width: '2px',
            background: '#fff',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 3px rgba(0,0,0,0.5)',
          }} />
        </div>
        {/* Zone labels */}
        <div style={{ display: 'flex', marginTop: '4px', fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 500 }}>
          <div style={{ flex: '0 0 53%', color: '#b04428' }}>Poor · 0–159</div>
          <div style={{ flex: '0 0 10%', color: '#38a880', textAlign: 'center', fontSize: '9px' }}>Fair</div>
          <div style={{ flex: '0 0 6.7%', color: '#8ab820', textAlign: 'center', fontSize: '9px' }}>Good</div>
          <div style={{ flex: '1', color: '#8ab820', textAlign: 'right' }}>Excellent · 210+</div>
        </div>
      </div>
    </div>
  );
}

// ── SBSS History Sparkline ───────────────────────────────────────────────────
function SBSSHistorySparkline({ history }: { history: SBSSSnapshot[] }) {
  if (history.length === 0) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
        No SBSS history recorded yet. Your scores will be tracked here over time.
      </div>
    );
  }
  if (history.length === 1) {
    return (
      <div style={{ padding: '12px 0', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Only one score recorded ({history[0].score} on {new Date(history[0].date).toLocaleDateString()}). Reassess periodically to build your trend.
      </div>
    );
  }

  const W = 400, H = 80;
  const pL = 40, pR = 12, pT = 16, pB = 20;
  const innerW = W - pL - pR;
  const innerH = H - pT - pB;

  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const xStep  = innerW / Math.max(1, sorted.length - 1);
  const pts    = sorted.map((h, i) => ({
    x: pL + i * xStep,
    y: H - pB - (h.score / 300) * innerH,
    score: h.score,
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
  }));
  const polyPts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const threshY = H - pB - (160 / 300) * innerH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%' }}>
      {/* Y-axis */}
      <line x1={pL} y1={pT} x2={pL} y2={H - pB} stroke="var(--border-subtle)" strokeWidth="1" />
      <text x={pL - 4} y={pT + 4}   textAnchor="end" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-body)">300</text>
      <text x={pL - 4} y={threshY + 3} textAnchor="end" fontSize="9" fill="#38a880"         fontFamily="var(--font-body)">160</text>
      <text x={pL - 4} y={H - pB + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-body)">0</text>
      {/* Bankable threshold */}
      <line x1={pL} x2={W - pR} y1={threshY} y2={threshY} stroke="#38a880" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      <text x={W - pR} y={threshY - 3} textAnchor="end" fontSize="8" fill="#38a880" fontFamily="var(--font-body)">bankable</text>
      {/* Score line */}
      <polyline points={polyPts} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="var(--primary)" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--primary)" fontFamily="var(--font-display)">{p.score}</text>
          {(i === 0 || i === pts.length - 1) && (
            <text x={p.x} y={H - pB + 12} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-body)">{p.date}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function BusinessFICO({ data: propData }: BusinessFICOProps) {
  const navigate = useNavigate();
  const [data, setData]       = useState<ExtendedResultsOutput | null>(propData || null);
  const [sbssHistory, setSbssHistory] = useState<SBSSSnapshot[]>([]);

  // Load assessment data
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
  }, [propData, navigate]);

  // Load SBSS score history (T-12B)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sbss_history');
      if (raw) setSbssHistory(JSON.parse(raw) as SBSSSnapshot[]);
    } catch { /* non-fatal */ }
  }, []);

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ color: 'var(--text-primary)' }}>Loading report...</div>
      </div>
    );
  }

  const handleDownload = () => { window.print(); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '16px' }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                Business FICO Report
              </h1>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                FICO SBSS (Small Business Scoring Service)
              </h2>
            </div>
            <button
              onClick={handleDownload}
              style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, padding: '8px 16px', background: 'transparent', border: '1px solid var(--primary)', borderRadius: '6px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
              className="no-print"
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Download PDF
            </button>
          </div>

          {/* Explanation */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '12px' }}>
              Just like personal FICO scores are the standard for all things consumer lending, the FICO Small Business Scoring Service (FICO SBSS) is the definitive standard for all business lending decisions made by banks, credit unions, and SBA lenders across the country.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '12px' }}>
              The range is 0 to 300. Below 160 means you will not be approved for traditional bankable loans. 160–189 means you are just barely bankable. 190–209 means you are solidly bankable. 210+ means you are top-tier.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.8, marginBottom: '12px' }}>
              <strong>FICO SBSS is broken down into four sections:</strong>
              <br />Section 1 — 35% — Owner credit detail
              <br />Section 2 — 30% — Business bank / revenue / debt
              <br />Section 3 — 20% — Industry / location / web presence
              <br />Section 4 — 15% — Business credit bureaus
            </p>
          </div>

          {/* Results For / Report Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Results For: <strong>{data.businessName}</strong>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Report Date: {data.reportDate}
            </div>
          </div>
        </div>

        {/* ── Numeric Arc Gauges ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
            <NumericArcGauge
              value={data.personalCreditSummary.composite}
              max={850}
              label="Owner's Credit"
              sublabel="Anyone owning 20%+ · target 700+"
            />
            <NumericArcGauge
              value={data.sbssScore}
              max={300}
              label="Business FICO SBSS"
              sublabel="Must be 160+ to be bankable"
            />
          </div>

          {/* T-14: SBSS Ruler */}
          <SBSSRuler score={data.sbssScore} />
        </div>

        {/* ── T-14: SBSS Score History ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
            SBSS Score History
          </div>
          <SBSSHistorySparkline history={sbssHistory} />
        </div>

        {/* ── Business FICO Sections Table ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 3fr', gap: '16px', padding: '12px 16px', background: 'var(--primary)', borderBottom: '1px solid var(--border-subtle)' }}>
            {(['Business FICO Sections', '% of Total', 'Current', 'Description'] as const).map((h, i) => (
              <div key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#000', textAlign: i === 1 || i === 2 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>
          {data.sbssSections.map((section, index) => (
            <div key={section.section} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 3fr', gap: '16px', padding: '12px 16px', alignItems: 'center', background: index % 2 === 0 ? 'var(--bg-surface-1)' : 'var(--bg-surface-2)', borderBottom: index < data.sbssSections.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{section.section}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)', textAlign: 'center' }}>{section.percentage}</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {section.status === 'pass'
                  ? <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                  : section.status === 'partial'
                    ? <AlertTriangle style={{ width: '16px', height: '16px', color: '#c89020' }} />
                    : <XCircle style={{ width: '16px', height: '16px', color: '#b04428' }} />}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 300, color: 'var(--text-secondary)' }}>{section.description}</div>
            </div>
          ))}
        </div>

        {/* ── Work Needed Table ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 3fr', gap: '16px', padding: '12px 16px', background: 'var(--bg-surface-2)', borderBottom: '1px solid var(--border-subtle)' }}>
            {(['Work Needed Doing', 'Current', '# In Goal', 'Description'] as const).map((h, i) => (
              <div key={h} style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', textAlign: i === 1 || i === 2 ? 'center' : 'left' }}>{h}</div>
            ))}
          </div>
          {data.workNeeded.map((work, index) => {
            const isAtGoal = typeof work.current === 'number' ? work.current >= parseInt(work.goal) : false;
            return (
              <div key={work.item} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 100px 3fr', gap: '16px', padding: '12px 16px', alignItems: 'center', background: index % 2 === 0 ? 'var(--bg-surface-1)' : 'var(--bg-surface-2)', borderBottom: index < data.workNeeded.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{work.item}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: isAtGoal ? 'var(--primary)' : '#b04428', textAlign: 'center' }}>{work.current}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)', textAlign: 'center' }}>{work.goal}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 300, color: 'var(--text-secondary)' }}>{work.description}</div>
              </div>
            );
          })}
        </div>

        {/* ── T-14: The "Old Guard" Bureau Explainer ── */}
        <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            The "Old Guard" — How Credit Bureaus Feed Your SBSS
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '16px' }}>
            FICO SBSS aggregates data from all three major personal credit bureaus alongside business credit bureau data. Lenders call them the "Old Guard" — they have been the industry standard for over 60 years and every bankable lender pulls all three. Your SBSS owner component (35%) reflects the median of your Experian, Equifax, and TransUnion FICO scores.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {/* Experian */}
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderTop: '3px solid #e44c2b', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Experian
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: data.personalCreditSummary.experian >= 700 ? 'var(--primary)' : '#b04428', marginLeft: '8px' }}>
                  {data.personalCreditSummary.experian}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Primary bureau for SBA and bank lenders. FICO 8 range 300–850. Target 720+ for best rates.
              </div>
            </div>
            {/* Equifax */}
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderTop: '3px solid #cc0000', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Equifax
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: data.personalCreditSummary.equifax >= 700 ? 'var(--primary)' : '#b04428', marginLeft: '8px' }}>
                  {data.personalCreditSummary.equifax}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Widely used by credit unions and traditional lenders. Range 280–850. All three must be clean.
              </div>
            </div>
            {/* TransUnion */}
            <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-subtle)', borderTop: '3px solid #1a5fac', borderRadius: '6px', padding: '12px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                TransUnion
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 800, color: data.personalCreditSummary.transunion >= 700 ? 'var(--primary)' : '#b04428', marginLeft: '8px' }}>
                  {data.personalCreditSummary.transunion}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Core SBSS personal component source. Range 300–850. Pulls all three — lowest score counts most with many lenders.
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Callout ── */}
        <div style={{ background: 'var(--bg-surface-2)', borderLeft: '3px solid var(--primary)', borderRadius: '4px', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            There is a lot of high-interest non-bankable money available with a below-160 SBSS score.
            <br />
            A non-bankable $100,000 loan at 35% interest on a one-year repayment will be ~$11,250/month.
            <br />
            <strong style={{ color: 'var(--primary)' }}>
              A 160+ bankable $250,000 loan at 12% on a 10-year term will be ~$3,500/month.
            </strong>
          </div>
        </div>

        {/* Report Date Footer */}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)', textAlign: 'right', marginTop: '24px' }}>
          Report Generated: {data.reportDate}
        </div>

      </div>
    </div>
  );
}

export default BusinessFICO;
