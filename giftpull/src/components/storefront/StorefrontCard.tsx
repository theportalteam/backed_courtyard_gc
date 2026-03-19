"use client";

import React, { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { cn, formatCurrency, getBrandColor, getBrandDisplayName, getRarityColor } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PurchaseModal } from "@/components/storefront/PurchaseModal";

export interface StorefrontCardData {
  id: string;
  brand: string;
  denomination: number;
  fmv: number;
  listedPrice: number;
  discountPercent: number | null;
  rarityTier: string | null;
}

interface StorefrontCardProps {
  card: StorefrontCardData;
}

export function StorefrontCard({ card }: StorefrontCardProps) {
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const brandColor = getBrandColor(card.brand);
  const brandName = getBrandDisplayName(card.brand);
  const hasDiscount = card.discountPercent != null && card.discountPercent > 0;
  const originalPrice = card.fmv;
  const salePrice = card.listedPrice;

  return (
    <>
      <Card
        variant="interactive"
        padding="md"
        className="group relative flex flex-col h-full overflow-hidden"
        style={
          {
            "--brand-color": brandColor,
          } as React.CSSProperties
        }
        onClick={() => setPurchaseOpen(true)}
      >
        {/* Brand glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-card"
          style={{
            boxShadow: `inset 0 0 30px ${brandColor}15, 0 0 20px ${brandColor}10`,
          }}
        />

        {/* Top row: brand badge + rarity */}
        <div className="flex items-center justify-between mb-4 relative">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: brandColor }}
          >
            {brandName}
          </span>

          {card.rarityTier && (
            <Badge
              variant={
                card.rarityTier === "LEGENDARY"
                  ? "legendary"
                  : card.rarityTier === "EPIC"
                  ? "epic"
                  : card.rarityTier === "RARE"
                  ? "brand"
                  : card.rarityTier === "UNCOMMON"
                  ? "success"
                  : "default"
              }
              size="sm"
            >
              {card.rarityTier}
            </Badge>
          )}
        </div>

        {/* Denomination */}
        <div className="relative mb-4">
          <h3 className="text-xl font-bold text-text-primary">
            {formatCurrency(card.denomination)}{" "}
            <span className="text-sm font-medium text-text-secondary">
              {brandName} Gift Card
            </span>
          </h3>
        </div>

        {/* Decorative divider */}
        <div
          className="h-px w-full mb-4 opacity-20"
          style={{
            background: `linear-gradient(to right, transparent, ${brandColor}, transparent)`,
          }}
        />

        {/* Pricing section */}
        <div className="flex items-end justify-between mb-5 relative">
          <div>
            {hasDiscount ? (
              <>
                <p className="text-sm text-text-secondary line-through">
                  {formatCurrency(originalPrice)}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {formatCurrency(salePrice)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-text-primary">
                {formatCurrency(salePrice)}
              </p>
            )}
          </div>

          {hasDiscount && card.discountPercent && (
            <Badge variant="success" size="md">
              {Math.round(card.discountPercent)}% OFF
            </Badge>
          )}
        </div>

        {/* Buy Now button */}
        <div className="mt-auto relative">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            icon={<ShoppingCart className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation();
              setPurchaseOpen(true);
            }}
          >
            Buy Now
          </Button>
        </div>
      </Card>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        item={{
          id: card.id,
          brand: card.brand,
          denomination: card.denomination,
          price: card.listedPrice,
          discountPercent: card.discountPercent,
          name: `${formatCurrency(card.denomination)} ${brandName} Gift Card`,
        }}
        type="card"
      />
    </>
  );
}
