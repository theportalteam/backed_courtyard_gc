"use client";

import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default:
    "bg-bg-elevated text-text-secondary border border-bg-border",
  success:
    "bg-success-muted text-success border border-success/30",
  warning:
    "bg-warning-muted text-warning border border-warning/30",
  epic:
    "bg-rarity-epic/15 text-rarity-epic border border-rarity-epic/30",
  legendary:
    "bg-gradient-to-r from-[rgba(255,177,195,0.12)] to-[rgba(125,0,255,0.12)] text-tertiary border border-tertiary/30",
  brand:
    "bg-primary-muted text-primary border border-primary/30",
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
          "inline-flex items-center font-headline font-bold rounded-badge whitespace-nowrap uppercase tracking-wide",
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
