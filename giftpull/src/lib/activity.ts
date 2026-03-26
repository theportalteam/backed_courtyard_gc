import prisma from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

export async function logActivity(
  userId: string,
  type: ActivityType,
  description: string,
  options?: {
    amount?: number;
    currency?: string;
    txHash?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        type,
        description,
        amount: options?.amount,
        currency: options?.currency,
        txHash: options?.txHash,
        metadata: options?.metadata as any,
      },
    });
  } catch (error) {
    // Log but don't throw — activity logging should never break transactions
    console.error("Failed to log activity:", error);
  }
}
