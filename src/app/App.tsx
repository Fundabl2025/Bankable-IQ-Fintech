import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { initializeBusinessData } from './utils/businessData';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  // Initialize the unified data system on app load
  useEffect(() => {
    initializeBusinessData();
  }, []);
  
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
