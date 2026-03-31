// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Public Landing Page (PCP Rewrite)
// Full PCP Sequence: Focus → Relevance → Micro-Compliance → Wedge → Authority
// → Tribe → Emotion → Identity → Action
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
        boxShadow: '0 0 60px rgba(16, 185, 129, 0.15)',
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
          color: '#a0a020',
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
              fontFamily: "'Inter', sans-serif",
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
          3 capital paths open at your current profile
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
          Up to $125K accessible today
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
          See what changes in 30, 60, and 90 days
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// PATTERN CARD — Shows patterns that block approval
// ════════════════════════════════════════════════════════════════════════════════
function PatternCard({ stat, title, description }: { stat: string; title: string; description: string }) {
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
        maxWidth: '320px',
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
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/images/fundready-logo.png"
            alt="FundReady"
            style={{
              height: '36px',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            to="/login"
            style={{
              fontFamily: "'Inter', sans-serif",
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
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #9333ea, #3b82f6)',
              color: '#ffffff',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              borderRadius: '1rem',
              boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)',
            }}
          >
            See Your FundScore
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HERO SECTION — PCP Wedge + Micro-Compliance */}
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
                fontFamily: "'Inter', sans-serif",
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: '24px',
                maxWidth: '600px',
              }}
            >
              Most businesses are not denied because <span style={{ color: 'var(--primary)' }}>they are not good enough.</span>
              <br />
              They are denied because <span style={{ color: 'var(--primary)' }}>the system has rules nobody showed them.</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '16px',
                fontStyle: 'italic',
                color: 'var(--muted-foreground)',
                lineHeight: 1.7,
                marginBottom: '16px',
                maxWidth: '500px',
              }}
            >
              There is a scoring model lenders use that most business owners have never seen. It is not just your credit score. It analyzes your business across more than a dozen dimensions — and if you do not know what those are, you are applying blind.
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                color: 'var(--foreground)',
                lineHeight: 1.6,
                marginBottom: '32px',
                maxWidth: '500px',
              }}
            >
              33 million small businesses get denied every year. The ones that get approved are not luckier. <strong style={{ color: 'var(--primary)' }}>They are prepared.</strong>
            </motion.p>

            {/* CTA Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}
            >
              <Link
                to="/business-assessment"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 36px',
                  background: 'linear-gradient(135deg, #9333ea, #3b82f6)',
                  color: '#ffffff',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  borderRadius: '1rem',
                  boxShadow: '0 8px 25px rgba(147, 51, 234, 0.35)',
                }}
              >
                See What Lenders See — Free
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </Link>
              <a
                href="#the-real-pattern"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 24px',
                  background: 'transparent',
                  color: 'var(--muted-foreground)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  border: 'none',
                }}
              >
                Find Out What Is Blocking You
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
                { icon: Clock, text: 'Results in 10 minutes' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
                  <span style={{
                    fontFamily: "'Inter', sans-serif",
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
      {/* THE REAL PATTERN SECTION — PCP Pattern Language + Wedge */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section id="the-real-pattern" style={{
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
            marginBottom: '16px',
          }}>
            There is a reason most businesses keep hitting the same wall.
          </h2>
          <div style={{
            maxWidth: '640px',
            margin: '0 auto 16px',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontStyle: 'italic',
              color: 'var(--muted-foreground)',
              lineHeight: 1.7,
              marginBottom: '8px',
            }}>
              It is rarely the business itself. It is the profile the business presents to lenders.
            </p>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              color: 'var(--muted-foreground)',
              lineHeight: 1.6,
            }}>
              Most business owners have never seen that profile. And lenders have no reason to show it to you.
            </p>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--foreground)',
            textAlign: 'center',
            marginBottom: '48px',
          }}>
            Here are the three patterns that block approval most often at this stage.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            <PatternCard
              stat="580"
              title="Credit Profile"
              description="Lenders do not just look at your score. They analyze utilization, payment history, recent inquiries, and more than a dozen behavioral signals. Most businesses have signals they do not even know are working against them."
            />
            <PatternCard
              stat="14/20"
              title="Compliance Readiness"
              description="Most businesses are missing several compliance items lenders expect before they review an application. The surprising part is that 14 of those 20 items can typically be addressed in under 30 days."
            />
            <PatternCard
              stat="60%"
              title="Documentation Readiness"
              description="Six out of ten application denials involve documentation that was incomplete or not formatted the way lenders require. This is one of the most common preventable reasons businesses do not move forward."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS SECTION — PCP Pace and Lead */}
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
            Three steps. No guessing. No bank login. No credit pull.
          </h2>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '640px',
            margin: '0 auto 48px',
            lineHeight: 1.7,
          }}>
            Most businesses spend months applying and being rejected without understanding what needs to change. FundReady maps the exact picture lenders see and shows you the highest-leverage things to address first.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '40px',
          }}>
            <SolutionStep
              number={1}
              icon={BarChart3}
              title="Your FundScore Assessment"
              description="24 questions. About 10 minutes. We build your full capital readiness profile across six dimensions — the same signals lenders actually weight."
            />
            <SolutionStep
              number={2}
              icon={Shield}
              title="Your Gap Analysis"
              description="See the exact patterns in your profile that are creating friction with lenders. Every compliance gap. Every credit signal. Ranked by the impact each one has on your approval odds."
            />
            <SolutionStep
              number={3}
              icon={TrendingUp}
              title="Your Capital Path"
              description="See which funding products your current profile qualifies for. Then see what opens up in 30, 60, and 90 days as your profile strengthens. Most businesses that follow the plan unlock significantly more capital within the first quarter."
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* SOCIAL PROOF STRIP — PCP Authority + Tribe */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '64px 40px',
        background: 'var(--surface-2)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '40px',
            marginBottom: '32px',
          }}>
            {[
              { number: '33M', label: 'small businesses' },
              { number: '$300B+', label: 'denied annually' },
              { number: '17', label: 'funding products mapped' },
            ].map(({ number, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '40px',
                  fontWeight: 800,
                  color: 'var(--primary)',
                }}>
                  {number}
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: 'var(--muted-foreground)',
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--muted-foreground)',
            lineHeight: 1.7,
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            33 million small businesses in the US alone are navigating a system that was never explained to them. Over $300 billion in capital is denied every year — not because the businesses are not viable, but because the profiles are not ready. FundReady maps 17 funding products against your real profile so you see exactly where you stand and exactly what changes.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* CLOSING CTA SECTION — PCP Identity + Least Resistance */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 800,
          marginBottom: '24px',
          maxWidth: '700px',
          margin: '0 auto 24px',
          lineHeight: 1.2,
        }}>
          At some point, every business owner realizes that applying harder is not the answer.<br />
          <span style={{ color: 'var(--primary)' }}>Applying prepared is.</span>
        </h2>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--muted-foreground)',
          lineHeight: 1.7,
          maxWidth: '600px',
          margin: '0 auto 16px',
        }}>
          The businesses that access bank-grade capital — lower rates, larger amounts, longer terms — are not fundamentally different from yours. They just understood what lenders look for before they applied.
        </p>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          color: 'var(--foreground)',
          lineHeight: 1.7,
          maxWidth: '560px',
          margin: '0 auto 40px',
        }}>
          Your FundScore takes 10 minutes. It does not touch your credit. And it shows you something most business owners have never seen: exactly what your profile looks like from the lender's side.
        </p>

        <Link
          to="/business-assessment"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 52px',
            background: 'linear-gradient(135deg, #9333ea, #3b82f6)',
            color: '#ffffff',
            fontFamily: 'var(--font-display)',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            textDecoration: 'none',
            borderRadius: '1rem',
            boxShadow: '0 10px 30px rgba(147, 51, 234, 0.35)',
          }}
        >
          See Your FundScore Free
          <ArrowRight style={{ width: '20px', height: '20px' }} />
        </Link>

        <div style={{
          marginTop: '24px',
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        }}>
          {[
            { icon: Lock, text: 'No bank login required' },
            { icon: BarChart3, text: 'No credit pull' },
            { icon: Clock, text: 'Results in 10 minutes' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon style={{ width: '14px', height: '14px', color: 'var(--muted-foreground)' }} />
              <span style={{
                fontFamily: "'Inter', sans-serif",
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
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
          fontSize: '13px',
          color: 'var(--muted-foreground)',
          marginBottom: '4px',
        }}>
          The capital readiness platform for small business.
        </p>
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
