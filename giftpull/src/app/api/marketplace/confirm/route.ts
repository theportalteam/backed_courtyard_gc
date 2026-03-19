import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

/**
 * POST /api/marketplace/confirm
 *
 * Confirm receipt of a purchased card. Requires authentication.
 * Only the buyer can confirm. Marks the card as SOLD (finalized).
 * Body: { listingId }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { listingId } = body;

    // ── Input validation ───────────────────────────────
    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    // ── Fetch the listing ──────────────────────────────
    const listing = await prisma.p2PListing.findUnique({
      where: { id: listingId },
      include: {
        giftCard: {
          select: {
            id: true,
            brand: true,
            denomination: true,
            status: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Validate user is the buyer
    if (listing.buyerId !== userId) {
      return NextResponse.json(
        { error: "Only the buyer can confirm a listing" },
        { status: 403 }
      );
    }

    // Validate listing is SOLD
    if (listing.status !== "SOLD") {
      return NextResponse.json(
        { error: "Can only confirm a purchased listing" },
        { status: 400 }
      );
    }

    // If dispute status is NONE, just finalize the card
    // If dispute status is OPEN, resolve in seller's favor (buyer is confirming)
    const updateData: Record<string, unknown> = {};

    if (listing.disputeStatus === "OPEN") {
      updateData.disputeStatus = "RESOLVED_SELLER";
    }

    // Mark card as SOLD (finalized, no longer RESERVED)
    await prisma.giftCard.update({
      where: { id: listing.giftCardId },
      data: { status: "SOLD" },
    });

    const updatedListing = await prisma.p2PListing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            sellerTier: true,
          },
        },
        giftCard: {
          select: {
            id: true,
            brand: true,
            denomination: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Error confirming listing:", error);

    const message =
      error instanceof Error ? error.message : "Failed to confirm listing";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
