import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { ActivityType, Prisma } from "@prisma/client";

const TYPE_FILTERS: Record<string, ActivityType[]> = {
  PURCHASES: ["STOREFRONT_PURCHASE", "BUNDLE_PURCHASE"],
  GACHA: ["GACHA_PULL", "GACHA_BUYBACK"],
  MARKETPLACE: ["MARKETPLACE_PURCHASE", "MARKETPLACE_SALE", "MARKETPLACE_LIST", "OFFER_MADE", "OFFER_RECEIVED", "OFFER_ACCEPTED", "OFFER_DECLINED"],
  POINTS: ["POINTS_EARNED", "POINTS_REDEEMED"],
  WITHDRAWALS: ["USDC_WITHDRAWAL"],
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "ALL";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = { userId: session.user.id };
    if (type !== "ALL" && TYPE_FILTERS[type]) {
      where.type = { in: TYPE_FILTERS[type] };
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return NextResponse.json({
      activities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
