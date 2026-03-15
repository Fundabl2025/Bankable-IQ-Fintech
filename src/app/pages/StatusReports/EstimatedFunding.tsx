// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Estimated Funding Report
// Dynamic funding range report with contingency analysis
// ════════════════════════════════════════════════════════════════════════════════

import { Download, TrendingUp } from 'lucide-react';
import { ExtendedResultsOutput } from '../business-assessment/types';
import { useEffect, useState } from 'react';
import { computeExtendedResults } from '../business-assessment/engine';
import { useNavigate } from 'react-router';
import { getAllAuditItems } from '../../utils/businessData';

interface EstimatedFundingProps {
  data?: ExtendedResultsOutput;
}

export function EstimatedFunding({ data: propData }: EstimatedFundingProps) {
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

  // Determine current score band highlight
  const getCurrentBandIndex = (score: number): number => {
    if (score >= 90) return 0;
    if (score >= 80) return 1;
    if (score >= 70) return 2;
    if (score >= 60) return 3;
    return 4;
  };

  const currentBandIndex = getCurrentBandIndex(data.fundScore);

  // Funding range table data
  const fundingRanges = [
    { scoreLabel: '90 to 100', bizMin: 80000, bizMax: 100000, personalMin: 90000, personalMax: 120000 },
    { scoreLabel: '80 to 89', bizMin: 60000, bizMax: 80000, personalMin: 70000, personalMax: 100000 },
    { scoreLabel: '70 to 79', bizMin: 40000, bizMax: 60000, personalMin: 50000, personalMax: 80000 },
    { scoreLabel: '60 to 69', bizMin: 20000, bizMax: 40000, personalMin: 30000, personalMax: 60000 },
    { scoreLabel: 'Below 60', bizMin: 0, bizMax: 0, personalMin: 0, personalMax: 0 },
  ];

  const formatCurrency = (min: number, max: number): string => {
    if (min === 0 && max === 0) return 'Take actions to raise score';
    return `$${(min / 1000).toFixed(0)},000 to $${(max / 1000).toFixed(0)},000`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header Card */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {/* Top Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Estimated Funding Range & Contingency Report
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

          {/* Sub Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--text-muted)',
              }}
            >
              For: <strong style={{ color: 'var(--text-primary)' }}>{data.businessName}</strong>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 400,
                color: 'var(--text-muted)',
              }}
            >
              Date Produced: {data.reportDate}
            </div>
          </div>
        </div>

        {/* Critical Variables Section */}
        <div
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '16px 24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Critical Variables
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Estimate Expires: {data.estimateExpiry}
            </div>
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
            • Keep all revolving credit balances below 45% balance to limit
            <br />
            • Estimate based on no previous derogatory account with banks we seek funding from
            <br />
            • No other credit applied for after date produced
          </div>
        </div>

        {/* Funding Estimator Range Table */}
        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '24px',
          }}
        >
          {/* Header Row */}
          <div
            style={{
              background: 'var(--primary)',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', gap: '32px', flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#000',
                  minWidth: '80px',
                }}
              >
                Score Range
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#000',
                  flex: 1,
                }}
              >
                Business Only Funding
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#000',
                  flex: 1,
                }}
              >
                Personal & Business Funding
              </div>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--primary)',
                background: 'var(--primary-alpha)',
                border: '1px solid var(--primary)',
                padding: '4px 12px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              Current Score: {data.fundScore}
            </div>
          </div>

          {/* Data Rows */}
          {fundingRanges.map((range, index) => {
            const isActive = index === currentBandIndex;
            return (
              <div
                key={range.scoreLabel}
                style={{
                  display: 'flex',
                  gap: '32px',
                  padding: '12px 16px',
                  borderBottom: index < fundingRanges.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: isActive ? 'var(--primary-alpha)' : 'var(--bg-surface-1)',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                    minWidth: '80px',
                  }}
                >
                  {range.scoreLabel}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    flex: 1,
                  }}
                >
                  {formatCurrency(range.bizMin, range.bizMax)}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    flex: 1,
                  }}
                >
                  {formatCurrency(range.personalMin, range.personalMax)}
                </div>
              </div>
            );
          })}
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════════ */}
        {/* CAPITAL UNLOCK FORECASTING — 30/60/90 Day Projections (STRATEGIC FEATURE)    */}
        {/* ═════════════════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: 'linear-gradient(135deg, #10b98130 0%, #06b6d430 100%)',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUp style={{ width: '18px', height: '18px', color: 'white' }} />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '18px',
                fontWeight: 700,
                color: '#10b981',
                margin: 0,
              }}
            >
              Your Funding Growth Path
            </h2>
          </div>

          {/* Sub-heading */}
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 400,
              color: 'var(--text-secondary)',
              marginBottom: '20px',
            }}
          >
            Complete high-impact audit items to unlock more capital. Here's your projected funding eligibility at key milestones:
          </p>

          {/* 30/60/90 Day Milestones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {/* Today */}
            <div
              style={{
                background: 'white',
                border: '2px solid #10b981',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#10b981',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Today (Current)
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                {formatCurrency(data.fundingRange.businessOnlyMin, data.fundingRange.businessOnlyMax)}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  color: 'var(--text-muted)',
                }}
              >
                FundScore: {data.fundScore}
              </div>
            </div>

            {/* 30 Days */}
            <div
              style={{
                background: 'white',
                border: '1px solid #06b6d4',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#06b6d4',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                After 30 Days
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                $75K - $150K
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  color: 'var(--text-muted)',
                }}
              >
                Projected FundScore: 750+
              </div>
            </div>

            {/* 90 Days */}
            <div
              style={{
                background: 'white',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#3b82f6',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                After 90 Days
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                }}
              >
                $150K - $400K
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 400,
                  color: 'var(--text-muted)',
                }}
              >
                Projected FundScore: 850+
              </div>
            </div>
          </div>

          {/* Bottom note */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.05)',
              borderRadius: '4px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              <strong>💡 Tip:</strong> Completing audit items from "Lender Compliance" and "Building Credit" categories has the highest impact on unlocking capital.
            </p>
          </div>
        </div>
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
              background: 'var(--bg-surface-2)',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
              Business Owner Status
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              For: {data.ownerStatus.name}
            </div>
          </div>

          {/* 5-Column Table */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '12px' }}>
              {/* Column Headers */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Owner Info
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                FICO Scores
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Recent Inquiries
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Open Tradelines
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Revolving Usage
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {/* Owner Info Column */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {data.ownerStatus.name}
                <br />
                Income: {data.ownerStatus.personalIncome}
                <br />
                TIB: {data.ownerStatus.timeInBusiness}
              </div>

              {/* FICO Scores Column */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                Experian: {data.ownerStatus.experian}
                <br />
                Equifax: {data.ownerStatus.equifax}
                <br />
                TransUnion: {data.ownerStatus.transunion}
              </div>

              {/* Recent Inquiries Column */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                3 Months: {data.ownerStatus.inquiries3mo}
                <br />
                6 Months: {data.ownerStatus.inquiries6mo}
                <br />
                12 Months: {data.ownerStatus.inquiries12mo}
              </div>

              {/* Open Tradelines Column */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {data.ownerStatus.openTradelines}
              </div>

              {/* Revolving Usage Column */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 400,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                Utilization: {data.ownerStatus.revolvingUsage}
                <br />
                {parseInt(data.ownerStatus.revolvingUsage) > 30 && (
                  <span style={{ color: 'var(--warning)' }}>Above 30% actively hurts score</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Funding Contingencies Table */}
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
              background: 'var(--bg-surface-2)',
              padding: '12px 16px',
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
              Business Funding Contingencies
            </div>
          </div>

          {/* Table Content */}
          <div>
            {/* Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 2fr',
                gap: '16px',
                padding: '12px 16px',
                background: 'var(--bg-surface-2)',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Item
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Found
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Cause
              </div>
            </div>

            {/* Data Rows */}
            {data.contingencies.map((contingency, index) => (
              <div
                key={contingency.item}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 2fr',
                  gap: '16px',
                  padding: '12px 16px',
                  background: index % 2 === 0 ? 'var(--bg-surface-1)' : 'var(--bg-surface-2)',
                  borderBottom: index < data.contingencies.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 400,
                    color: 'var(--text-primary)',
                  }}
                >
                  {contingency.item}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: contingency.found === 0 ? 'var(--primary)' : '#b04428',
                  }}
                >
                  {contingency.found}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    fontWeight: 300,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  {contingency.cause || '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Required Tradeline Paydowns - Conditional */}
        {parseInt(data.ownerStatus.revolvingUsage) > 45 ? (
          <div
            style={{
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}
            >
              Required Tradeline Pay Downs
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 300,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
              }}
            >
              High utilization detected — enter tradeline details to calculate paydowns.{' '}
              <a
                href="/business-profile"
                style={{
                  color: 'var(--primary)',
                  textDecoration: 'underline',
                }}
              >
                Update in My Business Profile →
              </a>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 400,
                color: 'var(--primary)',
              }}
            >
              ✓ No tradeline paydowns required at current utilization.
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 300,
            color: 'var(--text-muted)',
            lineHeight: 1.8,
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '24px',
            marginTop: '24px',
          }}
        >
          <p style={{ marginBottom: '12px' }}>
            Business credit cards are considered Non-Bankable "aka Alternative" business funding. After business credit cards are established and we've built some cushion between the borrowing and personal income there's a transition that happens once you have the above available credit on business credit cards.
          </p>
          <p style={{ marginBottom: '12px' }}>
            While cards are 0% interest to start with aggressive but appropriate use they become the cheapest funding to use; because unlike loans you don't have to pay them down to zero. You can keep the balance on the cards as long as you service the minimum payments, and those minimums are the cheapest payments you could ever pay when compared to any funded loan (other than personal credit cards).
          </p>
          <p style={{ marginBottom: 0 }}>
            After business credit cards are obtained then we know exactly where we can get you low-rate bankable loans. Approved amounts will fluctuate until you have two consecutive years of tax returns, gross profit and net profit are positive, and in general you have a strong operating business. Some bankable loans can be obtained with only one year of tax returns – those max amounts range $100K to $150K. The loan amounts above assume two years of tax returns. We suggest getting all the business credit cards first before applying for bankable loans.
          </p>
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

export default EstimatedFunding;
