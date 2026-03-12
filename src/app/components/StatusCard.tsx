interface StatusCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'warning' | 'info' | 'success' | 'destructive';
}

export function StatusCard({ label, value, subtext, variant = 'default' }: StatusCardProps) {
  const variantClasses = {
    default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
    warning: 'bg-[var(--warning)] text-[var(--warning-foreground)]',
    info: 'bg-[var(--info)] text-[var(--info-foreground)]',
    success: 'bg-[var(--success)] text-[var(--success-foreground)]',
    destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
  };
  
  return (
    <div className={`${variantClasses[variant]} border-2 border-[var(--border)] rounded-lg p-4 text-center`}>
      <p 
        className="text-xs uppercase tracking-[0.12em] mb-2 opacity-90"
        style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}
      >
        {label}
      </p>
      <p 
        className="text-3xl font-bold"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}
      >
        {value}
      </p>
      {subtext && (
        <p 
          className="text-xs mt-1 opacity-80"
          style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
