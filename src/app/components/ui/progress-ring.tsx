import { motion } from 'motion/react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
}

export function ProgressRing({ 
  percentage, 
  size = 120, 
  strokeWidth = 10,
  label,
  showPercentage = true,
  color
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  // Use primary color or provided color
  const ringColor = color || 'var(--primary)';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <motion.span
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: ringColor
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              {percentage}%
            </motion.span>
          )}
        </div>
      </div>
      
      {label && (
        <p 
          className="text-xs uppercase tracking-[0.12em] mt-3 text-center"
          style={{ 
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            color: 'var(--muted-foreground)'
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
