// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Badge Grid Component
// Displays earned and locked badges with unlock animation toast
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BADGES, getEarnedBadges, type Badge } from '../lib/badges';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string;
  isNew?: boolean;
}

function BadgeCard({ badge, earned, earnedAt, isNew }: BadgeCardProps) {
  const date = earnedAt ? new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <motion.div
      initial={isNew ? { scale: 0.5, opacity: 0 } : false}
      animate={isNew ? { scale: 1, opacity: 1 } : false}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        position: 'relative',
        borderRadius: '14px',
        padding: '18px 14px',
        textAlign: 'center',
        border: earned ? `1.5px solid ${badge.color}30` : '1.5px solid var(--border)',
        background: earned ? `${badge.color}08` : 'var(--card)',
        opacity: earned ? 1 : 0.45,
        filter: earned ? 'none' : 'grayscale(1)',
        transition: 'all 0.2s',
        cursor: 'default',
      }}
      title={earned ? `Earned: ${date}` : badge.hint}
    >
      {/* New glow ring */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '14px',
            border: `2px solid ${badge.color}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Icon circle */}
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: earned ? badge.gradient : '#94a3b820',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          fontSize: '24px',
          boxShadow: earned ? `0 4px 16px ${badge.color}30` : 'none',
        }}
      >
        {earned ? badge.icon : '🔒'}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '13px',
          color: earned ? 'var(--foreground)' : 'var(--muted-foreground)',
          marginBottom: '4px',
          lineHeight: 1.2,
        }}
      >
        {badge.name}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.4,
        }}
      >
        {earned ? (date ? `Earned ${date}` : badge.description) : badge.hint}
      </div>
    </motion.div>
  );
}

// ── Unlock Toast ───────────────────────────────────────────────────────────────

function UnlockToast({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        background: 'var(--card)',
        border: `1.5px solid ${badge.color}40`,
        borderRadius: '14px',
        boxShadow: `0 8px 32px ${badge.color}20, 0 2px 8px rgba(0,0,0,0.12)`,
        maxWidth: '300px',
        cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: badge.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
          boxShadow: `0 4px 12px ${badge.color}40`,
        }}
      >
        {badge.icon}
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 700, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
          Badge Unlocked!
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--foreground)' }}>
          {badge.name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '2px' }}>
          {badge.description}
        </div>
      </div>
    </motion.div>
  );
}

// ── Toast Container ────────────────────────────────────────────────────────────

export function BadgeToastContainer({ newBadgeIds }: { newBadgeIds: string[] }) {
  const [toasts, setToasts] = useState<string[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = newBadgeIds.filter((id) => !seenRef.current.has(id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => seenRef.current.add(id));
    setToasts((prev) => [...prev, ...fresh]);
  }, [newBadgeIds]);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t !== id));

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
      }}
    >
      <AnimatePresence>
        {toasts.map((id) => {
          const badge = BADGES.find((b) => b.id === id);
          if (!badge) return null;
          return <UnlockToast key={id} badge={badge} onClose={() => dismiss(id)} />;
        })}
      </AnimatePresence>
    </div>
  );
}

// ── Main BadgeGrid ─────────────────────────────────────────────────────────────

interface BadgeGridProps {
  newBadgeIds?: string[];
}

export function BadgeGrid({ newBadgeIds = [] }: BadgeGridProps) {
  const earnedList = getEarnedBadges();
  const earnedMap = new Map(earnedList.map((e) => [e.id, e.earnedAt]));
  const earnedCount = BADGES.filter((b) => earnedMap.has(b.id)).length;

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '16px',
              color: 'var(--foreground)',
              margin: 0,
            }}
          >
            Achievements
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', margin: '4px 0 0' }}>
            {earnedCount} of {BADGES.length} badges earned
          </p>
        </div>
        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '100px',
              height: '6px',
              borderRadius: '99px',
              background: 'var(--border)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / BADGES.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: '99px',
                background: 'linear-gradient(90deg, #10b981, #3b82f6)',
              }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--muted-foreground)' }}>
            {Math.round((earnedCount / BADGES.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
          padding: '20px',
        }}
      >
        {BADGES.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            earned={earnedMap.has(badge.id)}
            earnedAt={earnedMap.get(badge.id)}
            isNew={newBadgeIds.includes(badge.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default BadgeGrid;
