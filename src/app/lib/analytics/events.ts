// ── Product Event Logger ──────────────────────────────────────────────────────
// Writes to Supabase event_logs table when configured. Silently no-ops otherwise.
// Never throws. Never blocks the calling workflow. Always fire-and-forget.
//
// Usage:
//   import { logEvent } from '../lib/analytics/events';
//   logEvent({ event_name: 'assessment_completed', payload: { fund_score: 720 } });

import { isSupabaseConfigured, supabase } from '../supabase/client';

export interface ProductEvent {
  event_name: string;
  business_id?: string;
  assessment_id?: string;
  payload?: Record<string, unknown>;
}

export async function logEvent(event: ProductEvent): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('event_logs').insert({
      actor_profile_id: user?.id ?? null,
      event_name: event.event_name,
      event_payload: event.payload ?? {},
      occurred_at: new Date().toISOString(),
    });
  } catch {
    // Non-fatal — event logging must never break the product
  }
}
