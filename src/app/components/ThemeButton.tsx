import * as React from 'react';
import { Button } from './ui/button';
import { cn } from './ui/utils';

export type ThemeColor = 'blue-cyan' | 'purple-pink' | 'green' | 'orange' | 'red';

interface ThemeButtonProps extends React.ComponentProps<typeof Button> {
  theme?: ThemeColor;
}

// Theme color mappings for consistent styling across modules
const themeColors: Record<ThemeColor, {
  primary: string;
  hover: string;
  gradient: string;
  light: string;
  border: string;
}> = {
  'blue-cyan': {
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    gradient: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    light: 'bg-blue-500/20 border-blue-500/50',
    border: 'border-blue-500/30'
  },
  'purple-pink': {
    primary: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    gradient: 'bg-gradient-to-r from-purple-600 to-pink-600',
    light: 'bg-purple-500/20 border-purple-500/50',
    border: 'border-purple-500/30'
  },
  'green': {
    primary: 'bg-green-600',
    hover: 'hover:bg-green-700',
    gradient: 'bg-gradient-to-r from-green-600 to-emerald-600',
    light: 'bg-green-500/20 border-green-500/50',
    border: 'border-green-500/30'
  },
  'orange': {
    primary: 'bg-orange-600',
    hover: 'hover:bg-orange-700',
    gradient: 'bg-gradient-to-r from-orange-600 to-amber-600',
    light: 'bg-orange-500/20 border-orange-500/50',
    border: 'border-orange-500/30'
  },
  'red': {
    primary: 'bg-red-600',
    hover: 'hover:bg-red-700',
    gradient: 'bg-gradient-to-r from-red-600 to-rose-600',
    light: 'bg-red-500/20 border-red-500/50',
    border: 'border-red-500/30'
  }
};

export function ThemeButton({
  theme = 'blue-cyan',
  className,
  variant = 'default',
  children,
  ...props
}: ThemeButtonProps) {
  const colors = themeColors[theme];

  // Apply theme colors based on variant
  const themeClassName = React.useMemo(() => {
    if (variant === 'default') {
      return cn(colors.primary, colors.hover);
    }
    if (variant === 'outline') {
      return cn(colors.light, 'border', colors.border);
    }
    return '';
  }, [variant, colors]);

  return (
    <Button
      variant={variant}
      className={cn(themeClassName, className)}
      {...props}
    >
      {children}
    </Button>
  );
}

// Export theme utilities for other components
export const getThemeGradient = (theme: ThemeColor) => themeColors[theme].gradient;
export const getThemeColors = (theme: ThemeColor) => themeColors[theme];
