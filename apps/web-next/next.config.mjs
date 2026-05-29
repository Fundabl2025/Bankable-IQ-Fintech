/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use App Router (default in Next.js 14+)
  experimental: {
    // typedRoutes: true, // enable once routes stabilize
  },
  // Match the existing Vite app's strict mode behavior
  reactStrictMode: true,
  // Match the existing TypeScript strictness
  typescript: {
    // We use the workspace tsconfig
    tsconfigPath: './tsconfig.json',
  },
  // Public env vars Vite uses with VITE_ prefix; Next.js uses NEXT_PUBLIC_
  // The data-adapter and supabase client handle both during the transition window.
  // Vercel deploys can set both NEXT_PUBLIC_SUPABASE_URL and VITE_SUPABASE_URL during migration.
  poweredByHeader: false,
  // Output mode: standalone for Vercel; remove if using static export
  // output: 'standalone',
};

export default nextConfig;
