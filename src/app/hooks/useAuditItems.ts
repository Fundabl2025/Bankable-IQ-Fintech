import { useState, useCallback, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase/client'
import { AuditItem } from '../utils/businessData'

export function useAuditItems() {
  const [items, setItems] = useState<AuditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchItems = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: fetchError } = await supabase
        .from('audit_items')
        .select('*')
        .eq('user_id', user.id)
        .order('category')

      if (fetchError) throw fetchError

      setItems(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [])

  const updateItem = useCallback(async (itemId: string, updates: Partial<AuditItem>) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured')
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error: updateError } = await supabase
        .from('audit_items')
        .update({
          ...updates,
          lastUpdated: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local state
      setItems(items.map(item => item.id === itemId ? { ...item, ...data } : item))
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    }
  }, [items])

  const markComplete = useCallback(async (itemId: string) => {
    return updateItem(itemId, {
      status: 'complete',
      completedDate: new Date().toISOString(),
    })
  }, [updateItem])

  const markIncomplete = useCallback(async (itemId: string) => {
    return updateItem(itemId, {
      status: 'incomplete',
      completedDate: undefined,
    })
  }, [updateItem])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    loading,
    error,
    updateItem,
    markComplete,
    markIncomplete,
    refetch: fetchItems,
  }
}
