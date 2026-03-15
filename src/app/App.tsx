import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { initializeBusinessData } from './utils/businessData';
import { Toaster } from 'sonner';

export default function App() {
  // Initialize the unified data system on app load
  useEffect(() => {
    initializeBusinessData();
  }, []);
  
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
