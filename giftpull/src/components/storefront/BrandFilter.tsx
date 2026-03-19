"use client";

import React, { useRef } from "react";
import { cn, getBrandColor, getBrandDisplayName } from "@/lib/utils";

const ALL_BRANDS = [
  "XBOX",
  "STEAM",
  "NINTENDO",
  "PLAYSTATION",
  "GOOGLE_PLAY",
  "AMAZON",
  "APPLE",
  "ROBLOX",
  "SPOTIFY",
  "NETFLIX",
] as const;

interface BrandFilterProps {
  selectedBrand: string | null;
  onBrandChange: (brand: string | null) => void;
}

export function BrandFilter({ selectedBrand, onBrandChange }: BrandFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      {/* Fade edges to indicate scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* "All" pill */}
        <button
          onClick={() => onBrandChange(null)}
          className={cn(
            "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            selectedBrand === null
              ? "bg-primary text-white shadow-lg shadow-primary/25"
              : "bg-surface-light text-text-secondary hover:text-text-primary hover:bg-surface-light/80 border border-border-subtle"
          )}
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              selectedBrand === null ? "bg-white" : "bg-text-secondary"
            )}
          />
          All
        </button>

        {/* Brand pills */}
        {ALL_BRANDS.map((brand) => {
          const isActive = selectedBrand === brand;
          const brandColor = getBrandColor(brand);
          const displayName = getBrandDisplayName(brand);

          return (
            <button
              key={brand}
              onClick={() => onBrandChange(brand)}
              className={cn(
                "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-white shadow-lg"
                  : "bg-surface-light text-text-secondary hover:text-text-primary hover:bg-surface-light/80 border border-border-subtle"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: brandColor,
                      boxShadow: `0 4px 14px ${brandColor}40`,
                    }
                  : undefined
              }
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: isActive ? "#FFFFFF" : brandColor,
                }}
              />
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
