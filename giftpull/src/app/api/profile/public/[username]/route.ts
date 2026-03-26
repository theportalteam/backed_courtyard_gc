import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    const user = await prisma.user.findFirst({
      where: { name: username },
      select: {
        id: true,
        name: true,
        sellerTier: true,
        sellerRating: true,
        loginStreak: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get public stats
    const [collectionCount, totalListings, totalSales] = await Promise.all([
      prisma.giftCard.count({
        where: { currentOwnerId: user.id, status: { in: ["RESERVED", "LISTED"] } },
      }),
      prisma.p2PListing.count({
        where: { sellerId: user.id, status: "ACTIVE" },
      }),
      prisma.p2PListing.count({
        where: { sellerId: user.id, status: "SOLD" },
      }),
    ]);

    // Get active listings
    const listings = await prisma.p2PListing.findMany({
      where: { sellerId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: {
        giftCard: {
          select: { brand: true, denomination: true, fmv: true, rarityTier: true },
        },
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        sellerTier: user.sellerTier,
        sellerRating: user.sellerRating,
        loginStreak: user.loginStreak,
        createdAt: user.createdAt,
      },
      stats: {
        collectionCount,
        totalListings,
        totalSales,
      },
      listings: listings.map((l) => ({
        id: l.id,
        price: l.askingPrice,
        giftCard: l.giftCard,
      })),
    });
  } catch (error) {
    console.error("Public profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
