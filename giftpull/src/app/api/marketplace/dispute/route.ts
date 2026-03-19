import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

/**
 * POST /api/marketplace/dispute
 *
 * Open a dispute on a purchased listing. Requires authentication.
 * Only the buyer can dispute a listing.
 * Body: { listingId, reason }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { listingId, reason } = body;

    // ── Input validation ───────────────────────────────
    if (!listingId || !reason) {
      return NextResponse.json(
        { error: "listingId and reason are required" },
        { status: 400 }
      );
    }

    if (typeof reason !== "string" || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Dispute reason must be at least 10 characters" },
        { status: 400 }
      );
    }

    // ── Fetch the listing ──────────────────────────────
    const listing = await prisma.p2PListing.findUnique({
      where: { id: listingId },
      include: {
        giftCard: {
          select: {
            brand: true,
            denomination: true,
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
        { error: "Only the buyer can dispute a listing" },
        { status: 403 }
      );
    }

    // Validate listing is SOLD (you can only dispute after purchase)
    if (listing.status !== "SOLD") {
      return NextResponse.json(
        { error: "Can only dispute a purchased listing" },
        { status: 400 }
      );
    }

    // Check if already disputed
    if (listing.disputeStatus !== "NONE") {
      return NextResponse.json(
        { error: "A dispute has already been filed for this listing" },
        { status: 409 }
      );
    }

    // ── Update dispute status ──────────────────────────
    const updatedListing = await prisma.p2PListing.update({
      where: { id: listingId },
      data: {
        disputeStatus: "OPEN",
        disputeReason: reason.trim(),
      },
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
          },
        },
      },
    });

    return NextResponse.json({ listing: updatedListing });
  } catch (error) {
    console.error("Error filing dispute:", error);

    const message =
      error instanceof Error ? error.message : "Failed to file dispute";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
