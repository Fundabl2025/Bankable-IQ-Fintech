// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Platform Config Service
// Reads pricing + feature flags from Supabase platform_config table.
// Falls back to hardcoded defaults when Supabase isn't available.
// Admin can update prices in Supabase without a code deploy.
// ════════════════════════════════════════════════════════════════════════════════

import { supabase, isSupabaseConfigured } from './supabase/client';

// ── Defaults (shown when Supabase isn't configured or fetch fails) ────────────
const DEFAULTS: Record<string, string> = {
  price_virtual_monthly:    '97',
  price_virtual_annual:     '970',
  price_live_monthly:       '297',
  price_live_annual:        '2970',
  price_currency:           'USD',
  virtual_trial_days:       '0',
  live_trial_days:          '0',
  platform_name:            'FundReady',
  support_email:            'support@fundreadyai.com',
  forge_ai_enabled:         'true',
  compliance_modules_count: '13',
};

// ── In-memory cache — fetched once per session ────────────────────────────────
let configCache: Record<string, string> | null = null;
let cachePromise: Promise<Record<string, string>> | null = null;

export async function getPlatformConfig(): Promise<Record<string, string>> {
  if (configCache) return configCache;
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    if (!isSupabaseConfigured) return { ...DEFAULTS };
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('key, value');
      if (error || !data) return { ...DEFAULTS };
      const result: Record<string, string> = { ...DEFAULTS };
      for (const row of data) result[row.key] = row.value;
      configCache = result;
      return result;
    } catch {
      return { ...DEFAULTS };
    }
  })();

  return cachePromise;
}

/** Get a single config value synchronously (uses defaults until async load completes) */
export function getConfigValue(key: string): string {
  return configCache?.[key] ?? DEFAULTS[key] ?? '';
}

/** Format price for display — "$97" from "97" */
export function formatPrice(amountStr: string): string {
  const n = parseInt(amountStr, 10);
  if (isNaN(n)) return amountStr;
  return `$${n}`;
}

// ── Typed pricing helpers ─────────────────────────────────────────────────────
export interface MembershipPricing {
  virtual: { monthly: string; annual: string; monthlyDisplay: string; annualDisplay: string };
  live:    { monthly: string; annual: string; monthlyDisplay: string; annualDisplay: string };
}

export async function getMembershipPricing(): Promise<MembershipPricing> {
  const config = await getPlatformConfig();
  return {
    virtual: {
      monthly:        config.price_virtual_monthly,
      annual:         config.price_virtual_annual,
      monthlyDisplay: formatPrice(config.price_virtual_monthly),
      annualDisplay:  formatPrice(config.price_virtual_annual),
    },
    live: {
      monthly:        config.price_live_monthly,
      annual:         config.price_live_annual,
      monthlyDisplay: formatPrice(config.price_live_monthly),
      annualDisplay:  formatPrice(config.price_live_annual),
    },
  };
}

/** Synchronous fallback — safe to call before async load */
export function getMembershipPricingSync(): MembershipPricing {
  return {
    virtual: {
      monthly:        DEFAULTS.price_virtual_monthly,
      annual:         DEFAULTS.price_virtual_annual,
      monthlyDisplay: formatPrice(DEFAULTS.price_virtual_monthly),
      annualDisplay:  formatPrice(DEFAULTS.price_virtual_annual),
    },
    live: {
      monthly:        DEFAULTS.price_live_monthly,
      annual:         DEFAULTS.price_live_annual,
      monthlyDisplay: formatPrice(DEFAULTS.price_live_monthly),
      annualDisplay:  formatPrice(DEFAULTS.price_live_annual),
    },
  };
}

// Invalidate cache (call after admin updates)
export function invalidatePlatformConfig(): void {
  configCache = null;
  cachePromise = null;
}
