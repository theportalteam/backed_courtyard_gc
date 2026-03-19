"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  cn,
  formatCurrency,
  getBrandDisplayName,
} from "@/lib/utils";

// ── Types ──────────────────────────────────────────────

interface GiftCardRow {
  id: string;
  brand: string;
  denomination: number;
  status: string;
  source: string;
  rarityTier: string | null;
  fmv: number;
  createdAt: string;
  currentOwner: { id: string; email: string; name: string | null } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const BRANDS = [
  "", "XBOX", "STEAM", "NINTENDO", "PLAYSTATION",
  "GOOGLE_PLAY", "AMAZON", "APPLE", "ROBLOX", "SPOTIFY", "NETFLIX",
];

const STATUSES = [
  "", "AVAILABLE", "RESERVED", "SOLD", "REDEEMED", "BUYBACK", "LISTED",
];

const SOURCES = [
  "", "BULK_IMPORT", "API", "USER_LISTED", "BUYBACK_RECYCLE",
];

const DENOMINATIONS = [5, 10, 15, 20, 25, 50, 75, 100];

// ── Status badge helper ────────────────────────────────

function getStatusBadge(status: string) {
  const map: Record<string, "success" | "warning" | "epic" | "brand" | "default"> = {
    AVAILABLE: "success",
    RESERVED: "brand",
    SOLD: "default",
    REDEEMED: "epic",
    BUYBACK: "warning",
    LISTED: "brand",
  };
  return <Badge variant={map[status] || "default"} size="sm">{status}</Badge>;
}

function getSourceBadge(source: string) {
  const map: Record<string, "brand" | "success" | "epic" | "warning" | "default"> = {
    BULK_IMPORT: "brand",
    API: "success",
    USER_LISTED: "epic",
    BUYBACK_RECYCLE: "warning",
  };
  return <Badge variant={map[source] || "default"} size="sm">{source.replace("_", " ")}</Badge>;
}

// ── Page Component ─────────────────────────────────────

function InventoryContent() {
  const [cards, setCards] = useState<GiftCardRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterBrand, setFilterBrand] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");

  // Add Cards modal
  const [showAdd, setShowAdd] = useState(false);
  const [addBrand, setAddBrand] = useState("XBOX");
  const [addDenom, setAddDenom] = useState("25");
  const [addQty, setAddQty] = useState("10");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // ── Fetch cards ────────────────────────────────────
  const fetchCards = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "25");
        if (filterBrand) params.set("brand", filterBrand);
        if (filterStatus) params.set("status", filterStatus);
        if (filterSource) params.set("source", filterSource);

        const res = await fetch(`/api/admin/inventory?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setCards(data.cards);
        setPagination(data.pagination);
      } catch {
        console.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    },
    [filterBrand, filterStatus, filterSource]
  );

  useEffect(() => {
    fetchCards(1);
  }, [fetchCards]);

  // ── Add cards handler ──────────────────────────────
  const handleAddCards = async () => {
    setAddError("");
    setAddSuccess("");

    const denomination = parseFloat(addDenom);
    const quantity = parseInt(addQty, 10);

    if (isNaN(denomination) || denomination <= 0) {
      setAddError("Enter a valid denomination");
      return;
    }
    if (isNaN(quantity) || quantity < 1 || quantity > 500) {
      setAddError("Quantity must be between 1 and 500");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: addBrand,
          denomination,
          quantity,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Failed to create cards");
        return;
      }

      setAddSuccess(
        `Created ${data.created} ${getBrandDisplayName(data.brand)} $${denomination} cards (${data.rarityTier})`
      );

      // Refresh after brief delay
      setTimeout(() => {
        fetchCards(1);
        setShowAdd(false);
        setAddSuccess("");
      }, 2000);
    } catch {
      setAddError("Network error. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Gift Card Inventory</h1>
            <p className="text-text-secondary text-sm mt-1">
              {pagination.total} total cards in the system
            </p>
          </div>
          <Button
            onClick={() => {
              setShowAdd(true);
              setAddError("");
              setAddSuccess("");
            }}
          >
            Add Cards
          </Button>
        </div>

        {/* ── Filters ────────────────────────────────── */}
        <Card className="mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="w-48">
              <label className="block text-xs text-text-secondary font-semibold mb-1.5 uppercase tracking-wider">
                Brand
              </label>
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Brands</option>
                {BRANDS.filter(Boolean).map((b) => (
                  <option key={b} value={b}>
                    {getBrandDisplayName(b)}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-44">
              <label className="block text-xs text-text-secondary font-semibold mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Statuses</option>
                {STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="w-44">
              <label className="block text-xs text-text-secondary font-semibold mb-1.5 uppercase tracking-wider">
                Source
              </label>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">All Sources</option>
                {SOURCES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterBrand("");
                setFilterStatus("");
                setFilterSource("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* ── Table ──────────────────────────────────── */}
        <Card padding="sm">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Brand</th>
                      <th className="text-right text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Denomination</th>
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Status</th>
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Source</th>
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Owner</th>
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-text-secondary py-12">
                          No cards found matching your filters
                        </td>
                      </tr>
                    ) : (
                      cards.map((card) => (
                        <tr
                          key={card.id}
                          className="border-b border-border-subtle/50 hover:bg-surface-light/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-text-primary font-medium">
                            {getBrandDisplayName(card.brand)}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary text-right font-mono font-semibold">
                            {formatCurrency(card.denomination)}
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(card.status)}</td>
                          <td className="px-4 py-3">{getSourceBadge(card.source)}</td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {card.currentOwner?.email || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                            {new Date(card.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ─────────────────────────── */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                  <p className="text-sm text-text-secondary">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} cards)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchCards(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchCards(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* ── Add Cards Modal ────────────────────────── */}
      <Modal
        isOpen={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Gift Cards"
      >
        {addSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#10B981]/15 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Cards Created
            </h3>
            <p className="text-text-secondary text-sm">{addSuccess}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Brand
              </label>
              <select
                value={addBrand}
                onChange={(e) => setAddBrand(e.target.value)}
                className="w-full bg-surface-light border border-border-subtle rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {BRANDS.filter(Boolean).map((b) => (
                  <option key={b} value={b}>
                    {getBrandDisplayName(b)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Denomination
              </label>
              <div className="grid grid-cols-4 gap-2">
                {DENOMINATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setAddDenom(String(d))}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                      addDenom === String(d)
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border-subtle bg-surface-light text-text-secondary hover:text-text-primary"
                    )}
                  >
                    ${d}
                  </button>
                ))}
              </div>
              <Input
                className="mt-2"
                placeholder="Or enter custom amount"
                type="number"
                value={DENOMINATIONS.includes(Number(addDenom)) ? "" : addDenom}
                onChange={(e) => setAddDenom(e.target.value)}
              />
            </div>

            <Input
              label="Quantity"
              type="number"
              min="1"
              max="500"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
            />

            {addError && (
              <p className="text-sm text-red-400">{addError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                loading={adding}
                onClick={handleAddCards}
              >
                Create {addQty} Cards
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <AdminGuard>
      <InventoryContent />
    </AdminGuard>
  );
}
