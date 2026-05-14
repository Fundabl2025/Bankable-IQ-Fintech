// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Forgot Password Page
// Sends password reset email via Supabase Auth
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Mail, CheckCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const { isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { supabase } = await import('../../lib/supabase/client');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--background)',
    }}>
      {/* Left Panel — Branding */}
      <div style={{
        flex: '0 0 45%',
        background: 'var(--surface-1)',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid var(--border)',
      }}>
        <div>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img
              src="/images/bankableiq-logo-white.png"
              alt="Bankable IQ"
              style={{
                height: '48px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Link>
        </div>

        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '24px',
          }}>
            Reset your password.
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontStyle: 'italic',
            color: 'var(--muted-foreground)',
            lineHeight: 1.7,
            maxWidth: '400px',
          }}>
            No worries — it happens. Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--muted-foreground)',
        }}>
          &copy; {new Date().getFullYear()} Bankable Business Solutions. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          {sent ? (
            /* Success State */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--primary-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <CheckCircle style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '12px',
              }}>
                Check Your Email
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.7,
                marginBottom: '8px',
              }}>
                We've sent a password reset link to:
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                color: 'var(--foreground)',
                marginBottom: '32px',
              }}>
                {email}
              </p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.7,
                marginBottom: '32px',
              }}>
                Click the link in the email to set a new password. If you don't see it, check your spam folder.
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                <ArrowLeft style={{ width: '16px', height: '16px' }} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* Form State */
            <>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '8px',
              }}>
                Forgot Password
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                marginBottom: '32px',
              }}>
                Remember your password?{' '}
                <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in
                </Link>
              </p>

              {!isConfigured && (
                <div style={{
                  padding: '16px',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: '6px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}>
                  <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--warning)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, color: 'var(--warning)', marginBottom: '4px' }}>
                      Supabase Not Configured
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--muted-foreground)' }}>
                      Password reset requires Supabase. Connect the integration in settings.
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div style={{
                  padding: '16px',
                  background: 'var(--destructive-bg)',
                  border: '1px solid var(--destructive-border)',
                  borderRadius: '6px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <AlertCircle style={{ width: '18px', height: '18px', color: 'var(--destructive)' }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--destructive)' }}>
                    {error}
                  </span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 400,
                    color: 'var(--muted-foreground)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '8px',
                  }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 44px',
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: '0',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: 'var(--foreground)',
                        outline: 'none',
                      }}
                    />
                    <Mail style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: 'var(--muted-foreground)',
                    }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: isConfigured ? 'var(--primary)' : 'var(--muted)',
                    color: isConfigured ? 'var(--background)' : 'var(--muted-foreground)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    border: 'none',
                    borderRadius: '0',
                    cursor: isConfigured ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight style={{ width: '18px', height: '18px' }} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    color: 'var(--muted-foreground)',
                    textDecoration: 'none',
                  }}
                >
                  <ArrowLeft style={{ width: '14px', height: '14px' }} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: var(--muted-foreground);
          opacity: 0.6;
        }
        input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 3px var(--primary-bg);
        }
      `}</style>
    </div>
  );
}

export default ForgotPasswordPage;
