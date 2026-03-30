import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/stripe";
import { earnPoints, calculatePointsEarned } from "@/lib/points";
import { logActivity } from "@/lib/activity";
import { capturePortfolioSnapshot } from "@/lib/portfolio";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = verifyWebhookSignature(body, sig);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const { userId, type } = metadata;

      if (!userId) {
        console.error("Webhook: missing userId in metadata");
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // ── Storefront card purchase ──────────────────────────
      if (type === "storefront_card" && metadata.cardId) {
        await fulfillCardPurchase({
          cardId: metadata.cardId,
          userId,
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
        });
      }

      // ── Bundle purchase ───────────────────────────────────
      else if (type === "bundle" && metadata.bundleId) {
        const cardIds = JSON.parse(metadata.cardIds || "[]") as string[];

        await fulfillBundlePurchase({
          bundleId: metadata.bundleId,
          cardIds,
          userId,
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
        });
      }

      // ── P2P marketplace purchase ────────────────────────────
      else if (type === "p2p_purchase" && metadata.listingId) {
        await fulfillP2PPurchase({
          listingId: metadata.listingId,
          buyerId: userId,
          sellerId: metadata.sellerId || "",
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
        });
      }

      // ── Gacha pack purchase (Phase 3) ─────────────────────
      else if (type === "gacha_pull" && metadata.packTier) {
        // Will be implemented in Phase 3
        console.log(
          `Gacha pack purchase webhook received: packTier=${metadata.packTier}, userId=${userId}`
        );
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ─── Fulfillment helpers ──────────────────────────────────────

async function fulfillCardPurchase({
  cardId,
  userId,
  stripeSessionId,
  amount,
}: {
  cardId: string;
  userId: string;
  stripeSessionId: string;
  amount: number;
}) {
  // Check if already fulfilled (idempotency)
  const existing = await prisma.transaction.findFirst({
    where: {
      stripePaymentIntentId: stripeSessionId,
      status: "COMPLETED",
    },
  });

  if (existing) {
    console.log(`Card purchase already fulfilled: ${stripeSessionId}`);
    return;
  }

  const card = await prisma.giftCard.findUnique({
    where: { id: cardId },
  });

  if (!card || card.status !== "AVAILABLE") {
    console.error(`Card ${cardId} not available for fulfillment`);
    return;
  }

  const transaction = await prisma.$transaction(async (tx) => {
    // Mark card as SOLD and assign owner
    await tx.giftCard.update({
      where: { id: cardId },
      data: {
        status: "SOLD",
        currentOwnerId: userId,
      },
    });

    // Create transaction record
    const txn = await tx.transaction.create({
      data: {
        type: "STOREFRONT_PURCHASE",
        userId,
        giftCardId: cardId,
        amount,
        paymentMethod: "STRIPE",
        stripePaymentIntentId: stripeSessionId,
        status: "COMPLETED",
      },
    });

    return txn;
  });

  // Earn points: base rate for Stripe storefront purchase
  const pointsEarned = calculatePointsEarned(amount, "STRIPE", false);

  if (pointsEarned > 0) {
    await earnPoints({
      userId,
      amount: pointsEarned,
      type: "PURCHASE_EARN",
      description: `Storefront purchase: ${card.brand} $${card.denomination}`,
      transactionId: transaction.id,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { pointsEarned },
    });
  }
}

// Commission rates by seller tier (mirrors buy/route.ts)
const COMMISSION_RATES: Record<string, number> = {
  NEW: 0.10,
  VERIFIED: 0.07,
  POWER: 0.05,
};

async function fulfillP2PPurchase({
  listingId,
  buyerId,
  sellerId,
  stripeSessionId,
  amount,
}: {
  listingId: string;
  buyerId: string;
  sellerId: string;
  stripeSessionId: string;
  amount: number;
}) {
  // Idempotency check
  const existing = await prisma.transaction.findFirst({
    where: {
      stripePaymentIntentId: stripeSessionId,
      status: "COMPLETED",
    },
  });

  if (existing) {
    console.log(`P2P purchase already fulfilled: ${stripeSessionId}`);
    return;
  }

  const listing = await prisma.p2PListing.findUnique({
    where: { id: listingId },
    include: {
      seller: { select: { id: true, name: true, sellerTier: true } },
      giftCard: true,
    },
  });

  if (!listing || listing.status !== "ACTIVE") {
    console.error(`Listing ${listingId} not available for fulfillment (status: ${listing?.status})`);
    return;
  }

  const actualSellerId = listing.sellerId || sellerId;
  const commissionRate = COMMISSION_RATES[listing.seller.sellerTier] ?? 0.10;
  const commission = Math.round(listing.askingPrice * commissionRate * 100) / 100;
  const sellerPayout = Math.round((listing.askingPrice - commission) * 100) / 100;

  const transaction = await prisma.$transaction(async (tx) => {
    // Mark listing as SOLD
    await tx.p2PListing.update({
      where: { id: listingId },
      data: {
        status: "SOLD",
        buyerId,
      },
    });

    // Update card: RESERVED with buyer as owner (buyer must confirm to finalize)
    await tx.giftCard.update({
      where: { id: listing.giftCardId },
      data: {
        status: "RESERVED",
        currentOwnerId: buyerId,
      },
    });

    // Credit seller's USDC balance (minus commission)
    await tx.user.update({
      where: { id: actualSellerId },
      data: {
        usdcBalance: { increment: sellerPayout },
        totalSales: { increment: 1 },
      },
    });

    // Create buyer transaction
    const buyerTxn = await tx.transaction.create({
      data: {
        type: "P2P_PURCHASE",
        userId: buyerId,
        giftCardId: listing.giftCardId,
        amount: listing.askingPrice,
        paymentMethod: "STRIPE",
        stripePaymentIntentId: stripeSessionId,
        status: "COMPLETED",
      },
    });

    // Create seller transaction
    await tx.transaction.create({
      data: {
        type: "P2P_SALE",
        userId: actualSellerId,
        giftCardId: listing.giftCardId,
        amount: sellerPayout,
        paymentMethod: "STRIPE",
        status: "COMPLETED",
        metadata: {
          commission,
          commissionRate,
          listingId: listing.id,
        },
      },
    });

    return buyerTxn;
  });

  // Earn points for buyer
  const pointsEarned = calculatePointsEarned(amount, "STRIPE", false);

  if (pointsEarned > 0) {
    await earnPoints({
      userId: buyerId,
      amount: pointsEarned,
      type: "PURCHASE_EARN",
      description: `P2P purchase: ${listing.giftCard.brand} $${listing.giftCard.denomination}`,
      transactionId: transaction.id,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { pointsEarned },
    });
  }

  // Log activity
  await logActivity(buyerId, "MARKETPLACE_PURCHASE", `Bought $${listing.giftCard.denomination} ${listing.giftCard.brand} Gift Card for $${listing.askingPrice.toFixed(2)}`, { amount: listing.askingPrice, currency: "USD", metadata: { listingId, sellerId: actualSellerId } });
  await logActivity(actualSellerId, "MARKETPLACE_SALE", `Sold $${listing.giftCard.denomination} ${listing.giftCard.brand} Gift Card for $${listing.askingPrice.toFixed(2)}`, { amount: listing.askingPrice, currency: "USD", metadata: { listingId, buyerId, commission } });
  await capturePortfolioSnapshot(buyerId);
  await capturePortfolioSnapshot(actualSellerId);
}

async function fulfillBundlePurchase({
  bundleId,
  cardIds,
  userId,
  stripeSessionId,
  amount,
}: {
  bundleId: string;
  cardIds: string[];
  userId: string;
  stripeSessionId: string;
  amount: number;
}) {
  // Check if already fulfilled (idempotency)
  const existing = await prisma.transaction.findFirst({
    where: {
      stripePaymentIntentId: stripeSessionId,
      status: "COMPLETED",
    },
  });

  if (existing) {
    console.log(`Bundle purchase already fulfilled: ${stripeSessionId}`);
    return;
  }

  const bundle = await prisma.bundle.findUnique({
    where: { id: bundleId },
  });

  if (!bundle) {
    console.error(`Bundle ${bundleId} not found for fulfillment`);
    return;
  }

  // Verify all cards are still available
  const availableCards = await prisma.giftCard.findMany({
    where: {
      id: { in: cardIds },
      status: "AVAILABLE",
    },
  });

  if (availableCards.length !== cardIds.length) {
    console.error(
      `Bundle fulfillment: only ${availableCards.length}/${cardIds.length} cards still available`
    );
    // Proceed with available cards rather than failing entirely
  }

  const availableCardIds = availableCards.map((c) => c.id);

  const transaction = await prisma.$transaction(async (tx) => {
    // Mark all available cards as SOLD and assign owner
    await Promise.all(
      availableCardIds.map((id) =>
        tx.giftCard.update({
          where: { id },
          data: {
            status: "SOLD",
            currentOwnerId: userId,
          },
        })
      )
    );

    // Create transaction record
    const txn = await tx.transaction.create({
      data: {
        type: "BUNDLE_PURCHASE",
        userId,
        amount,
        paymentMethod: "STRIPE",
        stripePaymentIntentId: stripeSessionId,
        status: "COMPLETED",
        metadata: {
          bundleId,
          bundleName: bundle.name,
          cardIds: availableCardIds,
        },
      },
    });

    return txn;
  });

  // Earn points: 1.5x bundle multiplier for Stripe
  const pointsEarned = calculatePointsEarned(amount, "STRIPE", true);

  if (pointsEarned > 0) {
    await earnPoints({
      userId,
      amount: pointsEarned,
      type: "PURCHASE_EARN",
      description: `Bundle purchase: ${bundle.name}`,
      transactionId: transaction.id,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { pointsEarned },
    });
  }
}
