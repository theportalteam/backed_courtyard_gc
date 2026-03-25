"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn, formatCurrency, formatPoints } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  pointsBalance: number;
  usdcBalance: number;
  sellerTier: string;
  sellerRating: number | null;
  totalSales: number;
  isAdmin: boolean;
  loginStreak: number;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    transactions: number;
    pullHistory: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Seller tier badge ──────────────────────────────────

function getSellerTierBadge(tier: string) {
  const map: Record<string, "success" | "brand" | "epic" | "default"> = {
    NEW: "default",
    VERIFIED: "brand",
    POWER: "epic",
  };
  return <Badge variant={map[tier] || "default"} size="sm">{tier}</Badge>;
}

// ── Page Component ─────────────────────────────────────

function UsersContent() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  // Expanded user
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Points adjustment
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch users ────────────────────────────────────
  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "25");
        if (searchDebounced.trim()) {
          params.set("search", searchDebounced.trim());
        }

        const res = await fetch(`/api/admin/users?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        console.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [searchDebounced]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // ── Adjust points ─────────────────────────────────
  const handleAdjustPoints = async (userId: string) => {
    setAdjustError("");
    setAdjustSuccess("");

    const amount = parseInt(adjustAmount, 10);
    if (isNaN(amount) || amount === 0) {
      setAdjustError("Enter a non-zero amount");
      return;
    }
    if (!adjustReason.trim()) {
      setAdjustError("Reason is required");
      return;
    }

    setAdjusting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          pointsAdjustment: amount,
          reason: adjustReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAdjustError(data.error || "Failed to adjust points");
        return;
      }

      setAdjustSuccess(
        `Adjusted ${amount >= 0 ? "+" : ""}${formatPoints(amount)} points for ${data.user.email}`
      );

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, pointsBalance: data.user.pointsBalance }
            : u
        )
      );

      setAdjustAmount("");
      setAdjustReason("");

      setTimeout(() => setAdjustSuccess(""), 3000);
    } catch {
      setAdjustError("Network error. Please try again.");
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-headline font-black uppercase tracking-tighter italic text-text-primary">User Management</h1>
            <p className="text-text-secondary text-sm mt-1">
              {pagination.total} registered users
            </p>
          </div>
        </div>

        {/* ── Search ─────────────────────────────────── */}
        <div className="mb-6">
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            wrapperClassName="max-w-md"
          />
        </div>

        {/* ── Success banner ─────────────────────────── */}
        {adjustSuccess && (
          <div className="mb-4 p-3 rounded-none bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-sm font-medium">
            {adjustSuccess}
          </div>
        )}

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
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Name</th>
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Email</th>
                      <th className="text-right text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Points</th>
                      <th className="text-right text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">USDC</th>
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Tier</th>
                      <th className="text-left text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Joined</th>
                      <th className="text-center text-xs text-text-secondary font-semibold uppercase tracking-wider px-4 py-3">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-text-secondary py-12">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const isExpanded = expandedUser === user.id;
                        return (
                          <React.Fragment key={user.id}>
                            <tr
                              className={cn(
                                "border-b border-border-subtle/50 hover:bg-surface-light/50 transition-colors cursor-pointer",
                                isExpanded && "bg-surface-light/30"
                              )}
                              onClick={() => {
                                setExpandedUser(isExpanded ? null : user.id);
                                setAdjustAmount("");
                                setAdjustReason("");
                                setAdjustError("");
                              }}
                            >
                              <td className="px-4 py-3 text-sm text-text-primary font-medium">
                                <div className="flex items-center gap-2">
                                  {user.name || "Unnamed"}
                                  {user.isAdmin && (
                                    <Badge variant="warning" size="sm">ADMIN</Badge>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-text-secondary">
                                {user.email}
                              </td>
                              <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                                {formatPoints(user.pointsBalance)}
                              </td>
                              <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                                {formatCurrency(user.usdcBalance)}
                              </td>
                              <td className="px-4 py-3">
                                {getSellerTierBadge(user.sellerTier)}
                              </td>
                              <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">
                                {new Date(user.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <svg
                                  className={cn(
                                    "w-4 h-4 text-text-secondary transition-transform mx-auto",
                                    isExpanded && "rotate-180"
                                  )}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </td>
                            </tr>

                            {/* Expanded row */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={7} className="px-4 py-4 bg-surface-light/20">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* User details */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-text-primary mb-3">
                                        User Details
                                      </h4>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 rounded-none bg-surface">
                                          <p className="text-xs text-text-secondary">Transactions</p>
                                          <p className="text-lg font-bold text-text-primary">
                                            {user._count.transactions}
                                          </p>
                                        </div>
                                        <div className="p-3 rounded-none bg-surface">
                                          <p className="text-xs text-text-secondary">Gacha Pulls</p>
                                          <p className="text-lg font-bold text-text-primary">
                                            {user._count.pullHistory}
                                          </p>
                                        </div>
                                        <div className="p-3 rounded-none bg-surface">
                                          <p className="text-xs text-text-secondary">Total Sales</p>
                                          <p className="text-lg font-bold text-text-primary">
                                            {user.totalSales}
                                          </p>
                                        </div>
                                        <div className="p-3 rounded-none bg-surface">
                                          <p className="text-xs text-text-secondary">Login Streak</p>
                                          <p className="text-lg font-bold text-text-primary">
                                            {user.loginStreak} days
                                          </p>
                                        </div>
                                        <div className="p-3 rounded-none bg-surface">
                                          <p className="text-xs text-text-secondary">Rating</p>
                                          <p className="text-lg font-bold text-text-primary">
                                            {user.sellerRating !== null
                                              ? `${user.sellerRating.toFixed(1)}/5`
                                              : "N/A"}
                                          </p>
                                        </div>
                                        <div className="p-3 rounded-none bg-surface">
                                          <p className="text-xs text-text-secondary">Last Login</p>
                                          <p className="text-sm font-semibold text-text-primary">
                                            {user.lastLoginAt
                                              ? new Date(user.lastLoginAt).toLocaleDateString()
                                              : "Never"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Points adjustment */}
                                    <div>
                                      <h4 className="text-sm font-semibold text-text-primary mb-3">
                                        Adjust Points
                                      </h4>
                                      <div className="p-4 rounded-none bg-surface border border-border-subtle">
                                        <div className="flex items-center gap-2 mb-3">
                                          <p className="text-sm text-text-secondary">
                                            Current balance:
                                          </p>
                                          <p className="text-sm font-bold text-text-primary">
                                            {formatPoints(user.pointsBalance)} pts
                                          </p>
                                        </div>

                                        <div className="space-y-3">
                                          <Input
                                            label="Amount (+/-)"
                                            type="number"
                                            placeholder="e.g. 500 or -200"
                                            value={adjustAmount}
                                            onChange={(e) => setAdjustAmount(e.target.value)}
                                          />
                                          <Input
                                            label="Reason"
                                            placeholder="Reason for adjustment..."
                                            value={adjustReason}
                                            onChange={(e) => setAdjustReason(e.target.value)}
                                          />

                                          {adjustError && (
                                            <p className="text-sm text-red-400">{adjustError}</p>
                                          )}

                                          <Button
                                            size="sm"
                                            loading={adjusting}
                                            onClick={() => handleAdjustPoints(user.id)}
                                            className="w-full"
                                          >
                                            Apply Adjustment
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination ─────────────────────────── */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
                  <p className="text-sm text-text-secondary">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchUsers(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchUsers(pagination.page + 1)}
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
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersContent />
    </AdminGuard>
  );
}
