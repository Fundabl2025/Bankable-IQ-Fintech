import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[var(--primary-bg)] text-[var(--primary)] border-[var(--primary-border)]',
    success: 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success-border)]',
    warning: 'bg-[var(--warning-bg)] text-[var(--warning)] border-[var(--warning-border)]',
    error: 'bg-[var(--destructive-bg)] text-[var(--destructive)] border-[var(--destructive-border)]',
    info: 'bg-[var(--info-bg)] text-[var(--info)] border-[rgba(56,168,128,.25)]',
    secondary: 'bg-[var(--surface-2)] text-[var(--muted-foreground)] border-[var(--border)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-normal uppercase tracking-[0.15em] border ${variants[variant]} ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </span>
  );
}
