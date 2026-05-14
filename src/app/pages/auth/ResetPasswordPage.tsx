// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Reset Password Page
// Allows user to set a new password after clicking the email reset link
// Supabase redirects here with a session token in the URL hash
// ════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, ArrowRight, Loader2, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isConfigured } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // On mount, verify we have a valid recovery session from the email link
  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const { supabase } = await import('../../lib/supabase/client');

        // Supabase JS v2 automatically picks up the token from the URL hash
        // and exchanges it for a session via onAuthStateChange
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
              setSessionReady(true);
              setCheckingSession(false);
            }
          }
        );

        // Also check if we already have a session (e.g. the event fired before we subscribed)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
          setCheckingSession(false);
        } else {
          // Give a moment for the hash to be processed
          setTimeout(() => {
            setCheckingSession(false);
          }, 2000);
        }

        return () => subscription?.unsubscribe();
      } catch {
        setCheckingSession(false);
      }
    };

    if (isConfigured) {
      checkRecoverySession();
    } else {
      setCheckingSession(false);
    }
  }, [isConfigured]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { supabase } = await import('../../lib/supabase/client');
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please try again.');
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
            Set a new password.
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontStyle: 'italic',
            color: 'var(--muted-foreground)',
            lineHeight: 1.7,
            maxWidth: '400px',
          }}>
            Choose a strong password to keep your account and capital roadmap secure.
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
          {checkingSession ? (
            /* Loading — verifying recovery token */
            <div style={{ textAlign: 'center' }}>
              <Loader2 style={{ width: '32px', height: '32px', color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                Verifying your reset link...
              </p>
            </div>
          ) : success ? (
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
                Password Updated
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.7,
                marginBottom: '32px',
              }}>
                Your password has been reset successfully. Redirecting you to your dashboard...
              </p>
              <Loader2 style={{ width: '20px', height: '20px', color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          ) : !sessionReady ? (
            /* No valid session — invalid/expired link */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--destructive-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <AlertCircle style={{ width: '32px', height: '32px', color: 'var(--destructive)' }} />
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 700,
                marginBottom: '12px',
              }}>
                Invalid or Expired Link
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                lineHeight: 1.7,
                marginBottom: '32px',
              }}>
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  background: 'var(--primary)',
                  color: 'var(--background)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  textDecoration: 'none',
                  border: 'none',
                  borderRadius: '0',
                }}
              >
                Request New Link
                <ArrowRight style={{ width: '16px', height: '16px' }} />
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
                Set New Password
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--muted-foreground)',
                marginBottom: '32px',
              }}>
                Enter your new password below. Must be at least 8 characters.
              </p>

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
                {/* New Password */}
                <div style={{ marginBottom: '20px' }}>
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
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      style={{
                        width: '100%',
                        padding: '14px 48px 14px 44px',
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: '0',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: 'var(--foreground)',
                        outline: 'none',
                      }}
                    />
                    <Lock style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: 'var(--muted-foreground)',
                    }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
                      ) : (
                        <Eye style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
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
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Re-enter your password"
                      style={{
                        width: '100%',
                        padding: '14px 48px 14px 44px',
                        background: 'var(--surface-3)',
                        border: '1px solid var(--border)',
                        borderRadius: '0',
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        color: 'var(--foreground)',
                        outline: 'none',
                      }}
                    />
                    <Lock style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: 'var(--muted-foreground)',
                    }} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
                      ) : (
                        <Eye style={{ width: '18px', height: '18px', color: 'var(--muted-foreground)' }} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'var(--primary)',
                    color: 'var(--background)',
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    border: 'none',
                    borderRadius: '0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight style={{ width: '18px', height: '18px' }} />
                    </>
                  )}
                </button>
              </form>
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

export default ResetPasswordPage;
