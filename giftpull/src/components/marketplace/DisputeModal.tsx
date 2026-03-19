"use client";

import React, { useState, useCallback, useEffect } from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { cn, formatCurrency, getBrandDisplayName } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface DisputeListingInfo {
  id: string;
  askingPrice: number;
  giftCard: {
    brand: string;
    denomination: number;
  };
  seller: {
    name: string | null;
    sellerTier: string;
  };
}

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: DisputeListingInfo;
  onDisputeFiled?: () => void;
}

export function DisputeModal({
  isOpen,
  onClose,
  listing,
  onDisputeFiled,
}: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setReason("");
        setLoading(false);
        setError("");
        setSuccess(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async () => {
    setError("");

    if (reason.trim().length < 10) {
      setError("Please provide a detailed reason (at least 10 characters)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/marketplace/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to file dispute");
      }

      setSuccess(true);
      onDisputeFiled?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [listing.id, reason, onDisputeFiled]);

  const brandName = getBrandDisplayName(listing.giftCard.brand);

  // ── Success state ──────────────────────────────────
  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/15 border-2 border-warning/30 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-warning" />
          </div>

          <h2 className="text-xl font-bold text-text-primary mb-1">
            Dispute Filed
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Your dispute has been submitted. Our team will review it and respond
            within 24-48 hours.
          </p>

          <div className="bg-surface-light/50 border border-border-subtle rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-2">
              Dispute Reason
            </p>
            <p className="text-sm text-text-primary">{reason}</p>
          </div>

          <Button variant="secondary" size="md" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  // ── Dispute form ───────────────────────────────────
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="File a Dispute" size="md">
      <div>
        {/* Listing details */}
        <div className="bg-surface-light/50 border border-border-subtle rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {formatCurrency(listing.giftCard.denomination)} {brandName} Gift Card
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Purchased for {formatCurrency(listing.askingPrice)}
              </p>
            </div>
            <Badge variant="warning" size="sm">
              Dispute
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <span>Seller:</span>
            <span className="font-medium text-text-primary">
              {listing.seller.name || "Anonymous"}
            </span>
          </div>
        </div>

        {/* Warning notice */}
        <div className="flex items-start gap-2.5 bg-warning/5 border border-warning/20 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary">
            Filing a dispute will freeze the transaction. Our team will review the
            evidence and make a determination. False disputes may affect your account
            standing.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Reason textarea */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Reason for Dispute
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue with this purchase. For example: the gift card code is invalid, the balance is incorrect, etc."
            rows={4}
            className={cn(
              "w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary",
              "placeholder:text-text-secondary/50",
              "transition-all duration-200 resize-none",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            )}
          />
          <p className="text-xs text-text-secondary mt-1.5">
            {reason.length}/500 characters
            {reason.length > 0 && reason.length < 10 && (
              <span className="text-red-400 ml-2">(minimum 10 characters)</span>
            )}
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            loading={loading}
            disabled={loading || reason.trim().length < 10}
            onClick={handleSubmit}
            icon={<AlertTriangle className="w-4 h-4" />}
          >
            Submit Dispute
          </Button>
        </div>
      </div>
    </Modal>
  );
}
