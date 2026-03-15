import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { TopNav } from '../components/TopNav';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function RootLayout() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopNav />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
