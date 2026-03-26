"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Coins,
  Wallet,
  Package,
  Heart,
  Activity,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Flame,
  Loader2,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Dices,
  Store,
  ArrowRightLeft,
  Tag,
  Gift,
  CreditCard,
  Gavel,
  Check,
  X,
  Send,
  Ban,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn, formatCurrency, formatPoints, getRarityColor, getBrandDisplayName } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Tab = "collection" | "offers-received" | "offers-made" | "favorites" | "activity" | "points";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "collection", label: "Collection", icon: <Package className="w-4 h-4" /> },
  { key: "offers-received", label: "Offers Received", icon: <ArrowDownRight className="w-4 h-4" /> },
  { key: "offers-made", label: "Offers Made", icon: <ArrowUpRight className="w-4 h-4" /> },
  { key: "favorites", label: "Favorites", icon: <Heart className="w-4 h-4" /> },
  { key: "activity", label: "Activity", icon: <Activity className="w-4 h-4" /> },
  { key: "points", label: "Points History", icon: <Coins className="w-4 h-4" /> },
];

const ACTIVITY_FILTERS = ["ALL", "PURCHASES", "GACHA", "MARKETPLACE", "POINTS", "WITHDRAWALS"] as const;

// --- Types ---

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    walletAddress?: string;
    pointsBalance: number;
    usdcBalance: number;
    sellerTier: string;
    sellerRating: number;
    loginStreak: number;
    lastLoginAt: string;
    createdAt: string;
  };
  stats: {
    collectionCount: number;
    collectionValue: number;
    totalListings: number;
    pendingOffersReceived: number;
    pendingOffersMade: number;
    favoritesCount: number;
  };
  portfolioSnapshots: { date: string; totalValue: number }[];
}

interface CollectionCard {
  id: string;
  brand: string;
  denomination: number;
  fmv: number;
  rarityTier: string;
  status: string;
  code?: string;
  listing?: { id: string; price: number; status: string };
}

interface OfferItem {
  id: string;
  amount: number;
  message?: string;
  status: string;
  createdAt: string;
  listing: {
    id: string;
    price: number;
    giftCard: { brand: string; denomination: number; fmv: number };
  };
  buyer?: { id: string; name: string };
  seller?: { id: string; name: string };
}

interface FavoriteItem {
  id: string;
  giftCard?: { id: string; brand: string; denomination: number; fmv: number; rarityTier: string; status: string };
  listing?: {
    id: string;
    price: number;
    giftCard: { id: string; brand: string; denomination: number; fmv: number };
    seller: { id: string; name: string };
  };
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  amount?: number;
  currency?: string;
  txHash?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface PointsEntry {
  id: string;
  amount: number;
  type: string;
  description?: string;
  multiplier: number;
  balanceAfter: number;
  createdAt: string;
}

// --- Helpers ---

function getActivityIcon(type: string) {
  switch (type) {
    case "STOREFRONT_PURCHASE": return <ShoppingCart className="w-4 h-4 text-primary" />;
    case "BUNDLE_PURCHASE": return <Gift className="w-4 h-4 text-primary" />;
    case "GACHA_PULL": return <Dices className="w-4 h-4 text-accent" />;
    case "GACHA_BUYBACK": return <ArrowRightLeft className="w-4 h-4 text-warning" />;
    case "MARKETPLACE_PURCHASE": return <Store className="w-4 h-4 text-success" />;
    case "MARKETPLACE_SALE": return <DollarSign className="w-4 h-4 text-success" />;
    case "MARKETPLACE_LIST": return <Tag className="w-4 h-4 text-accent" />;
    case "OFFER_MADE": return <Send className="w-4 h-4 text-primary" />;
    case "OFFER_RECEIVED": return <ArrowDownRight className="w-4 h-4 text-accent" />;
    case "OFFER_ACCEPTED": return <Check className="w-4 h-4 text-success" />;
    case "OFFER_DECLINED": return <X className="w-4 h-4 text-danger" />;
    case "POINTS_EARNED": return <Coins className="w-4 h-4 text-warning" />;
    case "POINTS_REDEEMED": return <CreditCard className="w-4 h-4 text-tertiary" />;
    case "USDC_WITHDRAWAL": return <Wallet className="w-4 h-4 text-success" />;
    default: return <Activity className="w-4 h-4 text-text-secondary" />;
  }
}

function getPointsTypeLabel(type: string) {
  switch (type) {
    case "DAILY_LOGIN": return "Daily Login";
    case "STREAK_BONUS": return "Streak Bonus";
    case "PURCHASE_REWARD": return "Purchase Reward";
    case "GACHA_REWARD": return "Gacha Reward";
    case "REFERRAL": return "Referral";
    case "REDEEMED": return "Redeemed";
    case "ADMIN_GRANT": return "Admin Grant";
    default: return type;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// --- Main Component ---

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam && TABS.some((t) => t.key === tabParam) ? tabParam : "collection");

  // Data states
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab data
  const [collection, setCollection] = useState<CollectionCard[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionSort, setCollectionSort] = useState("newest");

  const [offersReceived, setOffersReceived] = useState<OfferItem[]>([]);
  const [offersReceivedLoading, setOffersReceivedLoading] = useState(false);
  const [offersReceivedFilter, setOffersReceivedFilter] = useState("ALL");

  const [offersMade, setOffersMade] = useState<OfferItem[]>([]);
  const [offersMadeLoading, setOffersMadeLoading] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>("ALL");
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);

  const [pointsEntries, setPointsEntries] = useState<PointsEntry[]>([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsPage, setPointsPage] = useState(1);
  const [pointsTotalPages, setPointsTotalPages] = useState(1);
  const [pointsSummary, setPointsSummary] = useState<{
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    currentStreak: number;
  } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchProfile();
  }, [status, fetchProfile]);

  // Fetch tab data
  const fetchCollection = useCallback(async () => {
    setCollectionLoading(true);
    try {
      const res = await fetch(`/api/profile/collection?sort=${collectionSort}`);
      if (res.ok) {
        const data = await res.json();
        setCollection(data.cards || []);
      }
    } catch {} finally { setCollectionLoading(false); }
  }, [collectionSort]);

  const fetchOffersReceived = useCallback(async () => {
    setOffersReceivedLoading(true);
    try {
      const url = offersReceivedFilter === "ALL"
        ? "/api/profile/offers/received"
        : `/api/profile/offers/received?status=${offersReceivedFilter}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOffersReceived(data.offers || []);
      }
    } catch {} finally { setOffersReceivedLoading(false); }
  }, [offersReceivedFilter]);

  const fetchOffersMade = useCallback(async () => {
    setOffersMadeLoading(true);
    try {
      const res = await fetch("/api/profile/offers/made");
      if (res.ok) {
        const data = await res.json();
        setOffersMade(data.offers || []);
      }
    } catch {} finally { setOffersMadeLoading(false); }
  }, []);

  const fetchFavorites = useCallback(async () => {
    setFavoritesLoading(true);
    try {
      const res = await fetch("/api/profile/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch {} finally { setFavoritesLoading(false); }
  }, []);

  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({ page: String(activityPage), limit: "20" });
      if (activityFilter !== "ALL") params.set("type", activityFilter);
      const res = await fetch(`/api/profile/activity?${params}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setActivityTotalPages(data.totalPages || 1);
      }
    } catch {} finally { setActivityLoading(false); }
  }, [activityFilter, activityPage]);

  const fetchPoints = useCallback(async () => {
    setPointsLoading(true);
    try {
      const res = await fetch(`/api/profile/points-history?page=${pointsPage}&limit=25`);
      if (res.ok) {
        const data = await res.json();
        setPointsEntries(data.entries || []);
        setPointsTotalPages(data.totalPages || 1);
        setPointsSummary(data.summary || null);
      }
    } catch {} finally { setPointsLoading(false); }
  }, [pointsPage]);

  // Load data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case "collection": fetchCollection(); break;
      case "offers-received": fetchOffersReceived(); break;
      case "offers-made": fetchOffersMade(); break;
      case "favorites": fetchFavorites(); break;
      case "activity": fetchActivity(); break;
      case "points": fetchPoints(); break;
    }
  }, [activeTab, fetchCollection, fetchOffersReceived, fetchOffersMade, fetchFavorites, fetchActivity, fetchPoints]);

  // Offer actions
  const handleOfferAction = async (offerId: string, action: "accept" | "decline" | "cancel") => {
    try {
      const res = await fetch(`/api/profile/offers/${offerId}/${action}`, { method: "POST" });
      if (res.ok) {
        if (activeTab === "offers-received") fetchOffersReceived();
        if (activeTab === "offers-made") fetchOffersMade();
        fetchProfile();
      }
    } catch {}
  };

  // Remove favorite
  const handleRemoveFavorite = async (fav: FavoriteItem) => {
    try {
      const body = fav.giftCard ? { giftCardId: fav.giftCard.id } : { listingId: fav.listing?.id };
      await fetch("/api/profile/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    } catch {}
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const { user, stats, portfolioSnapshots } = profile;

  // Portfolio change
  const portfolioChange = portfolioSnapshots.length >= 2
    ? portfolioSnapshots[portfolioSnapshots.length - 1].totalValue - portfolioSnapshots[portfolioSnapshots.length - 2].totalValue
    : 0;
  const portfolioChangePercent = portfolioSnapshots.length >= 2 && portfolioSnapshots[portfolioSnapshots.length - 2].totalValue > 0
    ? ((portfolioChange / portfolioSnapshots[portfolioSnapshots.length - 2].totalValue) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User info card */}
          <Card className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/20 border-2 border-primary/40 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="font-headline font-black text-xl tracking-tighter text-text-primary truncate">
                  {user.name}
                </h1>
                <p className="text-xs text-text-secondary">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default" size="sm">{user.sellerTier}</Badge>
                  {user.loginStreak > 0 && (
                    <div className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-warning" />
                      <span className="text-[10px] text-warning font-bold">{user.loginStreak}-day streak</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Balance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-elevated/50 border border-bg-border px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Coins className="w-3.5 h-3.5 text-warning" />
                  <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Points</span>
                </div>
                <p className="text-sm font-bold text-text-primary">{formatPoints(user.pointsBalance)}</p>
              </div>
              <div className="bg-bg-elevated/50 border border-bg-border px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-success" />
                  <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">USDC</span>
                </div>
                <p className="text-sm font-bold text-text-primary">{formatCurrency(user.usdcBalance)}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center py-2">
                <p className="text-lg font-bold text-text-primary">{stats.collectionCount}</p>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Cards</p>
              </div>
              <div className="text-center py-2">
                <p className="text-lg font-bold text-text-primary">{stats.totalListings}</p>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Listed</p>
              </div>
              <div className="text-center py-2">
                <p className="text-lg font-bold text-text-primary">{stats.favoritesCount}</p>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Favs</p>
              </div>
            </div>

            <p className="text-[10px] text-text-tertiary mt-3">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </p>
          </Card>

          {/* Portfolio Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-headline font-bold text-sm uppercase tracking-tight text-text-secondary">
                  Portfolio Value
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary">
                    {formatCurrency(stats.collectionValue)}
                  </span>
                  {portfolioChange !== 0 && (
                    <span className={cn("flex items-center gap-0.5 text-xs font-semibold", portfolioChange > 0 ? "text-success" : "text-danger")}>
                      {portfolioChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {portfolioChange > 0 ? "+" : ""}{portfolioChangePercent}%
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 text-success" />
                  <span>{stats.pendingOffersReceived} incoming</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3 text-primary" />
                  <span>{stats.pendingOffersMade} outgoing</span>
                </div>
              </div>
            </div>

            {portfolioSnapshots.length > 1 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={portfolioSnapshots} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d5bbff" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#d5bbff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      tick={{ fill: "#968da3", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `$${v}`}
                      tick={{ fill: "#968da3", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{ background: "#1b1b20", border: "1px solid #4b4357", fontSize: 12 }}
                      labelFormatter={(d) => new Date(String(d)).toLocaleDateString()}
                      formatter={(v) => [formatCurrency(Number(v)), "Value"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      stroke="#d5bbff"
                      strokeWidth={2}
                      fill="url(#portfolioGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-text-secondary">
                Not enough data for chart yet
              </div>
            )}
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-bg-border mb-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-headline uppercase tracking-tight font-medium transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab.key
                    ? "text-accent border-accent"
                    : "text-text-secondary border-transparent hover:text-text-primary hover:border-bg-border"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.key === "offers-received" && stats.pendingOffersReceived > 0 && (
                  <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                    {stats.pendingOffersReceived}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* Collection Tab */}
            {activeTab === "collection" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline font-bold uppercase tracking-tight text-text-primary">
                    My Collection ({collection.length})
                  </h2>
                  <select
                    value={collectionSort}
                    onChange={(e) => setCollectionSort(e.target.value)}
                    className="bg-bg-surface border border-bg-border px-3 py-1.5 text-sm text-text-primary"
                  >
                    <option value="newest">Newest</option>
                    <option value="value_desc">Value: High → Low</option>
                    <option value="value_asc">Value: Low → High</option>
                    <option value="brand">Brand A-Z</option>
                    <option value="rarity">Rarity</option>
                  </select>
                </div>

                {collectionLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : collection.length === 0 ? (
                  <Card className="text-center py-12">
                    <Package className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                    <p className="text-text-secondary">No cards in collection yet</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {collection.map((card) => (
                      <Card key={card.id} variant="interactive" className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getRarityColor(card.rarityTier) }}>
                            {card.rarityTier}
                          </span>
                          <Badge variant={card.status === "LISTED" ? "warning" : "success"} size="sm">
                            {card.status === "LISTED" ? "Listed" : "Owned"}
                          </Badge>
                        </div>
                        <h3 className="font-headline font-bold text-text-primary mb-1">
                          {getBrandDisplayName(card.brand)}
                        </h3>
                        <p className="text-lg font-bold text-text-primary">${card.denomination}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-bg-border">
                          <span className="text-xs text-text-secondary">FMV</span>
                          <span className="text-sm font-semibold text-success">{formatCurrency(card.fmv)}</span>
                        </div>
                        {card.listing && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-text-secondary">Listed at</span>
                            <span className="text-sm font-semibold text-primary">{formatCurrency(card.listing.price)}</span>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Offers Received Tab */}
            {activeTab === "offers-received" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline font-bold uppercase tracking-tight text-text-primary">
                    Offers Received
                  </h2>
                  <div className="flex gap-1">
                    {["ALL", "PENDING", "ACCEPTED", "DECLINED"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setOffersReceivedFilter(f)}
                        className={cn(
                          "px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors",
                          offersReceivedFilter === f
                            ? "bg-primary text-on-primary"
                            : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {offersReceivedLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : offersReceived.length === 0 ? (
                  <Card className="text-center py-12">
                    <Gavel className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                    <p className="text-text-secondary">No offers received</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {offersReceived.map((offer) => (
                      <Card key={offer.id} className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-text-primary">
                              {getBrandDisplayName(offer.listing.giftCard.brand)} ${offer.listing.giftCard.denomination}
                            </span>
                            <Badge
                              variant={offer.status === "PENDING" ? "warning" : offer.status === "ACCEPTED" ? "success" : "default"}
                              size="sm"
                            >
                              {offer.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary">
                            From <span className="text-text-primary font-medium">{offer.buyer?.name || "Unknown"}</span>
                            {" · "}{timeAgo(offer.createdAt)}
                          </p>
                          {offer.message && (
                            <p className="text-xs text-text-tertiary mt-1 italic">&quot;{offer.message}&quot;</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">{formatCurrency(offer.amount)}</p>
                          <p className="text-xs text-text-secondary">Listed: {formatCurrency(offer.listing.price)}</p>
                        </div>
                        {offer.status === "PENDING" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" variant="primary" icon={<Check className="w-3.5 h-3.5" />} onClick={() => handleOfferAction(offer.id, "accept")}>
                              Accept
                            </Button>
                            <Button size="sm" variant="ghost" icon={<X className="w-3.5 h-3.5" />} onClick={() => handleOfferAction(offer.id, "decline")}>
                              Decline
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Offers Made Tab */}
            {activeTab === "offers-made" && (
              <div>
                <h2 className="font-headline font-bold uppercase tracking-tight text-text-primary mb-4">
                  Offers Made
                </h2>

                {offersMadeLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : offersMade.length === 0 ? (
                  <Card className="text-center py-12">
                    <Send className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                    <p className="text-text-secondary">No offers made yet</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {offersMade.map((offer) => (
                      <Card key={offer.id} className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-text-primary">
                              {getBrandDisplayName(offer.listing.giftCard.brand)} ${offer.listing.giftCard.denomination}
                            </span>
                            <Badge
                              variant={offer.status === "PENDING" ? "warning" : offer.status === "ACCEPTED" ? "success" : "default"}
                              size="sm"
                            >
                              {offer.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary">
                            To <span className="text-text-primary font-medium">{offer.seller?.name || "Unknown"}</span>
                            {" · "}{timeAgo(offer.createdAt)}
                          </p>
                          {offer.message && (
                            <p className="text-xs text-text-tertiary mt-1 italic">&quot;{offer.message}&quot;</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">{formatCurrency(offer.amount)}</p>
                          <p className="text-xs text-text-secondary">Listed: {formatCurrency(offer.listing.price)}</p>
                        </div>
                        {offer.status === "PENDING" && (
                          <Button size="sm" variant="ghost" icon={<Ban className="w-3.5 h-3.5" />} onClick={() => handleOfferAction(offer.id, "cancel")}>
                            Cancel
                          </Button>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === "favorites" && (
              <div>
                <h2 className="font-headline font-bold uppercase tracking-tight text-text-primary mb-4">
                  Favorites ({favorites.length})
                </h2>

                {favoritesLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : favorites.length === 0 ? (
                  <Card className="text-center py-12">
                    <Heart className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                    <p className="text-text-secondary">No favorites yet</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {favorites.map((fav) => {
                      const card = fav.giftCard;
                      const listing = fav.listing;
                      return (
                        <Card key={fav.id} variant="interactive" className="relative">
                          <button
                            onClick={() => handleRemoveFavorite(fav)}
                            className="absolute top-3 right-3 text-danger hover:text-red-300 transition-colors"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                          {card && (
                            <>
                              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: getRarityColor(card.rarityTier) }}>
                                {card.rarityTier}
                              </span>
                              <h3 className="font-headline font-bold text-text-primary mt-1">
                                {getBrandDisplayName(card.brand)}
                              </h3>
                              <p className="text-lg font-bold text-text-primary">${card.denomination}</p>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-bg-border">
                                <span className="text-xs text-text-secondary">FMV</span>
                                <span className="text-sm font-semibold text-success">{formatCurrency(card.fmv)}</span>
                              </div>
                            </>
                          )}
                          {listing && (
                            <>
                              <h3 className="font-headline font-bold text-text-primary">
                                {getBrandDisplayName(listing.giftCard.brand)}
                              </h3>
                              <p className="text-text-primary font-bold">${listing.giftCard.denomination}</p>
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-bg-border">
                                <span className="text-xs text-text-secondary">Price</span>
                                <span className="text-sm font-semibold text-primary">{formatCurrency(listing.price)}</span>
                              </div>
                              <p className="text-xs text-text-tertiary mt-1">
                                by {listing.seller.name}
                              </p>
                            </>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-headline font-bold uppercase tracking-tight text-text-primary">
                    Activity
                  </h2>
                  <div className="flex gap-1 overflow-x-auto">
                    {ACTIVITY_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setActivityFilter(f); setActivityPage(1); }}
                        className={cn(
                          "px-3 py-1 text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap",
                          activityFilter === f
                            ? "bg-primary text-on-primary"
                            : "bg-bg-elevated text-text-secondary hover:text-text-primary"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {activityLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : activities.length === 0 ? (
                  <Card className="text-center py-12">
                    <Activity className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                    <p className="text-text-secondary">No activity to show</p>
                  </Card>
                ) : (
                  <>
                    <div className="space-y-1">
                      {activities.map((act) => (
                        <div key={act.id} className="flex items-center gap-3 px-4 py-3 bg-bg-surface border border-bg-border hover:bg-bg-elevated transition-colors">
                          <div className="shrink-0">{getActivityIcon(act.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-primary truncate">{act.description}</p>
                            <p className="text-xs text-text-tertiary">{timeAgo(act.createdAt)}</p>
                          </div>
                          {act.amount != null && (
                            <div className="text-right shrink-0">
                              <span className={cn("text-sm font-bold", act.amount > 0 ? "text-success" : "text-danger")}>
                                {act.amount > 0 ? "+" : ""}{act.currency === "POINTS" ? formatPoints(act.amount) : formatCurrency(act.amount)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {activityTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <button
                          disabled={activityPage <= 1}
                          onClick={() => setActivityPage((p) => p - 1)}
                          className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-text-secondary">
                          Page {activityPage} of {activityTotalPages}
                        </span>
                        <button
                          disabled={activityPage >= activityTotalPages}
                          onClick={() => setActivityPage((p) => p + 1)}
                          className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Points History Tab */}
            {activeTab === "points" && (
              <div>
                <h2 className="font-headline font-bold uppercase tracking-tight text-text-primary mb-4">
                  Points History
                </h2>

                {/* Summary cards */}
                {pointsSummary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-bg-surface border border-bg-border px-4 py-3">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Balance</p>
                      <p className="text-lg font-bold text-text-primary">{formatPoints(pointsSummary.currentBalance)}</p>
                    </div>
                    <div className="bg-bg-surface border border-bg-border px-4 py-3">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Total Earned</p>
                      <p className="text-lg font-bold text-success">{formatPoints(pointsSummary.totalEarned)}</p>
                    </div>
                    <div className="bg-bg-surface border border-bg-border px-4 py-3">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Total Spent</p>
                      <p className="text-lg font-bold text-danger">{formatPoints(pointsSummary.totalSpent)}</p>
                    </div>
                    <div className="bg-bg-surface border border-bg-border px-4 py-3">
                      <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Streak</p>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-warning" />
                        <p className="text-lg font-bold text-text-primary">{pointsSummary.currentStreak}</p>
                      </div>
                    </div>
                  </div>
                )}

                {pointsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
                ) : pointsEntries.length === 0 ? (
                  <Card className="text-center py-12">
                    <Coins className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
                    <p className="text-text-secondary">No points transactions yet</p>
                  </Card>
                ) : (
                  <>
                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-bg-border">
                            <th className="text-left px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium">Type</th>
                            <th className="text-left px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium">Description</th>
                            <th className="text-right px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium">Amount</th>
                            <th className="text-right px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium">Balance</th>
                            <th className="text-right px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pointsEntries.map((entry) => (
                            <tr key={entry.id} className="border-b border-bg-border/50 hover:bg-bg-elevated/50 transition-colors">
                              <td className="px-4 py-3">
                                <Badge variant={entry.amount > 0 ? "success" : "warning"} size="sm">
                                  {getPointsTypeLabel(entry.type)}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-text-primary">
                                {entry.description || getPointsTypeLabel(entry.type)}
                                {entry.multiplier > 1 && (
                                  <span className="ml-1 text-xs text-warning font-semibold">{entry.multiplier}x</span>
                                )}
                              </td>
                              <td className={cn("px-4 py-3 text-sm font-bold text-right", entry.amount > 0 ? "text-success" : "text-danger")}>
                                {entry.amount > 0 ? "+" : ""}{formatPoints(entry.amount)}
                              </td>
                              <td className="px-4 py-3 text-sm text-text-secondary text-right">
                                {formatPoints(entry.balanceAfter)}
                              </td>
                              <td className="px-4 py-3 text-xs text-text-tertiary text-right whitespace-nowrap">
                                {timeAgo(entry.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pointsTotalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <button
                          disabled={pointsPage <= 1}
                          onClick={() => setPointsPage((p) => p - 1)}
                          className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm text-text-secondary">
                          Page {pointsPage} of {pointsTotalPages}
                        </span>
                        <button
                          disabled={pointsPage >= pointsTotalPages}
                          onClick={() => setPointsPage((p) => p + 1)}
                          className="p-2 text-text-secondary hover:text-text-primary disabled:opacity-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
