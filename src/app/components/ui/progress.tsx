"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative w-full overflow-hidden rounded-sm",
        className,
      )}
      style={{
        height: '4px',
        backgroundColor: 'var(--border)'
      }}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1"
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          background: 'linear-gradient(90deg, var(--destructive), var(--warning), #d4c443, var(--info), var(--success))',
          transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
