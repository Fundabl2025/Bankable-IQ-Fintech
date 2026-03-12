import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'destructive';
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  description,
  color = 'primary' 
}: StatCardProps) {
  const colorClasses = {
    primary: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    success: 'bg-[var(--success)] text-[var(--success-foreground)]',
    warning: 'bg-[var(--warning)] text-[var(--warning-foreground)]',
    info: 'bg-[var(--info)] text-[var(--info-foreground)]',
    destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
  };

  return (
    <motion.div
      whileHover={{ borderColor: 'var(--border-medium)' }}
      className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-5 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend.isPositive ? 'text-[var(--success)]' : 'text-[var(--destructive)]'
          }`}
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p 
          className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)] mb-1"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}
        >
          {title}
        </p>
        <p 
          className="text-3xl font-bold text-[var(--foreground)] mb-1"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}
        >
          {value}
        </p>
        {description && (
          <p 
            className="text-sm text-[var(--muted-foreground)]"
            style={{ fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.65 }}
          >
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
