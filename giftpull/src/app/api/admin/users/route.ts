import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/users
 *
 * Admin-only. Returns paginated users with key fields.
 * Query params: search (email/name), page (1-based), limit (default 25).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    // ── Build where clause ─────────────────────────────
    const where: any = {};
    if (search.trim()) {
      where.OR = [
        { email: { contains: search.trim(), mode: "insensitive" } },
        { name: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          pointsBalance: true,
          usdcBalance: true,
          sellerTier: true,
          sellerRating: true,
          totalSales: true,
          isAdmin: true,
          loginStreak: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              transactions: true,
              pullHistory: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 *
 * Admin-only. Adjust a user's points balance.
 *
 * Body: { userId: string, pointsAdjustment: number, reason: string }
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
    const { userId, pointsAdjustment, reason } = body;

    // ── Validation ─────────────────────────────────────
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    if (typeof pointsAdjustment !== "number" || pointsAdjustment === 0) {
      return NextResponse.json(
        { error: "pointsAdjustment must be a non-zero number" },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "reason is required" },
        { status: 400 }
      );
    }

    // ── Verify user exists ─────────────────────────────
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, pointsBalance: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent negative balance
    const newBalance = targetUser.pointsBalance + pointsAdjustment;
    if (newBalance < 0) {
      return NextResponse.json(
        {
          error: `Adjustment would result in negative balance. Current: ${targetUser.pointsBalance}, adjustment: ${pointsAdjustment}`,
        },
        { status: 400 }
      );
    }

    // ── Atomic update ──────────────────────────────────
    const [updatedUser, ledgerEntry] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          pointsBalance: { increment: pointsAdjustment },
        },
        select: {
          id: true,
          email: true,
          pointsBalance: true,
        },
      }),
      prisma.pointsLedger.create({
        data: {
          userId,
          amount: pointsAdjustment,
          type: "ADMIN_ADJUST",
          description: `Admin adjustment by ${session.user.email}: ${reason.trim()}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      ledgerEntry: {
        id: ledgerEntry.id,
        amount: ledgerEntry.amount,
        type: ledgerEntry.type,
        description: ledgerEntry.description,
      },
    });
  } catch (error) {
    console.error("Admin users PUT error:", error);
    return NextResponse.json(
      { error: "Failed to adjust user points" },
      { status: 500 }
    );
  }
}
