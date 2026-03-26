import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { generateFakeCode } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import type { GiftCardBrand, Prisma } from "@prisma/client";

const VALID_BRANDS: GiftCardBrand[] = [
  "XBOX",
  "STEAM",
  "NINTENDO",
  "PLAYSTATION",
  "GOOGLE_PLAY",
  "AMAZON",
  "APPLE",
  "ROBLOX",
  "SPOTIFY",
  "NETFLIX",
];

type SortOption = "newest" | "price_asc" | "price_desc" | "discount";

/**
 * GET /api/marketplace/listings
 *
 * Fetch active P2P listings with optional filters.
 * Query params: brand, minPrice, maxPrice, sort (newest|price_asc|price_desc|discount)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand") as GiftCardBrand | null;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = (searchParams.get("sort") || "newest") as SortOption;

    // Build where clause
    const where: Prisma.P2PListingWhereInput = {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    };

    if (brand && VALID_BRANDS.includes(brand)) {
      where.giftCard = { brand };
    }

    if (minPrice || maxPrice) {
      where.askingPrice = {};
      if (minPrice) {
        where.askingPrice.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.askingPrice.lte = parseFloat(maxPrice);
      }
    }

    // Build orderBy
    let orderBy: Prisma.P2PListingOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { askingPrice: "asc" };
        break;
      case "price_desc":
        orderBy = { askingPrice: "desc" };
        break;
      case "discount":
        // Sort by biggest discount: lowest askingPrice relative to denomination
        // We approximate by sorting by askingPrice ascending
        orderBy = { askingPrice: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [listings, total] = await Promise.all([
      prisma.p2PListing.findMany({
        where,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              sellerTier: true,
              sellerRating: true,
              totalSales: true,
            },
          },
          giftCard: {
            select: {
              id: true,
              brand: true,
              denomination: true,
              fmv: true,
              verificationStatus: true,
            },
          },
        },
      }),
      prisma.p2PListing.count({ where }),
    ]);

    // If sorting by discount, sort in memory by actual discount percentage
    let sortedListings = listings;
    if (sort === "discount") {
      sortedListings = [...listings].sort((a, b) => {
        const discountA =
          ((a.giftCard.denomination - a.askingPrice) / a.giftCard.denomination) * 100;
        const discountB =
          ((b.giftCard.denomination - b.askingPrice) / b.giftCard.denomination) * 100;
        return discountB - discountA;
      });
    }

    return NextResponse.json({ listings: sortedListings, total });
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/listings
 *
 * Create a new P2P listing. Requires authentication.
 * Body: { brand, denomination, code, askingPrice }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { brand, denomination, code, askingPrice } = body;

    // ── Input validation ───────────────────────────────
    if (!brand || !denomination || !code || !askingPrice) {
      return NextResponse.json(
        { error: "brand, denomination, code, and askingPrice are required" },
        { status: 400 }
      );
    }

    if (!VALID_BRANDS.includes(brand as GiftCardBrand)) {
      return NextResponse.json(
        { error: `Invalid brand. Use one of: ${VALID_BRANDS.join(", ")}` },
        { status: 400 }
      );
    }

    const denom = parseFloat(denomination);
    const price = parseFloat(askingPrice);

    if (isNaN(denom) || denom <= 0) {
      return NextResponse.json(
        { error: "Denomination must be a positive number" },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Asking price must be a positive number" },
        { status: 400 }
      );
    }

    if (price > denom) {
      return NextResponse.json(
        { error: "Asking price cannot exceed denomination" },
        { status: 400 }
      );
    }

    // ── Create GiftCard with PENDING verification ──────
    const suggestedPrice = Math.round(denom * 0.9 * 100) / 100;

    const giftCard = await prisma.giftCard.create({
      data: {
        brand: brand as GiftCardBrand,
        denomination: denom,
        code,
        status: "LISTED",
        source: "USER_LISTED",
        fmv: denom,
        currentOwnerId: userId,
        verificationStatus: "PENDING",
      },
    });

    // ── Simulate 1s verification delay ─────────────────
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update to VERIFIED
    await prisma.giftCard.update({
      where: { id: giftCard.id },
      data: { verificationStatus: "VERIFIED" },
    });

    // ── Create the P2P listing ─────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const listing = await prisma.p2PListing.create({
      data: {
        sellerId: userId,
        giftCardId: giftCard.id,
        askingPrice: price,
        suggestedPrice,
        status: "ACTIVE",
        expiresAt,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            sellerTier: true,
            sellerRating: true,
          },
        },
        giftCard: {
          select: {
            id: true,
            brand: true,
            denomination: true,
            fmv: true,
            verificationStatus: true,
          },
        },
      },
    });

    await logActivity(userId, "MARKETPLACE_LIST", `Listed $${denom} ${brand} Gift Card for $${price.toFixed(2)}`, { amount: price, metadata: { listingId: listing.id, cardBrand: brand } });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create listing";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
