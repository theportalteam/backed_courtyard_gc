import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Sparkles, Eye, RefreshCw, Shield } from "lucide-react";

export const metadata = {
  title: "About — GiftPull",
};

function ValueCard({ icon: Icon, title, description }: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-card p-5">
      <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

export default function AboutPage() {
  return (
    <InfoPageLayout
      title="About GiftPull"
      subtitle="The gift card marketplace where every pull has value."
    >
      <section>
        <h2>Our Story</h2>
        <p>
          GiftPull started with a simple observation: the gift card market is broken. Buyers
          overpay, sellers get lowballed, and the randomized &quot;mystery box&quot; trend gives
          customers terrible odds. We set out to build something better.
        </p>
        <p>
          GiftPull is a gift card platform that combines a discount storefront, a fair gacha system
          with positive expected value, and a peer-to-peer marketplace with escrow protection. Every
          feature is designed to put value back in the hands of our users.
        </p>
      </section>

      <section>
        <h2>What Makes Us Different</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ValueCard
            icon={Sparkles}
            title="Positive EV Gacha"
            description="Unlike traditional mystery boxes, our Gacha Packs are designed with positive expected value. On average, you get more than you pay for."
          />
          <ValueCard
            icon={Eye}
            title="Transparent Odds"
            description="Every pack shows exact odds for each rarity tier before you buy. No hidden mechanics, no manipulation — just honest probabilities."
          />
          <ValueCard
            icon={RefreshCw}
            title="Instant Buyback"
            description="Don't want your pull? Sell it back at up to 95% of face value, instantly credited to your wallet. No waiting, no haggling."
          />
          <ValueCard
            icon={Shield}
            title="Escrow Protection"
            description="All marketplace transactions are protected by escrow. Buyers verify codes before sellers get paid. Both sides are covered."
          />
        </div>
      </section>

      <section>
        <h2>Our Mission</h2>
        <p>
          We believe buying gift cards should be exciting, fair, and safe. Our mission is to build
          the most trusted gift card platform on the internet — where every purchase is protected,
          every gacha pull is fair, and every marketplace trade is secure.
        </p>
      </section>

      <section>
        <h2>The Team</h2>
        <p>
          GiftPull is built by a small team of developers, designers, and gaming enthusiasts who
          are passionate about creating fair digital marketplaces. We&apos;re always working on new
          features and improvements.
        </p>
        <p>
          Want to get in touch? Reach out at{" "}
          <a href="mailto:hello@giftpull.com">hello@giftpull.com</a> or visit our{" "}
          <a href="/contact">Contact page</a>.
        </p>
      </section>
    </InfoPageLayout>
  );
}
