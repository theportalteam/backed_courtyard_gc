import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        giftCard: { select: { id: true, brand: true, denomination: true, fmv: true, rarityTier: true, status: true } },
        listing: {
          include: {
            giftCard: { select: { id: true, brand: true, denomination: true, fmv: true } },
            seller: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Favorites error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { giftCardId, listingId } = await request.json();

    if (!giftCardId && !listingId) {
      return NextResponse.json({ error: "giftCardId or listingId is required" }, { status: 400 });
    }

    // Toggle: if already favorited, remove it; otherwise add it
    if (giftCardId) {
      const existing = await prisma.favorite.findUnique({ where: { userId_giftCardId: { userId, giftCardId } } });
      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return NextResponse.json({ favorited: false });
      }
      await prisma.favorite.create({ data: { userId, giftCardId } });
      return NextResponse.json({ favorited: true });
    }

    if (listingId) {
      const existing = await prisma.favorite.findUnique({ where: { userId_listingId: { userId, listingId } } });
      if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        return NextResponse.json({ favorited: false });
      }
      await prisma.favorite.create({ data: { userId, listingId } });
      return NextResponse.json({ favorited: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
