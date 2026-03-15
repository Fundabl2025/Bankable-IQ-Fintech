import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Try multiple env var patterns (Vite uses import.meta.env, Next.js uses process.env)
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : '') ||
  (typeof process !== 'undefined' ? process.env.SUPABASE_URL : '') ||
  ''

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : '') ||
  (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : '') ||
  ''

// Create a mock client if env vars are missing (allows app to load)
let supabase: SupabaseClient

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Log warning but don't crash - allows app to load without Supabase
  console.warn('[FundReady] Supabase environment variables not found. Database features will be disabled.')
  console.warn('[FundReady] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.')
  
  // Create a placeholder that will throw clear errors if used
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
    },
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      upsert: () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
  } as unknown as SupabaseClient
}

export { supabase }
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)
