import { Link } from 'react-router';
import { Clock, ChevronRight, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import type { IdeaReport } from '../lib/types';

interface PastReportsListProps {
  reports: IdeaReport[];
  onDelete: (reportId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--destructive)';
}

export function PastReportsList({ reports, onDelete }: PastReportsListProps) {
  if (reports.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-[var(--muted-foreground)]" />
          Past Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.map((report) => (
          <div
            key={report.id}
            className="group flex items-center justify-between gap-3 rounded-sm border border-[var(--border)] p-3 hover:border-[var(--primary-border)] transition-colors"
          >
            <Link
              to={`/app/idea-validator/${report.id}`}
              className="flex-1 min-w-0 flex items-center gap-3"
            >
              {/* Score indicator */}
              {report.status === 'complete' && report.report ? (
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${getScoreColor(report.report.businessOverview.viabilityScore)} 15%, transparent)`,
                    color: getScoreColor(report.report.businessOverview.viabilityScore),
                    border: `1px solid color-mix(in srgb, ${getScoreColor(report.report.businessOverview.viabilityScore)} 30%, transparent)`,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {report.report.businessOverview.viabilityScore}
                </div>
              ) : report.status === 'generating' ? (
                <div className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--surface-2)] border border-[var(--border)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--destructive-bg)] border border-[var(--destructive-border)]">
                  <AlertCircle className="h-4 w-4 text-[var(--destructive)]" />
                </div>
              )}

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm text-[var(--foreground)] truncate"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {report.ideaDescription.substring(0, 100)}
                  {report.ideaDescription.length > 100 ? '...' : ''}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] text-[var(--muted-foreground)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {formatDate(report.createdAt)}
                  </span>
                  {report.status === 'generating' && (
                    <Badge variant="info">Generating</Badge>
                  )}
                  {report.status === 'error' && (
                    <Badge variant="error">Failed</Badge>
                  )}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
            </Link>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(report.id);
              }}
              className="flex-shrink-0 p-1.5 rounded-sm text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive-bg)] transition-colors opacity-0 group-hover:opacity-100"
              title="Delete report"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
