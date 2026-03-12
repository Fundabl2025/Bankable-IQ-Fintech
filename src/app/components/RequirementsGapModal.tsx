import { X, CheckCircle2, XCircle, AlertCircle, TrendingUp, Target, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import type { EligibilityResult } from '../utils/fundingRequirements';

interface RequirementsGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  programAmount: string;
  gapAnalysis: EligibilityResult | null;
}

export function RequirementsGapModal({
  isOpen,
  onClose,
  programName,
  programAmount,
  gapAnalysis
}: RequirementsGapModalProps) {
  const navigate = useNavigate();

  if (!gapAnalysis) return null;

  const requirementsMet = gapAnalysis.passedRequirements.length;
  const requirementsMissing = gapAnalysis.failedRequirements.length;
  const totalRequirements = requirementsMet + requirementsMissing + gapAnalysis.missingData.length;
  const progressPercentage = totalRequirements > 0 
    ? Math.round((requirementsMet / totalRequirements) * 100) 
    : 0;

  const isClose = progressPercentage >= 70;
  const isAlmostThere = progressPercentage >= 50 && progressPercentage < 70;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-50"
            style={{ backgroundColor: 'var(--card)' }}
          >
            {/* Header */}
            <div className="sticky top-0 p-6 rounded-t-2xl border-b" style={{ 
              background: 'linear-gradient(to right, var(--surface-3), var(--muted))',
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="pr-12">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-2)' }}>
                    <Lock className="w-6 h-6" style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{programName}</h2>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{programAmount}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>
                    {isClose ? '🎯 Almost There!' : isAlmostThere ? '⚡ Making Progress' : '📋 Requirements Overview'}
                  </span>
                  <span className="text-sm font-bold">
                    {requirementsMet} of {totalRequirements} Requirements Met
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background: isClose
                        ? 'linear-gradient(to right, var(--success), var(--info))'
                        : isAlmostThere
                        ? 'linear-gradient(to right, var(--warning), var(--warning))'
                        : 'linear-gradient(to right, var(--muted-foreground), var(--border-medium))'
                    }}
                  />
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {progressPercentage}% Complete
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Match Score Banner */}
              <div className="rounded-xl p-4 border-2" style={{
                backgroundColor: isClose ? 'var(--success-bg)' : isAlmostThere ? 'var(--warning-bg)' : 'var(--surface-1)',
                borderColor: isClose ? 'var(--success-border)' : isAlmostThere ? 'var(--warning-border)' : 'var(--border)'
              }}>
                <div className="flex items-center gap-3">
                  {isClose ? (
                    <Target className="w-8 h-8" style={{ color: 'var(--success)' }} />
                  ) : isAlmostThere ? (
                    <TrendingUp className="w-8 h-8" style={{ color: 'var(--warning)' }} />
                  ) : (
                    <AlertCircle className="w-8 h-8" style={{ color: 'var(--muted-foreground)' }} />
                  )}
                  <div>
                    <h3 className="font-bold" style={{ 
                      color: isClose ? 'var(--foreground)' : isAlmostThere ? 'var(--foreground)' : 'var(--foreground)' 
                    }}>
                      {isClose
                        ? 'You\'re very close to qualifying!'
                        : isAlmostThere
                        ? 'You\'re making good progress'
                        : 'Here\'s what you need to unlock this program'}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {isClose
                        ? `Complete ${requirementsMissing} more requirement${requirementsMissing !== 1 ? 's' : ''} to unlock this funding option`
                        : isAlmostThere
                        ? `${requirementsMissing} requirement${requirementsMissing !== 1 ? 's' : ''} to go`
                        : `Work on these ${requirementsMissing + gapAnalysis.missingData.length} items to become eligible`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements Met */}
              {gapAnalysis.passedRequirements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--success-bg)' }}>
                      <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
                    </div>
                    Requirements You Meet ({gapAnalysis.passedRequirements.length})
                  </h3>
                  <div className="space-y-2">
                    {gapAnalysis.passedRequirements.map((req, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                        style={{ 
                          backgroundColor: 'var(--success-bg)',
                          borderColor: 'var(--success-border)'
                        }}
                      >
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--success)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{req}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements Missing */}
              {gapAnalysis.failedRequirements.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--destructive-bg)' }}>
                      <XCircle className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                    </div>
                    What You Need to Improve ({gapAnalysis.failedRequirements.length})
                  </h3>
                  <div className="space-y-2">
                    {gapAnalysis.failedRequirements.map((req, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (gapAnalysis.passedRequirements.length + idx) * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                        style={{ 
                          backgroundColor: 'var(--destructive-bg)',
                          borderColor: 'var(--destructive-border)'
                        }}
                      >
                        <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--destructive)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{req}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Data */}
              {gapAnalysis.missingData.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--warning-bg)' }}>
                      <AlertCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                    </div>
                    Additional Information Needed ({gapAnalysis.missingData.length})
                  </h3>
                  <div className="space-y-2">
                    {gapAnalysis.missingData.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (gapAnalysis.passedRequirements.length + gapAnalysis.failedRequirements.length + idx) * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg border"
                        style={{ 
                          backgroundColor: 'var(--warning-bg)',
                          borderColor: 'var(--warning-border)'
                        }}
                      >
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--warning)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              <div className="rounded-xl p-4 border" style={{ 
                backgroundColor: 'var(--info-bg)',
                borderColor: 'var(--border)'
              }}>
                <h3 className="font-bold mb-3" style={{ color: 'var(--foreground)' }}>📈 Next Steps to Unlock This Program</h3>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--foreground)' }}>
                  {requirementsMissing > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">1.</span>
                      <span>Work on improving the requirements listed above through our 90-day coaching program</span>
                    </li>
                  )}
                  {gapAnalysis.missingData.length > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="font-bold mt-0.5">2.</span>
                      <span>Retake the Business Success Scan with complete information</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5">{requirementsMissing > 0 || gapAnalysis.missingData.length > 0 ? '3.' : '1.'}</span>
                    <span>Complete the relevant modules in your dashboard to build bankability</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 border-t p-6 rounded-b-2xl" style={{ 
              backgroundColor: 'var(--surface-1)',
              borderColor: 'var(--border)'
            }}>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    onClose();
                    navigate('/dashboard');
                  }}
                  className="flex-1"
                  style={{
                    background: 'linear-gradient(to right, var(--primary), var(--info))',
                    color: 'var(--primary-foreground)'
                  }}
                >
                  View Dashboard & Get Started
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    navigate('/business-success-scan/step-1');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Retake Scan
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
