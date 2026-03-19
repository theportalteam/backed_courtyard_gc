"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Store,
  SlidersHorizontal,
  Plus,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { cn, formatCurrency, getBrandColor, getBrandDisplayName } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ListingCard } from "@/components/marketplace/ListingCard";
import type { ListingCardData } from "@/components/marketplace/ListingCard";

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

type SortOption = "newest" | "price_asc" | "price_desc" | "discount";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount", label: "Best Discount" },
];

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-card border border-border-subtle p-5 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-6 w-20 bg-surface-light rounded-full" />
        <div className="h-4 w-14 bg-surface-light rounded-full" />
      </div>
      <div className="h-6 w-40 bg-surface-light rounded-lg mb-3" />
      <div className="h-px w-full bg-surface-light mb-3" />
      <div className="flex items-end justify-between mb-3">
        <div className="h-8 w-24 bg-surface-light rounded-lg" />
        <div className="h-5 w-20 bg-surface-light rounded-full" />
      </div>
      <div className="bg-surface-light rounded-xl p-3 mb-4">
        <div className="h-4 w-full bg-surface rounded-lg mb-2" />
        <div className="h-3 w-24 bg-surface rounded-lg" />
      </div>
      <div className="h-3 w-16 bg-surface-light rounded-lg mb-4" />
      <div className="h-10 w-full bg-surface-light rounded-xl" />
    </div>
  );
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBrand) params.set("brand", selectedBrand);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("sort", sortBy);

      const res = await fetch(`/api/marketplace/listings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setListings(data.listings ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setListings([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const clearFilters = useCallback(() => {
    setSelectedBrand(null);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setShowPriceFilter(false);
  }, []);

  const hasFilters = selectedBrand || minPrice || maxPrice || sortBy !== "newest";

  return (
    <div className="relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
                P2P Marketplace
              </h1>
            </div>
            <p className="text-text-secondary ml-[52px]">
              Buy and sell gift cards directly from other users
            </p>
          </div>

          <Link href="/marketplace/sell">
            <Button
              variant="success"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              Sell a Card
            </Button>
          </Link>
        </div>

        {/* Brand Filter Pills */}
        <div className="relative mb-6">
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div
            className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* All pill */}
            <button
              onClick={() => setSelectedBrand(null)}
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

            {ALL_BRANDS.map((brand) => {
              const isActive = selectedBrand === brand;
              const brandColor = getBrandColor(brand);
              const displayName = getBrandDisplayName(brand);

              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
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

        {/* Sort + Price Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          {/* Price range toggle */}
          <button
            onClick={() => setShowPriceFilter(!showPriceFilter)}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
              showPriceFilter
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-surface-light border-border-subtle text-text-secondary hover:text-text-primary"
            )}
          >
            <DollarSign className="w-4 h-4" />
            Price Range
          </button>

          {/* Price inputs (shown when toggled) */}
          {showPriceFilter && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={cn(
                  "w-24 bg-surface-light border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary",
                  "placeholder:text-text-secondary/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                  "transition-all duration-200"
                )}
              />
              <span className="text-text-secondary text-sm">to</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={cn(
                  "w-24 bg-surface-light border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary",
                  "placeholder:text-text-secondary/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                  "transition-all duration-200"
                )}
              />
            </div>
          )}

          <div className="flex-1" />

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-text-secondary" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className={cn(
                "bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                "transition-all duration-200 cursor-pointer appearance-none pr-8"
              )}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              No listings found
            </h3>
            <p className="text-sm text-text-secondary text-center max-w-xs">
              {hasFilters
                ? "Try adjusting your filters to find more listings."
                : "Be the first to list a gift card on the marketplace!"}
            </p>
            <div className="flex items-center gap-3 mt-5">
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
                >
                  Clear all filters
                </button>
              )}
              <Link href="/marketplace/sell">
                <Button
                  variant="success"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Sell a Card
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4">
              <p className="text-sm text-text-secondary">
                {total} listing{total !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </>
        )}

        {/* Bottom accent */}
        <div className="mt-16">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
