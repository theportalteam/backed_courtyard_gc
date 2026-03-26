import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { offerId: string } }) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const offer = await prisma.offer.findUnique({ where: { id: params.offerId } });

    if (!offer || offer.fromUserId !== session.user.id) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json({ error: "Offer is no longer pending" }, { status: 400 });
    }

    await prisma.offer.update({ where: { id: params.offerId }, data: { status: "CANCELLED" } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel offer error:", error);
    return NextResponse.json({ error: "Failed to cancel offer" }, { status: 500 });
  }
}
