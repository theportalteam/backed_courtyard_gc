import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GiftCardBrand, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const brand = searchParams.get("brand") as GiftCardBrand | null;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort"); // price_asc, price_desc, discount_desc

    // Build where clause
    const where: Prisma.GiftCardWhereInput = {
      status: "AVAILABLE",
    };

    if (brand) {
      where.brand = brand;
    }

    if (minPrice) {
      where.listedPrice = {
        ...(where.listedPrice as Prisma.FloatNullableFilter || {}),
        gte: parseFloat(minPrice),
      };
    }

    if (maxPrice) {
      where.listedPrice = {
        ...(where.listedPrice as Prisma.FloatNullableFilter || {}),
        lte: parseFloat(maxPrice),
      };
    }

    // Build orderBy clause
    let orderBy: Prisma.GiftCardOrderByWithRelationInput = { createdAt: "desc" };

    switch (sort) {
      case "price_asc":
        orderBy = { listedPrice: "asc" };
        break;
      case "price_desc":
        orderBy = { listedPrice: "desc" };
        break;
      case "discount_desc":
        orderBy = { discountPercent: "desc" };
        break;
    }

    const [cards, total] = await Promise.all([
      prisma.giftCard.findMany({
        where,
        orderBy,
        select: {
          id: true,
          brand: true,
          denomination: true,
          status: true,
          fmv: true,
          listedPrice: true,
          discountPercent: true,
          rarityTier: true,
          createdAt: true,
        },
      }),
      prisma.giftCard.count({ where }),
    ]);

    return NextResponse.json({ cards, total });
  } catch (error) {
    console.error("Error fetching storefront cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}
