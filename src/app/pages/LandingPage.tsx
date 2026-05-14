// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Public Landing Page
// Chase Hughes PCP Architecture:
//   Focus → Relevance → Micro-Compliance → Wedge → Authority → Tribe → Emotion
//   → Identity → Future Pace → Action
//
// Psychological Triggers: Identity, Control, Certainty, Belonging, Fairness,
//   Loss Aversion, Completion Pull, Specificity = Credibility
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router';
import { motion, useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import {
  ArrowRight, Lock, BarChart3, Clock, Shield, TrendingUp,
  Brain, CheckCircle, ChevronDown, Star, Zap, Building2,
  Target, Users, AlertTriangle, Eye
} from 'lucide-react';
import { getMembershipPricing, getMembershipPricingSync, type MembershipPricing } from '../lib/platform-config';

// ════════════════════════════════════════════════════════════════════════════════
// FADE IN WRAPPER — Reusable scroll-triggered animation
// ════════════════════════════════════════════════════════════════════════════════
function FadeIn({ children, delay = 0, direction = 'up' as 'up' | 'left' | 'right' | 'none' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const yOffset = direction === 'up' ? 28 : 0;
  const xOffset = direction === 'left' ? -28 : direction === 'right' ? 28 : 0;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// LIVE SCORE CARD — Hero right column
// FICO SBSS scale: 0–300 | 160 = bankability threshold
//   Poor 1–159 | Fair 160–189 | Good 190–209 | Excellent 210–300
// This card shows a real-world example: SBSS 270 (Excellent) → $125K funded
// ════════════════════════════════════════════════════════════════════════════════
function LiveScoreCard() {
  // SBSS 270 out of 300 = 90% of scale
  const sbssScore = 270;
  const sbssMax = 300;
  const sbssPercent = Math.round((sbssScore / sbssMax) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.45, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: '#0d1117',
        border: '1px solid rgba(16,185,129,0.3)',
        borderRadius: '16px',
        padding: '28px',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 0 80px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Green top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, #10b981, #059669)',
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-40px', right: '-40px',
        width: '180px', height: '180px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          FORGE™ Capital Readiness Profile
        </div>
        <div style={{ padding: '3px 8px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '4px', fontFamily: 'var(--font-body)', fontSize: '10px', color: '#10b981' }}>
          LIVE PREVIEW
        </div>
      </div>

      {/* Funded amount — primary identity anchor */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px' }}>
          Approved &amp; Funded
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: 'var(--font-display)', fontSize: '62px', fontWeight: 900, color: '#ffffff', lineHeight: 1, textShadow: '0 0 40px rgba(16,185,129,0.35)' }}
        >
          $125,000
        </motion.div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#10b981', fontWeight: 700 }}>Business Term Loan · Funded</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />

      {/* FICO SBSS Score */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>
              FICO SBSS Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '38px', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                {sbssScore}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
                / {sbssMax}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ padding: '4px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '6px', fontFamily: 'var(--font-body)', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
              Excellent
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
              210–300 range
            </div>
          </div>
        </div>

        {/* SBSS bar with threshold markers */}
        <div style={{ position: 'relative', marginBottom: '6px' }}>
          <div style={{ height: '7px', background: 'rgba(255,255,255,0.07)', borderRadius: '999px', overflow: 'visible', position: 'relative' }}>
            {/* Segments: Poor (red) | Fair (amber) | Good (teal) | Excellent (green) */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '999px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${(159/300)*100}%`, background: 'rgba(239,68,68,0.25)' }} />
              <div style={{ width: `${(30/300)*100}%`, background: 'rgba(245,158,11,0.3)' }} />
              <div style={{ width: `${(20/300)*100}%`, background: 'rgba(20,184,166,0.35)' }} />
              <div style={{ flex: 1, background: 'rgba(16,185,129,0.2)' }} />
            </div>
            {/* Filled progress */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${sbssPercent}%` }}
              transition={{ delay: 0.9, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 55%, #34d399 100%)', borderRadius: '999px', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }}
            />
            {/* Threshold marker at 160 */}
            <div style={{ position: 'absolute', top: '-3px', left: `${(160/300)*100}%`, width: '2px', height: '13px', background: 'rgba(255,255,255,0.5)', borderRadius: '1px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'rgba(255,255,255,0.25)' }}>0 · Poor</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>160 = bankable threshold</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: '#10b981', fontWeight: 700 }}>300 · Max</span>
          </div>
        </div>
      </div>

      {/* Capital paths unlocked at 270 */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
          Capital Paths Unlocked
        </div>
        {[
          { label: 'SBA 7(a) Loan', amount: 'Up to $5M', conf: 'High', color: '#10b981' },
          { label: 'Business Credit Line', amount: 'Up to $750K', conf: 'High', color: '#10b981' },
          { label: 'Equipment Financing', amount: 'Up to $500K', conf: 'High', color: '#10b981' },
        ].map((p) => (
          <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: '6px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', marginBottom: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: '#ffffff', fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{p.amount}</div>
              </div>
            </div>
            <div style={{ padding: '2px 7px', background: 'rgba(16,185,129,0.15)', borderRadius: '4px', fontFamily: 'var(--font-body)', fontSize: '9px', color: '#10b981', fontWeight: 700 }}>
              {p.conf}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '11px 14px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>
            This profile took 10 minutes to build
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
            See your real profile →
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 900, color: '#10b981', opacity: 0.6 }}>✓</div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SIGNAL CARD — "The 17 signals" grid
// ════════════════════════════════════════════════════════════════════════════════
function SignalCard({ title, description, icon: Icon, index }: {
  title: string;
  description: string;
  icon: React.ElementType;
  index: number;
}) {
  return (
    <FadeIn delay={index * 0.08}>
      <div style={{
        padding: '28px', background: 'var(--surface-1)',
        border: '1px solid var(--border)', borderRadius: '12px',
        height: '100%',
        transition: 'border-color 0.2s',
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <Icon style={{ width: '18px', height: '18px', color: '#10b981' }} />
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '15px',
          fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '13px',
          color: 'var(--muted-foreground)', lineHeight: 1.6,
        }}>
          {description}
        </div>
      </div>
    </FadeIn>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// GOAL STEP — Visual 3-goal journey
// ════════════════════════════════════════════════════════════════════════════════
function GoalStep({ number, label, title, description, capital, tags, color, index }: {
  number: string; label: string; title: string; description: string;
  capital: string; tags: string[]; color: string; index: number;
}) {
  return (
    <FadeIn delay={index * 0.12}>
      <div style={{
        padding: '32px', background: 'var(--surface-1)',
        border: `1px solid ${color}30`,
        borderTop: `3px solid ${color}`,
        borderRadius: '0 0 12px 12px',
        position: 'relative',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '4px 12px', background: `${color}12`,
          border: `1px solid ${color}30`, borderRadius: '6px',
          marginBottom: '20px',
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '11px',
            fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Goal {number} · {label}
          </span>
        </div>

        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '22px',
          fontWeight: 800, color: 'var(--foreground)', marginBottom: '12px',
          lineHeight: 1.2,
        }}>
          {title}
        </div>

        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '14px',
          color: 'var(--muted-foreground)', lineHeight: 1.65,
          marginBottom: '20px',
        }}>
          {description}
        </div>

        <div style={{
          padding: '12px 16px', background: `${color}08`,
          borderRadius: '8px', marginBottom: '16px',
        }}>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '11px',
            color: 'var(--muted-foreground)', marginBottom: '4px',
          }}>
            Capital Range
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '18px',
            fontWeight: 700, color: color,
          }}>
            {capital}
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tags.map(t => (
            <span key={t} style={{
              padding: '4px 10px', background: 'var(--surface-2)',
              border: '1px solid var(--border)', borderRadius: '4px',
              fontFamily: 'var(--font-body)', fontSize: '11px',
              color: 'var(--muted-foreground)',
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </FadeIn>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PRICING CARD — Membership tier
// ════════════════════════════════════════════════════════════════════════════════
function PricingCard({ tier, price, label, description, features, cta, highlight, color }: {
  tier: string; price: string; label: string; description: string;
  features: string[]; cta: string; highlight?: boolean; color: string;
}) {
  return (
    <div style={{
      padding: '36px', background: highlight ? '#0d1117' : 'var(--surface-1)',
      border: highlight ? `2px solid ${color}` : '1px solid var(--border)',
      borderRadius: '16px', position: 'relative',
      boxShadow: highlight ? `0 0 60px ${color}20` : 'none',
      flex: 1, minWidth: '260px',
    }}>
      {highlight && (
        <div style={{
          position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
          padding: '4px 14px', background: color, borderRadius: '6px',
          fontFamily: 'var(--font-body)', fontSize: '11px',
          fontWeight: 700, color: '#000',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Most Popular
        </div>
      )}

      <div style={{ marginBottom: '8px' }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
          color: color, textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          {tier}
        </span>
      </div>

      <div style={{ marginBottom: '6px' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '44px',
          fontWeight: 900, color: highlight ? '#ffffff' : 'var(--foreground)',
          lineHeight: 1,
        }}>
          {price}
        </span>
        {price !== 'Free' && (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '14px',
            color: 'var(--muted-foreground)', marginLeft: '6px',
          }}>
            /month
          </span>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)', fontSize: '17px',
        fontWeight: 700, color: highlight ? '#ffffff' : 'var(--foreground)',
        marginBottom: '8px',
      }}>
        {label}
      </div>

      <div style={{
        fontFamily: 'var(--font-body)', fontSize: '13px',
        color: 'var(--muted-foreground)', lineHeight: 1.6,
        marginBottom: '28px', minHeight: '54px',
      }}>
        {description}
      </div>

      <div style={{ marginBottom: '28px' }}>
        {features.map((f) => (
          <div key={f} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            marginBottom: '10px',
          }}>
            <CheckCircle style={{
              width: '15px', height: '15px', color,
              flexShrink: 0, marginTop: '2px',
            }} />
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: highlight ? 'rgba(255,255,255,0.85)' : 'var(--muted-foreground)',
              lineHeight: 1.4,
            }}>
              {f}
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/business-assessment"
        style={{
          display: 'block', textAlign: 'center',
          padding: '14px', borderRadius: '10px',
          fontFamily: 'var(--font-body)', fontSize: '13px',
          fontWeight: 700, textDecoration: 'none',
          background: highlight ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'transparent',
          color: highlight ? '#000' : color,
          border: highlight ? 'none' : `1px solid ${color}`,
          letterSpacing: '0.03em',
        }}
      >
        {cta}
      </Link>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE
// ════════════════════════════════════════════════════════════════════════════════
export function LandingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [pricing, setPricing] = useState<MembershipPricing>(getMembershipPricingSync());

  useEffect(() => {
    getMembershipPricing().then(setPricing);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--foreground)',
      overflowX: 'hidden',
    }}>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* NAV */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <nav className="landing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(var(--background-rgb, 255,255,255), 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/bankableiq-logo-wide.png"
            alt="Bankable IQ"
            style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
          />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a href="#how-it-works" className="landing-nav-links" style={{
            padding: '8px 16px',
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: 'var(--muted-foreground)', textDecoration: 'none',
            fontWeight: 500,
          }}>
            How It Works
          </a>
          <a href="#pricing" className="landing-nav-links" style={{
            padding: '8px 16px',
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: 'var(--muted-foreground)', textDecoration: 'none',
            fontWeight: 500,
          }}>
            Pricing
          </a>
          <Link to="/login" className="landing-nav-links" style={{
            padding: '8px 16px',
            fontFamily: 'var(--font-body)', fontSize: '13px',
            color: 'var(--muted-foreground)', textDecoration: 'none',
            fontWeight: 500,
          }}>
            Sign In
          </Link>
          <Link to="/business-assessment" className="landing-cta-pill" style={{
            padding: '10px 22px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            fontFamily: 'var(--font-body)', fontSize: '12px',
            fontWeight: 700, textDecoration: 'none', borderRadius: '8px',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
          }}>
            Get Your FundScore →
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HERO — Identity + Wedge + Loss Aversion                                */}
      {/* Chase: Lead with IDENTITY. They are a builder. Not a failure.           */}
      {/* Wedge: Separate them from the enemy (the hidden system, not themselves) */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-hero-padding" style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        padding: '120px 40px 80px',
        maxWidth: '1400px', margin: '0 auto',
      }}>
        <div className="landing-hero-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '60px', alignItems: 'center', width: '100%',
        }}>

          {/* LEFT — Copy */}
          <div>
            {/* Micro-compliance opener — get early small "yes" agreements */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '6px 14px', background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)', borderRadius: '6px',
                marginBottom: '28px',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '11px',
                color: '#10b981', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>
                AI-Powered Capital Readiness Platform
              </span>
            </motion.div>

            {/* Primary identity + pattern interrupt headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(34px, 4.2vw, 54px)',
                fontWeight: 900, lineHeight: 1.1,
                marginBottom: '28px', maxWidth: '600px',
                letterSpacing: '-0.02em',
              }}
            >
              You built the business.<br />
              <span style={{ color: '#10b981' }}>The system never told you the rules.</span>
            </motion.h1>

            {/* Wedge statement — not your fault, here's why */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '17px',
                color: 'var(--foreground)', lineHeight: 1.65,
                marginBottom: '16px', maxWidth: '520px', fontWeight: 500,
              }}
            >
              Lenders score businesses on 17 signals before approving a dollar. Most business owners have never seen that scorecard.
            </motion.p>

            {/* Loss aversion — what they're leaving on the table */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.6 }}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '15px',
                color: 'var(--muted-foreground)', lineHeight: 1.65,
                marginBottom: '32px', maxWidth: '500px',
              }}
            >
              Every month you apply without knowing your profile is a month you're paying higher rates, getting smaller amounts, or getting rejected entirely — for reasons that were completely fixable.
            </motion.p>

            {/* CTA + micro-commitment framing */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.55 }}
              style={{ marginBottom: '28px' }}
            >
              <Link
                to="/business-assessment"
                className="landing-hero-cta"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '17px 40px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)', fontSize: '15px',
                  fontWeight: 800, textDecoration: 'none', borderRadius: '10px',
                  boxShadow: '0 8px 28px rgba(16,185,129,0.35)',
                  letterSpacing: '0.01em',
                }}
              >
                See Your Free FundScore
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <div style={{
                marginTop: '10px',
                fontFamily: 'var(--font-body)', fontSize: '12px',
                color: 'var(--muted-foreground)',
              }}>
                10 minutes · no credit pull · no bank login required
              </div>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}
            >
              {[
                { icon: Lock, text: 'No credit pull' },
                { icon: Shield, text: 'Bank-grade security' },
                { icon: Clock, text: 'Results in 10 min' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <Icon style={{ width: '13px', height: '13px', color: '#10b981' }} />
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '12px',
                    color: 'var(--muted-foreground)',
                  }}>
                    {text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Live Score Preview Card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <LiveScoreCard />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* THE INVISIBLE WALL — Pattern language + numbers = credibility          */}
      {/* Chase: Specificity = Credibility. Not "most" — "33 million."            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section-padding" style={{
        padding: '80px 40px',
        background: 'var(--surface-1)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{
                display: 'inline-block', padding: '4px 14px',
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '6px', marginBottom: '20px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>
                  The Hidden Problem
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 800, lineHeight: 1.15,
                marginBottom: '16px', letterSpacing: '-0.02em',
              }}>
                $300 billion in capital gets denied every year.<br />
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Most of those denials were preventable.</span>
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px',
                color: 'var(--muted-foreground)', maxWidth: '600px',
                margin: '0 auto', lineHeight: 1.7,
              }}>
                The businesses that get approved aren't luckier. They aren't more successful. They just knew what lenders were looking for — and they prepared for it.
              </p>
            </div>
          </FadeIn>

          <div className="landing-stats-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px', background: 'var(--border)',
            border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden',
          }}>
            {[
              {
                stat: '33M',
                label: 'Small businesses denied each year',
                note: 'Not because they are not viable. Because their profile was not lender-ready.',
                color: '#ef4444',
              },
              {
                stat: '76%',
                label: 'Of denials cite preventable causes',
                note: 'Compliance gaps, credit profile errors, missing documentation, and wrong product targeting.',
                color: '#f59e0b',
              },
              {
                stat: '17',
                label: 'Lender signals analyzed by FORGE™',
                note: 'Your credit score is 1 of 17. The other 16 determine whether lenders want to resell your loan.',
                color: '#10b981',
              },
            ].map(({ stat, label, note, color }) => (
              <FadeIn key={stat}>
                <div className="landing-stat-cell" style={{
                  padding: '40px 32px', background: 'var(--surface-1)',
                  textAlign: 'center',
                }}>
                  <div className="landing-stat-number" style={{
                    fontFamily: 'var(--font-display)', fontSize: '56px',
                    fontWeight: 900, color, marginBottom: '12px', lineHeight: 1,
                  }}>
                    {stat}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '15px',
                    fontWeight: 700, color: 'var(--foreground)',
                    marginBottom: '12px',
                  }}>
                    {label}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    color: 'var(--muted-foreground)', lineHeight: 1.6,
                  }}>
                    {note}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FORGE™ AI SECTION — The AI story                                        */}
      {/* Chase: Story = identity shift. They become the type of person who uses  */}
      {/* AI to win, not the person who "tries to figure it out."                 */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section-padding" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="landing-forge-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '64px', alignItems: 'center',
          }}>

            {/* Left — FORGE visual */}
            <FadeIn direction="left">
              <div style={{
                background: '#0d1117',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '16px', padding: '36px',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Top glow */}
                <div style={{
                  position: 'absolute', top: '-60px', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '200px', height: '200px',
                  background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  marginBottom: '28px',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Brain style={{ width: '22px', height: '22px', color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: '20px',
                      fontWeight: 900, color: '#ffffff',
                    }}>
                      FORGE™ AI
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)', fontSize: '11px',
                      color: '#10b981', fontWeight: 600,
                    }}>
                      Funding Optimization & Readiness Guidance Engine
                    </div>
                  </div>
                </div>

                {[
                  { label: 'Credit profile analyzed', value: '12 behavioral signals', done: true },
                  { label: 'Compliance gaps identified', value: '4 items require attention', done: true },
                  { label: 'Product matching complete', value: '5 products qualified', done: true },
                  { label: 'Capital path generated', value: 'Q1 roadmap ready', done: true },
                  { label: 'FORGE coaching session', value: 'Available now', done: false },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: item.done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${item.done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: '8px', marginBottom: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: item.done ? '#10b981' : 'rgba(255,255,255,0.2)',
                      }} />
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '12px',
                        color: item.done ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)',
                      }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: '11px',
                      color: item.done ? '#10b981' : 'rgba(255,255,255,0.2)',
                      fontWeight: 600,
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </FadeIn>

            {/* Right — Copy */}
            <FadeIn direction="right">
              <div>
                <div style={{
                  display: 'inline-block', padding: '4px 14px',
                  background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '6px', marginBottom: '20px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '11px',
                    color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                  }}>
                    Powered by FORGE™ AI
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(26px, 3vw, 38px)',
                  fontWeight: 800, lineHeight: 1.15,
                  marginBottom: '20px', letterSpacing: '-0.02em',
                }}>
                  The first AI built specifically to make your business look like a{' '}
                  <span style={{ color: '#10b981' }}>lender's ideal borrower.</span>
                </h2>

                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '15px',
                  color: 'var(--muted-foreground)', lineHeight: 1.7,
                  marginBottom: '16px',
                }}>
                  FORGE™ doesn't just analyze your data. It reads the same signals a lender's underwriting model reads — and tells you exactly what to change, in what order, for the maximum impact on your approval odds.
                </p>

                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '15px',
                  color: 'var(--muted-foreground)', lineHeight: 1.7,
                  marginBottom: '28px',
                }}>
                  It knows that a specific type of account opened 90 days before application reduces approval rates by 23%. It knows which compliance items lenders use to evaluate loan resaleability. It knows the thresholds that separate "maybe" from "yes."
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {[
                    'Analyzes 17 lender signals against your profile',
                    'Ranks every gap by its impact on approvals',
                    'Generates a personal capital roadmap for 30/60/90 days',
                    'Coaches you through each compliance module',
                    'Updates your capital access as your profile improves',
                  ].map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{
                        fontFamily: 'var(--font-body)', fontSize: '14px',
                        color: 'var(--foreground)', lineHeight: 1.4,
                      }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to="/business-assessment" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '8px',
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', fontFamily: 'var(--font-body)', fontSize: '13px',
                  fontWeight: 700, textDecoration: 'none',
                }}>
                  See Your FORGE™ Analysis →
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* THE 3-GOAL SYSTEM — Future pace + completion pull                       */}
      {/* Chase: Show them the full journey. People want a map, not a miracle.    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="landing-section-padding" style={{
        padding: '96px 40px',
        background: 'var(--surface-1)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{
                display: 'inline-block', padding: '4px 14px',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: '6px', marginBottom: '20px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>
                  The 3-Goal System
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 800, lineHeight: 1.15,
                marginBottom: '16px', letterSpacing: '-0.02em',
              }}>
                Not a product. A capital progression system.
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px',
                color: 'var(--muted-foreground)', maxWidth: '600px',
                margin: '0 auto', lineHeight: 1.7,
              }}>
                Bankable IQ maps the exact path from where your business is today to where it can access bank-grade capital — and shows you the fastest way through.
              </p>
            </div>
          </FadeIn>

          <div className="landing-goals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <GoalStep
              index={0}
              number="01"
              label="Start Here"
              title="Get Your FundScore & Access Initial Capital"
              description="Know exactly where you stand. Get your full capital readiness profile, see every product you qualify for right now, and apply for funding with confidence — not guesswork."
              capital="$5K – $250K"
              tags={['Revenue Loans', 'Business Credit', 'Equipment Financing', 'MCA Options']}
              color="#6366f1"
            />
            <GoalStep
              index={1}
              number="02"
              label="Become Bankable"
              title="Build the Profile That Banks and the SBA Require"
              description="Complete 13 compliance modules that transform how lenders evaluate your risk. This is the work that less than 1% of businesses ever do — and why less than 1% ever access bank capital."
              capital="$50K – $500K"
              tags={['Business Credit File', 'Bank Statements', 'Entity Structure', 'Compliance Score']}
              color="#10b981"
            />
            <GoalStep
              index={2}
              number="03"
              label="Full Capital Stack"
              title="Access SBA Loans, Bank Lines & Institutional Capital"
              description="The rates the banks reserve for businesses that have done the work. 9–12% APR, multi-year terms, $500K–$5M — the capital that changes what a business can become."
              capital="$500K – $5M"
              tags={['SBA 7(a)', 'Bank Lines of Credit', 'Commercial Real Estate', 'SBA 504']}
              color="#f59e0b"
            />
          </div>

          <FadeIn delay={0.3}>
            <div style={{
              marginTop: '40px', padding: '24px 32px',
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: '12px', textAlign: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '14px',
                color: 'var(--muted-foreground)',
              }}>
                <strong style={{ color: 'var(--foreground)' }}>The average Bankable IQ member reaches Goal #2 in 60–90 days.</strong>
                {' '}Most businesses that do the compliance work unlock 3–5x more capital than they had before — at significantly lower rates.
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS — Process steps                                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section-padding" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 800, lineHeight: 1.15,
                marginBottom: '16px', letterSpacing: '-0.02em',
              }}>
                Start in 10 minutes.<br />
                <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>No guessing. No bank login. No credit pull.</span>
              </h2>
            </div>
          </FadeIn>

          <div className="landing-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[
              {
                icon: BarChart3, step: '01',
                title: 'Take the FundScore Assessment',
                description: '24 questions. 10 minutes. We build your complete capital readiness profile across all 17 lender signals.',
                color: '#6366f1',
              },
              {
                icon: Eye, step: '02',
                title: 'See Your Full Profile',
                description: 'Your FundScore, every gap in your profile, every product you qualify for — ranked by confidence.',
                color: '#10b981',
              },
              {
                icon: Target, step: '03',
                title: 'Get Your Capital Path',
                description: 'FORGE™ maps the highest-impact changes in 30, 60, and 90 days. Know exactly what to do and in what order.',
                color: '#f59e0b',
              },
              {
                icon: TrendingUp, step: '04',
                title: 'Unlock Larger Capital',
                description: 'As your profile strengthens, new products unlock. Watch your access to capital grow month by month.',
                color: '#ef4444',
              },
            ].map(({ icon: Icon, step, title, description, color }, i) => (
              <FadeIn key={step} delay={i * 0.1}>
                <div style={{
                  padding: '28px 24px', background: 'var(--surface-1)',
                  border: '1px solid var(--border)', borderRadius: '12px',
                  borderTop: `3px solid ${color}`,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '10px',
                    fontWeight: 700, color, textTransform: 'uppercase',
                    letterSpacing: '0.12em', marginBottom: '16px',
                  }}>
                    Step {step}
                  </div>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${color}12`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Icon style={{ width: '18px', height: '18px', color }} />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '15px',
                    fontWeight: 700, color: 'var(--foreground)',
                    marginBottom: '10px', lineHeight: 1.2,
                  }}>
                    {title}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    color: 'var(--muted-foreground)', lineHeight: 1.6,
                  }}>
                    {description}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* IDENTITY SHIFT SECTION — Who they become                               */}
      {/* Chase: The most powerful persuasion is identity-based. "You're not     */}
      {/* someone who gets rejected. You're the 1%."                             */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section-padding" style={{
        padding: '80px 40px',
        background: '#0d1117',
        borderTop: '1px solid rgba(16,185,129,0.15)',
        borderBottom: '1px solid rgba(16,185,129,0.15)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
              color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em',
              marginBottom: '28px',
            }}>
              The 1% Stat That Changes Everything
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 900, color: '#ffffff',
              lineHeight: 1.1, letterSpacing: '-0.02em',
              marginBottom: '28px',
            }}>
              Less than 1% of businesses are bankable.<br />
              <span style={{ color: '#10b981' }}>Bankable IQ exists to change that number.</span>
            </h2>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '17px',
              color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
              marginBottom: '16px',
            }}>
              Not because most businesses aren't viable. Because the compliance work that makes a business "bankable" has never been explained, organized, or made accessible to the people who need it most.
            </p>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '16px',
              color: 'rgba(255,255,255,0.8)', lineHeight: 1.7,
              marginBottom: '40px', fontWeight: 500,
            }}>
              Until now. The exact steps. The exact order. With an AI coach who knows every lender's threshold and tells you what to work on next.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
              {[
                { number: '<1%', label: 'of businesses are bankable today' },
                { number: '13', label: 'compliance modules to join them' },
                { number: '60–90', label: 'days average to reach bankable' },
              ].map(({ number, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '44px',
                    fontWeight: 900, color: '#10b981', lineHeight: 1, marginBottom: '8px',
                  }}>
                    {number}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    color: 'rgba(255,255,255,0.5)', maxWidth: '140px', lineHeight: 1.4,
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PRICING — Tier comparison                                               */}
      {/* Chase: Anchor the premium first. Free is the door; paid is the house.  */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="landing-section-padding" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{
                display: 'inline-block', padding: '4px 14px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '6px', marginBottom: '20px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>
                  Membership
                </span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(26px, 3.5vw, 42px)',
                fontWeight: 800, lineHeight: 1.15,
                marginBottom: '16px', letterSpacing: '-0.02em',
              }}>
                Start free. Scale when you're ready.
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '16px',
                color: 'var(--muted-foreground)', maxWidth: '560px',
                margin: '0 auto', lineHeight: 1.7,
              }}>
                Every membership starts with a free FundScore. Upgrade to unlock the full compliance system and coaching that makes you bankable.
              </p>
            </div>
          </FadeIn>

          <div className="landing-pricing-grid" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <PricingCard
              tier="Free Member"
              price="Free"
              label="Goal #1 Access"
              description="Start with a complete picture of where you stand — and the funding products available to you right now."
              features={[
                'FundScore Assessment (24 questions)',
                'Capital readiness profile',
                'Pre-qualified funding matches',
                'Apply for initial funding',
                'View bankable status indicator',
              ]}
              cta="Get Your Free FundScore"
              color="#6366f1"
            />
            <PricingCard
              tier="Virtual Coached"
              price={pricing.virtual.monthlyDisplay}
              label="Goal #2 + AI Coaching"
              description="The full compliance system with FORGE™ AI coaching every step of the way. Built to make you bankable in 60–90 days."
              features={[
                'Everything in Free',
                '13 Lender Compliance modules',
                '90+ virtual coaching videos',
                'FORGE™ AI Coach full access',
                'Step-by-step bankability guide',
                'Goal #2 & Goal #3 tracking',
              ]}
              cta="Start Virtual Coaching"
              highlight
              color="#10b981"
            />
            <PricingCard
              tier="Live Coached"
              price={pricing.live.monthlyDisplay}
              label="Done-For-You + Live Coach"
              description="A real human coach handles the compliance work and stays with your business for 12 months. For owners who want it done right."
              features={[
                'Everything in Virtual',
                'Done-for-you compliance completion',
                'Live professional coach (12 months)',
                'Business directory listings',
                'Priority application support',
                'Direct lender introductions',
              ]}
              cta="Get a Live Coach"
              color="#f59e0b"
            />
          </div>

          <FadeIn delay={0.2}>
            <p style={{
              textAlign: 'center', marginTop: '28px',
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: 'var(--muted-foreground)',
            }}>
              All plans include a free FundScore assessment. Cancel anytime.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FAQ */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section-padding" style={{
        padding: '80px 40px',
        background: 'var(--surface-1)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <FadeIn>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '32px',
              fontWeight: 800, textAlign: 'center',
              marginBottom: '48px', letterSpacing: '-0.02em',
            }}>
              Common questions
            </h2>
          </FadeIn>

          {[
            {
              q: 'What is a FundScore?',
              a: 'Your FundScore is a 0–1000 capital readiness score built from 17 lender signals across six dimensions: credit profile, business financials, time in business, compliance readiness, documentation, and market position. It\'s the score lenders use — before they ever look at your credit score.',
            },
            {
              q: 'Do I need good credit to start?',
              a: 'No. Bankable IQ is designed for businesses at every stage of their credit journey. Many users start with sub-600 credit scores and use the platform to understand what products are available right now while building toward bank-grade products in 60–90 days.',
            },
            {
              q: 'Will this pull my credit?',
              a: 'No. The FundScore Assessment uses reported ranges, not credit bureau pulls. There is no hard inquiry, no impact to your credit score, and no connection to your bank accounts.',
            },
            {
              q: 'Who is this for — people who have been denied, or people who want to apply?',
              a: 'Both. If you\'ve been denied, Bankable IQ shows you exactly why and what to fix. If you haven\'t applied yet, Bankable IQ makes sure you\'re prepared before you walk into that conversation — so you don\'t get the answer most businesses get.',
            },
            {
              q: 'What makes Bankable IQ different from a loan broker?',
              a: 'A broker finds you a product. Bankable IQ changes your profile so you qualify for better products — lower rates, larger amounts, longer terms. The difference between a 24% merchant cash advance and a 9% SBA loan is bankability. That\'s what Bankable IQ builds.',
            },
          ].map(({ q, a }, i) => (
            <FadeIn key={i} delay={i * 0.07}>
              <div style={{
                borderBottom: '1px solid var(--border)',
                marginBottom: '4px',
              }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '20px 0', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '16px',
                    fontWeight: 700, color: 'var(--foreground)',
                  }}>
                    {q}
                  </span>
                  <ChevronDown style={{
                    width: '18px', height: '18px',
                    color: 'var(--muted-foreground)',
                    transform: faqOpen === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s',
                    flexShrink: 0, marginLeft: '16px',
                  }} />
                </button>
                {faqOpen === i && (
                  <div style={{
                    padding: '0 0 20px',
                    fontFamily: 'var(--font-body)', fontSize: '14px',
                    color: 'var(--muted-foreground)', lineHeight: 1.7,
                  }}>
                    {a}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA — Identity anchor + completion pull                           */}
      {/* Chase: End with an identity statement. They decide who they are here.   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section className="landing-section-padding" style={{ padding: '120px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700,
              color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em',
              marginBottom: '24px',
            }}>
              The only thing left is the decision
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4.5vw, 56px)',
              fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-0.025em', marginBottom: '28px',
            }}>
              The approved businesses didn't work harder.<br />
              <span style={{ color: '#10b981' }}>They applied prepared.</span>
            </h2>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '17px',
              color: 'var(--muted-foreground)', lineHeight: 1.7,
              marginBottom: '12px',
            }}>
              There's nothing fundamentally different between a business that gets approved for $500K at 9% and one that gets declined. The difference is the profile they walked in with.
            </p>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '16px',
              color: 'var(--foreground)', lineHeight: 1.7,
              marginBottom: '44px', fontWeight: 500,
            }}>
              Your FundScore takes 10 minutes. No credit pull. No bank login. And it shows you something most business owners never see: exactly how a lender sees your business — and exactly how to change it.
            </p>

            <Link
              to="/business-assessment"
              className="landing-hero-cta"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                padding: '20px 52px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontFamily: 'var(--font-display)', fontSize: '16px',
                fontWeight: 800, textDecoration: 'none',
                boxShadow: '0 12px 36px rgba(16,185,129,0.35)',
                letterSpacing: '0.01em',
              }}
            >
              Get Your Free FundScore
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>

            <div style={{ marginTop: '16px' }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '12px',
                color: 'var(--muted-foreground)',
              }}>
                Free forever · no credit pull · no bank login · 10 minutes
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <footer style={{
        padding: '48px 40px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-1)',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '18px',
              fontWeight: 900, color: 'var(--foreground)',
            }}>
              FUND
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '18px',
              fontWeight: 900, color: '#10b981',
            }}>
              READY™
            </span>
          </div>

          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { to: '/business-assessment', label: 'Get FundScore' },
              { to: '/login', label: 'Sign In' },
              { to: '#how-it-works', label: 'How It Works' },
              { to: '#pricing', label: 'Pricing' },
            ].map(({ to, label }) => (
              <Link key={label} to={to} style={{
                fontFamily: 'var(--font-body)', fontSize: '13px',
                color: 'var(--muted-foreground)', textDecoration: 'none',
              }}>
                {label}
              </Link>
            ))}
          </div>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '12px',
            color: 'var(--muted-foreground)', textAlign: 'center',
          }}>
            © {new Date().getFullYear()} Bankable Business Solutions. All rights reserved. · Bankable IQ is a capital readiness platform, not a lender. Funding results depend on individual business profiles.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
