// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Signup Page
// Clean registration with value proposition
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { migrateLocalDataToSupabase } from '../../lib/data-adapter';
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, loading: authLoading, isConfigured } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      
      // Migrate any localStorage data to Supabase
      try {
        console.log('[v0] Migrating localStorage data to Supabase...');
        await migrateLocalDataToSupabase();
        console.log('[v0] Migration complete');
      } catch (migrationError) {
        console.warn('[v0] Data migration failed, but account creation succeeded:', migrationError);
        // Don't show migration error to user - account was created successfully
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        padding: '40px',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            maxWidth: '440px',
          }}
        >
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--success-bg)',
            border: '2px solid var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle style={{ width: '40px', height: '40px', color: 'var(--success)' }} />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            fontWeight: 800,
            marginBottom: '16px',
          }}>
            Check Your Email
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'var(--muted-foreground)',
            lineHeight: 1.7,
            marginBottom: '32px',
          }}>
            We've sent a confirmation link to <strong style={{ color: 'var(--foreground)' }}>{email}</strong>. 
            Click the link to activate your account and start your FundScore™ assessment.
          </p>
          <Link
            to="/login"
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
              borderRadius: '0',
            }}
          >
            Go to Sign In
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--background)',
    }}>
      {/* Left Panel — Branding + Value Props */}
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
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <img 
              src="/images/fundready-logo.png" 
              alt="FundReady - Unlocking Your Potential" 
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
            Know your fundability<br />
            <span style={{ color: 'var(--primary)' }}>before you apply.</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontStyle: 'italic',
            color: 'var(--muted-foreground)',
            lineHeight: 1.7,
            marginBottom: '40px',
            maxWidth: '400px',
          }}>
            Create your free account to get your FundScore™ and see exactly what's blocking your capital access.
          </p>

          {/* Value Props */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'FundScore™ (0-1000) with 6-dimension breakdown',
              '17 funding products mapped to your profile',
              'Ranked action plan to unlock more capital',
              'No bank login. No credit pull.',
            ].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <CheckCircle style={{ width: '14px', height: '14px', color: 'var(--background)' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--foreground)' }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--muted-foreground)',
        }}>
          © {new Date().getFullYear()} Fundabl. All rights reserved.
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
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            marginBottom: '8px',
          }}>
            Create Account
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            marginBottom: '32px',
          }}>
            Already have an account?{' '}
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
                  Authentication requires Supabase. Connect the integration in settings.
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
            {/* Email */}
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
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  borderRadius: '0',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--foreground)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Password */}
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
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  style={{
                    width: '100%',
                    padding: '14px 48px 14px 16px',
                    background: 'var(--surface-3)',
                    border: '1px solid var(--border)',
                    borderRadius: '0',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--foreground)',
                    outline: 'none',
                  }}
                />
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
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  borderRadius: '0',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--foreground)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || authLoading || !isConfigured}
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
              {loading || authLoading ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>

          <p style={{
            marginTop: '24px',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--muted-foreground)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            By creating an account, you agree to our{' '}
            <a href="/terms" style={{ color: 'var(--foreground)', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: 'var(--foreground)', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
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

export default SignupPage;
