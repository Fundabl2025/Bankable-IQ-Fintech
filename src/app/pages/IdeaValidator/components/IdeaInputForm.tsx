import { useState } from 'react';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';

interface IdeaInputFormProps {
  onSubmit: (idea: string) => void;
  isGenerating: boolean;
}

const EXAMPLE_IDEAS = [
  'An AI-powered personal finance app that analyzes spending patterns and automatically negotiates better rates on bills and subscriptions.',
  'A subscription box service for sustainable home products, delivering eco-friendly alternatives to common household items monthly.',
  'A B2B SaaS platform that uses computer vision to automate quality control inspections in manufacturing.',
];

export function IdeaInputForm({ onSubmit, isGenerating }: IdeaInputFormProps) {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isGenerating) return;
    onSubmit(idea.trim());
  };

  const handleExampleClick = (example: string) => {
    setIdea(example);
  };

  return (
    <Card className="border-[var(--primary-border)] bg-[var(--surface-1)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-[var(--primary)]" />
          Describe Your Business Idea
        </CardTitle>
        <CardDescription>
          Enter a detailed description of your business idea. The more detail you provide,
          the more comprehensive and actionable your report will be.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Example: A mobile app that connects local organic farmers directly with consumers, offering subscription-based weekly produce boxes with real-time delivery tracking and recipes based on seasonal availability..."
            className="min-h-[140px] bg-[var(--surface-2)] border-[var(--border)] focus-visible:border-[var(--primary)] text-[var(--foreground)]"
            disabled={isGenerating}
          />

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={!idea.trim() || isGenerating}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Validate My Idea
                </>
              )}
            </Button>

            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-body)' }}>
                Try an example:
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_IDEAS.map((example, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExampleClick(example)}
                    disabled={isGenerating}
                    className="text-left text-xs px-3 py-1.5 rounded-sm border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary-border)] hover:text-[var(--foreground)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {example.substring(0, 60)}...
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
