/**
 * Data Adapter - Unified interface for localStorage and Supabase
 * Saves to localStorage always, also writes to Supabase for logged-in users
 */

import { isSupabaseConfigured, supabase } from './supabase/client'

/**
 * Get current user from Supabase Auth
 */
async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    return null
  }
}

/**
 * Always save to localStorage
 * If user is logged in and Supabase is configured, also save to business_profiles.assessment_data
 */
export async function setDataItem(key: string, value: string): Promise<void> {
  // Always save to localStorage
  localStorage.setItem(key, value)
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }))

  // If user is logged in, also save to Supabase
  if (isSupabaseConfigured && key === 'unified_assessment') {
    try {
      const user = await getCurrentUser()
      if (user) {
        await supabase
          .from('business_profiles')
          .upsert(
            {
              user_id: user.id,
              assessment_data: value,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
      }
    } catch (error) {
      console.warn('[FundReady] Warning: Could not save assessment to Supabase:', error)
      // Don't throw - localStorage save succeeded, Supabase is just a bonus
    }
  }
}

/**
 * Get data from Supabase if logged in, fall back to localStorage
 */
export async function getDataItem(key: string): Promise<string | null> {
  // If user is logged in and this is assessment data, try Supabase first
  if (isSupabaseConfigured && key === 'unified_assessment') {
    try {
      const user = await getCurrentUser()
      if (user) {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('assessment_data')
          .eq('user_id', user.id)
          .single()

        if (!error && data?.assessment_data) {
          return data.assessment_data
        }
      }
    } catch (error) {
      console.warn('[FundReady] Warning: Could not read from Supabase:', error)
    }
  }

  // Fall back to localStorage
  return localStorage.getItem(key)
}

/**
 * Migrate all localStorage data to Supabase for newly signed-up user
 * Call this after successful authentication
 */
export async function migrateLocalDataToSupabase(): Promise<void> {
  if (!isSupabaseConfigured) {
    console.warn('[FundReady] Supabase not configured, skipping migration')
    return
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      console.warn('[FundReady] No user logged in, cannot migrate data')
      return
    }

    // Get all FundReady data from localStorage
    const assessmentData = localStorage.getItem('unified_assessment')
    const businessProfile = localStorage.getItem('fundready_business_profile')
    const auditItems = localStorage.getItem('auditItems')

    console.log('[FundReady] Migrating data to Supabase for user:', user.id)

    // Save assessment data to business_profiles.assessment_data
    if (assessmentData) {
      await supabase
        .from('business_profiles')
        .upsert(
          {
            user_id: user.id,
            assessment_data: assessmentData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
      console.log('[FundReady] Migrated assessment data')
    }

    // Parse business profile and save individual fields
    if (businessProfile) {
      try {
        const profile = JSON.parse(businessProfile)
        await supabase
          .from('business_profiles')
          .upsert(
            {
              user_id: user.id,
              business_legal_name: profile.businessName,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
        console.log('[FundReady] Migrated business profile')
      } catch (e) {
        console.warn('[FundReady] Could not parse business profile:', e)
      }
    }

    console.log('[FundReady] Data migration complete')
  } catch (error) {
    console.error('[FundReady] Error during data migration:', error)
    throw error
  }
}

/**
 * Clear all localStorage data for this user
 */
export async function removeDataItem(key: string): Promise<void> {
  localStorage.removeItem(key)
}
