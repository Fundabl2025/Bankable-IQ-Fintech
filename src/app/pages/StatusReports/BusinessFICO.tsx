// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Business FICO SBSS Report
// FICO Small Business Scoring Service breakdown with dual gauge visual
// ════════════════════════════════════════════════════════════════════════════════

import { Download, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { ExtendedResultsOutput } from '../business-assessment/types';
import { useEffect, useState } from 'react';
import { computeExtendedResults } from '../business-assessment/engine';
import { useNavigate } from 'react-router';

interface BusinessFICOProps {
  data?: ExtendedResultsOutput;
}

export function BusinessFICO({ data: propData }: BusinessFICOProps) {
  const navigate = useNavigate();
  const [data, setData] = useState<ExtendedResultsOutput | null>(propData || null);

  // Load data from localStorage if not provided via props
  useEffect(() => {
    if (!propData) {
      try {
        const saved = localStorage.getItem('unified_assessment');
        if (saved) {
          const assessmentData = JSON.parse(saved);
          const extended = computeExtendedResults(assessmentData);
          setData(extended);
        } else {
          // No assessment data - redirect to assessment
          navigate('/business-assessment');
        }
      } catch (error) {
        console.error('Error loading assessment:', error);
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

  const handleDownload = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '16px' }}>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: '0 0 8px 0',
                }}
              >
                Business FICO Report
              </h1>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                FICO SBSS (Small Business Scoring Service)
              </h2>
            </div>
            <button
              onClick={handleDownload}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid var(--primary)',
                borderRadius: '6px',
                color: 'var(--primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
              className="no-print"
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Download PDF
            </button>
          </div>

          {/* Explanation Paragraphs */}
          <div style={{ marginBottom: '16px' }}>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                marginBottom: '12px',
              }}
            >
              Just like personal FICO scores are the standard for all things consumer lending, the FICO Small Business Scoring Service (FICO SBSS) is the definitive standard for all business lending decisions made by banks, credit unions, and SBA lenders across the country.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 300,
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                marginBottom: '12px',
              }}
            >
              The range is 0 to 300. If your FICO SBSS is below a 160, you will not be approved for traditional bankable loans. A score of 160-180 means you're just barely bankable. A 180-220 score means you're solidly bankable and will receive favorable consideration. A 220+ score means you're in the top tier of bankable businesses.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.8,
                marginBottom: '12px',
              }}
            >
              <strong>FICO SBSS is broken down into four sections:</strong>
              <br />
              Section 1 — 35% — Owner credit detail
              <br />
              Section 2 — 30% — Business bank/revenue/debt
              <br />
              Section 3 — 20% — Industry/location/web presence
              <br />
              Section 4 — 15% — Business credit bureaus
            </p>
          </div>

          {/* Results For / Report Date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              Results For: <strong>{data.businessName}</strong>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              Report Date: {data.reportDate}
            </div>
          </div>
        </div>

        {/* Dual Gauge Dials */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <FICOGauge
              status={data.sbssOwnerStatus}
              label="Owners"
              sublabel="Anyone owning 20+%, goal should be 700+"
            />
            <FICOGauge
              status={data.sbssBusinessStatus}
              label="Business"
              sublabel="FICO SBSS must be a 160+ to be bankable"
            />
          </div>
        </div>

        {/* Business FICO Sections Table */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 100px 100px 3fr',
              gap: '16px',
              padding: '12px 16px',
              background: 'var(--bg-surface-2)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Business FICO Sections
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              % of Total
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              Current
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Description
            </div>
          </div>

          {/* Rows */}
          {data.sbssSections.map((section, index) => (
            <div
              key={section.section}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 100px 100px 3fr',
                gap: '16px',
                padding: '12px 16px',
                alignItems: 'center',
                background: index % 2 === 0 ? 'var(--bg-surface-1)' : 'var(--bg-surface-2)',
                borderBottom: index < data.sbssSections.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {section.section}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                }}
              >
                {section.percentage}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {section.status === 'pass' ? (
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: 'var(--primary)' }} />
                ) : section.status === 'partial' ? (
                  <AlertTriangle style={{ width: '16px', height: '16px', color: '#c89020' }} />
                ) : (
                  <XCircle style={{ width: '16px', height: '16px', color: '#b04428' }} />
                )}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--text-secondary)',
                }}
              >
                {section.description}
              </div>
            </div>
          ))}
        </div>

        {/* Work Needed Table */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 100px 100px 3fr',
              gap: '16px',
              padding: '12px 16px',
              background: 'var(--bg-surface-2)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Work Needed Doing
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              Current
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                textAlign: 'center',
              }}
            >
              # In Goal
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Description
            </div>
          </div>

          {/* Rows */}
          {data.workNeeded.map((work, index) => {
            const isAtGoal = typeof work.current === 'number' ? work.current >= parseInt(work.goal) : false;
            
            return (
              <div
                key={work.item}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 100px 100px 3fr',
                  gap: '16px',
                  padding: '12px 16px',
                  alignItems: 'center',
                  background: index % 2 === 0 ? 'var(--bg-surface-1)' : 'var(--bg-surface-2)',
                  borderBottom: index < data.workNeeded.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {work.item}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isAtGoal ? 'var(--primary)' : '#b04428',
                    textAlign: 'center',
                  }}
                >
                  {work.current}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                  }}
                >
                  {work.goal}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 300,
                    color: 'var(--text-secondary)',
                  }}
                >
                  {work.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div
          style={{
            background: 'var(--bg-surface-2)',
            borderLeft: '3px solid var(--primary)',
            borderRadius: '4px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
            }}
          >
            There is a lot of high interest non-bankable money available with a below 160 business FICO score.
            <br />
            A non-bankable $100,000 loan at 35% interest on a one year repayment will be ~$11,250 a month.
            <br />
            <strong style={{ color: 'var(--primary)' }}>
              A 160+ FICO bankable $250,000 loan at 12% on a 10 year payment will be ~$3,500 a month.
            </strong>
          </div>
        </div>

        {/* Report Date Footer */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 400,
            color: 'var(--text-muted)',
            textAlign: 'right',
            marginTop: '24px',
          }}
        >
          Report Generated: {data.reportDate}
        </div>
      </div>
    </div>
  );
}

export default BusinessFICO;