import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = { fromUserId: session.user.id };
    if (status) where.status = status;

    const offers = await prisma.offer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { include: { giftCard: { select: { id: true, brand: true, denomination: true, fmv: true } }, seller: { select: { id: true, name: true, image: true } } } },
        toUser: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Offers made error:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}
