"use client";

import React, { useState } from "react";
import { Package, Tag } from "lucide-react";
import { formatCurrency, getBrandDisplayName, getBrandColor } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PurchaseModal } from "@/components/storefront/PurchaseModal";

export interface BundleItemData {
  id: string;
  brand: string;
  denomination: number;
  quantity: number;
}

export interface BundleData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  faceValue: number;
  discountPercent: number;
  items: BundleItemData[];
}

interface BundleCardProps {
  bundle: BundleData;
}

export function BundleCard({ bundle }: BundleCardProps) {
  const [purchaseOpen, setPurchaseOpen] = useState(false);

  const savings = bundle.faceValue - bundle.price;

  return (
    <>
      <Card variant="interactive" padding="md" className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-epic/10 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-epic" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                {bundle.name}
              </h3>
              {bundle.description && (
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                  {bundle.description}
                </p>
              )}
            </div>
          </div>
          <Badge variant="success" size="md">
            {Math.round(bundle.discountPercent)}% OFF
          </Badge>
        </div>

        {/* Included items */}
        <div className="my-3 space-y-2">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Includes
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {bundle.items.map((item) => {
              const brandColor = getBrandColor(item.brand);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-bg-elevated/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: brandColor }}
                    />
                    <span className="text-sm text-text-primary">
                      {getBrandDisplayName(item.brand)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    {item.quantity > 1 && `${item.quantity}x `}
                    {formatCurrency(item.denomination)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-bg-border my-3" />

        {/* Pricing comparison */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-text-secondary">Total Face Value</p>
            <p className="text-sm text-text-secondary line-through">
              {formatCurrency(bundle.faceValue)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary">Bundle Price</p>
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(bundle.price)}
            </p>
          </div>
        </div>

        {/* Savings callout */}
        <div className="flex items-center gap-1.5 bg-success/10 border border-success/20 rounded-lg px-3 py-2 mb-4">
          <Tag className="w-3.5 h-3.5 text-success shrink-0" />
          <span className="text-xs font-medium text-success">
            You save {formatCurrency(savings)}
          </span>
        </div>

        {/* Buy Bundle button */}
        <div className="mt-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            icon={<Package className="w-4 h-4" />}
            onClick={() => setPurchaseOpen(true)}
          >
            Buy Bundle
          </Button>
        </div>
      </Card>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseOpen}
        onClose={() => setPurchaseOpen(false)}
        item={{
          id: bundle.id,
          brand: "BUNDLE",
          denomination: bundle.faceValue,
          price: bundle.price,
          discountPercent: bundle.discountPercent,
          name: bundle.name,
        }}
        type="bundle"
      />
    </>
  );
}
