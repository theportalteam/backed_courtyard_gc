import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";

    let orderBy: Prisma.GiftCardOrderByWithRelationInput;
    switch (sort) {
      case "value_high": orderBy = { fmv: "desc" }; break;
      case "value_low": orderBy = { fmv: "asc" }; break;
      case "brand": orderBy = { brand: "asc" }; break;
      default: orderBy = { createdAt: "desc" }; break;
    }

    const cards = await prisma.giftCard.findMany({
      where: { currentOwnerId: session.user.id, status: { in: ["RESERVED", "LISTED"] } },
      orderBy,
      select: {
        id: true, brand: true, denomination: true, fmv: true,
        rarityTier: true, status: true, createdAt: true,
      },
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Collection error:", error);
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}
