// ════════════════════════════════════════════════════════════════════════════════
// Idea Validator Store (localStorage with Supabase-ready pattern)
// ════════════════════════════════════════════════════════════════════════════════

import type { IdeaReport } from './types';

const STORAGE_KEY_PREFIX = 'idea_validator_reports';

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}_${userId}`;
}

/**
 * Get all reports for a user, sorted by creation date (newest first).
 */
export function getReports(userId: string): IdeaReport[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const reports: IdeaReport[] = JSON.parse(raw);
    return reports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Get a single report by ID.
 */
export function getReportById(userId: string, reportId: string): IdeaReport | null {
  const reports = getReports(userId);
  return reports.find((r) => r.id === reportId) ?? null;
}

/**
 * Save a new report or update an existing one.
 */
export function saveReport(userId: string, report: IdeaReport): void {
  const reports = getReports(userId);
  const existingIndex = reports.findIndex((r) => r.id === report.id);

  if (existingIndex >= 0) {
    reports[existingIndex] = report;
  } else {
    reports.push(report);
  }

  localStorage.setItem(getStorageKey(userId), JSON.stringify(reports));
}

/**
 * Delete a report by ID.
 */
export function deleteReport(userId: string, reportId: string): void {
  const reports = getReports(userId).filter((r) => r.id !== reportId);
  localStorage.setItem(getStorageKey(userId), JSON.stringify(reports));
}

/**
 * Generate a unique ID for a new report.
 */
export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ── Future Supabase integration ──────────────────────────────────────────────
// When ready to migrate to Supabase:
//
// 1. Create table:
//    CREATE TABLE idea_reports (
//      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//      user_id UUID REFERENCES auth.users(id),
//      idea_description TEXT NOT NULL,
//      report JSONB,
//      status TEXT DEFAULT 'generating',
//      error TEXT,
//      created_at TIMESTAMPTZ DEFAULT now()
//    );
//    ALTER TABLE idea_reports ENABLE ROW LEVEL SECURITY;
//    CREATE POLICY "Users can manage own reports"
//      ON idea_reports FOR ALL USING (auth.uid() = user_id);
//
// 2. Replace localStorage calls with supabase client queries.
