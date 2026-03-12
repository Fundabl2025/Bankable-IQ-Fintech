import { Progress } from './ui/progress';
import { LucideIcon } from 'lucide-react';

interface FeatureSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  progressMax: number;
  statusText: string;
  variant?: 'default' | 'warning' | 'success';
}

export function FeatureSection({
  icon: Icon,
  title,
  description,
  progressLabel,
  progressValue,
  progressMax,
  statusText,
  variant = 'default'
}: FeatureSectionProps) {
  const getProgressColor = () => {
    if (variant === 'warning') return 'bg-orange-500';
    if (variant === 'success') return 'bg-green-500';
    return 'bg-yellow-400';
  };

  const progressPercentage = (progressValue / progressMax) * 100;

  return (
    <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-start gap-3 mb-4">
        <Icon className="w-8 h-8 text-cyan-200" />
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      
      <p className="text-sm text-cyan-100 mb-4">{description}</p>
      
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`${getProgressColor()} px-3 py-1 rounded text-xs font-bold text-gray-900`}>
            {progressLabel}
          </span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-2">
          <div
            className={`${getProgressColor()} h-2 rounded-full transition-all`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <p className="text-xs text-cyan-100">{statusText}</p>
    </div>
  );
}
