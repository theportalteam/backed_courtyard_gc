import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * POST /api/wallet/withdraw
 *
 * Mocked USDC withdrawal. Validates the requested amount against
 * the user's USDC balance, deducts the balance, creates a
 * transaction record, and returns the new balance.
 *
 * Body: { toAddress: string, amount: number }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { toAddress, amount } = body;

    // ── Input validation ───────────────────────────────
    if (!toAddress || typeof toAddress !== "string" || toAddress.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid wallet address is required" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // ── Check balance ──────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { usdcBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (amount > user.usdcBalance) {
      return NextResponse.json(
        { error: "Insufficient USDC balance" },
        { status: 400 }
      );
    }

    // ── Deduct balance & create transaction (atomic) ───
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { usdcBalance: { decrement: amount } },
        select: { usdcBalance: true },
      }),
      prisma.transaction.create({
        data: {
          type: "P2P_SALE", // closest available type for withdrawal
          userId,
          amount,
          currency: "USDC",
          paymentMethod: "USDC_BASE",
          status: "COMPLETED",
          baseTxHash: `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
          metadata: {
            action: "withdrawal",
            toAddress: toAddress.trim(),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.usdcBalance,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        status: transaction.status,
        txHash: transaction.baseTxHash,
      },
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Withdrawal failed" },
      { status: 500 }
    );
  }
}
