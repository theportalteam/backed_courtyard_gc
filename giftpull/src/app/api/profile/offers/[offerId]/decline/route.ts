import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function POST(request: NextRequest, { params }: { params: { offerId: string } }) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.offerId },
      include: { listing: { include: { giftCard: { select: { brand: true, denomination: true } } } } },
    });

    if (!offer || offer.toUserId !== session.user.id) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json({ error: "Offer is no longer pending" }, { status: 400 });
    }

    await prisma.offer.update({ where: { id: params.offerId }, data: { status: "DECLINED" } });

    await logActivity(session.user.id, "OFFER_DECLINED", `Declined offer of $${offer.amount.toFixed(2)} on $${offer.listing.giftCard.denomination} ${offer.listing.giftCard.brand}`, { amount: offer.amount, metadata: { offerId: offer.id, listingId: offer.listingId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Decline offer error:", error);
    return NextResponse.json({ error: "Failed to decline offer" }, { status: 500 });
  }
}
