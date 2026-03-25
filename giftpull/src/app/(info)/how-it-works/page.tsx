import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { ShoppingBag, Sparkles, Users, CreditCard, Gift, ArrowRight, Shield, RefreshCw } from "lucide-react";

export const metadata = {
  title: "How It Works — GiftPull",
};

function Step({ number, icon: Icon, title, description }: {
  number: number;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Icon className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function WorkstreamCard({ icon: Icon, title, subtitle, children }: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-card p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <p className="text-xs text-text-tertiary">{subtitle}</p>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <InfoPageLayout
      title="How GiftPull Works"
      subtitle="Three ways to buy, win, and trade gift cards."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WorkstreamCard
          icon={ShoppingBag}
          title="Storefront"
          subtitle="Buy gift cards at a discount"
        >
          <Step
            number={1}
            icon={ShoppingBag}
            title="Browse Cards"
            description="Explore gift cards from top brands like Xbox, Steam, PlayStation, and more — all priced below retail."
          />
          <Step
            number={2}
            icon={CreditCard}
            title="Pay Securely"
            description="Check out with Stripe. Your payment is encrypted and processed instantly."
          />
          <Step
            number={3}
            icon={Gift}
            title="Get Your Code"
            description="Your gift card code is delivered immediately to your account. Redeem it right away."
          />
        </WorkstreamCard>

        <WorkstreamCard
          icon={Sparkles}
          title="Gacha Packs"
          subtitle="Pull for rare rewards"
        >
          <Step
            number={1}
            icon={Sparkles}
            title="Choose a Pack"
            description="Pick from themed packs with transparent odds and positive expected value. Every pack shows exact probabilities."
          />
          <Step
            number={2}
            icon={Gift}
            title="Pull & Reveal"
            description="Open your pack for a randomized gift card reward. Rarity tiers range from Common to Legendary."
          />
          <Step
            number={3}
            icon={RefreshCw}
            title="Keep or Buyback"
            description="Love your pull? Redeem it. Not what you wanted? Sell it back at up to 95% value — instantly credited to your wallet."
          />
        </WorkstreamCard>

        <WorkstreamCard
          icon={Users}
          title="Marketplace"
          subtitle="Trade with other users"
        >
          <Step
            number={1}
            icon={CreditCard}
            title="List or Browse"
            description="Sellers list gift cards at their chosen price. Buyers browse deals from other users."
          />
          <Step
            number={2}
            icon={Shield}
            title="Escrow Protection"
            description="When a buyer purchases, payment is held in escrow until the card is verified — protecting both parties."
          />
          <Step
            number={3}
            icon={ArrowRight}
            title="Confirm & Complete"
            description="Buyer tests the code and confirms it works. Funds release to the seller. Disputes are resolved within 48 hours."
          />
        </WorkstreamCard>
      </div>
    </InfoPageLayout>
  );
}
