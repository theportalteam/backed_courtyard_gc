import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, collectionCount, collectionValue, totalListings, pendingOffersReceived, pendingOffersMade, favoritesCount, portfolioSnapshots] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, name: true, email: true, walletAddress: true,
          pointsBalance: true, usdcBalance: true, sellerTier: true,
          sellerRating: true, loginStreak: true, lastLoginAt: true, createdAt: true,
        },
      }),
      prisma.giftCard.count({ where: { currentOwnerId: userId, status: { in: ["RESERVED", "LISTED"] } } }),
      prisma.giftCard.aggregate({ where: { currentOwnerId: userId, status: { in: ["RESERVED", "LISTED"] } }, _sum: { fmv: true } }),
      prisma.p2PListing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
      prisma.offer.count({ where: { toUserId: userId, status: "PENDING" } }),
      prisma.offer.count({ where: { fromUserId: userId, status: "PENDING" } }),
      prisma.favorite.count({ where: { userId } }),
      prisma.portfolioSnapshot.findMany({
        where: { userId },
        orderBy: { date: "asc" },
        select: { date: true, totalValue: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user,
      stats: {
        collectionCount,
        collectionValue: collectionValue._sum.fmv ?? 0,
        totalListings,
        pendingOffersReceived,
        pendingOffersMade,
        favoritesCount,
      },
      portfolioSnapshots,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
