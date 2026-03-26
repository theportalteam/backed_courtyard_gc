import prisma from "@/lib/prisma";

export async function capturePortfolioSnapshot(userId: string): Promise<void> {
  try {
    const cards = await prisma.giftCard.findMany({
      where: {
        currentOwnerId: userId,
        status: { in: ["RESERVED", "LISTED"] },
      },
      select: { fmv: true },
    });

    const totalValue = cards.reduce((sum, card) => sum + card.fmv, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.portfolioSnapshot.upsert({
      where: { userId_date: { userId, date: today } },
      update: { totalValue },
      create: { userId, totalValue, date: today },
    });
  } catch (error) {
    console.error("Failed to capture portfolio snapshot:", error);
  }
}
