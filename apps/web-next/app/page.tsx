/**
 * BANKABLE IQ — Public Landing
 *
 * NOTE: This is the placeholder Next.js App Router landing page during the
 * Vite-to-Next.js parallel migration. The full restyle to BANKABLE IQ Brand v1
 * tokens ships in PR #6.
 *
 * During the migration, this route is available at /next while the existing
 * Vite landing remains canonical at /. See vercel.json for routing strategy.
 */
export default function LandingPage() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#050E2B',
      color: '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'inline-block',
        padding: '6px 14px',
        marginBottom: '24px',
        border: '1px solid #00AEEF',
        borderRadius: 100,
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: '#00AEEF',
      }}>
        Next.js Scaffold · Migration in Progress
      </div>
      <h1 style={{
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        margin: 0,
        background: 'linear-gradient(90deg, #2F2BB8 0%, #137DC5 50%, #00AEEF 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontWeight: 800,
        letterSpacing: '-0.02em',
      }}>
        BANKABLE IQ
      </h1>
      <p style={{
        marginTop: '16px',
        fontSize: '1.1rem',
        maxWidth: '720px',
        color: 'rgba(255,255,255,0.78)',
        lineHeight: 1.5,
      }}>
        The Institutional Readiness Operating System. Bankability Score 0-100.
        Bankability Compass + Wheel Diagnostic. AI Readiness Coaching System.
        Three Outcomes. One platform.
      </p>
      <div style={{
        marginTop: '40px',
        padding: '20px 28px',
        borderRadius: 10,
        backgroundColor: 'rgba(132,94,247,0.08)',
        border: '1px solid rgba(132,94,247,0.2)',
        fontSize: '0.875rem',
        color: 'rgba(255,255,255,0.7)',
        maxWidth: '720px',
      }}>
        <strong style={{ color: '#B197FC' }}>For developers and operators:</strong>{' '}
        This is the Next.js App Router scaffold. The canonical landing page during the migration is the existing Vite app at <code style={{ background: 'rgba(132,94,247,0.15)', padding: '2px 6px', borderRadius: 4 }}>/</code>. The fleet (bot-frontend agent) will migrate pages from <code style={{ background: 'rgba(132,94,247,0.15)', padding: '2px 6px', borderRadius: 4 }}>src/app/pages/</code> into this directory progressively. See <code style={{ background: 'rgba(132,94,247,0.15)', padding: '2px 6px', borderRadius: 4 }}>docs/strategy/NEXTJS-MIGRATION.md</code>.
      </div>
    </main>
  );
}
