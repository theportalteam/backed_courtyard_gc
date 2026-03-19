import { PrismaClient, GiftCardBrand, GiftCardStatus, GiftCardSource, PackTier, RarityTier, TransactionType, PaymentMethod, TransactionStatus, PointsType, SellerTier, ListingStatus } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────

function randomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${seg()}-${seg()}-${seg()}-${seg()}`;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

const ALL_BRANDS: GiftCardBrand[] = [
  GiftCardBrand.XBOX,
  GiftCardBrand.STEAM,
  GiftCardBrand.NINTENDO,
  GiftCardBrand.PLAYSTATION,
  GiftCardBrand.GOOGLE_PLAY,
  GiftCardBrand.AMAZON,
  GiftCardBrand.APPLE,
  GiftCardBrand.ROBLOX,
  GiftCardBrand.SPOTIFY,
  GiftCardBrand.NETFLIX,
];

const DENOMINATIONS = [5, 10, 15, 25, 50, 100];

function rarityForDenomination(denom: number): RarityTier {
  switch (denom) {
    case 5: return RarityTier.COMMON;
    case 10: return RarityTier.UNCOMMON;
    case 15: return RarityTier.UNCOMMON;
    case 25: return RarityTier.RARE;
    case 50: return RarityTier.EPIC;
    case 100: return RarityTier.LEGENDARY;
    default: return RarityTier.COMMON;
  }
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('Clearing existing data...');

  // Delete in FK-safe order (children first)
  await prisma.gachaPull.deleteMany();
  await prisma.gachaOdds.deleteMany();
  await prisma.pointsLedger.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.p2PListing.deleteMany();
  await prisma.bundleItem.deleteMany();
  await prisma.bundle.deleteMany();
  await prisma.giftCard.deleteMany();
  await prisma.gachaPack.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.verificationToken.deleteMany();

  console.log('All tables cleared.');

  // ─── Users ──────────────────────────────────────────────

  const passwordHash = hashSync('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@giftpull.test',
      name: 'Admin',
      isAdmin: true,
      pointsBalance: 10000,
      usdcBalance: 500,
      passwordHash,
      lastLoginAt: new Date(),
      loginStreak: 30,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@test.com',
      name: 'Alice',
      pointsBalance: 2500,
      usdcBalance: 50,
      sellerTier: SellerTier.VERIFIED,
      sellerRating: 4.8,
      totalSales: 15,
      passwordHash,
      lastLoginAt: new Date(),
      loginStreak: 7,
    },
  });
  console.log(`Created user: ${alice.email}`);

  const bob = await prisma.user.create({
    data: {
      email: 'bob@test.com',
      name: 'Bob',
      pointsBalance: 100,
      usdcBalance: 0,
      passwordHash,
      lastLoginAt: daysAgo(2),
      loginStreak: 1,
    },
  });
  console.log(`Created user: ${bob.email}`);

  // ─── Gift Cards (100+) ─────────────────────────────────

  console.log('Creating gift cards...');

  interface CardSeedData {
    brand: GiftCardBrand;
    denomination: number;
    code: string;
    status: GiftCardStatus;
    source: GiftCardSource;
    fmv: number;
    rarityTier: RarityTier | null;
    currentOwnerId: string | null;
    listedPrice: number | null;
    discountPercent: number | null;
  }

  const cardRecords: CardSeedData[] = [];

  // We need ~70 AVAILABLE, ~15 RESERVED, ~10 SOLD, ~5 BUYBACK = 100 cards
  // Distribute evenly across brands: 10 brands x 10 cards each = 100, plus a few extra

  // -- 70 AVAILABLE cards (7 per brand) --
  for (const brand of ALL_BRANDS) {
    for (let i = 0; i < 7; i++) {
      const denom = DENOMINATIONS[i % DENOMINATIONS.length];
      const discount = i % 3 === 0 ? randomFloat(5, 15, 0) : null; // ~1/3 have discount
      cardRecords.push({
        brand,
        denomination: denom,
        code: randomCode(),
        status: GiftCardStatus.AVAILABLE,
        source: GiftCardSource.BULK_IMPORT,
        fmv: denom,
        rarityTier: rarityForDenomination(denom),
        currentOwnerId: null,
        listedPrice: discount ? parseFloat((denom * (1 - discount / 100)).toFixed(2)) : null,
        discountPercent: discount,
      });
    }
  }

  // -- 15 RESERVED cards (mixed between alice and bob) --
  const reservedBrands: GiftCardBrand[] = [
    GiftCardBrand.STEAM, GiftCardBrand.XBOX, GiftCardBrand.PLAYSTATION,
    GiftCardBrand.NINTENDO, GiftCardBrand.AMAZON, GiftCardBrand.APPLE,
    GiftCardBrand.ROBLOX, GiftCardBrand.GOOGLE_PLAY, GiftCardBrand.SPOTIFY,
    GiftCardBrand.NETFLIX, GiftCardBrand.STEAM, GiftCardBrand.XBOX,
    GiftCardBrand.PLAYSTATION, GiftCardBrand.NINTENDO, GiftCardBrand.AMAZON,
  ];
  for (let i = 0; i < 15; i++) {
    const denom = DENOMINATIONS[i % DENOMINATIONS.length];
    cardRecords.push({
      brand: reservedBrands[i],
      denomination: denom,
      code: randomCode(),
      status: GiftCardStatus.RESERVED,
      source: GiftCardSource.BULK_IMPORT,
      fmv: denom,
      rarityTier: rarityForDenomination(denom),
      currentOwnerId: i < 10 ? alice.id : bob.id,
      listedPrice: null,
      discountPercent: null,
    });
  }

  // -- 10 SOLD cards --
  const soldBrands: GiftCardBrand[] = [
    GiftCardBrand.STEAM, GiftCardBrand.XBOX, GiftCardBrand.AMAZON,
    GiftCardBrand.PLAYSTATION, GiftCardBrand.APPLE, GiftCardBrand.ROBLOX,
    GiftCardBrand.NETFLIX, GiftCardBrand.SPOTIFY, GiftCardBrand.GOOGLE_PLAY,
    GiftCardBrand.NINTENDO,
  ];
  for (let i = 0; i < 10; i++) {
    const denom = DENOMINATIONS[i % DENOMINATIONS.length];
    cardRecords.push({
      brand: soldBrands[i],
      denomination: denom,
      code: randomCode(),
      status: GiftCardStatus.SOLD,
      source: GiftCardSource.BULK_IMPORT,
      fmv: denom,
      rarityTier: rarityForDenomination(denom),
      currentOwnerId: i < 7 ? alice.id : bob.id,
      listedPrice: null,
      discountPercent: null,
    });
  }

  // -- 5 BUYBACK cards --
  const buybackBrands: GiftCardBrand[] = [
    GiftCardBrand.STEAM, GiftCardBrand.XBOX, GiftCardBrand.AMAZON,
    GiftCardBrand.PLAYSTATION, GiftCardBrand.ROBLOX,
  ];
  for (let i = 0; i < 5; i++) {
    const denom = DENOMINATIONS[i % DENOMINATIONS.length];
    cardRecords.push({
      brand: buybackBrands[i],
      denomination: denom,
      code: randomCode(),
      status: GiftCardStatus.BUYBACK,
      source: GiftCardSource.BUYBACK_RECYCLE,
      fmv: denom,
      rarityTier: rarityForDenomination(denom),
      currentOwnerId: null,
      listedPrice: null,
      discountPercent: null,
    });
  }

  console.log(`Preparing ${cardRecords.length} gift cards...`);

  const createdCards = await prisma.$transaction(
    cardRecords.map((c) =>
      prisma.giftCard.create({
        data: {
          brand: c.brand,
          denomination: c.denomination,
          code: c.code,
          status: c.status,
          source: c.source,
          fmv: c.fmv,
          rarityTier: c.rarityTier,
          currentOwnerId: c.currentOwnerId,
          listedPrice: c.listedPrice,
          discountPercent: c.discountPercent,
        },
      })
    )
  );

  console.log(`Created ${createdCards.length} gift cards.`);

  // Partition cards by status for referencing later
  const availableCards = createdCards.filter((_, i) => cardRecords[i].status === GiftCardStatus.AVAILABLE);
  const reservedCards = createdCards.filter((_, i) => cardRecords[i].status === GiftCardStatus.RESERVED);
  const soldCards = createdCards.filter((_, i) => cardRecords[i].status === GiftCardStatus.SOLD);

  // ─── Gacha Packs ────────────────────────────────────────

  console.log('Creating gacha packs...');

  const starterPack = await prisma.gachaPack.create({
    data: {
      tier: PackTier.STARTER,
      name: 'Starter Pack',
      description: 'A budget-friendly pack with a chance at uncommon and rare cards.',
      price: 5,
      pointsCost: 400,
      dailyLimit: 10,
      isActive: true,
    },
  });

  const standardPack = await prisma.gachaPack.create({
    data: {
      tier: PackTier.STANDARD,
      name: 'Standard Pack',
      description: 'The most popular pack with balanced odds and a shot at epic rewards.',
      price: 15,
      pointsCost: 1200,
      dailyLimit: 5,
      isActive: true,
    },
  });

  const premiumPack = await prisma.gachaPack.create({
    data: {
      tier: PackTier.PREMIUM,
      name: 'Premium Pack',
      description: 'High-value pack with better odds for rare and epic gift cards.',
      price: 50,
      pointsCost: 4000,
      dailyLimit: 3,
      isActive: true,
    },
  });

  const ultraPack = await prisma.gachaPack.create({
    data: {
      tier: PackTier.ULTRA,
      name: 'Ultra Pack',
      description: 'The ultimate pack with the best odds for legendary gift cards.',
      price: 100,
      pointsCost: 8000,
      dailyLimit: 1,
      isActive: true,
    },
  });

  console.log('Created 4 gacha packs.');

  // ─── Gacha Odds ─────────────────────────────────────────

  console.log('Creating gacha odds...');

  const oddsData = [
    // Starter ($5)
    { packId: starterPack.id, rarityTier: RarityTier.COMMON, cardValue: 3, weight: 0.50 },
    { packId: starterPack.id, rarityTier: RarityTier.UNCOMMON, cardValue: 5, weight: 0.30 },
    { packId: starterPack.id, rarityTier: RarityTier.RARE, cardValue: 10, weight: 0.15 },
    { packId: starterPack.id, rarityTier: RarityTier.EPIC, cardValue: 15, weight: 0.05 },
    // Standard ($15)
    { packId: standardPack.id, rarityTier: RarityTier.COMMON, cardValue: 5, weight: 0.40 },
    { packId: standardPack.id, rarityTier: RarityTier.UNCOMMON, cardValue: 10, weight: 0.30 },
    { packId: standardPack.id, rarityTier: RarityTier.RARE, cardValue: 25, weight: 0.20 },
    { packId: standardPack.id, rarityTier: RarityTier.EPIC, cardValue: 50, weight: 0.08 },
    { packId: standardPack.id, rarityTier: RarityTier.LEGENDARY, cardValue: 100, weight: 0.02 },
    // Premium ($50)
    { packId: premiumPack.id, rarityTier: RarityTier.COMMON, cardValue: 25, weight: 0.35 },
    { packId: premiumPack.id, rarityTier: RarityTier.UNCOMMON, cardValue: 50, weight: 0.30 },
    { packId: premiumPack.id, rarityTier: RarityTier.RARE, cardValue: 75, weight: 0.20 },
    { packId: premiumPack.id, rarityTier: RarityTier.EPIC, cardValue: 100, weight: 0.10 },
    { packId: premiumPack.id, rarityTier: RarityTier.LEGENDARY, cardValue: 200, weight: 0.05 },
    // Ultra ($100)
    { packId: ultraPack.id, rarityTier: RarityTier.COMMON, cardValue: 50, weight: 0.30 },
    { packId: ultraPack.id, rarityTier: RarityTier.UNCOMMON, cardValue: 75, weight: 0.30 },
    { packId: ultraPack.id, rarityTier: RarityTier.RARE, cardValue: 100, weight: 0.20 },
    { packId: ultraPack.id, rarityTier: RarityTier.EPIC, cardValue: 200, weight: 0.12 },
    { packId: ultraPack.id, rarityTier: RarityTier.LEGENDARY, cardValue: 500, weight: 0.08 },
  ];

  await prisma.$transaction(
    oddsData.map((o) => prisma.gachaOdds.create({ data: o }))
  );

  console.log(`Created ${oddsData.length} gacha odds entries.`);

  // ─── Bundles ────────────────────────────────────────────

  console.log('Creating bundles...');

  const gamingStarterBundle = await prisma.bundle.create({
    data: {
      name: 'Gaming Starter Pack',
      description: '$25 Steam + $25 Xbox + $10 Nintendo at a discount.',
      price: 50,
      faceValue: 60,
      discountPercent: 16.67,
      isActive: true,
      items: {
        create: [
          { brand: GiftCardBrand.STEAM, denomination: 25, quantity: 1 },
          { brand: GiftCardBrand.XBOX, denomination: 25, quantity: 1 },
          { brand: GiftCardBrand.NINTENDO, denomination: 10, quantity: 1 },
        ],
      },
    },
  });

  const entertainmentBundle = await prisma.bundle.create({
    data: {
      name: 'Entertainment Bundle',
      description: '$25 Netflix + $25 Spotify + $10 Google Play at 20% off.',
      price: 48,
      faceValue: 60,
      discountPercent: 20,
      isActive: true,
      items: {
        create: [
          { brand: GiftCardBrand.NETFLIX, denomination: 25, quantity: 1 },
          { brand: GiftCardBrand.SPOTIFY, denomination: 25, quantity: 1 },
          { brand: GiftCardBrand.GOOGLE_PLAY, denomination: 10, quantity: 1 },
        ],
      },
    },
  });

  const megaMixBundle = await prisma.bundle.create({
    data: {
      name: 'Mega Mix',
      description: '5x random $10 cards from top brands. Great value!',
      price: 40,
      faceValue: 50,
      discountPercent: 20,
      isActive: true,
      items: {
        create: [
          { brand: GiftCardBrand.STEAM, denomination: 10, quantity: 1 },
          { brand: GiftCardBrand.XBOX, denomination: 10, quantity: 1 },
          { brand: GiftCardBrand.PLAYSTATION, denomination: 10, quantity: 1 },
          { brand: GiftCardBrand.AMAZON, denomination: 10, quantity: 1 },
          { brand: GiftCardBrand.APPLE, denomination: 10, quantity: 1 },
        ],
      },
    },
  });

  console.log('Created 3 bundles.');

  // ─── Transactions for Alice (20+) ──────────────────────

  console.log('Creating transactions...');

  // 8 STOREFRONT_PURCHASE transactions
  const storefrontTxData = [
    { brand: 'STEAM', amount: 25, paymentMethod: PaymentMethod.STRIPE, cardIdx: 0 },
    { brand: 'XBOX', amount: 10, paymentMethod: PaymentMethod.STRIPE, cardIdx: 1 },
    { brand: 'AMAZON', amount: 50, paymentMethod: PaymentMethod.USDC_BASE, cardIdx: 2 },
    { brand: 'PLAYSTATION', amount: 15, paymentMethod: PaymentMethod.STRIPE, cardIdx: 3 },
    { brand: 'APPLE', amount: 5, paymentMethod: PaymentMethod.STRIPE, cardIdx: 4 },
    { brand: 'ROBLOX', amount: 25, paymentMethod: PaymentMethod.USDC_BASE, cardIdx: 5 },
    { brand: 'NETFLIX', amount: 10, paymentMethod: PaymentMethod.STRIPE, cardIdx: 6 },
    { brand: 'SPOTIFY', amount: 50, paymentMethod: PaymentMethod.STRIPE, cardIdx: 7 },
  ];

  const storefrontTxns = await prisma.$transaction(
    storefrontTxData.map((tx, i) =>
      prisma.transaction.create({
        data: {
          type: TransactionType.STOREFRONT_PURCHASE,
          userId: alice.id,
          giftCardId: soldCards[i % soldCards.length].id,
          amount: tx.amount,
          currency: 'USD',
          paymentMethod: tx.paymentMethod,
          stripePaymentIntentId: tx.paymentMethod === PaymentMethod.STRIPE ? `pi_test_${Date.now()}_${i}` : null,
          baseTxHash: tx.paymentMethod === PaymentMethod.USDC_BASE ? `0x${Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}` : null,
          pointsEarned: Math.floor(tx.amount * 10),
          status: TransactionStatus.COMPLETED,
          metadata: { brand: tx.brand },
          createdAt: daysAgo(30 - i * 3),
        },
      })
    )
  );
  console.log(`Created ${storefrontTxns.length} storefront transactions.`);

  // 7 GACHA_PULL transactions
  const gachaPacks = [starterPack, standardPack, premiumPack, ultraPack];
  const gachaTxData = [
    { pack: starterPack, amount: 5 },
    { pack: starterPack, amount: 5 },
    { pack: standardPack, amount: 15 },
    { pack: standardPack, amount: 15 },
    { pack: premiumPack, amount: 50 },
    { pack: premiumPack, amount: 50 },
    { pack: ultraPack, amount: 100 },
  ];

  const gachaTxns = await prisma.$transaction(
    gachaTxData.map((tx, i) =>
      prisma.transaction.create({
        data: {
          type: TransactionType.GACHA_PULL,
          userId: alice.id,
          giftCardId: reservedCards[i % reservedCards.length].id,
          amount: tx.amount,
          currency: 'USD',
          paymentMethod: i % 2 === 0 ? PaymentMethod.STRIPE : PaymentMethod.POINTS,
          pointsEarned: Math.floor(tx.amount * 5),
          status: TransactionStatus.COMPLETED,
          metadata: { packTier: tx.pack.tier, packName: tx.pack.name },
          createdAt: daysAgo(20 - i * 2),
        },
      })
    )
  );
  console.log(`Created ${gachaTxns.length} gacha transactions.`);

  // 3 P2P_PURCHASE transactions
  const p2pTxns = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type: TransactionType.P2P_PURCHASE,
        userId: alice.id,
        giftCardId: soldCards[7 % soldCards.length].id,
        amount: 22,
        currency: 'USD',
        paymentMethod: PaymentMethod.STRIPE,
        stripePaymentIntentId: `pi_p2p_${Date.now()}_0`,
        pointsEarned: 220,
        status: TransactionStatus.COMPLETED,
        metadata: { seller: 'external_user_1' },
        createdAt: daysAgo(14),
      },
    }),
    prisma.transaction.create({
      data: {
        type: TransactionType.P2P_PURCHASE,
        userId: alice.id,
        giftCardId: soldCards[8 % soldCards.length].id,
        amount: 45,
        currency: 'USD',
        paymentMethod: PaymentMethod.USDC_BASE,
        baseTxHash: `0x${Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`,
        pointsEarned: 450,
        status: TransactionStatus.COMPLETED,
        metadata: { seller: 'external_user_2' },
        createdAt: daysAgo(10),
      },
    }),
    prisma.transaction.create({
      data: {
        type: TransactionType.P2P_PURCHASE,
        userId: alice.id,
        giftCardId: soldCards[9 % soldCards.length].id,
        amount: 18,
        currency: 'USD',
        paymentMethod: PaymentMethod.STRIPE,
        stripePaymentIntentId: `pi_p2p_${Date.now()}_2`,
        pointsEarned: 180,
        status: TransactionStatus.COMPLETED,
        metadata: { seller: 'external_user_3' },
        createdAt: daysAgo(5),
      },
    }),
  ]);
  console.log(`Created ${p2pTxns.length} P2P transactions.`);

  // 2 BUYBACK transactions
  const buybackTxns = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type: TransactionType.BUYBACK,
        userId: alice.id,
        giftCardId: soldCards[0].id,
        amount: 4,
        currency: 'USD',
        paymentMethod: PaymentMethod.USDC_BASE,
        baseTxHash: `0x${Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`,
        pointsEarned: 0,
        status: TransactionStatus.COMPLETED,
        metadata: { buybackRate: 0.80 },
        createdAt: daysAgo(8),
      },
    }),
    prisma.transaction.create({
      data: {
        type: TransactionType.BUYBACK,
        userId: alice.id,
        giftCardId: soldCards[1].id,
        amount: 8,
        currency: 'USD',
        paymentMethod: PaymentMethod.USDC_BASE,
        baseTxHash: `0x${Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`,
        pointsEarned: 0,
        status: TransactionStatus.COMPLETED,
        metadata: { buybackRate: 0.80 },
        createdAt: daysAgo(3),
      },
    }),
  ]);
  console.log(`Created ${buybackTxns.length} buyback transactions.`);

  // ─── Gacha Pulls (7) ───────────────────────────────────

  console.log('Creating gacha pull records...');

  const pullData = [
    { pack: starterPack, rarity: RarityTier.COMMON, value: 3, buyback: 2.40, cardIdx: 0, txIdx: 0 },
    { pack: starterPack, rarity: RarityTier.UNCOMMON, value: 5, buyback: 4.00, cardIdx: 1, txIdx: 1 },
    { pack: standardPack, rarity: RarityTier.RARE, value: 25, buyback: 20.00, cardIdx: 2, txIdx: 2 },
    { pack: standardPack, rarity: RarityTier.COMMON, value: 5, buyback: 4.00, cardIdx: 3, txIdx: 3 },
    { pack: premiumPack, rarity: RarityTier.EPIC, value: 100, buyback: 80.00, cardIdx: 4, txIdx: 4 },
    { pack: premiumPack, rarity: RarityTier.UNCOMMON, value: 50, buyback: 40.00, cardIdx: 5, txIdx: 5 },
    { pack: ultraPack, rarity: RarityTier.LEGENDARY, value: 500, buyback: 400.00, cardIdx: 6, txIdx: 6 },
  ];

  const gachaPulls = await prisma.$transaction(
    pullData.map((p) =>
      prisma.gachaPull.create({
        data: {
          userId: alice.id,
          packId: p.pack.id,
          giftCardId: reservedCards[p.cardIdx % reservedCards.length].id,
          rarityTier: p.rarity,
          cardValue: p.value,
          buybackOffer: p.buyback,
          wasBoughtBack: false,
          randomSeed: `seed_${Math.random().toString(36).substring(2, 10)}`,
          createdAt: daysAgo(20 - p.txIdx * 2),
        },
      })
    )
  );
  console.log(`Created ${gachaPulls.length} gacha pull records.`);

  // ─── P2P Listings (5) ──────────────────────────────────

  console.log('Creating P2P listings...');

  const listingData = [
    { brand: GiftCardBrand.STEAM, denom: 25, asking: 22, suggested: 23.50 },
    { brand: GiftCardBrand.XBOX, denom: 50, asking: 44, suggested: 46.00 },
    { brand: GiftCardBrand.AMAZON, denom: 100, asking: 88, suggested: 92.00 },
    { brand: GiftCardBrand.PLAYSTATION, denom: 15, asking: 13, suggested: 14.00 },
    { brand: GiftCardBrand.APPLE, denom: 25, asking: 21, suggested: 23.00 },
  ];

  // Create 5 fresh gift cards for listing (owned by alice, status LISTED)
  const listingCards = await prisma.$transaction(
    listingData.map((l) =>
      prisma.giftCard.create({
        data: {
          brand: l.brand,
          denomination: l.denom,
          code: randomCode(),
          status: GiftCardStatus.LISTED,
          source: GiftCardSource.BULK_IMPORT,
          fmv: l.denom,
          rarityTier: rarityForDenomination(l.denom),
          currentOwnerId: alice.id,
        },
      })
    )
  );

  const p2pListings = await prisma.$transaction(
    listingData.map((l, i) =>
      prisma.p2PListing.create({
        data: {
          sellerId: alice.id,
          giftCardId: listingCards[i].id,
          askingPrice: l.asking,
          suggestedPrice: l.suggested,
          status: ListingStatus.ACTIVE,
          expiresAt: daysFromNow(7),
          createdAt: daysAgo(1),
        },
      })
    )
  );
  console.log(`Created ${p2pListings.length} P2P listings.`);

  // ─── Points Ledger (10+ entries) ───────────────────────

  console.log('Creating points ledger entries...');

  const ledgerEntries = [
    // PURCHASE_EARN entries (from storefront purchases)
    { amount: 250, type: PointsType.PURCHASE_EARN, multiplier: 1.0, description: 'Earned from $25 Steam card purchase', createdAt: daysAgo(27) },
    { amount: 100, type: PointsType.PURCHASE_EARN, multiplier: 1.0, description: 'Earned from $10 Xbox card purchase', createdAt: daysAgo(24) },
    { amount: 500, type: PointsType.PURCHASE_EARN, multiplier: 1.0, description: 'Earned from $50 Amazon card purchase', createdAt: daysAgo(21) },
    { amount: 150, type: PointsType.PURCHASE_EARN, multiplier: 1.0, description: 'Earned from $15 PlayStation card purchase', createdAt: daysAgo(18) },
    // GACHA_EARN entries
    { amount: 25, type: PointsType.GACHA_EARN, multiplier: 1.0, description: 'Bonus from Starter Pack pull (Common)', createdAt: daysAgo(20) },
    { amount: 50, type: PointsType.GACHA_EARN, multiplier: 1.0, description: 'Bonus from Starter Pack pull (Uncommon)', createdAt: daysAgo(18) },
    { amount: 125, type: PointsType.GACHA_EARN, multiplier: 1.0, description: 'Bonus from Standard Pack pull (Rare)', createdAt: daysAgo(16) },
    { amount: 250, type: PointsType.GACHA_EARN, multiplier: 1.5, description: 'Bonus from Premium Pack pull (Epic) + streak bonus', createdAt: daysAgo(12) },
    // DAILY_LOGIN entries
    { amount: 50, type: PointsType.DAILY_LOGIN, multiplier: 1.0, description: 'Daily login bonus', createdAt: daysAgo(7) },
    { amount: 50, type: PointsType.DAILY_LOGIN, multiplier: 1.0, description: 'Daily login bonus', createdAt: daysAgo(6) },
    { amount: 50, type: PointsType.DAILY_LOGIN, multiplier: 1.0, description: 'Daily login bonus', createdAt: daysAgo(5) },
    { amount: 50, type: PointsType.DAILY_LOGIN, multiplier: 1.5, description: 'Daily login bonus (7-day streak)', createdAt: daysAgo(4) },
    { amount: 50, type: PointsType.DAILY_LOGIN, multiplier: 1.0, description: 'Daily login bonus', createdAt: daysAgo(3) },
    { amount: 50, type: PointsType.DAILY_LOGIN, multiplier: 1.0, description: 'Daily login bonus', createdAt: daysAgo(2) },
    { amount: 50, type: PointsType.DAILY_LOGIN, multiplier: 1.0, description: 'Daily login bonus', createdAt: daysAgo(1) },
  ];

  await prisma.$transaction(
    ledgerEntries.map((e) =>
      prisma.pointsLedger.create({
        data: {
          userId: alice.id,
          amount: e.amount,
          type: e.type,
          multiplier: e.multiplier,
          description: e.description,
          createdAt: e.createdAt,
        },
      })
    )
  );
  console.log(`Created ${ledgerEntries.length} points ledger entries.`);

  // ─── Summary ────────────────────────────────────────────

  const totalCards = await prisma.giftCard.count();
  const totalTxns = await prisma.transaction.count();
  const totalPulls = await prisma.gachaPull.count();
  const totalListings = await prisma.p2PListing.count();
  const totalLedger = await prisma.pointsLedger.count();

  console.log('\n=== Seed Complete ===');
  console.log(`Users:        3`);
  console.log(`Gift Cards:   ${totalCards}`);
  console.log(`Gacha Packs:  4`);
  console.log(`Gacha Odds:   ${oddsData.length}`);
  console.log(`Bundles:      3`);
  console.log(`Transactions: ${totalTxns}`);
  console.log(`Gacha Pulls:  ${totalPulls}`);
  console.log(`P2P Listings: ${totalListings}`);
  console.log(`Points Ledger:${totalLedger}`);
}

main()
  .then(() => {
    console.log('Seeding finished successfully.');
  })
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
