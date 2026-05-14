// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Badge Grid Component
// Earned badges first, locked last. Show icon always. Date on earned.
// ════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { BADGES, getEarnedBadges, getBadgeById, type Badge } from '../lib/badges';

// ─── Category display order ───────────────────────────────────────────────────
const CATEGORY_ORDER = ['assessment', 'action', 'compliance', 'score', 'credit', 'financial'];
const CATEGORY_LABELS: Record<string, string> = {
  assessment: 'Getting Started',
  action:     'Actions Taken',
  compliance: 'Compliance',
  score:      'Score Milestones',
  credit:     'Credit',
  financial:  'Financial Health',
};

// ─── Badge Card ───────────────────────────────────────────────────────────────

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string;
  isNew?: boolean;
}

function BadgeCard({ badge, earned, earnedAt, isNew }: BadgeCardProps) {
  const dateLabel = earnedAt
    ? new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <motion.div
      initial={isNew ? { scale: 0.5, opacity: 0 } : false}
      animate={isNew ? { scale: 1, opacity: 1 } : false}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        position: 'relative',
        borderRadius: '14px',
        padding: '18px 12px 14px',
        textAlign: 'center',
        border: earned ? `1.5px solid ${badge.color}40` : '1.5px solid var(--border)',
        background: earned ? `${badge.color}08` : 'var(--card)',
        opacity: earned ? 1 : 0.55,
        transition: 'all 0.2s',
        cursor: 'default',
      }}
      title={earned ? `Earned: ${dateLabel}` : `Locked — ${badge.hint}`}
    >
      {/* New glow ring */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0, borderRadius: '14px',
            border: `2px solid ${badge.color}`, pointerEvents: 'none',
          }}
        />
      )}

      {/* Earned checkmark OR locked pill */}
      {earned ? (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: badge.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', color: 'white', fontWeight: 700,
        }}>✓</div>
      ) : (
        <div style={{
          position: 'absolute', top: '8px', right: '8px',
          fontSize: '8px', fontWeight: 700,
          color: 'var(--muted-foreground)', background: 'var(--border)',
          borderRadius: '4px', padding: '2px 5px', letterSpacing: '0.04em',
        }}>LOCKED</div>
      )}

      {/* Icon circle — always shows the real icon, dimmed when locked */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: earned ? badge.gradient : 'var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 10px',
        fontSize: '24px',
        filter: earned ? 'none' : 'grayscale(1)',
        boxShadow: earned ? `0 4px 16px ${badge.color}30` : 'none',
        transition: 'all 0.2s',
      }}>
        {badge.icon}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '12px',
        color: earned ? 'var(--foreground)' : 'var(--muted-foreground)',
        marginBottom: '3px', lineHeight: 1.2,
      }}>
        {badge.name}
      </div>

      {/* Description or hint */}
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '10px',
        color: earned ? badge.color : 'var(--muted-foreground)',
        lineHeight: 1.4, fontWeight: earned ? 600 : 400,
        marginBottom: dateLabel && earned ? '6px' : 0,
      }}>
        {earned ? badge.description : badge.hint}
      </div>

      {/* Earned date — only shown when earned */}
      {earned && dateLabel && (
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '9px',
          color: 'var(--muted-foreground)', fontWeight: 500,
          borderTop: '1px solid var(--border)', paddingTop: '5px', marginTop: '4px',
        }}>
          {dateLabel}
        </div>
      )}
    </motion.div>
  );
}

// ─── Unlock Toast ─────────────────────────────────────────────────────────────

function UnlockToast({ badge, onClose }: { badge: Badge; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 18px',
        background: 'var(--card)',
        border: `1.5px solid ${badge.color}40`,
        borderRadius: '14px',
        boxShadow: `0 8px 32px ${badge.color}20, 0 2px 8px rgba(0,0,0,0.12)`,
        maxWidth: '300px', cursor: 'pointer',
      }}
      onClick={onClose}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: badge.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', flexShrink: 0,
        boxShadow: `0 4px 12px ${badge.color}40`,
      }}>
        {badge.icon}
      </div>
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, color: badge.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '2px' }}>
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

// ─── Toast Container ─────────────────────────────────────────────────────────

export function BadgeToastContainer({ newBadgeIds }: { newBadgeIds: string[] }) {
  const [toasts, setToasts] = useState<string[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  // Listen for badges earned from other pages (e.g. ComplianceModulePage)
  useEffect(() => {
    const handler = (e: Event) => {
      const ids: string[] = (e as CustomEvent).detail?.ids ?? [];
      const fresh = ids.filter((id) => !seenRef.current.has(id));
      if (fresh.length === 0) return;
      fresh.forEach((id) => seenRef.current.add(id));
      setToasts((prev) => [...prev, ...fresh]);
    };
    window.addEventListener('badgeNewlyEarned', handler);
    return () => window.removeEventListener('badgeNewlyEarned', handler);
  }, []);

  // Also handle badges passed in via prop (from Dashboard's own award cycle)
  useEffect(() => {
    const fresh = newBadgeIds.filter((id) => !seenRef.current.has(id));
    if (fresh.length === 0) return;
    fresh.forEach((id) => seenRef.current.add(id));
    setToasts((prev) => [...prev, ...fresh]);
  }, [newBadgeIds]);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t !== id));

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      zIndex: 9999, display: 'flex', flexDirection: 'column',
      gap: '10px', alignItems: 'flex-end',
    }}>
      <AnimatePresence>
        {toasts.map((id) => {
          const badge = getBadgeById(id);
          if (!badge) return null;
          return <UnlockToast key={id} badge={badge} onClose={() => dismiss(id)} />;
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── Main BadgeGrid ───────────────────────────────────────────────────────────

interface BadgeGridProps {
  newBadgeIds?: string[];
}

export function BadgeGrid({ newBadgeIds = [] }: BadgeGridProps) {
  const earnedList = getEarnedBadges();
  const earnedMap = new Map(earnedList.map((e) => [e.id, e.earnedAt]));
  const earnedCount = BADGES.filter((b) => earnedMap.has(b.id)).length;

  // Group badges by category, earned first within each group
  const categories = CATEGORY_ORDER.filter((cat) =>
    BADGES.some((b) => b.category === cat)
  );

  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: '16px', color: 'var(--foreground)', margin: 0,
          }}>
            Achievements
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--muted-foreground)', margin: '4px 0 0' }}>
            {earnedCount} of {BADGES.length} badges earned
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '100px', height: '6px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / BADGES.length) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--muted-foreground)' }}>
            {Math.round((earnedCount / BADGES.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Categorised grid — earned first within each group */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {categories.map((cat) => {
          const catBadges = BADGES.filter((b) => b.category === cat);
          // Sort: earned first (by earnedAt desc), then locked
          const sorted = [...catBadges].sort((a, b) => {
            const aEarned = earnedMap.has(a.id);
            const bEarned = earnedMap.has(b.id);
            if (aEarned && !bEarned) return -1;
            if (!aEarned && bEarned) return 1;
            if (aEarned && bEarned) {
              return new Date(earnedMap.get(b.id)!).getTime() - new Date(earnedMap.get(a.id)!).getTime();
            }
            return 0;
          });

          return (
            <div key={cat}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                color: 'var(--muted-foreground)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '10px',
              }}>
                {CATEGORY_LABELS[cat]}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '10px',
              }}>
                {sorted.map((badge) => (
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
        })}
      </div>
    </div>
  );
}

// ─── BadgeStrip — Dashboard achievement widget ────────────────────────────────
// Elon: every achievement is tied to a real action. "Locked" shows exactly
//       what to do and links directly to the place that earns it.
// Chase: identity framing ("You're 71% of the way"), completion pull
//        (specific next badges with clear requirements), earned badges
//        anchored to real dates — momentum is visible.

export function BadgeStrip({ newBadgeIds = [], onViewAll }: { newBadgeIds?: string[]; onViewAll?: () => void }) {
  const navigate = useNavigate();
  const earnedList = getEarnedBadges();
  const earnedMap = new Map(earnedList.map(e => [e.id, e.earnedAt]));
  const earnedCount = BADGES.filter(b => earnedMap.has(b.id)).length;
  const pct = Math.round((earnedCount / BADGES.length) * 100);

  // Last 3 earned (most recent first)
  const recentEarned = [...earnedList]
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 3)
    .map(e => ({ badge: BADGES.find(b => b.id === e.id)!, earnedAt: e.earnedAt }))
    .filter(e => e.badge);

  // Next 3 to unlock — first locked badges in definition order
  const nextToEarn = BADGES.filter(b => !earnedMap.has(b.id)).slice(0, 3);

  const identityLabel = pct >= 90 ? 'Elite achiever — nearly complete'
    : pct >= 70 ? `${pct}% of the way to Bankable IQ Master`
    : pct >= 40 ? `${pct}% complete — momentum building`
    : `${earnedCount} earned — your journey is underway`;

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>

      {/* ── Header: identity + progress ── */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', color: 'var(--foreground)', marginBottom: '2px' }}>
            Achievements
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'var(--muted-foreground)', marginLeft: '8px' }}>
              {earnedCount}/{BADGES.length} earned
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
            {identityLabel}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '80px', height: '5px', borderRadius: '99px', background: 'var(--border)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ height: '100%', borderRadius: '99px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }}
              />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '13px', color: 'var(--foreground)' }}>{pct}%</span>
          </div>
          <button
            onClick={() => { if (onViewAll) { onViewAll(); } else { navigate('/app/my-progress'); } }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}
          >
            View all →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 0 }}>

        {/* ── Left: Recently Earned ── */}
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
            Recently Earned
          </p>
          {recentEarned.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              Complete your Business Success Scan to earn your first badge.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentEarned.map(({ badge, earnedAt }) => {
                const dateLabel = new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <motion.div
                    key={badge.id}
                    initial={newBadgeIds.includes(badge.id) ? { scale: 0.85, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: '10px',
                      background: `${badge.color}07`,
                      border: `1px solid ${badge.color}20`,
                      position: 'relative',
                    }}
                  >
                    {newBadgeIds.includes(badge.id) && (
                      <motion.div
                        initial={{ opacity: 0.8, scale: 1 }} animate={{ opacity: 0, scale: 1.4 }}
                        transition={{ duration: 0.7 }}
                        style={{ position: 'absolute', inset: 0, borderRadius: '10px', border: `2px solid ${badge.color}`, pointerEvents: 'none' }}
                      />
                    )}
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      background: badge.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', boxShadow: `0 3px 10px ${badge.color}30`,
                    }}>
                      {badge.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '1px' }}>
                        {badge.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: badge.color, fontWeight: 600, marginBottom: '2px' }}>
                        {badge.description}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--muted-foreground)' }}>
                        Earned {dateLabel}
                      </div>
                    </div>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: badge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '8px', color: 'white', fontWeight: 700 }}>✓</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div style={{ background: 'var(--border)' }} />

        {/* ── Right: Next to Unlock ── */}
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>
            Unlock Next
          </p>
          {nextToEarn.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
              🏆 All achievements unlocked — Elite status achieved.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {nextToEarn.map((badge, i) => (
                <div
                  key={badge.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px', borderRadius: '10px',
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    opacity: i === 0 ? 1 : 0.75,
                  }}
                >
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', filter: 'grayscale(1)',
                  }}>
                    {badge.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', color: 'var(--foreground)', marginBottom: '1px' }}>
                      {badge.name}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', lineHeight: 1.4, marginBottom: i === 0 ? '6px' : 0 }}>
                      {badge.hint}
                    </div>
                    {i === 0 && (
                      <button
                        onClick={() => navigate(badge.actionPath)}
                        style={{
                          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
                          color: 'white', background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                          border: 'none', borderRadius: '6px', padding: '4px 10px',
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        {badge.actionLabel} →
                      </button>
                    )}
                  </div>
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '50%',
                    border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: '8px', color: 'var(--muted-foreground)' }}>🔒</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BadgeGrid;
