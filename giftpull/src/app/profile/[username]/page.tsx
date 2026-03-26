"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  User,
  Package,
  Star,
  StarHalf,
  Shield,
  ShieldCheck,
  Crown,
  Flame,
  Loader2,
} from "lucide-react";
import { cn, formatCurrency, getRarityColor, getBrandDisplayName } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface PublicProfile {
  user: {
    id: string;
    name: string;
    sellerTier: string;
    sellerRating: number;
    loginStreak: number;
    createdAt: string;
  };
  stats: {
    collectionCount: number;
    totalListings: number;
    totalSales: number;
  };
  listings: {
    id: string;
    price: number;
    giftCard: {
      brand: string;
      denomination: number;
      fmv: number;
      rarityTier: string;
    };
  }[];
}

const TIER_CONFIG = {
  NEW: { label: "New Seller", icon: Shield, color: "text-text-secondary" },
  VERIFIED: { label: "Verified", icon: ShieldCheck, color: "text-primary" },
  POWER: { label: "Power Seller", icon: Crown, color: "text-warning" },
} as const;

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/profile/public/${encodeURIComponent(username)}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      setProfile(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center py-12 px-8">
          <User className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h2 className="font-headline font-bold text-xl text-text-primary mb-2">User not found</h2>
          <p className="text-text-secondary">The profile you&apos;re looking for doesn&apos;t exist.</p>
        </Card>
      </div>
    );
  }

  const { user, stats, listings } = profile;
  const tierConfig = TIER_CONFIG[user.sellerTier as keyof typeof TIER_CONFIG] || TIER_CONFIG.NEW;
  const TierIcon = tierConfig.icon;

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <Card className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 border-2 border-primary/40 flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-headline font-black text-2xl tracking-tighter text-text-primary truncate">
                {user.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <div className={cn("flex items-center gap-1", tierConfig.color)}>
                  <TierIcon className="w-4 h-4" />
                  <span className="text-xs font-semibold">{tierConfig.label}</span>
                </div>
                {user.loginStreak > 0 && (
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-warning" />
                    <span className="text-[10px] text-warning font-bold">{user.loginStreak}-day streak</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-bg-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{stats.collectionCount}</p>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Collection</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{stats.totalListings}</p>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text-primary">{stats.totalSales}</p>
              <p className="text-xs text-text-secondary uppercase tracking-wider">Total Sales</p>
            </div>
          </div>

          <p className="text-[10px] text-text-tertiary mt-4">
            Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </p>
        </Card>

        {/* Active Listings */}
        <h2 className="font-headline font-bold uppercase tracking-tight text-text-primary mb-4">
          Active Listings ({listings.length})
        </h2>

        {listings.length === 0 ? (
          <Card className="text-center py-12">
            <Package className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No active listings</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} variant="interactive">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getRarityColor(listing.giftCard.rarityTier) }}>
                    {listing.giftCard.rarityTier}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-text-primary">
                  {getBrandDisplayName(listing.giftCard.brand)}
                </h3>
                <p className="text-lg font-bold text-text-primary">${listing.giftCard.denomination}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-bg-border">
                  <span className="text-xs text-text-secondary">Price</span>
                  <span className="text-sm font-semibold text-primary">{formatCurrency(listing.price)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
