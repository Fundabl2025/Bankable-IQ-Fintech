import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopNav
            onMobileMenuToggle={() => setMobileMenuOpen(o => !o)}
            mobileMenuOpen={mobileMenuOpen}
          />
          <main style={{ flex: 1 }}>
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
