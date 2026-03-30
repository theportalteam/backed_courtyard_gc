"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, ShoppingBag, User } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function StorefrontPurchaseSuccessPage() {
  const searchParams = useSearchParams();
  const { update: updateSession } = useSession();
  const sessionId = searchParams.get("session_id");

  // Refresh session balances on mount
  useEffect(() => {
    updateSession();
  }, [updateSession]);

  return (
    <div className="relative mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="text-center">
        {/* Success icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-success/15 border-2 border-success/30 flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Purchase Complete!
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          Your gift card has been added to your collection. You can view it in
          your profile.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profile">
            <Button
              variant="primary"
              size="md"
              icon={<User className="w-4 h-4" />}
            >
              View Collection
            </Button>
          </Link>
          <Link href="/storefront">
            <Button
              variant="secondary"
              size="md"
              icon={<ShoppingBag className="w-4 h-4" />}
            >
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
