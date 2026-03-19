"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  DollarSign,
  Tag,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn, formatCurrency, getBrandDisplayName } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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

const COMMISSION_RATES: Record<string, number> = {
  NEW: 10,
  VERIFIED: 7,
  POWER: 5,
};

type FormStep = "form" | "verifying" | "success";

interface SellFormProps {
  className?: string;
}

export function SellForm({ className }: SellFormProps) {
  const { data: session } = useSession();
  const user = session?.user as
    | { id?: string; sellerTier?: string }
    | undefined;

  const sellerTier = (user?.sellerTier as string) || "NEW";

  // Form state
  const [brand, setBrand] = useState("");
  const [denomination, setDenomination] = useState("");
  const [code, setCode] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [showCode, setShowCode] = useState(false);

  // UI state
  const [step, setStep] = useState<FormStep>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [createdListingId, setCreatedListingId] = useState("");

  // Computed values
  const denomValue = parseFloat(denomination) || 0;
  const suggestedPrice = useMemo(() => {
    return denomValue > 0 ? Math.round(denomValue * 0.9 * 100) / 100 : 0;
  }, [denomValue]);

  const priceValue = parseFloat(askingPrice) || 0;
  const commissionRate = COMMISSION_RATES[sellerTier] || 10;
  const commissionAmount = Math.round(priceValue * (commissionRate / 100) * 100) / 100;
  const sellerReceives = Math.round((priceValue - commissionAmount) * 100) / 100;

  // Set asking price to suggested when denomination changes
  const handleDenominationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setDenomination(val);
      const denom = parseFloat(val) || 0;
      if (denom > 0) {
        setAskingPrice((Math.round(denom * 0.9 * 100) / 100).toString());
      } else {
        setAskingPrice("");
      }
    },
    []
  );

  const maskedCode = useMemo(() => {
    if (!code) return "";
    return code.replace(/[A-Za-z0-9]/g, "*");
  }, [code]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!brand) {
        setError("Please select a brand");
        return;
      }
      if (denomValue <= 0) {
        setError("Please enter a valid denomination");
        return;
      }
      if (!code.trim()) {
        setError("Please enter the gift card code");
        return;
      }
      if (priceValue <= 0) {
        setError("Please enter a valid asking price");
        return;
      }
      if (priceValue > denomValue) {
        setError("Asking price cannot exceed denomination");
        return;
      }

      setLoading(true);
      setStep("verifying");

      // Simulate verification progress
      const progressInterval = setInterval(() => {
        setVerifyProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      try {
        const res = await fetch("/api/marketplace/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand,
            denomination: denomValue,
            code: code.trim(),
            askingPrice: priceValue,
          }),
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create listing");
        }

        const data = await res.json();

        setVerifyProgress(100);

        // Short delay for the progress bar to reach 100%
        await new Promise((resolve) => setTimeout(resolve, 300));

        setCreatedListingId(data.listing.id);
        setStep("success");
      } catch (err) {
        clearInterval(progressInterval);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep("form");
        setVerifyProgress(0);
      } finally {
        setLoading(false);
      }
    },
    [brand, denomValue, code, priceValue]
  );

  // ── Success state ──────────────────────────────────
  if (step === "success") {
    return (
      <Card padding="lg" className={cn("text-center", className)}>
        <div className="mx-auto w-16 h-16 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-1">
          Card Listed Successfully!
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Your {getBrandDisplayName(brand)} {formatCurrency(denomValue)} gift card is now
          live on the marketplace.
        </p>

        <div className="bg-surface-light/50 border border-border-subtle rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-secondary">Asking Price</span>
            <span className="text-text-primary font-semibold">
              {formatCurrency(priceValue)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-text-secondary">Commission ({commissionRate}%)</span>
            <span className="text-red-400 font-medium">
              -{formatCurrency(commissionAmount)}
            </span>
          </div>
          <div className="h-px bg-border-subtle my-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary font-semibold">You Receive</span>
            <span className="text-success font-bold">
              {formatCurrency(sellerReceives)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/marketplace/${createdListingId}`}>
            <Button variant="primary" size="md" className="w-full" icon={<ExternalLink className="w-4 h-4" />}>
              View Listing
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="md"
            className="w-full"
            onClick={() => {
              setBrand("");
              setDenomination("");
              setCode("");
              setAskingPrice("");
              setStep("form");
              setVerifyProgress(0);
              setCreatedListingId("");
              setError("");
            }}
          >
            List Another Card
          </Button>
        </div>
      </Card>
    );
  }

  // ── Verifying state ────────────────────────────────
  if (step === "verifying") {
    return (
      <Card padding="lg" className={cn("text-center", className)}>
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-1">
          Verifying Card...
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          We're checking your {getBrandDisplayName(brand)} gift card.
          This usually takes a few seconds.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-surface-light rounded-full h-3 mb-3 overflow-hidden border border-border-subtle">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 ease-out"
            style={{ width: `${Math.min(verifyProgress, 100)}%` }}
          />
        </div>
        <p className="text-xs text-text-secondary">
          {verifyProgress < 30 && "Validating card details..."}
          {verifyProgress >= 30 && verifyProgress < 60 && "Checking card balance..."}
          {verifyProgress >= 60 && verifyProgress < 90 && "Confirming authenticity..."}
          {verifyProgress >= 90 && "Almost done..."}
        </p>
      </Card>
    );
  }

  // ── Form state ─────────────────────────────────────
  return (
    <Card padding="lg" className={className}>
      <form onSubmit={handleSubmit}>
        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Brand selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Brand
          </label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className={cn(
              "w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "transition-all duration-200 cursor-pointer appearance-none",
              !brand && "text-text-secondary/50"
            )}
          >
            <option value="">Select a brand...</option>
            {ALL_BRANDS.map((b) => (
              <option key={b} value={b}>
                {getBrandDisplayName(b)}
              </option>
            ))}
          </select>
        </div>

        {/* Denomination */}
        <div className="mb-5">
          <Input
            label="Denomination (Face Value)"
            type="number"
            min="1"
            step="0.01"
            placeholder="25.00"
            value={denomination}
            onChange={handleDenominationChange}
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {/* Gift card code */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Gift Card Code
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              <CreditCard className="w-4 h-4" />
            </div>
            <input
              type={showCode ? "text" : "password"}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className={cn(
                "w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary pl-10 pr-10",
                "placeholder:text-text-secondary/50",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                "font-mono tracking-wider"
              )}
            />
            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {showCode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Suggested price info */}
        {denomValue > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Suggested Price
              </span>
            </div>
            <p className="text-lg font-bold text-text-primary">
              {formatCurrency(suggestedPrice)}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Based on 90% of face value ({formatCurrency(denomValue)})
            </p>
          </div>
        )}

        {/* Asking price */}
        <div className="mb-5">
          <Input
            label="Your Asking Price"
            type="number"
            min="0.01"
            step="0.01"
            max={denomination || undefined}
            placeholder={suggestedPrice > 0 ? suggestedPrice.toString() : "0.00"}
            value={askingPrice}
            onChange={(e) => setAskingPrice(e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>

        {/* Commission breakdown */}
        {priceValue > 0 && (
          <div className="bg-surface-light/50 border border-border-subtle rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-text-secondary">Asking Price</span>
              <span className="text-text-primary font-medium">
                {formatCurrency(priceValue)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-text-secondary">
                  Commission
                </span>
                <Badge
                  variant={
                    sellerTier === "POWER"
                      ? "legendary"
                      : sellerTier === "VERIFIED"
                      ? "brand"
                      : "default"
                  }
                  size="sm"
                >
                  {sellerTier} {commissionRate}%
                </Badge>
              </div>
              <span className="text-red-400 font-medium">
                -{formatCurrency(commissionAmount)}
              </span>
            </div>
            <div className="h-px bg-border-subtle my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary font-semibold">
                You Receive
              </span>
              <span className="text-lg font-bold text-success">
                {formatCurrency(sellerReceives)}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="success"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={loading || !brand || denomValue <= 0 || !code.trim() || priceValue <= 0}
        >
          List Card for {priceValue > 0 ? formatCurrency(priceValue) : "Sale"}
        </Button>
      </form>
    </Card>
  );
}
