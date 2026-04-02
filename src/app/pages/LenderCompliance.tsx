import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, CheckCircle2, ChevronRight, ArrowRight, Lock } from 'lucide-react';
import {
  complianceModules,
  getComplianceProgress,
  getCategoryProgress,
  getOverallProgress,
  type ComplianceModule,
} from '../utils/lenderComplianceModules';

// Icon map per module
const MODULE_ICONS: Record<string, string> = {
  'entity-filings': '🏛️',
  'business-location': '📍',
  'phones-411': '📞',
  'website-email': '🌐',
  'ein-licenses': '📋',
  'business-banking': '🏦',
  'agencies-naics': '🔢',
  'business-plan': '📄',
  'assets-ucc': '⚖️',
  'corp-only-facts': '🏢',
  'bank-rating': '⭐',
  'comparable-credit': '📊',
  'cd-business-loan': '💰',
};

// FICO point impact per module (rough values)
const MODULE_IMPACT: Record<string, number> = {
  'entity-filings': 45,
  'business-location': 30,
  'phones-411': 25,
  'website-email': 20,
  'ein-licenses': 35,
  'business-banking': 40,
  'agencies-naics': 25,
  'business-plan': 20,
  'assets-ucc': 15,
  'corp-only-facts': 15,
  'bank-rating': 20,
  'comparable-credit': 15,
  'cd-business-loan': 10,
};

function ModuleCard({ module, isComplete, index }: { module: ComplianceModule; isComplete: boolean; index: number }) {
  const navigate = useNavigate();
  const icon = MODULE_ICONS[module.id] || '📌';
  const impact = MODULE_IMPACT[module.id] || 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={() => navigate(`/app${module.route}`)}
      style={{
        background: isComplete ? 'rgba(16,185,129,0.04)' : 'var(--card)',
        border: isComplete ? '1px solid rgba(16,185,129,0.25)' : '1px solid var(--border)',
        borderRadius: '14px',
        padding: '16px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: isComplete ? 'rgba(16,185,129,0.4)' : 'var(--border-medium)' }}
    >
      {/* Icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: isComplete ? 'rgba(16,185,129,0.1)' : 'var(--background)',
        border: `1px solid ${isComplete ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
      }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>
            {module.title}
          </span>
          {isComplete && <CheckCircle2 size={14} style={{ color: '#10b981', flexShrink: 0 }} />}
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {module.description}
        </p>
      </div>

      {/* Right side: impact badge + arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        {!isComplete && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '5px', padding: '2px 7px' }}>
            +{impact} pts
          </span>
        )}
        {isComplete ? (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981' }}>Complete ✓</span>
        ) : (
          <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
        )}
      </div>
    </motion.div>
  );
}

export function LenderCompliance() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handle = () => setRefreshKey(k => k + 1);
    window.addEventListener('auditItemUpdated', handle);
    window.addEventListener('storage', handle);
    return () => {
      window.removeEventListener('auditItemUpdated', handle);
      window.removeEventListener('storage', handle);
    };
  }, []);

  const progress = getComplianceProgress();
  const overall = getOverallProgress();
  const complianceCategory = getCategoryProgress('Complete Compliance');
  const approvedCategory = getCategoryProgress('Getting Approved');

  const completeModules = complianceModules.filter(m => m.category === 'Complete Compliance').sort((a, b) => a.order - b.order);
  const approvedModules = complianceModules.filter(m => m.category === 'Getting Approved').sort((a, b) => a.order - b.order);

  // Find the first incomplete module for the primary CTA
  const nextModule = complianceModules.find(m => !progress[m.id]?.completed);
  const overallPct = overall.percentage;
  const gaugeColor = overallPct === 100 ? '#10b981' : overallPct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
      <div style={{ padding: '32px 28px 48px', width: '100%', boxSizing: 'border-box' }}>

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '28px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            My Tools
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 36px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                Lender Compliance
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
                13 modules lenders verify before approving any application
              </p>
            </div>
            {nextModule && (
              <button
                onClick={() => navigate(`/app${nextModule.route}`)}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(16,185,129,0.25)', flexShrink: 0 }}
              >
                {overall.completed === 0 ? 'Start First Module' : 'Continue'} <ArrowRight size={14} />
              </button>
            )}
          </div>
        </motion.div>

        {/* PROGRESS HERO */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px 28px', marginBottom: '28px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative', width: '56px', height: '56px' }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke={gaugeColor} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - overallPct / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px', color: gaugeColor }}>
                  {overallPct}%
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '24px', color: 'var(--foreground)', lineHeight: 1 }}>
                  {overall.completed} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--muted-foreground)' }}>/ {overall.total} complete</span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                  {overall.total - overall.completed} modules remaining to become fully bankable
                </div>
              </div>
            </div>

            {/* Category badges */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: '#10b981' }}>{complianceCategory.completed}/{complianceCategory.total}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Complete Compliance</div>
              </div>
              <div style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: '#3b82f6' }}>{approvedCategory.completed}/{approvedCategory.total}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Getting Approved</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${gaugeColor}99, ${gaugeColor})`, borderRadius: '99px' }}
            />
          </div>
        </motion.div>

        {/* CATEGORY 1: COMPLETE COMPLIANCE */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Shield size={18} style={{ color: '#10b981' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--foreground)', margin: 0 }}>
              Complete Compliance
            </h2>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '5px', padding: '2px 8px' }}>
              {complianceCategory.completed}/{complianceCategory.total}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px', lineHeight: 1.6 }}>
            The structural foundation every lender checks before reviewing your application. These items are required — not optional.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completeModules.map((m, i) => (
              <ModuleCard key={m.id} module={m} isComplete={!!progress[m.id]?.completed} index={i} />
            ))}
          </div>
        </motion.div>

        {/* CATEGORY 2: GETTING APPROVED */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Lock size={18} style={{ color: '#3b82f6' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '17px', color: 'var(--foreground)', margin: 0 }}>
              Getting Approved
            </h2>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: '#3b82f6', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '5px', padding: '2px 8px' }}>
              {approvedCategory.completed}/{approvedCategory.total}
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: '16px', lineHeight: 1.6 }}>
            Advanced modules that move you from qualified to funded — increase approval odds and lower the rate lenders offer you.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {approvedModules.map((m, i) => (
              <ModuleCard key={m.id} module={m} isComplete={!!progress[m.id]?.completed} index={i} />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
