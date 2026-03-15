// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Public Landing Page
// Per P2.1 Figma Spec: Convert skepticism into action
// "You weren't denied because you failed. You were denied because you weren't prepared."
// ════════════════════════════════════════════════════════════════════════════════

import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Shield, BarChart3, Clock, CheckCircle, ArrowRight, Lock, TrendingUp } from 'lucide-react';

// ════════════════════════════════════════════════════════════════════════════════
// SCORE PREVIEW CARD — Floating card showing what user will get
// ════════════════════════════════════════════════════════════════════════════════
function ScorePreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 2 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '32px',
        maxWidth: '360px',
        boxShadow: '0 0 60px rgba(138, 184, 32, 0.15)',
        position: 'relative',
      }}
    >
      {/* Lime edge glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--primary), var(--primary-hover))',
        borderRadius: '8px 8px 0 0',
      }} />
      
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ 
          fontFamily: 'var(--font-body)', 
          fontSize: '11px', 
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: '8px',
        }}>
          Your FundScore
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '72px',
          fontWeight: 800,
          color: '#a0a020', // Developing band color
          lineHeight: 1,
        }}>
          624
        </div>
        <div style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '16px',
          fontStyle: 'italic',
          color: 'var(--muted-foreground)',
          marginTop: '4px',
        }}>
          Developing
        </div>
      </div>

      {/* Product chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
        {['Revenue Loan', 'Equipment Finance', 'Credit Line'].map((product) => (
          <div
            key={product}
            style={{
              padding: '6px 12px',
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              borderRadius: '4px',
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--primary)',
              fontWeight: 500,
            }}
          >
            {product}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: 'var(--surface-2)',
        borderRadius: '6px',
        textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
          3 products unlocked
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
          Up to $125K accessible today
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PROBLEM CARD — Shows why businesses get denied
// ════════════════════════════════════════════════════════════════════════════════
function ProblemCard({ stat, title, description }: { stat: string; title: string; description: string }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      border: '1px solid var(--border)',
      borderRadius: '0',
      padding: '32px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '48px',
        fontWeight: 800,
        color: 'var(--primary)',
        marginBottom: '12px',
      }}>
        {stat}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--foreground)',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        color: 'var(--muted-foreground)',
        lineHeight: 1.6,
      }}>
        {description}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// SOLUTION STEP — Shows the 3-step process
// ════════════════════════════════════════════════════════════════════════════════
function SolutionStep({ number, title, description, icon: Icon }: { 
  number: number; 
  title: string; 
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'var(--primary-bg)',
        border: '2px solid var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <Icon style={{ width: '28px', height: '28px', color: 'var(--primary)' }} />
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        color: 'var(--primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        marginBottom: '8px',
      }}>
        Step {number}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--foreground)',
        marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        color: 'var(--muted-foreground)',
        lineHeight: 1.6,
        maxWidth: '280px',
      }}>
        {description}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
export function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--background)',
      color: 'var(--foreground)',
    }}>
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* NAVIGATION BAR */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(13, 15, 11, 0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--foreground)' }}>
            FUND
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>
            READY
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
            ™
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link 
            to="/login" 
            style={{ 
              fontFamily: 'var(--font-body)', 
              fontSize: '14px', 
              color: 'var(--muted-foreground)',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
          <Link
            to="/business-assessment"
            style={{
              padding: '10px 20px',
              background: 'var(--primary)',
              color: 'var(--background)',
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              textDecoration: 'none',
              borderRadius: '0',
            }}
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — Viewport height */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 40px 80px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '60px',
          alignItems: 'center',
          width: '100%',
        }}>
          {/* Left Column — Copy */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '24px',
                maxWidth: '600px',
              }}
            >
              You weren't denied <span style={{ color: 'var(--primary)' }}>because you failed.</span>
              <br />
              You were denied because <span style={{ color: 'var(--primary)' }}>you weren't prepared.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'var(--muted-foreground)',
                lineHeight: 1.7,
                marginBottom: '32px',
                maxWidth: '480px',
              }}
            >
              33 million small businesses. 80%+ denied. Not because their business isn't worthy — 
              because no one showed them what lenders actually check.
            </motion.p>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}
            >
              <Link
                to="/business-assessment"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 32px',
                  background: 'var(--primary)',
                  color: 'var(--background)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  borderRadius: '0',
                }}
              >
                Get My FundScore Free
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <a
                href="#how-it-works"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  background: 'transparent',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  border: 'none',
                }}
              >
                See How It Works
              </a>
            </motion.div>

            {/* Trust Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ 
                display: 'flex', 
                gap: '24px', 
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {[
                { icon: Lock, text: 'No bank login' },
                { icon: BarChart3, text: 'No credit pull' },
                { icon: Clock, text: 'Results in 10 min' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
                  <span style={{ 
                    fontFamily: 'var(--font-body)', 
                    fontSize: '12px', 
                    color: 'var(--muted-foreground)',
                  }}>
                    {text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column — Score Preview Card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScorePreviewCard />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* PROBLEM SECTION — 3 columns */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 40px',
        background: 'var(--surface-1)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            The real reasons you were denied.
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            <ProblemCard
              stat="580"
              title="Credit Profile"
              description="Lenders don't just check your score. They check utilization, payment history, inquiries, and 12+ hidden factors."
            />
            <ProblemCard
              stat="14/20"
              title="Compliance Items"
              description="Most businesses are missing 6+ compliance items. 14 of the 20 can be fixed in under 30 days."
            />
            <ProblemCard
              stat="60%"
              title="Documentation"
              description="Incomplete or poorly organized documents cause 60% of preventable denials. Lenders need specific formats."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SOLUTION SECTION — 3 steps */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            How FundReady Works
          </h2>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontStyle: 'italic',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            Three steps. No bank login. No credit pull. Know exactly where you stand.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
          }}>
            <SolutionStep
              number={1}
              icon={BarChart3}
              title="FundScore Assessment"
              description="24 questions. 10 minutes. No bank login. We analyze your fundability across 6 dimensions."
            />
            <SolutionStep
              number={2}
              icon={Shield}
              title="Gap Analysis"
              description="See exactly what's blocking you. Every compliance gap. Every credit issue. Ranked by impact."
            />
            <SolutionStep
              number={3}
              icon={TrendingUp}
              title="Capital Access"
              description="Pre-qualify today. See which products you unlock. Build a 30-90 day path to more capital."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF STRIP */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '48px 40px',
        background: 'var(--surface-2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '40px',
        }}>
          {[
            { number: '33M', label: 'small businesses' },
            { number: '$300B+', label: 'denied annually' },
            { number: '17', label: 'funding products mapped' },
          ].map(({ number, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '40px',
                fontWeight: 800,
                color: 'var(--primary)',
              }}>
                {number}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FINAL CTA SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800,
          marginBottom: '32px',
          maxWidth: '700px',
          margin: '0 auto 32px',
        }}>
          Stop applying unprepared.<br />
          <span style={{ color: 'var(--primary)' }}>Start with your FundScore.</span>
        </h2>

        <Link
          to="/business-assessment"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 48px',
            background: 'var(--primary)',
            color: 'var(--background)',
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            textDecoration: 'none',
            borderRadius: '0',
          }}
        >
          Get My FundScore Free
          <ArrowRight style={{ width: '20px', height: '20px' }} />
        </Link>

        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
        }}>
          {[
            { icon: Lock, text: 'No bank login required' },
            { icon: BarChart3, text: 'No credit pull' },
            { icon: Clock, text: 'Results in 10 minutes' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
              <span style={{ 
                fontFamily: 'var(--font-body)', 
                fontSize: '12px', 
                color: 'var(--muted-foreground)',
              }}>
                {text}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <footer style={{
        padding: '40px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--foreground)' }}>
            FUND
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
            READY
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>
            ™
          </span>
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--muted-foreground)',
        }}>
          © {new Date().getFullYear()} Fundabl. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
