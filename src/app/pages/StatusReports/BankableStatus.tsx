// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Bankable Status Report
// 20-item compliance status with pass/fail indicators
// ════════════════════════════════════════════════════════════════════════════════

import { Download, CheckCircle2, XCircle } from 'lucide-react';
import { ExtendedResultsOutput } from '../business-assessment/types';
import { useEffect, useState } from 'react';
import { computeExtendedResults } from '../business-assessment/engine';
import { useNavigate } from 'react-router';

interface BankableStatusProps {
  data?: ExtendedResultsOutput;
}

export function BankableStatus({ data: propData }: BankableStatusProps) {
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

  const passCount = data.bankableItems.filter(item => item.status === 'pass').length;
  const totalCount = data.bankableItems.length;
  const progressPercentage = (passCount / totalCount) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
                textAlign: 'right',
                flex: 1,
              }}
            >
              Bankable Status Report
            </h1>
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

          {/* Intro Paragraph */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              marginBottom: '16px',
            }}
          >
            This report shows where your business currently stands in the process of becoming bankable and which critical items will need to be completed to become bankable. There are many funding programs available to non-bankable businesses but due to the higher risk those programs tend to be smaller amounts, high interest and shorter repayment terms. Below are a few of the requirements to become bankable. There are about 50, here are the top 20 you must address.
          </p>

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

        {/* 20-Item Status Table */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 100px 3fr',
              gap: '16px',
              padding: '12px 16px',
              background: 'var(--primary)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#000',
              }}
            >
              Bankable Item
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#000',
                textAlign: 'center',
              }}
            >
              Status
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#000',
              }}
            >
              Description
            </div>
          </div>

          {/* Table Rows */}
          {data.bankableItems.map((item, index) => (
            <div
              key={item.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 100px 3fr',
                gap: '16px',
                padding: '14px 16px',
                minHeight: '52px',
                alignItems: 'center',
                background: index % 2 === 0 ? 'var(--bg-surface-1)' : 'var(--bg-surface-2)',
                borderBottom: index < data.bankableItems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
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
                {item.name}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {item.status === 'pass' ? (
                  <CheckCircle2
                    style={{
                      width: '16px',
                      height: '16px',
                      color: 'var(--primary)',
                    }}
                  />
                ) : (
                  <XCircle
                    style={{
                      width: '16px',
                      height: '16px',
                      color: '#b04428',
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 300,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {item.description}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Row */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{passCount}</span> of {totalCount} items complete
          </div>
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'var(--border-subtle)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: 'var(--primary)',
                borderRadius: '2px',
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>

        {/* Bankable Explanation */}
        <div style={{ marginBottom: '24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 300,
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
              marginBottom: '16px',
            }}
          >
            Becoming Bankable is not hard, but it is complicated. The typical business seeking bankable funding does not meet all 20 items listed above. It can take 90 to 180 days to complete all the requirements depending on the starting point. The FundReady system guides you through each requirement with step-by-step instruction, software support, and done-for-you services where needed.
          </p>
        </div>

        {/* Comparison Callout */}
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
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            Here is an example of Non-Bankable loans versus Bankable loans:
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              lineHeight: 1.8,
            }}
          >
            A $100,000 non-bankable loan may be at 35% interest on a 1 year repayment making the payment $11,250 a month.
            <br />
            A $250,000 bankable loan may be at 12% interest on a 10 year repayment term making the payment ~$3,500 a month.
            <br />
            <strong style={{ color: 'var(--primary)' }}>
              By becoming bankable your business could receive $150,000 more in funding and pay $7,750 less per month for it.
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

export default BankableStatus;