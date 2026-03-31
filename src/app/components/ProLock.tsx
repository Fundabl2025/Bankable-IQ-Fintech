// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Pro Lock Screen Component
// Reusable overlay for premium-gated features
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'motion/react';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface ProLockProps {
  /** Feature name shown in the lock screen */
  featureName: string;
  /** One-line pitch for what the feature does */
  description?: string;
  /** What plan unlocks this feature */
  requiredPlan?: 'Pro' | 'Business' | 'Elite';
  /** Bullet list of what the user unlocks */
  unlocks?: string[];
  /** Render the lock as an overlay over children */
  overlay?: boolean;
  /** Children to render behind the lock (blur effect) */
  children?: React.ReactNode;
}

const PLAN_STYLES: Record<string, { gradient: string; badge: string; cta: string }> = {
  Pro: {
    gradient: 'linear-gradient(135deg, #9333ea, #3b82f6)',
    badge: '✦ Pro',
    cta: 'Upgrade to Pro',
  },
  Business: {
    gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    badge: '✦ Business',
    cta: 'Upgrade to Business',
  },
  Elite: {
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    badge: '★ Elite',
    cta: 'Upgrade to Elite',
  },
};

export function ProLock({
  featureName,
  description,
  requiredPlan = 'Pro',
  unlocks,
  overlay = false,
  children,
}: ProLockProps) {
  const navigate = useNavigate();
  const style = PLAN_STYLES[requiredPlan];

  const lockContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '40px 32px',
        maxWidth: '380px',
        margin: '0 auto',
      }}
    >
      {/* Lock icon circle */}
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: style.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 24px rgba(147,51,234,0.3)',
        }}
      >
        <Lock size={28} style={{ color: 'white' }} />
      </div>

      {/* Plan badge */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: '20px',
          background: style.gradient,
          color: 'white',
          marginBottom: '14px',
          letterSpacing: '0.04em',
        }}
      >
        {style.badge}
      </span>

      {/* Feature name */}
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '20px',
          color: 'var(--foreground)',
          marginBottom: '10px',
          lineHeight: 1.2,
        }}
      >
        {featureName}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
            marginBottom: '20px',
          }}
        >
          {description}
        </p>
      )}

      {/* Unlocks list */}
      {unlocks && unlocks.length > 0 && (
        <div
          style={{
            width: '100%',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '24px',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            What you unlock:
          </div>
          {unlocks.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: i < unlocks.length - 1 ? '8px' : 0,
              }}
            >
              <Zap
                size={13}
                style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--foreground)',
                  lineHeight: 1.4,
                }}
              >
                {item}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => navigate('/app/settings')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '13px 28px',
          background: style.gradient,
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(147,51,234,0.28)',
          transition: 'opacity 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.opacity = '0.9';
          (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.opacity = '1';
          (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
        }}
      >
        {style.cta}
        <ArrowRight size={15} />
      </button>

      <button
        onClick={() => navigate('/app/settings')}
        style={{
          marginTop: '12px',
          background: 'none',
          border: 'none',
          fontSize: '12px',
          color: 'var(--muted-foreground)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        View all plans
      </button>
    </motion.div>
  );

  // Overlay mode: blurs children and shows lock on top
  if (overlay && children) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '14px' }}>
        {/* Blurred content behind */}
        <div style={{ filter: 'blur(4px)', opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        {/* Lock overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(var(--background-rgb, 255,255,255), 0.7)',
            backdropFilter: 'blur(2px)',
          }}
        >
          {lockContent}
        </div>
      </div>
    );
  }

  // Standalone mode: just shows the lock screen
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}
    >
      {lockContent}
    </div>
  );
}

export default ProLock;
