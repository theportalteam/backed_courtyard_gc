import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

export const metadata = {
  title: "Terms of Service — GiftPull",
};

export default function TermsPage() {
  return (
    <InfoPageLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using GiftPull."
      lastUpdated="March 25, 2026"
    >
      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using GiftPull (&quot;the Platform&quot;), you agree to be bound by these
          Terms of Service. If you do not agree to all of these terms, do not use the Platform.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old (or the age of majority in your jurisdiction) to use
          GiftPull. By creating an account, you represent and warrant that you meet this requirement.
        </p>
      </section>

      <section>
        <h2>3. Account Responsibilities</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for
          all activity that occurs under your account. You agree to notify us immediately of any
          unauthorized use.
        </p>
        <ul>
          <li>One account per person</li>
          <li>Accurate and up-to-date information required</li>
          <li>You may not transfer or sell your account</li>
        </ul>
      </section>

      <section>
        <h2>4. Storefront Purchases</h2>
        <p>
          Gift cards purchased from the GiftPull Storefront are digital codes delivered
          electronically. All codes are sourced from authorized distributors and are guaranteed to be
          valid at the time of delivery.
        </p>
        <p>
          Prices are listed in USD. We reserve the right to change pricing at any time without prior
          notice. Any promotional pricing or discounts are subject to availability and may be
          withdrawn at our discretion.
        </p>
      </section>

      <section>
        <h2>5. Gacha Packs</h2>
        <p>
          Gacha Packs contain randomized gift card rewards. Odds for each rarity tier are displayed
          before purchase. By purchasing a Gacha Pack, you acknowledge the randomized nature of the
          contents and agree that the specific reward is not guaranteed.
        </p>
        <ul>
          <li>Odds are publicly displayed and independently verifiable</li>
          <li>Expected value (EV) is shown for transparency</li>
          <li>Buyback is available at stated rates for unwanted rewards</li>
          <li>Gacha Pack purchases are non-refundable</li>
        </ul>
      </section>

      <section>
        <h2>6. Peer-to-Peer Marketplace</h2>
        <p>
          The Marketplace allows users to list and sell gift cards to other users. GiftPull acts as
          an intermediary and escrow provider but is not a party to the transaction between buyer and
          seller.
        </p>
        <ul>
          <li>Sellers must list only valid, unredeemed gift cards</li>
          <li>Funds are held in escrow until the buyer confirms the card</li>
          <li>GiftPull charges a platform fee on completed transactions</li>
          <li>Fraudulent listings will result in account termination</li>
        </ul>
      </section>

      <section>
        <h2>7. Payments</h2>
        <p>
          All payments are processed through Stripe. By making a purchase, you agree to
          Stripe&apos;s terms of service. GiftPull does not store your full payment card information.
        </p>
        <p>
          Wallet balances and USDC balances are non-transferable outside the Platform except through
          authorized withdrawal methods.
        </p>
      </section>

      <section>
        <h2>8. Prohibited Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Platform for any illegal or unauthorized purpose</li>
          <li>Attempt to manipulate pricing, odds, or marketplace listings</li>
          <li>Use bots, scripts, or automated tools to interact with the Platform</li>
          <li>Engage in fraud, money laundering, or any form of financial crime</li>
          <li>Harass, threaten, or abuse other users</li>
          <li>Circumvent any security measures or access controls</li>
        </ul>
      </section>

      <section>
        <h2>9. Intellectual Property</h2>
        <p>
          All content on GiftPull, including logos, designs, text, and software, is the property of
          GiftPull or its licensors. You may not reproduce, distribute, or create derivative works
          without our prior written consent.
        </p>
      </section>

      <section>
        <h2>10. Disclaimers</h2>
        <p>
          GiftPull is provided &quot;as is&quot; and &quot;as available.&quot; We make no warranties,
          express or implied, regarding the Platform&apos;s availability, accuracy, or fitness for a
          particular purpose.
        </p>
      </section>

      <section>
        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, GiftPull shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of the
          Platform, including but not limited to loss of profits, data, or goodwill.
        </p>
      </section>

      <section>
        <h2>12. Termination</h2>
        <p>
          We may suspend or terminate your account at any time, with or without cause, and with or
          without notice. Upon termination, your right to use the Platform ceases immediately. Any
          remaining wallet balance will be handled in accordance with our refund policy.
        </p>
      </section>

      <section>
        <h2>13. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of
          Delaware, United States, without regard to conflict of law principles.
        </p>
      </section>

      <section>
        <h2>14. Contact</h2>
        <p>
          If you have questions about these Terms, please contact us at{" "}
          <a href="mailto:legal@giftpull.com">legal@giftpull.com</a>.
        </p>
      </section>
    </InfoPageLayout>
  );
}
