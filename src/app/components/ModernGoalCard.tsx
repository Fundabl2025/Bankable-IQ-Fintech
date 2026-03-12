import { motion } from 'motion/react';
import { ProgressRing } from './ui/progress-ring';
import { Badge } from './ui/badge';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface ModernGoalCardProps {
  number: number;
  title: string;
  description: string;
  status?: 'completed' | 'in-progress' | 'not-started' | 'unqualified';
  progress?: number;
}

export function ModernGoalCard({ 
  number, 
  title, 
  description, 
  status = 'not-started',
  progress = 0
}: ModernGoalCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          badge: 'Completed',
          variant: 'success' as const,
          color: '#10b981'
        };
      case 'in-progress':
        return {
          icon: AlertCircle,
          badge: 'In Progress',
          variant: 'info' as const,
          color: '#06b6d4'
        };
      case 'unqualified':
        return {
          icon: AlertCircle,
          badge: 'Unqualified',
          variant: 'warning' as const,
          color: '#f59e0b'
        };
      default:
        return {
          icon: Circle,
          badge: 'Not Started',
          variant: 'secondary' as const,
          color: '#64748b'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.15)' }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-200 p-8 shadow-md relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-50" />
      
      {/* Goal number badge */}
      <div className="absolute top-6 right-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">{number}</span>
        </div>
      </div>

      <div className="relative">
        <div className="mb-4">
          <Badge variant={statusConfig.variant} className="mb-3">
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.badge}
          </Badge>
          <h3 className="text-xl font-bold text-gray-900 mb-2 pr-12">
            Goal {number}
          </h3>
          <p className="text-base font-semibold text-gray-700 mb-3">
            {title}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Progress indicator */}
        {progress > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
