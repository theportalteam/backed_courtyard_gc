"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  StarHalf,
  Shield,
  ShieldCheck,
  Crown,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { cn, formatCurrency, getBrandColor, getBrandDisplayName } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface ListingCardData {
  id: string;
  askingPrice: number;
  suggestedPrice: number;
  createdAt: string;
  seller: {
    id: string;
    name: string | null;
    sellerTier: "NEW" | "VERIFIED" | "POWER";
    sellerRating: number | null;
    totalSales: number;
  };
  giftCard: {
    id: string;
    brand: string;
    denomination: number;
    fmv: number;
    verificationStatus: string;
  };
}

interface ListingCardProps {
  listing: ListingCardData;
}

const TIER_CONFIG = {
  NEW: {
    label: "New Seller",
    color: "text-text-secondary",
    bgColor: "bg-surface-light",
    borderColor: "border-border-subtle",
    icon: Shield,
  },
  VERIFIED: {
    label: "Verified",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    icon: ShieldCheck,
  },
  POWER: {
    label: "Power Seller",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
    icon: Crown,
  },
} as const;

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null || rating === undefined) {
    return <span className="text-[10px] text-text-secondary">No ratings</span>;
  }

  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const stars = [];

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={`full-${i}`} className="w-3 h-3 text-warning fill-warning" />
    );
  }
  if (hasHalf) {
    stars.push(
      <StarHalf key="half" className="w-3 h-3 text-warning fill-warning" />
    );
  }
  const emptyCount = 5 - fullStars - (hasHalf ? 1 : 0);
  for (let i = 0; i < emptyCount; i++) {
    stars.push(
      <Star key={`empty-${i}`} className="w-3 h-3 text-text-secondary/30" />
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      {stars}
      <span className="text-[10px] text-text-secondary ml-1">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

export function ListingCard({ listing }: ListingCardProps) {
  const brandColor = getBrandColor(listing.giftCard.brand);
  const brandName = getBrandDisplayName(listing.giftCard.brand);
  const tierConfig = TIER_CONFIG[listing.seller.sellerTier];
  const TierIcon = tierConfig.icon;

  const discountPercent = Math.round(
    ((listing.giftCard.denomination - listing.askingPrice) /
      listing.giftCard.denomination) *
      100
  );

  const isVerified = listing.giftCard.verificationStatus === "VERIFIED";

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <Card
        variant="interactive"
        padding="md"
        className="group relative flex flex-col h-full overflow-hidden"
        style={
          {
            "--brand-color": brandColor,
          } as React.CSSProperties
        }
      >
        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-card"
          style={{
            boxShadow: `inset 0 0 30px ${brandColor}15, 0 0 20px ${brandColor}10`,
          }}
        />

        {/* Top row: brand badge + discount */}
        <div className="flex items-center justify-between mb-3 relative">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: brandColor }}
          >
            {brandName}
          </span>

          <div className="flex items-center gap-1.5">
            {isVerified && (
              <div className="flex items-center gap-1 text-success">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold uppercase">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Denomination */}
        <div className="relative mb-3">
          <h3 className="text-xl font-bold text-text-primary">
            {formatCurrency(listing.giftCard.denomination)}{" "}
            <span className="text-sm font-medium text-text-secondary">
              Gift Card
            </span>
          </h3>
        </div>

        {/* Decorative divider */}
        <div
          className="h-px w-full mb-3 opacity-20"
          style={{
            background: `linear-gradient(to right, transparent, ${brandColor}, transparent)`,
          }}
        />

        {/* Pricing section */}
        <div className="flex items-end justify-between mb-3 relative">
          <div>
            {discountPercent > 0 && (
              <p className="text-sm text-text-secondary line-through">
                {formatCurrency(listing.giftCard.denomination)}
              </p>
            )}
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(listing.askingPrice)}
            </p>
          </div>

          {discountPercent > 0 && (
            <Badge variant="success" size="md">
              {discountPercent}% below FMV
            </Badge>
          )}
        </div>

        {/* Seller info */}
        <div className="bg-surface-light/50 border border-border-subtle rounded-none p-3 mb-4 relative">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-none flex items-center justify-center",
                  tierConfig.bgColor
                )}
              >
                <TierIcon className={cn("w-3.5 h-3.5", tierConfig.color)} />
              </div>
              <span className="text-sm font-medium text-text-primary truncate max-w-[120px]">
                {listing.seller.name || "Anonymous"}
              </span>
            </div>
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                tierConfig.bgColor,
                tierConfig.color,
                tierConfig.borderColor
              )}
            >
              {tierConfig.label}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <RatingStars rating={listing.seller.sellerRating} />
            <span className="text-[10px] text-text-secondary">
              {listing.seller.totalSales} sale{listing.seller.totalSales !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Listing age */}
        <div className="flex items-center gap-1.5 mb-4 relative">
          <Clock className="w-3 h-3 text-text-secondary" />
          <span className="text-xs text-text-secondary">
            {getTimeAgo(listing.createdAt)}
          </span>
        </div>

        {/* Buy button */}
        <div className="mt-auto relative">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={(e) => {
              e.preventDefault();
              // Navigation handled by the Link wrapper
            }}
          >
            Buy Now
          </Button>
        </div>
      </Card>
    </Link>
  );
}
