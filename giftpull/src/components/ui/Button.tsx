"use client";

import React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 rounded-button",
  secondary:
    "bg-bg-surface hover:bg-bg-elevated text-text-primary border border-bg-border rounded-button",
  danger:
    "bg-danger hover:bg-red-700 text-white shadow-lg shadow-danger/25 rounded-button",
  ghost:
    "bg-transparent hover:bg-bg-elevated text-text-secondary hover:text-text-primary rounded-button",
  success:
    "bg-success hover:bg-success-hover text-white shadow-lg shadow-success/25 rounded-button",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          "active:scale-[0.97]",
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
