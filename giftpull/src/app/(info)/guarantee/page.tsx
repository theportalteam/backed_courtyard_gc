import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { Shield, ShoppingBag, Sparkles, Users, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Buyer Protection Guarantee — GCPACKS",
};

function GuaranteeCard({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface border border-bg-border rounded-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-success/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-success" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="text-text-secondary text-sm space-y-3 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

export default function GuaranteePage() {
  return (
    <InfoPageLayout
      title="Buyer Protection Guarantee"
      subtitle="Every purchase on GCPACKS is backed by our comprehensive protection program."
    >
      <section>
        <h2>What&apos;s Covered</h2>
        <p>
          Our Buyer Protection Guarantee ensures that every gift card you receive through GCPACKS
          is valid and matches its listed denomination. If something goes wrong, we make it right.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GuaranteeCard icon={ShoppingBag} title="Storefront Guarantee">
          <p>
            Every code sold through the Storefront is <strong>guaranteed valid</strong>. If a code
            doesn&apos;t work, you get a full refund — no questions asked.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Full refund or instant wallet credit</li>
            <li>72-hour reporting window</li>
            <li>Replacement codes available</li>
          </ul>
        </GuaranteeCard>

        <GuaranteeCard icon={Sparkles} title="Gacha Guarantee">
          <p>
            All Gacha Pack odds are <strong>transparent and verifiable</strong>. Every pack has
            positive expected value, and unwanted rewards can be sold back.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Up to 95% buyback on unwanted pulls</li>
            <li>Invalid codes replaced at equal or higher value</li>
            <li>Odds publicly displayed before purchase</li>
          </ul>
        </GuaranteeCard>

        <GuaranteeCard icon={Users} title="Marketplace Guarantee">
          <p>
            All peer-to-peer transactions are protected by our <strong>escrow system</strong>.
            Payment is only released after the buyer confirms the card.
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>24-hour verification window</li>
            <li>Full refund if code is invalid</li>
            <li>Disputes resolved within 48 hours</li>
          </ul>
        </GuaranteeCard>
      </div>

      <section>
        <h2>Dispute Process</h2>
        <ol>
          <li>
            <strong>Report the issue</strong> — Go to your order history and select &quot;Report
            Issue&quot; on the affected transaction, or email{" "}
            <a href="mailto:support@giftpull.com">support@giftpull.com</a>.
          </li>
          <li>
            <strong>Provide evidence</strong> — Include screenshots, error messages, or any proof
            that the code is invalid or does not match the listing.
          </li>
          <li>
            <strong>Review</strong> — Our team investigates and contacts both parties (for
            marketplace transactions). Most disputes are resolved within 24–48 hours.
          </li>
          <li>
            <strong>Resolution</strong> — If the claim is valid, you receive a full refund to your
            wallet or original payment method.
          </li>
        </ol>
      </section>

      <section>
        <div className="bg-bg-surface border border-bg-border rounded-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-warning/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">What&apos;s Not Covered</h3>
          </div>
          <ul className="text-text-secondary text-sm space-y-2 list-disc pl-5">
            <li>Gift cards that have been partially or fully redeemed by the buyer</li>
            <li>Issues reported outside the eligible reporting window</li>
            <li>Buyer&apos;s remorse or change of mind (non-defective codes)</li>
            <li>Accounts suspended for violating Terms of Service</li>
            <li>Gacha Pack results (packs are non-refundable; buyback is available)</li>
          </ul>
        </div>
      </section>

      <section>
        <h2>How to File a Claim</h2>
        <p>
          Visit your <strong>Account Dashboard → Orders</strong> and click &quot;Report Issue&quot;
          on the relevant transaction, or email us at{" "}
          <a href="mailto:support@giftpull.com">support@giftpull.com</a> with your order number and
          details.
        </p>
      </section>
    </InfoPageLayout>
  );
}
