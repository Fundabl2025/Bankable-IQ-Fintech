import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Award, Target } from 'lucide-react';
import { getOverallProgress } from '../utils/businessData';
import { Link } from 'react-router';

export function FicoWidget() {
  const [fundScore, setFundScore] = useState<{ score: number; band: { name: string; color: string } }>(() => {
    try {
      const stored = localStorage.getItem('fundscore_result');
      if (stored) {
        const result = JSON.parse(stored);
        return { score: result.score, band: result.band };
      }
    } catch (error) {
      console.error('Error reading FundScore:', error);
    }
    return { score: 0, band: { name: 'Take Assessment', color: '#64748b' } };
  });
  const [progress, setProgress] = useState(() => getOverallProgress());

  useEffect(() => {
    // Update when data changes
    const updateData = () => {
      try {
        const stored = localStorage.getItem('fundscore_result');
        if (stored) {
          const result = JSON.parse(stored);
          setFundScore({ score: result.score, band: result.band });
        }
      } catch (error) {
        console.error('Error reading FundScore:', error);
      }
      setProgress(getOverallProgress());
    };

    // Listen for data changes
    window.addEventListener('storage', updateData);
    window.addEventListener('scanDataUpdated', updateData);
    window.addEventListener('fundscoreUpdated', updateData);

    return () => {
      window.removeEventListener('storage', updateData);
      window.removeEventListener('scanDataUpdated', updateData);
      window.removeEventListener('fundscoreUpdated', updateData);
    };
  }, []);

  // Calculate percentage (0-1000 scale, show progress to 800 as "ready")
  const percentage = Math.min((fundScore.score / 800) * 100, 100);
  const isBankable = fundScore.score >= 750; // Lender Ready threshold
  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Calculate points needed to reach "Lender Ready" (750)
  const pointsNeeded = Math.max(0, 750 - fundScore.score);

  // Safety checks
  if (!progress) {
    return null;
  }

  return (
    <Link to="/fundscore-assessment" className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ borderColor: 'var(--border-medium)' }}
        whileTap={{ scale: 0.98 }}
        className="border rounded-lg p-4 cursor-pointer transition-all duration-300"
        style={{
          backgroundColor: isBankable ? 'var(--success-bg)' : 'var(--primary-bg)',
          borderColor: isBankable ? 'var(--success-border)' : 'var(--primary-border)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {isBankable ? (
            <div 
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: 'var(--success)', color: 'var(--success-foreground)' }}
            >
              <Award className="w-5 h-5" />
            </div>
          ) : (
            <div 
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              <Target className="w-5 h-5" />
            </div>
          )}
          <div>
            <div 
              className="text-xs uppercase tracking-[0.12em]"
              style={{ 
                fontFamily: 'var(--font-body)', 
                fontWeight: 400,
                color: isBankable ? 'var(--success)' : 'var(--primary)'
              }}
            >
              FUNDSCORE™
            </div>
            <div 
              className="text-[10px]"
              style={{ 
                fontFamily: 'var(--font-body)', 
                fontWeight: 300,
                color: 'var(--muted-foreground)'
              }}
            >
              Funding Readiness
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative flex items-center justify-center mb-3">
          <svg className="w-28 h-28 -rotate-90">
            {/* Background circle */}
            <circle
              cx="56"
              cy="56"
              r="36"
              stroke="var(--border)"
              strokeWidth="6"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="56"
              cy="56"
              r="36"
              stroke={isBankable ? 'var(--success)' : 'var(--primary)'}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>

          {/* Score Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div 
              className="text-2xl font-bold leading-none"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800,
                color: isBankable ? 'var(--success)' : 'var(--primary)'
              }}
            >
              {fundScore.score}
            </div>
            <div 
              className="text-xs font-medium"
              style={{ 
                fontFamily: 'var(--font-body)', 
                fontWeight: 400,
                color: 'var(--muted-foreground)'
              }}
            >
              / 1000
            </div>
          </div>
        </div>

        {/* Status & Progress */}
        <div className="space-y-2">
          {isBankable ? (
            <div 
              className="border rounded-sm px-3 py-2 text-center"
              style={{
                backgroundColor: 'var(--success-bg)',
                borderColor: 'var(--success-border)'
              }}
            >
              <div 
                className="text-sm font-bold flex items-center justify-center gap-1"
                style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700,
                  color: 'var(--success)'
                }}
              >
                <Award className="w-4 h-4" />
                LENDER READY!
              </div>
            </div>
          ) : fundScore.score === 0 ? (
            <div 
              className="border rounded-sm px-3 py-2 text-center"
              style={{
                backgroundColor: 'var(--surface-2)',
                borderColor: 'var(--border)'
              }}
            >
              <div 
                className="text-xs font-bold"
                style={{ 
                  fontFamily: 'var(--font-display)', 
                  fontWeight: 700,
                  color: 'var(--foreground)'
                }}
              >
                Take Assessment
              </div>
            </div>
          ) : (
            <>
              <div 
                className="rounded-sm px-3 py-2"
                style={{ backgroundColor: 'var(--surface-2)' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-body)', 
                      fontWeight: 300,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Points to Lender Ready:
                  </span>
                  <span 
                    className="font-bold"
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700,
                      color: 'var(--foreground)'
                    }}
                  >
                    {pointsNeeded}
                  </span>
                </div>
              </div>
              <div 
                className="rounded-sm px-3 py-2"
                style={{ backgroundColor: 'var(--surface-2)' }}
              >
                <div className="flex items-center justify-between text-xs">
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-body)', 
                      fontWeight: 300,
                      color: 'var(--muted-foreground)'
                    }}
                  >
                    Items Complete:
                  </span>
                  <span 
                    className="font-bold"
                    style={{ 
                      fontFamily: 'var(--font-display)', 
                      fontWeight: 700,
                      color: 'var(--foreground)'
                    }}
                  >
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* View Details Link */}
        <div 
          className="mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div 
            className="flex items-center justify-center gap-1 text-xs transition-colors"
            style={{ 
              fontFamily: 'var(--font-body)', 
              fontWeight: 400,
              color: isBankable ? 'var(--success)' : 'var(--primary)'
            }}
          >
            <TrendingUp className="w-3 h-3" />
            <span>View Assessment</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}