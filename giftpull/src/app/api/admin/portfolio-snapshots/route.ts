import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { capturePortfolioSnapshot } from "@/lib/portfolio";

export async function POST() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all users who own at least one card
    const usersWithCards = await prisma.user.findMany({
      where: {
        giftCards: {
          some: { status: { in: ["RESERVED", "LISTED"] } },
        },
      },
      select: { id: true },
    });

    let captured = 0;
    for (const user of usersWithCards) {
      await capturePortfolioSnapshot(user.id);
      captured++;
    }

    return NextResponse.json({ captured, message: `Captured ${captured} portfolio snapshots` });
  } catch (error) {
    console.error("Portfolio snapshot error:", error);
    return NextResponse.json({ error: "Failed to capture snapshots" }, { status: 500 });
  }
}
