"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  ShieldCheck,
  DollarSign,
  CreditCard,
  ArrowRight,
  Crown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { SellForm } from "@/components/marketplace/SellForm";

const PROCESS_STEPS = [
  {
    icon: Tag,
    title: "List Your Card",
    description: "Enter your gift card details and set your asking price.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: ShieldCheck,
    title: "Verification",
    description: "We verify your card is valid and has the stated balance.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: CreditCard,
    title: "Buyer Purchases",
    description: "A buyer pays for your card through our secure platform.",
    color: "text-epic",
    bgColor: "bg-epic/10",
  },
  {
    icon: DollarSign,
    title: "Get Paid",
    description: "Funds are credited to your account minus commission.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

const COMMISSION_TIERS = [
  {
    tier: "NEW",
    rate: "10%",
    requirement: "0 sales",
    icon: Shield,
    color: "text-text-secondary",
    bgColor: "bg-surface-light",
    borderColor: "border-border-subtle",
  },
  {
    tier: "VERIFIED",
    rate: "7%",
    requirement: "10+ sales",
    icon: ShieldCheck,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  {
    tier: "POWER",
    rate: "5%",
    requirement: "50+ sales",
    icon: Crown,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/30",
  },
];

export default function SellPage() {
  return (
    <div className="relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-success/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-success" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary">
              Sell a Gift Card
            </h1>
          </div>
          <p className="text-text-secondary ml-[52px]">
            List your unused gift cards and earn cash
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left column: Sell Form */}
          <div className="lg:col-span-3">
            <SellForm />
          </div>

          {/* Right column: Info panels */}
          <div className="lg:col-span-2 space-y-6">
            {/* How it works */}
            <Card padding="md">
              <h3 className="text-base font-bold text-text-primary mb-4">
                How It Works
              </h3>
              <div className="space-y-4">
                {PROCESS_STEPS.map((step, i) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="relative">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                            step.bgColor
                          )}
                        >
                          <StepIcon className={cn("w-4 h-4", step.color)} />
                        </div>
                        {/* Connecting line */}
                        {i < PROCESS_STEPS.length - 1 && (
                          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-px h-4 bg-border-subtle" />
                        )}
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-semibold text-text-primary">
                          {step.title}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Commission rate table */}
            <Card padding="md">
              <h3 className="text-base font-bold text-text-primary mb-4">
                Commission Rates
              </h3>
              <div className="space-y-3">
                {COMMISSION_TIERS.map((tier) => {
                  const TierIcon = tier.icon;
                  return (
                    <div
                      key={tier.tier}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border",
                        tier.bgColor,
                        tier.borderColor
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <TierIcon className={cn("w-4 h-4", tier.color)} />
                        <div>
                          <p className={cn("text-sm font-semibold", tier.color)}>
                            {tier.tier}
                          </p>
                          <p className="text-[10px] text-text-secondary">
                            {tier.requirement}
                          </p>
                        </div>
                      </div>
                      <span className={cn("text-lg font-bold", tier.color)}>
                        {tier.rate}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-text-secondary mt-3">
                Lower your commission by completing more sales and building your
                reputation on the platform.
              </p>
            </Card>

            {/* Safety notice */}
            <Card padding="md" className="border-primary/20">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    Buyer Protection
                  </p>
                  <p className="text-xs text-text-secondary">
                    All cards are verified before listing. Buyers can file
                    disputes if a card is invalid, and our team resolves issues
                    within 24-48 hours.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="mt-16">
          <div className="h-px bg-gradient-to-r from-transparent via-success/30 to-transparent" />
        </div>
      </div>
    </div>
  );
}
