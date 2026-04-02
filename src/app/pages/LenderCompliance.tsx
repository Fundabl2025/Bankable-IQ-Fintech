import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle2, ChevronRight, ArrowRight, Lock, X, Star, Zap } from 'lucide-react';
import {
  complianceModules,
  getComplianceProgress,
  getCategoryProgress,
  getOverallProgress,
  type ComplianceModule,
} from '../utils/lenderComplianceModules';
import { getMembershipTier, canAccessGoal2, type MembershipTier, TIER_FEATURES } from '../lib/membership';

// ── Upgrade Modal ─────────────────────────────────────────────────────────────
function UpgradeModal({ onClose }: { onClose: () => void }) {
  const TIERS = [
    {
      tier: 'virtual',
      label: 'Virtual Coached',
      price: '$97/month',
      icon: '🎓',
      color: '#10b981',
      cta: 'Start Virtual Coaching',
      highlight: false,
      features: TIER_FEATURES.virtual,
      note: 'Goal #2 + AI Coaching — built to make you bankable in 60–90 days.',
    },
    {
      tier: 'live',
      label: 'Live Coached',
      price: '$297/month',
      icon: '⭐',
      color: '#f59e0b',
      cta: 'Get a Live Coach',
      highlight: true,
      features: TIER_FEATURES.live,
      note: 'Done-For-You + Live Coach — a real human coach handles compliance for 12 months.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="compliance-upgrade-modal"
        style={{ background: 'var(--background)', borderRadius: '22px', overflow: 'hidden', width: '100%', maxWidth: '560px', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', padding: '28px 28px 24px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <X size={14} />
          </button>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
            GOAL #2 — BECOME BANKABLE
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '22px', color: 'white', lineHeight: 1.2, marginBottom: '8px' }}>
            Unlock the 13 Compliance Modules
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: 0 }}>
            Less than 1% of businesses are bankable. These 13 steps are how you get there — and how lenders can resell your loan, which dramatically increases approval rates.
          </p>
        </div>

        {/* Tier cards */}
        <div style={{ padding: '20px 24px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {TIERS.map(tier => (
            <div
              key={tier.tier}
              style={{ background: tier.highlight ? `${tier.color}08` : 'var(--card)', border: `${tier.highlight ? '2px' : '1px'} solid ${tier.highlight ? tier.color + '50' : 'var(--border)'}`, borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}
            >
              {tier.highlight && (
                <div style={{ position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)', background: tier.color, borderRadius: '0 0 8px 8px', padding: '2px 12px', fontFamily: 'var(--font-body)', fontSize: '9px', fontWeight: 800, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', paddingTop: tier.highlight ? '10px' : '0' }}>
                <span style={{ fontSize: '22px' }}>{tier.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)' }}>{tier.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: tier.color, fontWeight: 600 }}>{tier.price}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{tier.note}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {tier.features.slice(1).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: tier.color, fontWeight: 800, marginTop: '2px' }}>✓</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--foreground)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                style={{ padding: '10px', background: tier.highlight ? `linear-gradient(135deg, ${tier.color}, ${tier.color}cc)` : tier.color + '15', border: tier.highlight ? 'none' : `1px solid ${tier.color}40`, borderRadius: '10px', color: tier.highlight ? 'white' : tier.color, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: tier.highlight ? `0 4px 14px ${tier.color}40` : 'none' }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 24px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
            Goal #1 (current access): initial funding products still available · No credit card required to continue with free access
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

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

function ModuleCard({ module, isComplete, index, locked, onLockedClick }: {
  module: ComplianceModule; isComplete: boolean; index: number;
  locked?: boolean; onLockedClick?: () => void;
}) {
  const navigate = useNavigate();
  const icon = MODULE_ICONS[module.id] || '📌';
  const impact = MODULE_IMPACT[module.id] || 10;

  const handleClick = () => {
    if (locked) { onLockedClick?.(); return; }
    navigate(`/app${module.route}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={handleClick}
      style={{
        background: locked ? 'var(--card)' : isComplete ? 'rgba(16,185,129,0.04)' : 'var(--card)',
        border: locked ? '1px solid var(--border)' : isComplete ? '1px solid rgba(16,185,129,0.25)' : '1px solid var(--border)',
        borderRadius: '14px',
        padding: '16px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        opacity: locked ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
    >
      {/* Lock strip for free-tier users */}
      {locked && (
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '3px', background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }} />
      )}
      {/* Icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: locked ? 'rgba(99,102,241,0.06)' : isComplete ? 'rgba(16,185,129,0.1)' : 'var(--background)',
        border: `1px solid ${locked ? 'rgba(99,102,241,0.2)' : isComplete ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
        filter: locked ? 'grayscale(0.4)' : 'none',
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

      {/* Right side: impact badge + arrow / lock */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
        {locked ? (
          <>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '5px', padding: '2px 7px' }}>
              +{impact} pts
            </span>
            <Lock size={14} style={{ color: '#6366f1' }} />
          </>
        ) : isComplete ? (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981' }}>Complete ✓</span>
        ) : (
          <>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '5px', padding: '2px 7px' }}>
              +{impact} pts
            </span>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </>
        )}
      </div>
    </motion.div>
  );
}

export function LenderCompliance() {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [tier, setTier] = useState<MembershipTier>(() => getMembershipTier());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const isLocked = !canAccessGoal2(tier);

  useEffect(() => {
    const handle = () => setRefreshKey(k => k + 1);
    const handleMembership = () => setTier(getMembershipTier());
    window.addEventListener('auditItemUpdated', handle);
    window.addEventListener('storage', handle);
    window.addEventListener('membershipUpdated', handleMembership);
    return () => {
      window.removeEventListener('auditItemUpdated', handle);
      window.removeEventListener('storage', handle);
      window.removeEventListener('membershipUpdated', handleMembership);
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
      <AnimatePresence>{showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}</AnimatePresence>
      <div style={{ padding: '32px 28px 48px', width: '100%', boxSizing: 'border-box' }}>

        {/* FREE-TIER UPGRADE BANNER */}
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Lock size={18} style={{ color: '#6366f1' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)', marginBottom: '3px' }}>
                Goal #2 — Become Bankable — requires Full Access
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                Less than 1% of businesses are bankable. These 13 steps — with a coach on every one — are how you join that 1%. Upgrade to access all modules and 90+ coaching videos.
              </div>
            </div>
            <button
              onClick={() => setShowUpgrade(true)}
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 14px rgba(99,102,241,0.3)', whiteSpace: 'nowrap' }}
            >
              Upgrade to Unlock →
            </button>
          </motion.div>
        )}

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: '28px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
            Goal #2 — Become Bankable
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(26px, 3.5vw, 36px)', color: 'var(--foreground)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                Lender Compliance
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)', marginTop: '6px' }}>
                13 modules that make you look low risk to lenders — and allow them to resell your loan, which vastly increases approvals
              </p>
            </div>
            {isLocked ? (
              <button
                onClick={() => setShowUpgrade(true)}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99,102,241,0.25)', flexShrink: 0 }}
              >
                <Lock size={13} /> Unlock Full Access
              </button>
            ) : nextModule ? (
              <button
                onClick={() => navigate(`/app${nextModule.route}`)}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #3b82f6)', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(16,185,129,0.25)', flexShrink: 0 }}
              >
                {overall.completed === 0 ? 'Start First Module' : 'Continue'} <ArrowRight size={14} />
              </button>
            ) : null}
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
              <ModuleCard key={m.id} module={m} isComplete={!!progress[m.id]?.completed} index={i} locked={isLocked} onLockedClick={() => setShowUpgrade(true)} />
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
              <ModuleCard key={m.id} module={m} isComplete={!!progress[m.id]?.completed} index={i} locked={isLocked} onLockedClick={() => setShowUpgrade(true)} />
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
