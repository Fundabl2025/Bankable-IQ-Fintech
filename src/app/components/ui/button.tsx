import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-offset-0 active:scale-[0.97] uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] rounded-sm shadow-sm font-bold",
        destructive:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:bg-[var(--destructive)]/90 rounded-sm shadow-sm font-bold",
        outline:
          "border border-[var(--border-medium)] bg-transparent text-[var(--muted-foreground)] hover:border-[var(--primary-border)] hover:text-[var(--foreground)] rounded-sm",
        secondary:
          "bg-transparent border border-[var(--border-medium)] text-[var(--muted-foreground)] hover:border-[var(--primary-border)] hover:text-[var(--foreground)] rounded-sm",
        ghost:
          "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] rounded-sm",
        link: "text-[var(--primary)] underline-offset-4 hover:underline font-normal normal-case tracking-normal",
      },
      size: {
        default: "h-auto px-6 py-3",
        sm: "h-auto px-4 py-2 text-xs",
        lg: "h-auto px-8 py-4 text-base",
        icon: "size-10 rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
