import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

const BASE_DAILY_POINTS = 5;
const STREAK_BONUS_INTERVAL = 5; // Bonus every 5 days
const STREAK_BONUS_MULTIPLIER = 3; // 3x bonus on streak milestones

export async function POST() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true, loginStreak: true, pointsBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already claimed today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastLoginAt) {
      const lastLogin = new Date(user.lastLoginAt);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      if (lastLoginDay.getTime() === today.getTime()) {
        return NextResponse.json({
          alreadyClaimed: true,
          streakCount: user.loginStreak,
          pointsAwarded: 0,
        });
      }
    }

    // Calculate streak
    let newStreak = 1;
    if (user.lastLoginAt) {
      const lastLogin = new Date(user.lastLoginAt);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastLoginDay = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      if (lastLoginDay.getTime() === yesterday.getTime()) {
        newStreak = user.loginStreak + 1;
      }
    }

    // Calculate points
    let pointsAwarded = BASE_DAILY_POINTS;
    const isStreakMilestone = newStreak % STREAK_BONUS_INTERVAL === 0;
    if (isStreakMilestone) {
      pointsAwarded = BASE_DAILY_POINTS * STREAK_BONUS_MULTIPLIER;
    }

    // Update user and create ledger entry
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          lastLoginAt: now,
          loginStreak: newStreak,
          pointsBalance: { increment: pointsAwarded },
        },
      }),
      prisma.pointsLedger.create({
        data: {
          userId,
          amount: pointsAwarded,
          type: isStreakMilestone ? "STREAK_BONUS" : "DAILY_LOGIN",
          multiplier: isStreakMilestone ? STREAK_BONUS_MULTIPLIER : 1.0,
          description: isStreakMilestone
            ? `${newStreak}-day streak bonus!`
            : `Daily login bonus (${newStreak}-day streak)`,
        },
      }),
    ]);

    await logActivity(userId, "POINTS_EARNED", isStreakMilestone ? `${newStreak}-day streak bonus! +${pointsAwarded} points` : `Daily login bonus +${pointsAwarded} points`, { amount: pointsAwarded, currency: "POINTS", metadata: { source: isStreakMilestone ? "STREAK_BONUS" : "DAILY_LOGIN", streak: newStreak } });

    return NextResponse.json({
      alreadyClaimed: false,
      streakCount: newStreak,
      pointsAwarded,
    });
  } catch (error) {
    console.error("Daily login error:", error);
    return NextResponse.json({ error: "Failed to process daily login" }, { status: 500 });
  }
}
