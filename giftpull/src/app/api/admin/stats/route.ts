import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/stats
 *
 * Admin-only. Returns platform-wide statistics:
 * totalUsers, totalRevenue, gachaPullsToday, activeListings, pointsInCirculation.
 */
export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Start of today (UTC)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      revenueResult,
      gachaPullsToday,
      activeListings,
      pointsResult,
    ] = await Promise.all([
      // Total registered users
      prisma.user.count(),

      // Total revenue from completed transactions
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),

      // Gacha pulls executed today
      prisma.gachaPull.count({
        where: {
          createdAt: { gte: todayStart },
        },
      }),

      // Active P2P listings
      prisma.p2PListing.count({
        where: { status: "ACTIVE" },
      }),

      // Total points in circulation (sum of all user balances)
      prisma.user.aggregate({
        _sum: { pointsBalance: true },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalRevenue: revenueResult._sum.amount ?? 0,
      gachaPullsToday,
      activeListings,
      pointsInCirculation: pointsResult._sum.pointsBalance ?? 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
