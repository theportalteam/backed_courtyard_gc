"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard wraps admin pages and checks the session for isAdmin.
 * Shows a loading state while the session resolves, an access-denied
 * screen for non-admins, and renders children for admins.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ── Loading ────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated ──────────────────────────────
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 116.636 4.636 9 9 0 0119.364 8.636z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Authentication Required
          </h2>
          <p className="text-text-secondary mb-6">
            You must be signed in to access this page.
          </p>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </Card>
      </div>
    );
  }

  // ── Not admin ──────────────────────────────────────
  if (!session.user.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/15 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 0A9 9 0 005.636 18.364"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Access Denied
          </h2>
          <p className="text-text-secondary mb-6">
            You do not have administrator privileges to view this page.
          </p>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  // ── Admin verified ─────────────────────────────────
  return <>{children}</>;
}
