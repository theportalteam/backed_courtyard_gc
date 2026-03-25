import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Storefront", href: "/storefront" },
    { label: "Gacha Packs", href: "/gacha" },
    { label: "Marketplace", href: "/marketplace" },
    { label: "Leaderboard", href: "/leaderboard" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "How It Works", href: "/how-it-works" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund-policy" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
  Trust: [
    { label: "Buyer Guarantee", href: "/guarantee" },
    { label: "Marketplace Guidelines", href: "/guidelines" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-surface/50 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-bg-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-tertiary">
            &copy; {new Date().getFullYear()} GCPACKS. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-text-tertiary text-xs">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
