import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables - Vite exposes all env vars via import.meta.env
// Variables must be prefixed with VITE_ to be exposed to client-side code
// But we also check for NEXT_PUBLIC_ for compatibility
const getEnvVar = (viteKey: string, nextKey: string): string => {
  // Check Vite env vars first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[viteKey]) return import.meta.env[viteKey]
    if (import.meta.env[nextKey]) return import.meta.env[nextKey]
  }
  // Fallback to process.env for SSR
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[viteKey]) return process.env[viteKey] as string
    if (process.env[nextKey]) return process.env[nextKey] as string
  }
  return ''
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

// Create a mock client if env vars are missing (allows app to load)
let supabase: SupabaseClient

const urlIsValid = supabaseUrl && isValidUrl(supabaseUrl)
const keyIsValid = supabaseAnonKey && supabaseAnonKey.length > 20

if (urlIsValid && keyIsValid) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Log warning but don't crash - allows app to load without Supabase
  console.warn('[FundReady] Supabase configuration issue:')
  if (!supabaseUrl) console.warn('  - VITE_SUPABASE_URL is not set')
  else if (!urlIsValid) console.warn('  - VITE_SUPABASE_URL is not a valid URL:', supabaseUrl)
  if (!supabaseAnonKey) console.warn('  - VITE_SUPABASE_ANON_KEY is not set')
  else if (!keyIsValid) console.warn('  - VITE_SUPABASE_ANON_KEY appears invalid')
  console.warn('[FundReady] Database features will be disabled. App will use localStorage fallback.')
  
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
