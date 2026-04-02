/**
 * Data Adapter - Unified interface for localStorage and Supabase
 * Saves to localStorage always, also writes to Supabase for logged-in users
 */

import { isSupabaseConfigured, supabase } from './supabase/client'
import { SCORING_VERSION } from '../pages/business-assessment/engine'
import { logEvent } from './analytics/events'

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
 * Parse assessment data to extract fund_score and bankable_score
 */
function parseScoresFromAssessment(assessmentJson: string): { fund_score: number; bankable_score: number } {
  try {
    const data = JSON.parse(assessmentJson)
    // These will be added by the Results page when it calculates scores
    // For now, return defaults - they'll be updated when Results page saves
    return {
      fund_score: data.fund_score || 0,
      bankable_score: data.bankable_score || 0,
    }
  } catch {
    return { fund_score: 0, bankable_score: 0 }
  }
}

/**
 * Always save to localStorage
 * If user is logged in and Supabase is configured, also save to business_profiles
 */
export async function setDataItem(key: string, value: string): Promise<void> {
  // Always save to localStorage
  localStorage.setItem(key, value)
  window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }))

  // Event: fundscore_generated — fires whenever assessment data is saved
  if (key === 'unified_assessment') {
    const { fund_score } = parseScoresFromAssessment(value)
    if (fund_score > 0) {
      logEvent({ event_name: 'fundscore_generated', payload: { fund_score, scoring_version: SCORING_VERSION } })
    }
  }

  if (!isSupabaseConfigured) return

  try {
    const user = await getCurrentUser()
    if (!user) return

    if (key === 'unified_assessment') {
      const { fund_score, bankable_score } = parseScoresFromAssessment(value)
      const now = new Date().toISOString()
      await supabase
        .from('business_profiles')
        .upsert(
          {
            user_id: user.id,
            assessment_data: value,
            fund_score,
            bankable_score,
            scoring_version: SCORING_VERSION,
            score_generated_at: now,
            updated_at: now,
          },
          { onConflict: 'user_id' }
        )
    } else if (key === 'fundready_badges') {
      await supabase
        .from('business_profiles')
        .upsert(
          { user_id: user.id, badges_data: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
    }
  } catch (error) {
    console.warn('[FundReady] Warning: Could not save to Supabase:', error)
    // Don't throw - localStorage save succeeded, Supabase is just a bonus
  }
}

/**
 * Get data from Supabase if logged in, fall back to localStorage
 */
export async function getDataItem(key: string): Promise<string | null> {
  if (isSupabaseConfigured) {
    try {
      const user = await getCurrentUser()
      if (user) {
        if (key === 'unified_assessment') {
          const { data, error } = await supabase
            .from('business_profiles')
            .select('assessment_data')
            .eq('user_id', user.id)
            .single()
          if (!error && data?.assessment_data) {
            return data.assessment_data
          }
        } else if (key === 'fundready_badges') {
          const { data, error } = await supabase
            .from('business_profiles')
            .select('badges_data')
            .eq('user_id', user.id)
            .single()
          if (!error && data?.badges_data) {
            // Sync down to localStorage so getEarnedBadges() stays fast
            localStorage.setItem('fundready_badges', data.badges_data)
            return data.badges_data
          }
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

    // Save assessment data to business_profiles.assessment_data with scores
    if (assessmentData) {
      const { fund_score, bankable_score } = parseScoresFromAssessment(assessmentData)
      const now = new Date().toISOString()

      await supabase
        .from('business_profiles')
        .upsert(
          {
            user_id: user.id,
            assessment_data: assessmentData,
            fund_score,
            bankable_score,
            scoring_version: SCORING_VERSION,
            score_generated_at: now,
            updated_at: now,
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
 * Clear assessment data from localStorage
 */
export async function clearLocalData(): Promise<void> {
  localStorage.removeItem('unified_assessment')
}

/**
 * Remove a data item from localStorage
 */
export async function removeDataItem(key: string): Promise<void> {
  localStorage.removeItem(key)
}
