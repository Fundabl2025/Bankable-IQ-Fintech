import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  unlocked?: boolean;
}

export function Card({ children, className = '', hover = false, unlocked = false }: CardProps) {
  const baseClasses = `bg-[var(--card)] rounded-lg border ${
    unlocked 
      ? 'border-[var(--primary-border)] bg-[var(--primary-bg)]' 
      : 'border-[var(--border)]'
  } transition-colors ${className}`;
  
  if (hover) {
    return (
      <motion.div
        whileHover={{ borderColor: 'var(--border-medium)' }}
        transition={{ duration: 0.2 }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    );
  }
  
  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 pb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 
      className={`text-[15px] uppercase tracking-[0.02em] text-[var(--foreground)] ${className}`}
      style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p 
      className={`text-sm text-[var(--muted-foreground)] mt-1 ${className}`}
      style={{ fontFamily: 'var(--font-body)', fontWeight: 300, lineHeight: 1.65 }}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}
