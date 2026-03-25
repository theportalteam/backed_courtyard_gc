import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

export const metadata = {
  title: "Marketplace Guidelines — GCPACKS",
};

export default function GuidelinesPage() {
  return (
    <InfoPageLayout
      title="Marketplace Guidelines"
      subtitle="Rules and expectations for buying and selling on the GCPACKS Marketplace."
      lastUpdated="March 25, 2026"
    >
      <section>
        <h2>Allowed Items</h2>
        <p>The following may be listed on the GCPACKS Marketplace:</p>
        <ul>
          <li>Valid, unredeemed digital gift cards from supported brands</li>
          <li>Gift cards obtained through the GCPACKS Storefront or Gacha Packs</li>
          <li>Gift cards purchased from authorized retailers</li>
        </ul>
      </section>

      <section>
        <h2>Prohibited Items</h2>
        <p>The following are strictly prohibited and will result in listing removal and potential account action:</p>
        <ul>
          <li>Partially or fully redeemed gift cards</li>
          <li>Stolen, fraudulently obtained, or counterfeit codes</li>
          <li>Gift cards obtained through unauthorized means (carding, exploits, etc.)</li>
          <li>Expired gift cards</li>
          <li>Non-gift-card items (game accounts, in-game items, physical goods)</li>
          <li>Gift cards from unsupported or blacklisted brands</li>
        </ul>
      </section>

      <section>
        <h2>Seller Requirements</h2>
        <ul>
          <li>Verified account with a confirmed email address</li>
          <li>Accurate listing information: brand, denomination, and region must match the actual card</li>
          <li>Codes must be valid and unredeemed at the time of listing</li>
          <li>Sellers must respond to buyer disputes within 24 hours</li>
          <li>Sellers must not list the same code on multiple platforms simultaneously</li>
        </ul>
      </section>

      <section>
        <h2>Pricing Rules</h2>
        <ul>
          <li>Prices must be listed in USD</li>
          <li>Listings may be priced above or below face value at the seller&apos;s discretion</li>
          <li>Predatory pricing or price manipulation (e.g., artificial scarcity, coordinated pricing) is prohibited</li>
          <li>GCPACKS reserves the right to remove listings with unreasonable pricing</li>
        </ul>
      </section>

      <section>
        <h2>Transaction Process</h2>
        <ol>
          <li><strong>Listing:</strong> Seller creates a listing with card details and price</li>
          <li><strong>Purchase:</strong> Buyer pays and funds are held in escrow</li>
          <li><strong>Verification:</strong> Buyer has 24 hours to test the code</li>
          <li><strong>Confirmation:</strong> Buyer confirms the code works, and funds release to the seller</li>
          <li><strong>Auto-release:</strong> If no dispute is filed within 24 hours, funds automatically release</li>
        </ol>
      </section>

      <section>
        <h2>Disputes</h2>
        <p>
          If a buyer reports an invalid or mismatched code, GCPACKS will investigate. During a
          dispute:
        </p>
        <ul>
          <li>Funds remain in escrow until resolution</li>
          <li>Both parties may be asked to provide evidence</li>
          <li>GCPACKS&apos;s decision on disputes is final</li>
          <li>Most disputes are resolved within 48 hours</li>
        </ul>
      </section>

      <section>
        <h2>Consequences for Violations</h2>
        <p>
          Violations of these guidelines may result in one or more of the following actions, at
          GCPACKS&apos;s sole discretion:
        </p>
        <ul>
          <li><strong>Warning:</strong> First offense for minor violations</li>
          <li><strong>Listing removal:</strong> Offending listings are taken down immediately</li>
          <li><strong>Temporary suspension:</strong> Account suspended from selling for a set period</li>
          <li><strong>Permanent ban:</strong> Account permanently terminated for severe or repeated violations</li>
          <li><strong>Fund forfeiture:</strong> Escrowed funds from fraudulent listings may be withheld</li>
        </ul>
        <p>
          Repeated violations or any form of fraud will result in immediate and permanent account
          termination.
        </p>
      </section>
    </InfoPageLayout>
  );
}
