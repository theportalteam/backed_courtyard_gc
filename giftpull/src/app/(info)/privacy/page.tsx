import { InfoPageLayout } from "@/components/layout/InfoPageLayout";

export const metadata = {
  title: "Privacy Policy — GCPACKS",
};

export default function PrivacyPage() {
  return (
    <InfoPageLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your information."
      lastUpdated="March 25, 2026"
    >
      <section>
        <h2>1. Information We Collect</h2>
        <h3>Information You Provide</h3>
        <ul>
          <li>Account details: name, email address, password</li>
          <li>Profile information: display name, avatar</li>
          <li>Payment information (processed securely by Stripe)</li>
          <li>Communications: support messages, contact form submissions</li>
        </ul>
        <h3>Information Collected Automatically</h3>
        <ul>
          <li>Device information: browser type, operating system, screen resolution</li>
          <li>Usage data: pages visited, features used, time spent</li>
          <li>IP address and approximate location</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>
      </section>

      <section>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide, maintain, and improve the Platform</li>
          <li>To process transactions and send related notifications</li>
          <li>To verify your identity and prevent fraud</li>
          <li>To communicate with you about updates, promotions, and support</li>
          <li>To analyze usage patterns and optimize the user experience</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>3. Information Sharing</h2>
        <p>We do not sell your personal information. We may share data with:</p>
        <ul>
          <li><strong>Service providers:</strong> Stripe (payments), hosting providers, analytics services</li>
          <li><strong>Other users:</strong> Limited profile information visible in the marketplace (display name, ratings)</li>
          <li><strong>Legal authorities:</strong> When required by law, subpoena, or legal process</li>
          <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        </ul>
      </section>

      <section>
        <h2>4. Cookies</h2>
        <p>
          We use cookies and similar technologies to maintain your session, remember preferences, and
          analyze traffic. For more details, see our{" "}
          <a href="/cookie-policy">Cookie Policy</a>.
        </p>
      </section>

      <section>
        <h2>5. Data Security</h2>
        <p>
          We implement industry-standard security measures including encryption in transit (TLS),
          secure password hashing, and regular security audits. However, no method of transmission
          over the internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>6. Data Retention</h2>
        <p>
          We retain your information for as long as your account is active or as needed to provide
          services. Transaction records are retained for 7 years for legal and compliance purposes.
          You may request deletion of your account and associated data at any time.
        </p>
      </section>

      <section>
        <h2>7. Your Rights</h2>
        <h3>For All Users</h3>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate information</li>
          <li>Delete your account and data</li>
          <li>Opt out of marketing communications</li>
        </ul>
        <h3>CCPA Rights (California Residents)</h3>
        <ul>
          <li>Right to know what personal information is collected</li>
          <li>Right to delete personal information</li>
          <li>Right to opt out of the sale of personal information (we do not sell data)</li>
          <li>Right to non-discrimination for exercising your rights</li>
        </ul>
        <h3>GDPR Rights (EU/EEA Residents)</h3>
        <ul>
          <li>Right of access, rectification, and erasure</li>
          <li>Right to restrict processing</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
          <li>Right to withdraw consent</li>
        </ul>
      </section>

      <section>
        <h2>8. Children&apos;s Privacy</h2>
        <p>
          GCPACKS is not intended for users under the age of 18. We do not knowingly collect
          personal information from children. If we learn that we have collected data from a minor,
          we will promptly delete it.
        </p>
      </section>

      <section>
        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by posting the updated policy on the Platform and updating the &quot;Last
          updated&quot; date. Continued use after changes constitutes acceptance.
        </p>
      </section>

      <section>
        <h2>10. Contact Us</h2>
        <p>
          For privacy-related inquiries, contact us at{" "}
          <a href="mailto:privacy@giftpull.com">privacy@giftpull.com</a>.
        </p>
      </section>
    </InfoPageLayout>
  );
}
