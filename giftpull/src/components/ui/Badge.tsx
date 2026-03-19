"use client";

import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default:
    "bg-surface-light text-text-secondary border border-border-subtle",
  success:
    "bg-success/15 text-success border border-success/30",
  warning:
    "bg-warning/15 text-warning border border-warning/30",
  epic:
    "bg-epic/15 text-epic border border-epic/30",
  legendary:
    "bg-gradient-to-r from-warning/20 to-red-500/20 text-warning border border-warning/30",
  brand:
    "bg-primary/15 text-primary border border-primary/30",
} as const;

const sizeStyles = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
} as const;

type BadgeVariant = keyof typeof variantStyles;
type BadgeSize = keyof typeof sizeStyles;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-semibold rounded-full whitespace-nowrap uppercase tracking-wide",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
export type { BadgeProps, BadgeVariant, BadgeSize };
