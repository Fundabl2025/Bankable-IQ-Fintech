import { Search, Bell, Moon, Sun, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router';
import { Button } from './ui/button';

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function TopNav() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fundScore, setFundScore] = useState<number>(0);

  // Load FundScore from localStorage
  useEffect(() => {
    const loadFundScore = () => {
      try {
        const stored = localStorage.getItem('fundscore_result');
        if (stored) {
          const result = JSON.parse(stored);
          setFundScore(result.score || 0);
        }
      } catch (error) {
        console.error('Error reading FundScore:', error);
      }
    };

    loadFundScore();

    // Listen for FundScore updates
    window.addEventListener('fundscoreUpdated', loadFundScore);
    window.addEventListener('storage', loadFundScore);

    return () => {
      window.removeEventListener('fundscoreUpdated', loadFundScore);
      window.removeEventListener('storage', loadFundScore);
    };
  }, []);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Handle keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="sticky top-0 z-30 border-b"
      style={{ 
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border)',
        height: '52px'
      }}
    >
      <div className="flex items-center justify-between px-6 h-full">
        {/* Breadcrumbs */}
        <div 
          className="flex items-center gap-2 text-sm"
          style={{ 
            fontFamily: 'var(--font-body)',
            fontWeight: 300
          }}
        >
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />}
              {index === breadcrumbs.length - 1 ? (
                <span 
                  className="font-medium"
                  style={{ 
                    color: 'var(--foreground)',
                    fontWeight: 400
                  }}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="transition-colors"
                  style={{ 
                    color: 'var(--muted-foreground)'
                  }}
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Score Chip */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-sm border"
            style={{
              backgroundColor: 'var(--primary-bg)',
              borderColor: 'var(--primary-border)'
            }}
          >
            <span 
              className="text-xs uppercase tracking-[0.12em]"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                color: 'var(--muted-foreground)'
              }}
            >
              Score
            </span>
            <span 
              className="text-sm font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--primary)'
              }}
            >
              {fundScore}
            </span>
          </div>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-sm transition-colors text-sm"
            style={{
              backgroundColor: 'var(--surface-2)',
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-body)',
              fontWeight: 300
            }}
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
            <kbd 
              className="hidden md:inline px-2 py-0.5 text-xs border rounded-sm"
              style={{
                backgroundColor: 'var(--surface-3)',
                borderColor: 'var(--border)',
                fontFamily: 'var(--font-body)'
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Notifications */}
          <button 
            className="relative p-2 rounded-sm transition-colors"
            style={{
              color: 'var(--muted-foreground)'
            }}
          >
            <Bell className="w-5 h-5" />
            <span 
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--destructive)' }}
            ></span>
          </button>

          {/* User Avatar */}
          <button 
            className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-sm transition-colors"
          >
            <span 
              className="text-sm font-medium"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                color: 'var(--foreground)'
              }}
            >
              JD
            </span>
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700
              }}
            >
              JD
            </div>
          </button>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20"
          onClick={() => setSearchOpen(false)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        >
          <div
            className="w-full max-w-2xl mx-4 rounded-lg border"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border-medium)',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div 
              className="flex items-center gap-3 p-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <Search className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search for pages, reports, or features..."
                className="flex-1 outline-none text-sm bg-transparent"
                style={{
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 300
                }}
                autoFocus
              />
              <kbd 
                className="px-2 py-1 text-xs border rounded-sm"
                style={{
                  backgroundColor: 'var(--surface-3)',
                  borderColor: 'var(--border)',
                  color: 'var(--muted-foreground)',
                  fontFamily: 'var(--font-body)'
                }}
              >
                ESC
              </kbd>
            </div>
            <div className="p-4 text-sm">
              <p 
                className="mb-2 font-medium"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  color: 'var(--foreground)'
                }}
              >
                Quick Actions
              </p>
              <div className="space-y-1">
                <Link
                  to="/business-success-scan/step-1"
                  className="block px-3 py-2 rounded-sm transition-colors"
                  onClick={() => setSearchOpen(false)}
                  style={{
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300
                  }}
                >
                  Start Business Success Scan
                </Link>
                <Link
                  to="/access-funding"
                  className="block px-3 py-2 rounded-sm transition-colors"
                  onClick={() => setSearchOpen(false)}
                  style={{
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300
                  }}
                >
                  Access Funding
                </Link>
                <Link
                  to="/status-reports/bankable-status"
                  className="block px-3 py-2 rounded-sm transition-colors"
                  onClick={() => setSearchOpen(false)}
                  style={{
                    color: 'var(--muted-foreground)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 300
                  }}
                >
                  View Bankable Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}