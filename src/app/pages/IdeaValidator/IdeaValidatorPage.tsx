/**
 * Idea Validator Page
 *
 * Main page for the Idea Validator feature. Users enter a business idea,
 * receive an AI-generated comprehensive report, and can view past reports.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import Anthropic from '@anthropic-ai/sdk';
import { useAuth } from '../../contexts/AuthContext';
import { IdeaInputForm } from './components/IdeaInputForm';
import { PastReportsList } from './components/PastReportsList';
import { getReports, saveReport, deleteReport, generateReportId } from './lib/store';
import { IDEA_VALIDATOR_SYSTEM_PROMPT, buildUserPrompt } from './lib/prompt';
import type { IdeaReport, BusinessReport } from './lib/types';

// Fallback user ID when Supabase is not configured (dev mode)
const DEV_USER_ID = 'dev-user';

export function IdeaValidatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<IdeaReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const userId = user?.id ?? DEV_USER_ID;

  const loadReports = useCallback(() => {
    setReports(getReports(userId));
  }, [userId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleSubmit = async (ideaDescription: string) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      toast.error('Anthropic API key not configured. Set VITE_ANTHROPIC_API_KEY in your environment.');
      return;
    }

    const reportId = generateReportId();
    const newReport: IdeaReport = {
      id: reportId,
      userId,
      ideaDescription,
      createdAt: new Date().toISOString(),
      status: 'generating',
      report: null,
    };

    // Save the generating report and update state
    saveReport(userId, newReport);
    loadReports();
    setIsGenerating(true);

    try {
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: IDEA_VALIDATOR_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(ideaDescription),
          },
        ],
      });

      // Extract text from the response
      const textContent = message.content.find((block) => block.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in AI response');
      }

      // Parse the JSON response
      let reportData: BusinessReport;
      try {
        reportData = JSON.parse(textContent.text);
      } catch {
        // Try to extract JSON from potential markdown code fences
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      // Update the report with the parsed data
      const completedReport: IdeaReport = {
        ...newReport,
        status: 'complete',
        report: reportData,
      };

      saveReport(userId, completedReport);
      loadReports();
      toast.success('Report generated successfully!');

      // Navigate to the report detail page
      navigate(`/app/idea-validator/${reportId}`);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate report';
      const errorReport: IdeaReport = {
        ...newReport,
        status: 'error',
        error: errorMessage,
      };

      saveReport(userId, errorReport);
      loadReports();
      toast.error(`Report generation failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (reportId: string) => {
    deleteReport(userId, reportId);
    loadReports();
    toast.success('Report deleted');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-[var(--primary-bg)] border border-[var(--primary-border)]">
            <Lightbulb className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Idea Validator
            </h1>
            <p
              className="text-sm text-[var(--muted-foreground)]"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
            >
              Get a comprehensive AI-powered business analysis of your idea
            </p>
          </div>
        </div>
      </motion.div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <IdeaInputForm onSubmit={handleSubmit} isGenerating={isGenerating} />
      </motion.div>

      {/* Past Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <PastReportsList reports={reports} onDelete={handleDelete} />
      </motion.div>
    </div>
  );
}

export default IdeaValidatorPage;
