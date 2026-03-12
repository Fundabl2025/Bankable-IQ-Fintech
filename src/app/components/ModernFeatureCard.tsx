import { motion } from 'motion/react';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { ProgressRing } from './ui/progress-ring';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card-modern';

interface ModernFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  progressLabel: string;
  progressValue: number;
  progressMax: number;
  statusText: string;
  variant?: 'default' | 'warning' | 'success' | 'info';
  onAction?: () => void;
}

export function ModernFeatureCard({
  icon: Icon,
  title,
  description,
  progressLabel,
  progressValue,
  progressMax,
  statusText,
  variant = 'default',
  onAction
}: ModernFeatureCardProps) {
  const progressPercentage = Math.round((progressValue / progressMax) * 100);
  
  const getVariantConfig = () => {
    switch (variant) {
      case 'warning':
        return {
          badge: 'warning' as const,
          iconBg: 'from-amber-500 to-orange-500',
          progressColor: '#f59e0b'
        };
      case 'success':
        return {
          badge: 'success' as const,
          iconBg: 'from-emerald-500 to-green-500',
          progressColor: '#10b981'
        };
      case 'info':
        return {
          badge: 'info' as const,
          iconBg: 'from-cyan-500 to-blue-500',
          progressColor: '#06b6d4'
        };
      default:
        return {
          badge: 'default' as const,
          iconBg: 'from-blue-500 to-indigo-500',
          progressColor: '#3b82f6'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md"
    >
      <div className="p-6">
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 bg-gradient-to-br ${config.iconBg} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <Badge variant={config.badge} className="text-xs">
            {progressValue}/{progressMax}
          </Badge>
        </div>

        {/* Title and description */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>

        {/* Progress section */}
        <div className="space-y-4">
          {/* Progress ring */}
          <div className="flex items-center justify-center py-4">
            <ProgressRing
              percentage={progressPercentage}
              size={100}
              strokeWidth={8}
              color={config.progressColor}
            />
          </div>

          {/* Progress label */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-700 mb-1">{progressLabel}</p>
            <p className="text-xs text-gray-600">{statusText}</p>
          </div>
        </div>

        {/* Action button */}
        {onAction && (
          <motion.button
            whileHover={{ x: 4 }}
            onClick={onAction}
            className="mt-4 w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group"
          >
            <span className="text-sm font-medium text-gray-700">View Details</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
