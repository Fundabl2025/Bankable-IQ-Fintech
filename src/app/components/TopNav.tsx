// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — TopNav
// Minimal signal bar: page context + live FundScore + actions
// Chase Hughes: identity confirmation (score) before anything else
// Elon: delete everything that doesn't drive the user toward the next action
// ════════════════════════════════════════════════════════════════════════════════

import { Search, Bell, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { computeScore } from '../pages/business-assessment/engine';

// Page label map — human name from route, no URL-splitting noise
const PAGE_LABELS: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/access-funding': 'Access Funding',
  '/app/my-progress': 'My Progress',
  '/app/finances': 'Finances',
  '/app/status-reports': 'Capital Intelligence',
  '/app/lender-compliance': 'Lender Compliance',
  '/app/document-collection': 'Document Portal',
  '/app/integrate-reports': 'Integrate Reports',
  '/app/capital-access-map': 'Capital Access Map',
  '/app/denial-diagnosis': 'Denial Diagnosis',
  '/app/capital-glossary': 'Capital Glossary',
  '/app/templates-resources': 'Templates & Resources',
  '/app/settings': 'Settings',
  '/business-assessment': 'Business Assessment',
};

function getPageLabel(pathname: string): string {
  // Exact match first
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname];
  // Compliance module pages
  if (pathname.startsWith('/app/lender-compliance/')) {
    const slug = pathname.split('/').pop() ?? '';
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  // Status report sub-pages
  if (pathname.startsWith('/app/status-reports/')) {
    const slug = pathname.split('/').pop() ?? '';
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
  // Fallback: last segment
  const last = pathname.split('/').filter(Boolean).pop() ?? '';
  return last.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Dashboard';
}

function getScoreColor(score: number): string {
  if (score >= 800) return '#10b981';
  if (score >= 650) return '#f59e0b';
  if (score >= 400) return '#ef4444';
  return 'var(--muted-foreground)';
}

interface TopNavProps {
  onMobileMenuToggle?: () => void;
  mobileMenuOpen?: boolean;
}

export function TopNav({ onMobileMenuToggle, mobileMenuOpen }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [fundScore, setFundScore] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  // Load FundScore from correct source — unified_assessment
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem('unified_assessment');
        if (raw) {
          const data = JSON.parse(raw);
          const result = computeScore(data);
          setFundScore(result.score);
          // Extract name from assessment data
          if (data.ownerName || data.firstName) {
            setUserName(data.ownerName || data.firstName || '');
          }
        }
      } catch { /* non-fatal */ }
    };
    load();
    window.addEventListener('fundscoreUpdated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('fundscoreUpdated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const pageLabel = getPageLabel(location.pathname);
  const scoreColor = getScoreColor(fundScore);

  // User initials from stored name or default
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'JD';

  const toggleTheme = () => {
    setIsDark(d => {
      document.documentElement.classList.toggle('dark', !d);
      return !d;
    });
  };

  return (
    <>
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 30,
          height: '52px',
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          paddingLeft: '16px', paddingRight: '16px',
          gap: '12px',
        }}
      >
        {/* Mobile: hamburger */}
        <button
          onClick={onMobileMenuToggle}
          style={{
            display: 'none',
            alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--card)',
            cursor: 'pointer', color: 'var(--foreground)', flexShrink: 0,
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Page label — only meaningful context, no URL noise */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '15px', color: 'var(--foreground)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {pageLabel}
          </span>
        </div>

        {/* Right side: FundScore + Search + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* FundScore chip — identity anchor, reads correct source */}
          {fundScore > 0 && (
            <div
              onClick={() => navigate('/app/status-reports')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px', borderRadius: '20px', cursor: 'pointer',
                background: `${scoreColor}12`,
                border: `1px solid ${scoreColor}30`,
                transition: 'opacity 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700,
                color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                Score
              </span>
              <span style={{
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '14px', color: scoreColor,
              }}>
                {fundScore}
              </span>
            </div>
          )}

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid var(--border)', background: 'var(--card)',
              cursor: 'pointer', color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-body)', fontSize: '12px',
            }}
            className="search-btn"
          >
            <Search size={14} />
            <span className="search-label">Search</span>
            <kbd style={{
              fontSize: '10px', padding: '1px 5px', borderRadius: '4px',
              background: 'var(--border)', color: 'var(--muted-foreground)',
              border: '1px solid var(--border)',
            }} className="search-kbd">⌘K</kbd>
          </button>

          {/* Notifications */}
          <button style={{
            position: 'relative', width: '34px', height: '34px',
            borderRadius: '8px', border: '1px solid var(--border)',
            background: 'var(--card)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--muted-foreground)',
          }}>
            <Bell size={15} />
          </button>

          {/* Avatar — single instance, no duplicate text */}
          <button
            onClick={() => navigate('/app/settings')}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #3b82f6)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: '12px', color: 'white',
              flexShrink: 0,
            }}
          >
            {initials}
          </button>
        </div>
      </div>

      {/* Search modal */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '80px', background: 'rgba(0,0,0,0.6)',
          }}
          onClick={() => setSearchOpen(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: '560px', margin: '0 16px',
              background: 'var(--card)', borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderBottom: '1px solid var(--border)',
            }}>
              <Search size={16} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search pages, reports, tools…"
                autoFocus
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontSize: '14px',
                  color: 'var(--foreground)', fontFamily: 'var(--font-body)',
                }}
              />
              <kbd style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'var(--border)', color: 'var(--muted-foreground)' }}>ESC</kbd>
            </div>
            <div style={{ padding: '12px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 8px 8px' }}>
                Quick Actions
              </p>
              {[
                { label: '📊 View Capital Intelligence', path: '/app/status-reports' },
                { label: '💰 Access Funding', path: '/app/access-funding' },
                { label: '🛡️ Lender Compliance', path: '/app/lender-compliance' },
                { label: '📋 Take / Update Assessment', path: '/business-assessment' },
                { label: '📁 Document Portal', path: '/app/document-collection' },
              ].map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSearchOpen(false)}
                  style={{
                    display: 'block', padding: '9px 12px', borderRadius: '8px',
                    fontFamily: 'var(--font-body)', fontSize: '13px',
                    color: 'var(--foreground)', textDecoration: 'none',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
          .search-label, .search-kbd { display: none !important; }
          .search-btn { padding: 6px 8px !important; }
        }
      `}</style>
    </>
  );
}
