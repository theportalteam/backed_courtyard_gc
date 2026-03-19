"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getRarityBorderClass } from "@/lib/utils";

const paddingStyles = {
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
} as const;

type CardVariant = "default" | "interactive" | "rarity";
type CardPadding = keyof typeof paddingStyles;

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  rarity?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      rarity,
      children,
      ...props
    },
    ref
  ) => {
    const isLegendary = variant === "rarity" && rarity === "LEGENDARY";

    if (isLegendary) {
      return (
        <div className="legendary-border rounded-card p-[2px]">
          <div
            ref={ref}
            className={cn(
              "bg-surface rounded-card",
              paddingStyles[padding],
              className
            )}
            {...props}
          >
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface rounded-card border",
          variant === "default" && "border-border-subtle",
          variant === "interactive" &&
            "border-border-subtle card-hover cursor-pointer",
          variant === "rarity" && rarity
            ? `border-2 ${getRarityBorderClass(rarity)}`
            : variant === "rarity" && "border-border-subtle",
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-4 pb-4 border-b border-border-subtle", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-4 pt-4 border-t border-border-subtle", className)}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter };
export type { CardProps, CardVariant, CardPadding };
