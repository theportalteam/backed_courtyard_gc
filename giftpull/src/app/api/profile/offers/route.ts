import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { listingId, amount, message } = await request.json();

    if (!listingId || !amount || amount <= 0) {
      return NextResponse.json({ error: "listingId and a positive amount are required" }, { status: 400 });
    }

    const listing = await prisma.p2PListing.findUnique({
      where: { id: listingId },
      include: { giftCard: { select: { brand: true, denomination: true } }, seller: { select: { id: true, name: true } } },
    });

    if (!listing || listing.status !== "ACTIVE") {
      return NextResponse.json({ error: "Listing not found or unavailable" }, { status: 404 });
    }

    if (listing.sellerId === userId) {
      return NextResponse.json({ error: "Cannot make an offer on your own listing" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const offer = await prisma.offer.create({
      data: {
        listingId,
        fromUserId: userId,
        toUserId: listing.sellerId,
        amount,
        message: message || null,
        expiresAt,
      },
    });

    await logActivity(userId, "OFFER_MADE", `Offered $${amount.toFixed(2)} on $${listing.giftCard.denomination} ${listing.giftCard.brand} Gift Card`, { amount, metadata: { listingId, offerId: offer.id } });
    await logActivity(listing.sellerId, "OFFER_RECEIVED", `Received offer of $${amount.toFixed(2)} on $${listing.giftCard.denomination} ${listing.giftCard.brand} Gift Card`, { amount, metadata: { listingId, offerId: offer.id, fromUserId: userId } });

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error) {
    console.error("Create offer error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
