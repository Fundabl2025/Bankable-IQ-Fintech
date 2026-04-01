import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { isProgramPreQualified, getFundingPrograms } from '../utils/fundingEligibility';
import { FundingApplicationModal } from './FundingApplicationModal';

export interface ProductFact {
  label: string;
  value: string;
}

export interface ProductReq {
  label: string;
  value: string;
}

export interface ProductPageConfig {
  id: string;
  icon: string;
  title: string;
  range: string;
  fundingSpeed: string;
  tagline: string;
  description: string;
  facts: ProductFact[];
  requirements: ProductReq[];
  benefits: string[];
  idealFor: string;
}

export function FundingProductPage({ config }: { config: ProductPageConfig }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preQualScore, setPreQualScore] = useState(0);

  const isPreQualified = isProgramPreQualified(config.id);
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === config.id);

  useEffect(() => {
    if (programData) setPreQualScore(programData.preQualificationScore ?? 0);
  }, [programData]);

  const statusColor = isPreQualified ? '#10b981' : preQualScore >= 70 ? '#f59e0b' : '#6366f1';
  const statusLabel = isPreQualified ? 'Pre-Qualified ✓' : preQualScore >= 70 ? 'Almost There' : 'Build Toward This';
  const statusBg = isPreQualified ? 'rgba(16,185,129,0.08)' : preQualScore >= 70 ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)';
  const statusBorder = isPreQualified ? 'rgba(16,185,129,0.25)' : preQualScore >= 70 ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', overflowY: 'auto' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 48px' }}>

        {/* Back nav */}
        <button
          onClick={() => navigate('/app/access-funding')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontFamily: 'var(--font-body)', fontSize: '13px', padding: 0, marginBottom: '24px' }}
        >
          <ArrowLeft size={14} /> Access Funding
        </button>

        {/* Hero */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '36px', marginBottom: '10px', lineHeight: 1 }}>{config.icon}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>Funding Product</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '26px', color: 'var(--foreground)', lineHeight: 1.1 }}>{config.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '6px', lineHeight: 1.5 }}>{config.tagline}</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '99px', background: statusBg, border: `1px solid ${statusBorder}`, flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: statusColor, whiteSpace: 'nowrap' }}>{statusLabel}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '3px' }}>Amount</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', color: '#10b981' }}>{config.range}</div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '3px' }}>Funding Speed</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--foreground)' }}>{config.fundingSpeed}</div>
            </div>
          </div>
        </div>

        {/* Quick Facts */}
        {config.facts.length > 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '14px' }}>Quick Facts</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
              {config.facts.map((f, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.4 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Requirements */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '14px' }}>Requirements</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {config.requirements.map((req, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: i < config.requirements.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: '2px', fontSize: '12px' }}>·</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: 'var(--foreground)' }}>{req.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px', lineHeight: 1.5 }}>{req.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description + Ideal For */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '10px' }}>What It Is</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--foreground)', lineHeight: 1.65, margin: 0 }}>{config.description}</p>
          {config.idealFor && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, marginTop: '2px' }}>Best For</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.5 }}>{config.idealFor}</span>
            </div>
          )}
        </div>

        {/* Benefits */}
        {config.benefits.length > 0 && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '12px' }}>Why Choose This</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {config.benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: '1px', fontWeight: 700 }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--foreground)', lineHeight: 1.55 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => isPreQualified ? setIsModalOpen(true) : navigate('/app/lender-compliance')}
            style={{
              flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px 24px', borderRadius: '12px', cursor: 'pointer', border: 'none',
              background: isPreQualified ? 'linear-gradient(135deg, #10b981, #059669)' : `${statusColor}12`,
              color: isPreQualified ? 'white' : statusColor,
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
              ...(isPreQualified ? {} : { border: `1px solid ${statusBorder}` }),
            }}
          >
            {isPreQualified ? 'Apply Now' : 'See What You Need'}
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/app/access-funding')}
            style={{
              padding: '14px 20px', borderRadius: '12px', cursor: 'pointer',
              background: 'var(--card)', border: '1px solid var(--border)',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px',
            }}
          >
            ← All Programs
          </button>
        </div>

      </div>

      {isModalOpen && (
        <FundingApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          programName={config.title}
          programAmount={config.range}
          programType={config.id}
        />
      )}
    </div>
  );
}
