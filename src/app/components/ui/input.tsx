import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-[var(--muted-foreground)] selection:bg-primary selection:text-primary-foreground flex h-auto w-full min-w-0 rounded-sm border-2 border-[var(--border)] px-4 py-3 text-sm bg-[var(--input)] text-[var(--foreground)] transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        "focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(138,184,32,0.12)]",
        "aria-invalid:border-[var(--destructive)] aria-invalid:shadow-[0_0_0_3px_rgba(176,68,40,0.12)]",
        className,
      )}
      style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}
      {...props}
    />
  );
}

export { Input };
