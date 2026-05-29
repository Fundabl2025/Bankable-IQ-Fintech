/**
 * BANKABLE IQ — Public Landing
 * Brand: BANKABLE IQ Brand v1 (Figma file y3wOnWeFZqJVUH8xi2MoLZ)
 * Vocabulary: Blueprint v1.8
 */
import { OUTCOMES, MATURITY_LEVELS, SCORE_LABELS } from '@lib/vocabulary';

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--surface-bg)' }}>
      <Nav />
      <Hero />
      <ThreeOutcomes />
      <MaturityLadder />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: 'var(--space-6) var(--space-12)', maxWidth: 1440, margin: '0 auto',
      borderBottom: '1px solid rgba(132,94,247,0.08)',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22,
        background: 'var(--brand-gradient)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>BankableIQ</div>
      <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
        <a href="#how-it-works" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>How It Works</a>
        <a href="#pricing" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Pricing</a>
        <a href="/sign-in" style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Sign In</a>
        <a href="/compass" style={{
          backgroundColor: 'var(--brand-cyan-500)', color: 'var(--brand-navy-950)',
          padding: '10px 18px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 14,
        }}>Run the Bankability Compass</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--space-16) var(--space-12)' }}>
      <div style={{
        display: 'inline-block', padding: '6px 14px', marginBottom: 24,
        border: '1px solid var(--brand-cyan-500)', borderRadius: 'var(--radius-round)',
        fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--text-accent)', fontFamily: 'var(--font-display)', fontWeight: 700,
      }}>
        The Institutional Readiness Operating System
      </div>
      <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)', maxWidth: 1000, marginBottom: 24 }}>
        <span>Capital access is the byproduct of </span>
        <span style={{
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>institutional readiness.</span>
      </h1>
      <p style={{
        fontSize: 'clamp(1rem, 1.4vw, 1.25rem)', color: 'var(--text-secondary)',
        maxWidth: 820, marginBottom: 40, lineHeight: 1.6,
      }}>
        BANKABLE IQ turns operationally active but institutionally unprepared businesses into
        companies banks, lenders, and capital providers actively want to back. Built on the
        Bankability Wheel™ — 4 Domains, 20 Focus Areas, 7 Cs of Institutional Readiness.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <a href="/compass" style={{
          backgroundColor: 'var(--brand-cyan-500)', color: 'var(--brand-navy-950)',
          padding: '14px 28px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 16,
        }}>Run the free Bankability Compass</a>
        <a href="#how-it-works" style={{
          backgroundColor: 'transparent', border: '1px solid var(--surface-border)',
          color: 'var(--text-primary)', padding: '14px 28px', borderRadius: 'var(--radius-md)',
          fontWeight: 600, fontSize: 16,
        }}>See how it works</a>
      </div>
      <p style={{ marginTop: 'var(--space-6)', fontSize: 13, color: 'var(--grey-600)' }}>
        60 seconds · 8 questions · no credit pull · no bank login required
      </p>
    </section>
  );
}

function ThreeOutcomes() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--space-16) var(--space-12)', borderTop: '1px solid var(--surface-border)' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-accent)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>
        The Bankable Capital Promise
      </div>
      <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 16 }}>Three Outcomes. One platform.</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 760, marginBottom: 48, fontSize: 16 }}>
        Most platforms own one outcome. BANKABLE IQ owns the entire arc — and that is what turns
        institutional readiness into the new credit conversation.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {Object.entries(OUTCOMES).map(([key, outcome], i) => (
          <article key={key} style={{
            backgroundColor: 'var(--surface-elevated)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)',
          }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', marginBottom: 12 }}>
              OUTCOME 0{i + 1} · SCORE {outcome.scoreRange}
            </div>
            <h3 style={{ fontSize: 28, marginBottom: 12, lineHeight: 1.15 }}>{outcome.short}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.55, marginBottom: 16 }}>
              {outcome.tagline}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.55 }}>
              {outcome.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MaturityLadder() {
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: 'var(--space-16) var(--space-12)', borderTop: '1px solid var(--surface-border)' }}>
      <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-accent)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 12 }}>
        Bankable Maturity Levels
      </div>
      <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 16 }}>
        {SCORE_LABELS.bankability.name} <span style={{ color: 'var(--text-secondary)' }}>(0-100)</span>
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 760, marginBottom: 48, fontSize: 16 }}>
        Every business sits in exactly one Maturity Level at any time. Cross score {SCORE_LABELS.bankability.threshold} and institutional capital opens up.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {Object.entries(MATURITY_LEVELS).map(([key, level], i) => (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-6)',
            backgroundColor: 'var(--surface-elevated)',
            border: `1px solid ${level.color}40`, borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{
              backgroundColor: level.color, color: 'var(--brand-navy-950)',
              padding: '8px 14px', borderRadius: 'var(--radius-sm)', fontWeight: 800, fontFamily: 'var(--font-display)',
              minWidth: 60, textAlign: 'center', fontSize: 14,
            }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                {level.display}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                Score {level.scoreMin}-{level.scoreMax}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Active Outcome: <span style={{ color: 'var(--text-primary)' }}>{OUTCOMES[level.activeOutcome].short}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--surface-border)', padding: 'var(--space-12)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
            background: 'var(--brand-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>BankableIQ</div>
          <p style={{ fontSize: 12, color: 'var(--grey-600)', marginTop: 6 }}>
            © 2026 Bankable Business Solutions. The Institutional Readiness Operating System.
          </p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--grey-600)', maxWidth: 480 }}>
          BANKABLE IQ™ is a capital readiness platform, not a lender. Funding results depend on individual business profiles. CROA / FCRA / ECOA compliance enforced.
        </div>
      </div>
    </footer>
  );
}
