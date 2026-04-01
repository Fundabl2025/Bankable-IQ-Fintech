import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { isProgramPreQualified, getFundingPrograms } from '../utils/fundingEligibility';
import { getApplyReadiness, LoanRequirement } from '../utils/loanRequirementsMap';
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
  const [readiness, setReadiness] = useState(() =>
    getApplyReadiness(config.id, {}, {})
  );

  const isPreQualified = isProgramPreQualified(config.id);
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === config.id);

  useEffect(() => {
    if (programData) setPreQualScore(programData.preQualificationScore ?? 0);
  }, [programData]);

  // Load assessment + compliance on mount
  useEffect(() => {
    let assessment: Record<string, any> = {};
    let complianceProgress: Record<string, { completed: boolean }> = {};
    try {
      const rawA = localStorage.getItem('unified_assessment');
      if (rawA) assessment = JSON.parse(rawA);
    } catch { /* ignore */ }
    try {
      const rawC = localStorage.getItem('lenderComplianceProgress');
      if (rawC) complianceProgress = JSON.parse(rawC);
    } catch { /* ignore */ }
    setReadiness(getApplyReadiness(config.id, assessment, complianceProgress));
  }, [config.id]);

  const { canApply, requiredScore, missingRequired, missingRecommended, metRequirements, nextStep, nextStepPath, totalRequired, metRequired } = readiness;

  const statusColor = isPreQualified ? '#10b981' : preQualScore >= 70 ? '#f59e0b' : '#6366f1';
  const statusLabel = isPreQualified ? 'Pre-Qualified ✓' : preQualScore >= 70 ? 'Almost There' : 'Build Toward This';
  const statusBg = isPreQualified ? 'rgba(16,185,129,0.08)' : preQualScore >= 70 ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)';
  const statusBorder = isPreQualified ? 'rgba(16,185,129,0.25)' : preQualScore >= 70 ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)';

  // Apply button state
  const applyButtonStyle = (): React.CSSProperties => {
    if (canApply) {
      return {
        flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '14px 24px', borderRadius: '12px', cursor: 'pointer', border: 'none',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: 'white',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
      };
    }
    if (requiredScore >= 60) {
      return {
        flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '14px 24px', borderRadius: '12px', cursor: 'pointer', border: 'none',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: 'white',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
        boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
      };
    }
    return {
      flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      padding: '14px 24px', borderRadius: '12px', cursor: 'not-allowed', border: 'none',
      background: 'var(--border)',
      color: 'var(--muted-foreground)',
      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
    };
  };

  // Determine if apply button is clickable
  const applyClickable = canApply || requiredScore >= 60;

  // Render a single requirement row
  function RequirementRow({ req, isMissing, isRequired }: { req: LoanRequirement; isMissing: boolean; isRequired: boolean }) {
    const isMet = !isMissing;
    let icon: string;
    let iconColor: string;
    if (isMet) {
      icon = '✓';
      iconColor = '#10b981';
    } else if (isRequired) {
      icon = '✗';
      iconColor = '#ef4444';
    } else {
      icon = '○';
      iconColor = 'var(--muted-foreground)';
    }

    const fixPath = req.type === 'compliance' ? req.fixPath : req.fixPath;
    const fixLabel = req.type === 'compliance' ? '→ Complete' : (req.fixLabel ?? '→ Fix');

    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ color: iconColor, flexShrink: 0, marginTop: '1px', fontWeight: 700, fontSize: '13px', width: '14px', textAlign: 'center' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 700, color: isMet ? 'var(--foreground)' : isRequired ? '#ef4444' : 'var(--muted-foreground)' }}>{req.label}</span>
            {isMissing && fixPath && (
              <a
                href={fixPath}
                onClick={e => { e.preventDefault(); navigate(fixPath); }}
                style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#3b82f6', textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                {fixLabel}
              </a>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '2px', lineHeight: 1.5 }}>{req.description}</div>
        </div>
      </div>
    );
  }

  // Collect all requirements in order: required (met + missing), then recommended
  const requiredMet = metRequirements.filter(r => r.severity === 'required');
  const recommendedMet = metRequirements.filter(r => r.severity === 'recommended');

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

        {/* Smart Requirements */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
          {/* Header with progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>Requirements</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 700, color: metRequired === totalRequired ? '#10b981' : 'var(--foreground)' }}>
              {metRequired} of {totalRequired} required complete
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              height: '100%',
              borderRadius: '99px',
              background: metRequired === totalRequired ? '#10b981' : requiredScore >= 60 ? '#f59e0b' : '#ef4444',
              width: `${totalRequired > 0 ? Math.round((metRequired / totalRequired) * 100) : 100}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* Required to Apply */}
          {(requiredMet.length > 0 || missingRequired.length > 0) && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--foreground)', marginBottom: '4px' }}>
                Required to Apply
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {requiredMet.map((req, i) => (
                  <RequirementRow key={`met-req-${i}`} req={req} isMissing={false} isRequired={true} />
                ))}
                {missingRequired.map((req, i) => (
                  <RequirementRow key={`miss-req-${i}`} req={req} isMissing={true} isRequired={true} />
                ))}
              </div>
            </div>
          )}

          {/* Boosts Your Odds */}
          {(recommendedMet.length > 0 || missingRecommended.length > 0) && (
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: '4px' }}>
                Boosts Your Odds
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recommendedMet.map((req, i) => (
                  <RequirementRow key={`met-rec-${i}`} req={req} isMissing={false} isRequired={false} />
                ))}
                {missingRecommended.map((req, i) => (
                  <RequirementRow key={`miss-rec-${i}`} req={req} isMissing={true} isRequired={false} />
                ))}
              </div>
            </div>
          )}
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
          {/* Apply Now button — state-driven */}
          <button
            onClick={() => { if (applyClickable) setIsModalOpen(true); }}
            disabled={!applyClickable}
            style={applyButtonStyle()}
          >
            {!canApply && requiredScore < 60 && <Lock size={15} />}
            {canApply
              ? 'Apply Now'
              : requiredScore >= 60
                ? <>Apply Now <span style={{ fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.2)', borderRadius: '5px', padding: '2px 7px' }}>{missingRequired.length} needed</span></>
                : `Unlock Apply (${missingRequired.length} required)`
            }
            {canApply && <ArrowRight size={16} />}
          </button>

          {/* Next step hint when locked */}
          {!canApply && requiredScore < 60 && (
            <button
              onClick={() => navigate(nextStepPath)}
              style={{
                padding: '14px 20px', borderRadius: '12px', cursor: 'pointer',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
                color: '#6366f1',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {nextStep}
            </button>
          )}

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

        {/* Next step hint below locked button */}
        {!canApply && requiredScore < 60 && (
          <div style={{ marginTop: '10px', fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
            Next: <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{nextStep}</span>
          </div>
        )}

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
