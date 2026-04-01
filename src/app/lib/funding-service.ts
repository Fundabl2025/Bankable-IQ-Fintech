// ════════════════════════════════════════════════════════════════════════════════
// FUNDREADY™ — Funding Pipeline Service
// Tracks every stage of the funding journey: Pre-Qual → Applied → Offer → Funded
// Backed by Supabase. Falls back to localStorage for unauthenticated users.
// ════════════════════════════════════════════════════════════════════════════════

import { supabase } from './supabase/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'applied'        // User clicked Apply — profile submitted to lender queue
  | 'under_review'   // Lender is actively reviewing the file
  | 'offer_received' // Lender sent back real numbers
  | 'accepted'       // User accepted the offer
  | 'funded'         // Money disbursed 🎉
  | 'declined'       // Lender declined
  | 'withdrawn';     // User withdrew

export interface FundingApplication {
  id: string;
  user_id: string;
  program_id: string;
  program_name: string;
  status: ApplicationStatus;
  pre_qualified_amount: string | null;
  pre_qualified_rate: string | null;
  offer_amount: number | null;
  offer_rate: string | null;
  offer_term: string | null;
  offer_received_at: string | null;
  funded_at: string | null;
  declined_at: string | null;
  lender_notes: string | null;
  applied_at: string | null;
  updated_at: string | null;
}

export interface PipelineCounts {
  applied: number;
  under_review: number;
  offer_received: number;
  accepted: number;
  funded: number;
  declined: number;
  total: number;
}

// ── localStorage fallback key ─────────────────────────────────────────────────
const LOCAL_KEY = 'fundready_applications';

function getLocalApps(): FundingApplication[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalApps(apps: FundingApplication[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(apps));
  window.dispatchEvent(new Event('fundingPipelineUpdated'));
}

// ── Get current user id ───────────────────────────────────────────────────────
async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Submit a funding application for a program.
 * Writes to Supabase if logged in, otherwise localStorage.
 */
export async function applyToProgram(
  programId: string,
  programName: string,
  preQualifiedAmount: string,
  preQualifiedRate?: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  const now = new Date().toISOString();

  if (userId) {
    // Check if already applied
    const { data: existing } = await supabase
      .from('funding_applications')
      .select('id, status')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .not('status', 'eq', 'withdrawn')
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Already applied to this program' };
    }

    const { error } = await supabase.from('funding_applications').insert({
      user_id: userId,
      program_id: programId,
      program_name: programName,
      status: 'applied',
      pre_qualified_amount: preQualifiedAmount,
      pre_qualified_rate: preQualifiedRate ?? null,
      applied_at: now,
    });

    if (error) return { success: false, error: error.message };
  } else {
    // localStorage fallback
    const apps = getLocalApps();
    const exists = apps.find(a => a.program_id === programId && a.status !== 'withdrawn');
    if (exists) return { success: false, error: 'Already applied to this program' };

    apps.push({
      id: crypto.randomUUID(),
      user_id: 'local',
      program_id: programId,
      program_name: programName,
      status: 'applied',
      pre_qualified_amount: preQualifiedAmount,
      pre_qualified_rate: preQualifiedRate ?? null,
      offer_amount: null,
      offer_rate: null,
      offer_term: null,
      offer_received_at: null,
      funded_at: null,
      declined_at: null,
      lender_notes: null,
      applied_at: now,
      updated_at: now,
    });
    saveLocalApps(apps);
  }

  window.dispatchEvent(new Event('fundingPipelineUpdated'));
  return { success: true };
}

/**
 * Withdraw / cancel an application.
 */
export async function withdrawApplication(
  programId: string
): Promise<{ success: boolean }> {
  const userId = await getCurrentUserId();

  if (userId) {
    await supabase
      .from('funding_applications')
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('program_id', programId);
  } else {
    const apps = getLocalApps().map(a =>
      a.program_id === programId ? { ...a, status: 'withdrawn' as ApplicationStatus } : a
    );
    saveLocalApps(apps);
  }

  window.dispatchEvent(new Event('fundingPipelineUpdated'));
  return { success: true };
}

/**
 * Get all active applications for the current user.
 */
export async function getUserApplications(): Promise<FundingApplication[]> {
  const userId = await getCurrentUserId();

  if (userId) {
    const { data, error } = await supabase
      .from('funding_applications')
      .select('*')
      .eq('user_id', userId)
      .not('status', 'eq', 'withdrawn')
      .order('applied_at', { ascending: false });

    if (error || !data) return [];
    return data as FundingApplication[];
  } else {
    return getLocalApps().filter(a => a.status !== 'withdrawn');
  }
}

/**
 * Get the application for a specific program (null if not applied / withdrawn).
 */
export async function getApplicationForProgram(
  programId: string
): Promise<FundingApplication | null> {
  const userId = await getCurrentUserId();

  if (userId) {
    const { data } = await supabase
      .from('funding_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('program_id', programId)
      .not('status', 'eq', 'withdrawn')
      .maybeSingle();

    return (data as FundingApplication | null);
  } else {
    const apps = getLocalApps();
    return apps.find(a => a.program_id === programId && a.status !== 'withdrawn') ?? null;
  }
}

/**
 * Get pipeline counts — drives the dashboard strip and page header.
 */
export async function getPipelineCounts(): Promise<PipelineCounts> {
  const apps = await getUserApplications();

  const counts: PipelineCounts = {
    applied: 0,
    under_review: 0,
    offer_received: 0,
    accepted: 0,
    funded: 0,
    declined: 0,
    total: apps.length,
  };

  for (const app of apps) {
    if (app.status in counts) {
      (counts as any)[app.status]++;
    }
  }

  return counts;
}

/**
 * Accept a funding offer.
 */
export async function acceptOffer(programId: string): Promise<{ success: boolean }> {
  const userId = await getCurrentUserId();
  const now = new Date().toISOString();

  if (userId) {
    await supabase
      .from('funding_applications')
      .update({ status: 'accepted', updated_at: now })
      .eq('user_id', userId)
      .eq('program_id', programId);
  } else {
    const apps = getLocalApps().map(a =>
      a.program_id === programId ? { ...a, status: 'accepted' as ApplicationStatus, updated_at: now } : a
    );
    saveLocalApps(apps);
  }

  window.dispatchEvent(new Event('fundingPipelineUpdated'));
  return { success: true };
}

// ── Stage labels & colors (used across UI) ────────────────────────────────────

export const STAGE_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; order: number }> = {
  applied:        { label: 'Applied',       color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  order: 1 },
  under_review:   { label: 'Under Review',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  order: 2 },
  offer_received: { label: 'Offer Received',color: '#10b981', bg: 'rgba(16,185,129,0.12)', order: 3 },
  accepted:       { label: 'Accepted',      color: '#10b981', bg: 'rgba(16,185,129,0.15)', order: 4 },
  funded:         { label: 'Funded ✓',      color: '#10b981', bg: 'rgba(16,185,129,0.2)',  order: 5 },
  declined:       { label: 'Declined',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   order: 6 },
  withdrawn:      { label: 'Withdrawn',     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', order: 7 },
};
