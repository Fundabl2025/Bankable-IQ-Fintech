import { useState, useCallback, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase/client'
import { GamificationData, Achievement, UserStreak } from '../utils/businessData'

export function useGamification() {
  const [gamification, setGamification] = useState<GamificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGamification = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('gamification_data')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      // If no data exists, create default
      if (!data) {
        const defaultData: GamificationData = {
          achievements: [],
          streak: {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date().toISOString(),
            streakHistory: [],
          },
          totalPoints: 0,
          level: 1,
          experiencePoints: 0,
        }
        setGamification(defaultData)
      } else {
        setGamification(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])

  const updatePoints = useCallback(async (pointsToAdd: number) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured')
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const currentData = gamification || {
        totalPoints: 0,
        level: 1,
        experiencePoints: 0,
      }

      const newTotalPoints = (currentData.totalPoints || 0) + pointsToAdd
      const newLevel = Math.floor(newTotalPoints / 20) + 1

      const { data, error: updateError } = await supabase
        .from('gamification_data')
        .upsert({
          user_id: user.id,
          totalPoints: newTotalPoints,
          level: newLevel,
          experiencePoints: (currentData.experiencePoints || 0) + pointsToAdd,
        })
        .select()
        .single()

      if (updateError) throw updateError

      setGamification(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    }
  }, [gamification])

  const unlockAchievement = useCallback(async (achievement: Achievement) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured')
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: insertError } = await supabase
        .from('achievements')
        .upsert({
          id: achievement.id,
          user_id: user.id,
          ...achievement,
          isUnlocked: true,
          unlockedDate: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (gamification) {
        setGamification({
          ...gamification,
          achievements: [...(gamification.achievements || []), data],
        })
      }

      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    }
  }, [gamification])

  useEffect(() => {
    fetchGamification()
  }, [fetchGamification])

  return {
    gamification,
    loading,
    error,
    updatePoints,
    unlockAchievement,
    refetch: fetchGamification,
  }
}
