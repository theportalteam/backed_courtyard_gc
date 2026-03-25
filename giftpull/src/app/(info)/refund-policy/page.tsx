import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

export const metadata = {
  title: "Refund Policy — GiftPull",
};

export default function RefundPolicyPage() {
  return (
    <InfoPageLayout
      title="Refund & Buyer Protection Policy"
      subtitle="Your purchases are protected. Here's how."
      lastUpdated="March 25, 2026"
    >
      <section>
        <h2>Storefront Purchases</h2>
        <p>
          Gift cards purchased from the GiftPull Storefront are backed by our full validity
          guarantee. If a code is invalid, already redeemed, or does not match the listed
          denomination, you are entitled to a <strong>full refund</strong>.
        </p>
        <ul>
          <li>Report invalid codes within 72 hours of purchase</li>
          <li>Provide the order number and a screenshot showing the error</li>
          <li>Refunds are issued to your original payment method within 5–7 business days</li>
          <li>Alternatively, receive an instant wallet credit for the full amount</li>
        </ul>
      </section>

      <section>
        <h2>Gacha Pack Purchases</h2>
        <p>
          Due to the randomized nature of Gacha Packs, <strong>purchases are non-refundable</strong>{" "}
          once a pack has been opened. This is disclosed prior to every purchase.
        </p>
        <p>However, we offer protections:</p>
        <ul>
          <li>
            <strong>Buyback program:</strong> Unwanted rewards can be sold back at up to 95% of face
            value, credited instantly to your wallet
          </li>
          <li>
            <strong>Technical issues:</strong> If a technical error prevents pack delivery or reveal,
            you will receive a full refund or replacement pack
          </li>
          <li>
            <strong>Duplicate protection:</strong> If the system delivers an invalid code from a
            pack, a replacement of equal or greater value is provided
          </li>
        </ul>
      </section>

      <section>
        <h2>Marketplace Purchases</h2>
        <p>
          Peer-to-peer marketplace transactions are protected by our escrow system.
        </p>
        <ul>
          <li>Payment is held in escrow until the buyer confirms the card works</li>
          <li>Buyers have a <strong>24-hour verification window</strong> to test the code</li>
          <li>If the code is invalid, the buyer can open a dispute and receive a full refund</li>
          <li>If no dispute is filed within 24 hours, funds are released to the seller</li>
        </ul>
      </section>

      <section>
        <h2>How to Request a Refund</h2>
        <ol>
          <li>Go to your order history in your account dashboard</li>
          <li>Select the order and click &quot;Report Issue&quot;</li>
          <li>Describe the problem and attach any supporting evidence</li>
          <li>Our team will review and respond within 24 hours</li>
        </ol>
        <p>
          You can also contact us directly at{" "}
          <a href="mailto:support@giftpull.com">support@giftpull.com</a>.
        </p>
      </section>

      <section>
        <h2>Refund Timeline</h2>
        <ul>
          <li><strong>Wallet credit:</strong> Instant</li>
          <li><strong>Original payment method:</strong> 5–7 business days</li>
          <li><strong>Dispute resolution:</strong> Up to 48 hours for review</li>
        </ul>
      </section>

      <section>
        <h2>Exceptions</h2>
        <p>Refunds will not be issued in the following cases:</p>
        <ul>
          <li>Gacha Pack purchases after the pack has been opened (buyback available instead)</li>
          <li>Gift cards that have been partially or fully redeemed by the buyer</li>
          <li>Requests made outside the eligible refund window</li>
          <li>Fraudulent or abusive refund requests</li>
          <li>Accounts terminated for violating our Terms of Service</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
}
