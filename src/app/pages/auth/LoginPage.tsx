// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Login Page
// Clean, focused authentication with FundReady™ branding
// ════════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { migrateLocalDataToSupabase } from '../../lib/data-adapter';
import { Eye, EyeOff, AlertCircle, ArrowRight, Loader2, Zap } from 'lucide-react';
import { seedDemoData } from '../../utils/demoData';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading: authLoading, isConfigured } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      
      // Attempt to migrate any localStorage data to Supabase
      try {
        console.log('[v0] Login: Migrating localStorage data to Supabase...');
        await migrateLocalDataToSupabase();
        console.log('[v0] Login: Migration complete');
      } catch (migrationError) {
        console.warn('[v0] Login: Data migration failed, but login succeeded:', migrationError);
        // Don't block navigation - sign-in was successful
      }
      
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login bypasses auth and seeds pre-filled assessment data
  const handleDemoLogin = () => {
    console.log('[v0] Demo mode button clicked!');
    
    try {
      // Step 1: Seed data
      console.log('[v0] Step 1: Calling seedDemoData...');
      seedDemoData();
      console.log('[v0] Step 2: seedDemoData completed');
      
      // Step 2: Navigate using window.location as fallback
      console.log('[v0] Step 3: About to navigate...');
      window.location.href = '/app';
    } catch (error) {
      console.error('[v0] Demo mode error:', error);
      alert('Demo mode error: ' + (error instanceof Error ? error.message : String(error)));
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
            Welcome back.
          </h1>
          <p style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '18px',
            fontStyle: 'italic',
            color: 'var(--muted-foreground)',
            lineHeight: 1.7,
            maxWidth: '400px',
          }}>
            Your FundScore™ and capital roadmap are waiting. Sign in to continue building your fundability.
          </p>
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
            Sign In
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--muted-foreground)',
            marginBottom: '32px',
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
              Create one
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
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight style={{ width: '18px', height: '18px' }} />
                </>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
          }}>
            <Link
              to="/forgot-password"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--muted-foreground)',
                textDecoration: 'none',
              }}
            >
              Forgot your password?
            </Link>
          </div>

          {/* Demo Mode Button */}
          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: 'var(--surface-2)',
            border: '1px dashed var(--border)',
            borderRadius: '0',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--muted-foreground)',
              marginBottom: '12px',
            }}>
              Development Mode
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              style={{
                width: '100%',
                padding: '14px',
                background: 'transparent',
                color: 'var(--primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                border: '1px solid var(--primary)',
                borderRadius: '0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Zap style={{ width: '16px', height: '16px' }} />
              Enter Demo Mode
            </button>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--muted-foreground)',
              marginTop: '10px',
              lineHeight: 1.5,
            }}>
              Skip auth and load pre-filled assessment data for "Acme Consulting LLC" (FundScore ~700, SBSS ~160)
            </p>
          </div>
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

export default LoginPage;
