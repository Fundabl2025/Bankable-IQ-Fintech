// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Protected Route Component
// Redirects unauthenticated users to login
// ════════════════════════════════════════════════════════════════════════════════

import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // Check for demo mode flag in localStorage
  const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('fundready_demo_mode') === 'true';

  // Self-heal: if demo mode is active but membership tier was never set (stale session),
  // ensure live tier is applied so no upgrade gates appear
  if (isDemoMode && typeof window !== 'undefined') {
    const tier = localStorage.getItem('fundready_membership_tier');
    if (tier !== 'live' && tier !== 'virtual') {
      localStorage.setItem('fundready_membership_tier', 'live');
    }
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        color: 'var(--foreground)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ 
            width: '32px', 
            height: '32px', 
            color: 'var(--primary)', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--muted-foreground)',
          }}>
            Loading...
          </div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If Supabase is not configured, allow access (development mode)
  // This lets users explore the app without auth in local dev
  if (!isConfigured) {
    return <>{children}</>;
  }

  // If in demo mode, allow access without authentication
  if (isDemoMode) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

export default ProtectedRoute;
