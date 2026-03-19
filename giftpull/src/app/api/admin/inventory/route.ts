import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateFakeCode } from "@/lib/utils";

/**
 * GET /api/admin/inventory
 *
 * Admin-only. Returns paginated gift cards with optional filters.
 * Query params: brand, status, source, page (1-based), limit (default 25).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get("brand");
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    // ── Build where clause ─────────────────────────────
    const where: any = {};
    if (brand) where.brand = brand;
    if (status) where.status = status;
    if (source) where.source = source;

    const [cards, total] = await Promise.all([
      prisma.giftCard.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          brand: true,
          denomination: true,
          status: true,
          source: true,
          rarityTier: true,
          fmv: true,
          createdAt: true,
          currentOwner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.giftCard.count({ where }),
    ]);

    return NextResponse.json({
      cards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin inventory GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/inventory
 *
 * Admin-only. Bulk-create gift cards with auto-generated test codes.
 *
 * Body: { brand: string, denomination: number, quantity: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { brand, denomination, quantity } = body;

    // ── Validation ─────────────────────────────────────
    if (!brand || typeof brand !== "string") {
      return NextResponse.json(
        { error: "brand is required" },
        { status: 400 }
      );
    }

    if (!denomination || typeof denomination !== "number" || denomination <= 0) {
      return NextResponse.json(
        { error: "denomination must be a positive number" },
        { status: 400 }
      );
    }

    if (!quantity || typeof quantity !== "number" || quantity < 1 || quantity > 500) {
      return NextResponse.json(
        { error: "quantity must be between 1 and 500" },
        { status: 400 }
      );
    }

    // ── Determine rarity tier based on denomination ────
    let rarityTier: "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY";
    if (denomination >= 100) rarityTier = "LEGENDARY";
    else if (denomination >= 50) rarityTier = "EPIC";
    else if (denomination >= 25) rarityTier = "RARE";
    else if (denomination >= 10) rarityTier = "UNCOMMON";
    else rarityTier = "COMMON";

    // ── Bulk create ────────────────────────────────────
    const cardsData = Array.from({ length: quantity }, () => ({
      brand: brand as any,
      denomination,
      code: generateFakeCode(),
      status: "AVAILABLE" as const,
      source: "BULK_IMPORT" as const,
      fmv: denomination, // FMV defaults to face value
      rarityTier,
    }));

    const result = await prisma.giftCard.createMany({
      data: cardsData,
    });

    return NextResponse.json({
      created: result.count,
      brand,
      denomination,
      rarityTier,
    });
  } catch (error) {
    console.error("Admin inventory POST error:", error);
    return NextResponse.json(
      { error: "Failed to create cards" },
      { status: 500 }
    );
  }
}
