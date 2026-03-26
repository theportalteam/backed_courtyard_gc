import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";
import { capturePortfolioSnapshot } from "@/lib/portfolio";

/**
 * POST /api/points/redeem
 *
 * Redeem points for a gift card or gacha pack.
 *
 * Body: { type: "GIFT_CARD" | "GACHA_PACK", brand?: string, denomination?: number }
 *
 * GIFT_CARD flow:
 *   - Points cost = denomination * 100
 *   - Finds an AVAILABLE gift card matching brand + denomination
 *   - Marks it RESERVED, assigns owner, deducts points, creates transaction + ledger entry
 *
 * GACHA_PACK flow:
 *   - Returns a redirect hint to use the gacha pull endpoint with POINTS payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { type, brand, denomination } = body;

    // ── Validate type ──────────────────────────────────
    if (!type || !["GIFT_CARD", "GACHA_PACK"].includes(type)) {
      return NextResponse.json(
        { error: 'type must be "GIFT_CARD" or "GACHA_PACK"' },
        { status: 400 }
      );
    }

    // ── GACHA_PACK redirect ────────────────────────────
    if (type === "GACHA_PACK") {
      return NextResponse.json({
        redirect: true,
        message: "Use POST /api/gacha/pull with paymentMethod: POINTS",
        endpoint: "/api/gacha/pull",
      });
    }

    // ── GIFT_CARD redemption ───────────────────────────
    if (!brand || !denomination) {
      return NextResponse.json(
        { error: "brand and denomination are required for GIFT_CARD redemption" },
        { status: 400 }
      );
    }

    if (typeof denomination !== "number" || denomination <= 0) {
      return NextResponse.json(
        { error: "denomination must be a positive number" },
        { status: 400 }
      );
    }

    const pointsCost = Math.round(denomination * 100);

    // ── Check user balance ─────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pointsBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.pointsBalance < pointsCost) {
      return NextResponse.json(
        {
          error: `Insufficient points. Need ${pointsCost}, have ${user.pointsBalance}`,
        },
        { status: 400 }
      );
    }

    // ── Find available card ────────────────────────────
    const card = await prisma.giftCard.findFirst({
      where: {
        brand: brand as any,
        denomination,
        status: "AVAILABLE",
      },
      orderBy: { createdAt: "asc" }, // FIFO
    });

    if (!card) {
      return NextResponse.json(
        { error: `No ${brand} $${denomination} cards available` },
        { status: 404 }
      );
    }

    // ── Atomic: reserve card, deduct points, create records ──
    const [updatedUser, updatedCard, transaction, ledgerEntry] =
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { pointsBalance: { decrement: pointsCost } },
          select: { pointsBalance: true },
        }),
        prisma.giftCard.update({
          where: { id: card.id },
          data: {
            status: "RESERVED",
            currentOwnerId: userId,
          },
        }),
        prisma.transaction.create({
          data: {
            type: "POINTS_REDEMPTION",
            userId,
            giftCardId: card.id,
            amount: denomination,
            currency: "POINTS",
            paymentMethod: "POINTS",
            status: "COMPLETED",
            pointsEarned: 0,
            metadata: {
              pointsSpent: pointsCost,
              brand,
              denomination,
            },
          },
        }),
        prisma.pointsLedger.create({
          data: {
            userId,
            amount: -pointsCost,
            type: "REDEMPTION",
            description: `Redeemed for ${brand} $${denomination} gift card`,
          },
        }),
      ]);

    await logActivity(userId, "POINTS_REDEEMED", `Redeemed ${pointsCost} points for ${brand} $${denomination} Gift Card`, { amount: pointsCost, currency: "POINTS", metadata: { redemptionType: "GIFT_CARD", brand, denomination } });
    await capturePortfolioSnapshot(userId);

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
      },
      card: {
        id: updatedCard.id,
        brand: updatedCard.brand,
        denomination: updatedCard.denomination,
        code: updatedCard.code,
      },
      pointsSpent: pointsCost,
      newBalance: updatedUser.pointsBalance,
    });
  } catch (error) {
    console.error("Points redemption error:", error);
    return NextResponse.json(
      { error: "Redemption failed" },
      { status: 500 }
    );
  }
}
