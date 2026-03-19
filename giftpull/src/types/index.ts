export type {
  GiftCardBrand,
  GiftCardStatus,
  GiftCardSource,
  PackTier,
  RarityTier,
  TransactionType,
  PaymentMethod,
  TransactionStatus,
  PointsType,
  SellerTier,
  ListingStatus,
  DisputeStatus,
  VerificationStatus,
} from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  pointsBalance: number;
  usdcBalance: number;
}
