"use client";

import React, { useState, useCallback } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface FavoriteButtonProps {
  giftCardId?: string;
  listingId?: string;
  initialFavorited?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({
  giftCardId,
  listingId,
  initialFavorited = false,
  className,
  size = "sm",
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!session?.user || loading) return;

      // Optimistic update
      setFavorited((prev) => !prev);
      setLoading(true);

      try {
        const body: Record<string, string> = {};
        if (giftCardId) body.giftCardId = giftCardId;
        if (listingId) body.listingId = listingId;

        const res = await fetch("/api/profile/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          // Revert on failure
          setFavorited((prev) => !prev);
        }
      } catch {
        setFavorited((prev) => !prev);
      } finally {
        setLoading(false);
      }
    },
    [session, loading, giftCardId, listingId]
  );

  if (!session?.user) return null;

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "transition-colors",
        favorited
          ? "text-danger hover:text-red-300"
          : "text-text-tertiary hover:text-danger",
        loading && "opacity-50",
        className
      )}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn(iconSize, favorited && "fill-current")} />
    </button>
  );
}
