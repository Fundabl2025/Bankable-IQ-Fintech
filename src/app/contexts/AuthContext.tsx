import React, { createContext, useContext, useState, useEffect } from 'react'
import { isSupabaseConfigured } from '../lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip if Supabase not configured
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // Check for existing session
    const checkSession = async () => {
      try {
        const { supabase } = await import('../lib/supabase/client')
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    let unsubscribe: (() => void) | undefined

    const setupListener = async () => {
      try {
        const { supabase } = await import('../lib/supabase/client')
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
          }
        )
        unsubscribe = () => subscription?.unsubscribe()
      } catch (error) {
        console.error('Error setting up auth listener:', error)
      }
    }

    setupListener()

    return () => unsubscribe?.()
  }, [])

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured')
    }

    setLoading(true)
    try {
      const { supabase } = await import('../lib/supabase/client')
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured')
    }

    setLoading(true)
    try {
      const { supabase } = await import('../lib/supabase/client')
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      return
    }

    setLoading(true)
    try {
      const { supabase } = await import('../lib/supabase/client')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
