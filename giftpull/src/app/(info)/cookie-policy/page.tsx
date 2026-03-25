import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

export const metadata = {
  title: "Cookie Policy — GiftPull",
};

export default function CookiePolicyPage() {
  return (
    <InfoPageLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies."
      lastUpdated="March 25, 2026"
    >
      <section>
        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a website. They help
          the site remember your preferences, keep you logged in, and understand how you interact
          with the Platform.
        </p>
      </section>

      <section>
        <h2>Types of Cookies We Use</h2>

        <h3>Essential Cookies</h3>
        <p>
          Required for the Platform to function. These handle authentication, session management,
          and security. They cannot be disabled without breaking core functionality.
        </p>
        <ul>
          <li>Session cookies (authentication state)</li>
          <li>CSRF protection tokens</li>
          <li>Load balancing identifiers</li>
        </ul>

        <h3>Analytics Cookies</h3>
        <p>
          Help us understand how visitors interact with the Platform. Data is aggregated and
          anonymized.
        </p>
        <ul>
          <li>Page views and navigation paths</li>
          <li>Feature usage patterns</li>
          <li>Error and performance monitoring</li>
        </ul>

        <h3>Preference Cookies</h3>
        <p>
          Remember your settings and choices to provide a more personalized experience.
        </p>
        <ul>
          <li>Display preferences</li>
          <li>Notification settings</li>
          <li>Recently viewed items</li>
        </ul>
      </section>

      <section>
        <h2>Third-Party Cookies</h2>
        <p>
          Some cookies are set by third-party services we use:
        </p>
        <ul>
          <li><strong>Stripe:</strong> Payment processing and fraud prevention</li>
          <li><strong>Google:</strong> OAuth authentication (if you sign in with Google)</li>
        </ul>
        <p>
          These third parties have their own privacy and cookie policies that govern their use of
          your data.
        </p>
      </section>

      <section>
        <h2>Managing Cookies</h2>
        <p>
          You can control cookies through your browser settings. Most browsers allow you to:
        </p>
        <ul>
          <li>View and delete existing cookies</li>
          <li>Block all or specific cookies</li>
          <li>Set preferences for certain websites</li>
          <li>Get notified when a cookie is set</li>
        </ul>
        <p>
          Note that disabling essential cookies may prevent you from using key features of the
          Platform, such as logging in or making purchases.
        </p>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Changes will be posted on this page
          with an updated &quot;Last updated&quot; date. Continued use of the Platform after changes
          constitutes acceptance.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about our use of cookies? Contact us at{" "}
          <a href="mailto:privacy@giftpull.com">privacy@giftpull.com</a>.
        </p>
      </section>
    </InfoPageLayout>
  );
}
