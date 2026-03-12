import { LucideIcon, Lock, Target, CheckCircle2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { useState } from 'react';
import { RequirementsGapModal } from './RequirementsGapModal';
import { FundingApplicationModal } from './FundingApplicationModal';
import { isProgramPreQualified } from '../utils/fundingEligibility';
import { getFundingPrograms } from '../utils/fundingEligibility';

interface FundingProgramHeaderProps {
  programId: string;
  icon: LucideIcon;
  title: string;
  description: string;
  amount: string;
  onApplyClick?: () => void;
}

export function FundingProgramHeader({
  programId,
  icon: Icon,
  title,
  description,
  amount,
  onApplyClick
}: FundingProgramHeaderProps) {
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  
  const isPreQualified = isProgramPreQualified(programId);
  const allPrograms = getFundingPrograms();
  const programData = allPrograms.find(p => p.id === programId);
  
  const getProximityStatus = () => {
    if (isPreQualified) return 'qualified';
    if (!programData?.gapAnalysis) return 'locked';
    
    const progress = programData.gapAnalysis.matchScore || 0;
    if (progress >= 70) return 'close';
    if (progress >= 50) return 'almost';
    return 'locked';
  };

  const proximityStatus = getProximityStatus();

  const handleApply = () => {
    if (onApplyClick) {
      onApplyClick();
    } else {
      setIsApplicationModalOpen(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl p-6 border-2"
        style={{
          backgroundColor: isPreQualified
            ? 'var(--success-bg)'
            : proximityStatus === 'close'
            ? 'var(--warning-bg)'
            : 'var(--surface-1)',
          borderColor: isPreQualified
            ? 'var(--success-border)'
            : proximityStatus === 'close'
            ? 'var(--warning-border)'
            : 'var(--border)'
        }}
      >
        <div className="flex items-start gap-6">
          {/* Icon */}
          <div 
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{
              background: isPreQualified
                ? 'linear-gradient(to bottom right, var(--success), var(--info))'
                : proximityStatus === 'close'
                ? 'linear-gradient(to bottom right, var(--warning), var(--warning))'
                : 'linear-gradient(to bottom right, var(--muted-foreground), var(--border-strong))'
            }}
          >
            <Icon className="w-10 h-10" style={{ color: isPreQualified || proximityStatus === 'close' ? 'var(--background)' : 'var(--foreground)' }} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {title}
                  </h1>
                  <Badge variant={
                    isPreQualified ? 'success' : proximityStatus === 'close' ? 'warning' : 'default'
                  }>
                    {isPreQualified 
                      ? '✓ Pre-Qualified' 
                      : proximityStatus === 'close'
                      ? '⚡ Almost There!'
                      : '🔒 Locked'}
                  </Badge>
                </div>
                <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
                  {description}
                </p>
              </div>

              {/* Amount Badge */}
              <div 
                className="text-right ml-4 p-4 rounded-xl border-2"
                style={{
                  backgroundColor: isPreQualified
                    ? 'var(--success-bg)'
                    : proximityStatus === 'close'
                    ? 'var(--warning-bg)'
                    : 'var(--surface-2)',
                  borderColor: isPreQualified
                    ? 'var(--success-border)'
                    : proximityStatus === 'close'
                    ? 'var(--warning-border)'
                    : 'var(--border)'
                }}
              >
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Available Funding</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {amount}
                </p>
              </div>
            </div>

            {/* Progress Indicator for Close Programs */}
            {!isPreQualified && programData?.gapAnalysis && proximityStatus === 'close' && (
              <div className="mb-4 p-3 border rounded-lg" style={{ 
                backgroundColor: 'var(--warning-bg)',
                borderColor: 'var(--warning-border)'
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                    {programData.gapAnalysis.passedRequirements.length} of {programData.gapAnalysis.passedRequirements.length + programData.gapAnalysis.failedRequirements.length} Requirements Met
                  </span>
                  <span className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                    {programData.gapAnalysis.matchScore}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${programData.gapAnalysis.matchScore}%`,
                      background: 'linear-gradient(to right, var(--warning), var(--warning))'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-4">
              {isPreQualified ? (
                <Button
                  onClick={handleApply}
                  size="lg"
                  className="shadow-lg"
                  style={{
                    background: 'linear-gradient(to right, var(--success), var(--info))',
                    color: 'var(--success-foreground)'
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Apply Now
                </Button>
              ) : (
                <Button
                  onClick={() => setIsGapModalOpen(true)}
                  size="lg"
                  variant="outline"
                  className="shadow-md"
                >
                  {proximityStatus === 'close' ? (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      View Gap Analysis
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      View Requirements to Unlock
                    </>
                  )}
                </Button>
              )}

              {!isPreQualified && proximityStatus === 'close' && (
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg" style={{ 
                  backgroundColor: 'var(--warning-bg)',
                  borderColor: 'var(--warning-border)'
                }}>
                  <Target className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                    You're close! Just {programData?.gapAnalysis?.failedRequirements.length || 0} requirement{(programData?.gapAnalysis?.failedRequirements.length || 0) !== 1 ? 's' : ''} away
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gap Analysis Modal */}
      {programData && (
        <RequirementsGapModal
          isOpen={isGapModalOpen}
          onClose={() => setIsGapModalOpen(false)}
          programName={title}
          programAmount={amount}
          gapAnalysis={programData.gapAnalysis}
        />
      )}

      {/* Application Modal */}
      <FundingApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        programName={title}
        programAmount={amount}
        programType={programData?.type || 'Funding'}
      />
    </>
  );
}
