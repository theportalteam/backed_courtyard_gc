import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const typeFilter = searchParams.get("type");
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (typeFilter) where.type = typeFilter;

    const [entries, total, totals, user] = await Promise.all([
      prisma.pointsLedger.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.pointsLedger.count({ where }),
      prisma.pointsLedger.groupBy({
        by: ["type"],
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { pointsBalance: true, loginStreak: true },
      }),
    ]);

    // Calculate totals
    let totalEarned = 0;
    let totalSpent = 0;
    for (const t of totals) {
      const sum = t._sum.amount ?? 0;
      if (sum > 0) totalEarned += sum;
      else totalSpent += Math.abs(sum);
    }

    // Calculate running balance for each entry
    // Get all entries to compute balance at each point
    const allEntries = await prisma.pointsLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, amount: true },
    });

    let runningBalance = 0;
    const balanceMap = new Map<string, number>();
    for (const entry of allEntries) {
      runningBalance += entry.amount;
      balanceMap.set(entry.id, runningBalance);
    }

    const entriesWithBalance = entries.map((entry) => ({
      ...entry,
      balanceAfter: balanceMap.get(entry.id) ?? 0,
    }));

    return NextResponse.json({
      entries: entriesWithBalance,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalEarned,
        totalSpent,
        currentBalance: user?.pointsBalance ?? 0,
        currentStreak: user?.loginStreak ?? 0,
      },
    });
  } catch (error) {
    console.error("Points history error:", error);
    return NextResponse.json({ error: "Failed to fetch points history" }, { status: 500 });
  }
}
