import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/points/balance
 *
 * Returns the authenticated user's points balance and
 * the 20 most recent points ledger entries.
 */
export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [user, recentLedger] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true },
      }),
      prisma.pointsLedger.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          amount: true,
          type: true,
          multiplier: true,
          description: true,
          transactionId: true,
          createdAt: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      balance: user.pointsBalance,
      recentLedger,
    });
  } catch (error) {
    console.error("Points balance error:", error);
    return NextResponse.json(
      { error: "Failed to fetch points balance" },
      { status: 500 }
    );
  }
}
