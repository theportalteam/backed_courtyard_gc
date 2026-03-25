"use client";

import { useState } from "react";
import { InfoPageLayout } from "@/components/layout/InfoPageLayout";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  name: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    name: "General",
    items: [
      {
        q: "What is GCPACKS?",
        a: "GCPACKS is a gift card platform with three ways to shop: a discount Storefront, randomized Gacha Packs with positive expected value, and a peer-to-peer Marketplace with escrow protection.",
      },
      {
        q: "Is GCPACKS legitimate?",
        a: "Yes. All gift cards are sourced from authorized distributors. Every storefront purchase is backed by our validity guarantee, and marketplace transactions are protected by escrow.",
      },
      {
        q: "Do I need an account to browse?",
        a: "You can browse the storefront and marketplace without an account, but you'll need to sign up to make purchases, open Gacha Packs, or sell on the marketplace.",
      },
    ],
  },
  {
    name: "Buying Gift Cards",
    items: [
      {
        q: "How do I buy a gift card from the Storefront?",
        a: "Browse the Storefront, select a card, and check out with Stripe. Your code is delivered instantly to your account after payment.",
      },
      {
        q: "Are storefront cards discounted?",
        a: "Yes — most cards in the Storefront are priced below face value. Discounts vary by brand and availability.",
      },
      {
        q: "What if my code doesn't work?",
        a: "Contact us within 72 hours with your order number and a screenshot of the error. You'll receive a full refund or replacement code.",
      },
    ],
  },
  {
    name: "Gacha Packs",
    items: [
      {
        q: "What are Gacha Packs?",
        a: "Gacha Packs are themed gift card packs with randomized rewards. Each pack shows exact odds for every rarity tier before purchase, and all packs are designed with positive expected value.",
      },
      {
        q: "Can I refund a Gacha Pack?",
        a: "Opened packs are non-refundable due to their randomized nature. However, you can sell back unwanted rewards through our buyback program at up to 95% of face value.",
      },
      {
        q: "What does 'positive expected value' mean?",
        a: "It means the average value of rewards across all pulls exceeds the cost of the pack. Over many pulls, you statistically come out ahead. Individual results will vary.",
      },
      {
        q: "How does buyback work?",
        a: "After revealing your pull, click 'Buyback' to instantly sell the card back to GCPACKS at the displayed rate. The credit is added to your wallet immediately.",
      },
    ],
  },
  {
    name: "Marketplace",
    items: [
      {
        q: "How do I sell a gift card?",
        a: "Go to the Marketplace, click 'List a Card,' enter the card details and your asking price, and submit. When a buyer purchases, payment is held in escrow until they confirm the code works.",
      },
      {
        q: "How does escrow work?",
        a: "When a buyer makes a purchase, their payment is held securely by GCPACKS. The buyer has 24 hours to verify the code. If verified, funds release to the seller. If disputed, our team investigates.",
      },
      {
        q: "What fees does GCPACKS charge?",
        a: "GCPACKS charges a small platform fee on completed marketplace transactions. The exact fee is displayed before you confirm a listing or purchase.",
      },
    ],
  },
  {
    name: "Payments & Wallet",
    items: [
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards through Stripe, including Visa, Mastercard, and American Express.",
      },
      {
        q: "What is the wallet?",
        a: "Your GCPACKS wallet holds credits from buybacks, refunds, and marketplace sales. Wallet balance can be used for any purchase on the platform.",
      },
      {
        q: "Can I withdraw my wallet balance?",
        a: "Withdrawal options are available through supported methods. Check your wallet page for current withdrawal options and minimum thresholds.",
      },
    ],
  },
  {
    name: "Account",
    items: [
      {
        q: "How do I create an account?",
        a: "Click 'Register' in the top right corner. You can sign up with your email or use Google sign-in for faster setup.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact support@giftpull.com with your account email. We'll process your request and delete your data in accordance with our Privacy Policy.",
      },
      {
        q: "I forgot my password. What do I do?",
        a: "Click 'Login,' then 'Forgot password.' Enter your email and we'll send you a reset link.",
      },
    ],
  },
];

function Accordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-bg-border rounded-none overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-bg-elevated/50 transition-colors"
      >
        <span className="text-sm font-medium text-text-primary pr-4">{item.q}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-text-tertiary flex-shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <InfoPageLayout
      title="Frequently Asked Questions"
      subtitle="Find answers to the most common questions about GCPACKS."
    >
      <div className="space-y-10">
        {faqData.map((category) => (
          <section key={category.name}>
            <h2 className="!mt-0">{category.name}</h2>
            <div className="space-y-3">
              {category.items.map((item) => (
                <Accordion key={item.q} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </InfoPageLayout>
  );
}
