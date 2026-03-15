/**
 * Data Adapter - Unified interface for localStorage and Supabase
 * Allows app to work with either backend seamlessly
 */

import { isSupabaseConfigured, supabase } from './supabase/client'

export interface DataAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
  getAllItems(): Record<string, string>
}

/**
 * LocalStorage adapter - Current implementation
 */
class LocalStorageAdapter implements DataAdapter {
  getItem(key: string): string | null {
    return localStorage.getItem(key)
  }

  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value)
    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: value }))
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key)
  }

  getAllItems(): Record<string, string> {
    const items: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('fundready_')) {
        items[key] = localStorage.getItem(key) || ''
      }
    }
    return items
  }
}

/**
 * Supabase adapter - Future implementation
 */
class SupabaseAdapter implements DataAdapter {
  private userId: string | null = null

  async getUserId(): Promise<string | null> {
    if (this.userId) return this.userId
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      this.userId = user?.id || null
      return this.userId
    } catch (error) {
      console.error('[FundReady] Error getting user:', error)
      return null
    }
  }

  async getItem(key: string): Promise<string | null> {
    const userId = await this.getUserId()
    if (!userId) return null

    try {
      const { data, error } = await supabase
        .from('key_value_store')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .single()

      if (error) return null
      return data?.value || null
    } catch (error) {
      console.error(`[FundReady] Error getting item ${key}:`, error)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    const userId = await this.getUserId()
    if (!userId) return

    try {
      await supabase
        .from('key_value_store')
        .upsert(
          {
            user_id: userId,
            key,
            value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,key' }
        )
    } catch (error) {
      console.error(`[FundReady] Error setting item ${key}:`, error)
    }
  }

  async removeItem(key: string): Promise<void> {
    const userId = await this.getUserId()
    if (!userId) return

    try {
      await supabase
        .from('key_value_store')
        .delete()
        .eq('user_id', userId)
        .eq('key', key)
    } catch (error) {
      console.error(`[FundReady] Error removing item ${key}:`, error)
    }
  }

  getAllItems(): Record<string, string> {
    // Note: This is async in Supabase, would need refactoring
    console.warn('[FundReady] getAllItems not implemented for Supabase adapter')
    return {}
  }
}

// Singleton instances
const localStorageAdapter = new LocalStorageAdapter()
const supabaseAdapter = new SupabaseAdapter()

/**
 * Get the active data adapter based on configuration
 */
export function getDataAdapter(): DataAdapter {
  if (isSupabaseConfigured) {
    return supabaseAdapter
  }
  return localStorageAdapter
}

/**
 * Convenience functions using the active adapter
 */
export async function getDataItem(key: string): Promise<string | null> {
  const adapter = getDataAdapter()
  
  if (isSupabaseConfigured && adapter instanceof SupabaseAdapter) {
    return await adapter.getItem(key)
  }
  
  return adapter.getItem(key)
}

export async function setDataItem(key: string, value: string): Promise<void> {
  const adapter = getDataAdapter()
  return await adapter.setItem(key, value)
}

export async function removeDataItem(key: string): Promise<void> {
  const adapter = getDataAdapter()
  return await adapter.removeItem(key)
}
