/**
 * Idea Report Page
 *
 * Displays a single generated business idea report with all sections.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Lightbulb, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { ReportViewer } from './components/ReportViewer';
import { getReportById } from './lib/store';
import type { IdeaReport } from './lib/types';

const DEV_USER_ID = 'dev-user';

export function IdeaReportPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState<IdeaReport | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.id ?? DEV_USER_ID;

  useEffect(() => {
    if (!id) {
      navigate('/app/idea-validator');
      return;
    }

    const found = getReportById(userId, id);
    setReport(found);
    setLoading(false);

    // If the report is still generating, poll for updates
    if (found?.status === 'generating') {
      const interval = setInterval(() => {
        const updated = getReportById(userId, id);
        if (updated && updated.status !== 'generating') {
          setReport(updated);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [id, userId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-[var(--muted-foreground)]" />
            <p className="text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-body)' }}>
              Report not found
            </p>
            <Button variant="outline" onClick={() => navigate('/app/idea-validator')}>
              <ArrowLeft className="h-4 w-4" />
              Back to Idea Validator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link
          to="/app/idea-validator"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Idea Validator
        </Link>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--primary-bg)] border border-[var(--primary-border)] flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div className="min-w-0">
            <h1
              className="text-xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Business Idea Report
            </h1>
            <p
              className="text-sm text-[var(--muted-foreground)] mt-1"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.65 }}
            >
              {report.ideaDescription}
            </p>
            <p
              className="text-[10px] text-[var(--muted-foreground)] mt-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              Generated {new Date(report.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Report Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {report.status === 'generating' && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
              <div className="text-center">
                <p className="text-[var(--foreground)] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  Generating your report...
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                  Our AI is analyzing your business idea across market, strategy, and financial dimensions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {report.status === 'error' && (
          <Card className="border-[var(--destructive-border)]">
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
              <AlertCircle className="h-10 w-10 text-[var(--destructive)]" />
              <div className="text-center">
                <p className="text-[var(--foreground)] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                  Report Generation Failed
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1" style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>
                  {report.error || 'An unknown error occurred.'}
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate('/app/idea-validator')}>
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {report.status === 'complete' && report.report && (
          <ReportViewer report={report.report} />
        )}
      </motion.div>
    </div>
  );
}

export default IdeaReportPage;
