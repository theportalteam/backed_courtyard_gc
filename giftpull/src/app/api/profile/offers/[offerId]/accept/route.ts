import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { capturePortfolioSnapshot } from "@/lib/portfolio";

export async function POST(request: NextRequest, { params }: { params: { offerId: string } }) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.offerId },
      include: { listing: { include: { giftCard: true } } },
    });

    if (!offer || offer.toUserId !== session.user.id) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json({ error: "Offer is no longer pending" }, { status: 400 });
    }

    // Accept offer: update offer status, mark listing sold, transfer card
    await prisma.$transaction([
      prisma.offer.update({ where: { id: params.offerId }, data: { status: "ACCEPTED" } }),
      prisma.p2PListing.update({ where: { id: offer.listingId }, data: { status: "SOLD", buyerId: offer.fromUserId } }),
      prisma.giftCard.update({ where: { id: offer.listing.giftCardId }, data: { status: "RESERVED", currentOwnerId: offer.fromUserId } }),
      // Decline other pending offers on this listing
      prisma.offer.updateMany({ where: { listingId: offer.listingId, id: { not: params.offerId }, status: "PENDING" }, data: { status: "DECLINED" } }),
    ]);

    await logActivity(session.user.id, "OFFER_ACCEPTED", `Accepted offer of $${offer.amount.toFixed(2)} on listing`, { amount: offer.amount, metadata: { offerId: offer.id, listingId: offer.listingId } });
    await capturePortfolioSnapshot(session.user.id);
    await capturePortfolioSnapshot(offer.fromUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Accept offer error:", error);
    return NextResponse.json({ error: "Failed to accept offer" }, { status: 500 });
  }
}
