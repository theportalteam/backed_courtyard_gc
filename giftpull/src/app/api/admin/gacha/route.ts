import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/gacha
 *
 * Admin-only. Returns all gacha packs with their odds configuration.
 */
export async function GET() {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const packs = await prisma.gachaPack.findMany({
      orderBy: { price: "asc" },
      include: {
        odds: {
          orderBy: { weight: "desc" },
        },
        _count: {
          select: { pulls: true },
        },
      },
    });

    // Calculate EV for each pack
    const packsWithEV = packs.map((pack) => {
      const totalWeight = pack.odds.reduce((sum, o) => sum + o.weight, 0);
      const expectedValue =
        totalWeight > 0
          ? pack.odds.reduce(
              (sum, o) => sum + (o.weight / totalWeight) * o.cardValue,
              0
            )
          : 0;

      return {
        ...pack,
        totalPulls: pack._count.pulls,
        expectedValue: Math.round(expectedValue * 100) / 100,
      };
    });

    return NextResponse.json({ packs: packsWithEV });
  } catch (error) {
    console.error("Admin gacha GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gacha configuration" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/gacha
 *
 * Admin-only. Update a gacha pack or an individual odds entry.
 *
 * Pack update body:
 *   { packId: string, updates: { price?: number, dailyLimit?: number, isActive?: boolean } }
 *
 * Odds update body:
 *   { oddsId: string, weight?: number, cardValue?: number }
 *
 * Kill switch body:
 *   { killSwitch: boolean } — sets ALL packs isActive to the given value
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();

    // ── Kill switch: toggle all packs ──────────────────
    if ("killSwitch" in body) {
      const isActive = Boolean(body.killSwitch);

      await prisma.gachaPack.updateMany({
        data: { isActive },
      });

      return NextResponse.json({
        success: true,
        message: isActive ? "All packs activated" : "All packs paused",
      });
    }

    // ── Update individual odds entry ───────────────────
    if (body.oddsId) {
      const { oddsId, weight, cardValue } = body;

      const updateData: any = {};
      if (typeof weight === "number" && weight >= 0) updateData.weight = weight;
      if (typeof cardValue === "number" && cardValue >= 0) updateData.cardValue = cardValue;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: "No valid fields to update" },
          { status: 400 }
        );
      }

      const updatedOdds = await prisma.gachaOdds.update({
        where: { id: oddsId },
        data: updateData,
      });

      return NextResponse.json({ success: true, odds: updatedOdds });
    }

    // ── Update pack settings ───────────────────────────
    if (body.packId) {
      const { packId, updates } = body;

      if (!updates || typeof updates !== "object") {
        return NextResponse.json(
          { error: "updates object is required" },
          { status: 400 }
        );
      }

      const updateData: any = {};
      if (typeof updates.price === "number" && updates.price > 0)
        updateData.price = updates.price;
      if (typeof updates.dailyLimit === "number" && updates.dailyLimit >= 0)
        updateData.dailyLimit = updates.dailyLimit;
      if (typeof updates.isActive === "boolean")
        updateData.isActive = updates.isActive;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { error: "No valid fields to update" },
          { status: 400 }
        );
      }

      const updatedPack = await prisma.gachaPack.update({
        where: { id: packId },
        data: updateData,
        include: { odds: true },
      });

      return NextResponse.json({ success: true, pack: updatedPack });
    }

    return NextResponse.json(
      { error: "Provide packId, oddsId, or killSwitch" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Admin gacha PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update gacha configuration" },
      { status: 500 }
    );
  }
}
