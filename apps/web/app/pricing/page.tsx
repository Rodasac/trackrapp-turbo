"use client";

import Link from "next/link";
import { PricingCards } from "@/components/landing/pricing-cards";

export default function PricingPage() {
  return (
    <div className="flex min-h-svh flex-col items-center px-4 py-16">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Simple pricing</h1>
        <p className="text-muted-foreground mt-2">
          Start free. Upgrade when you need AI insights.
        </p>
      </div>

      <PricingCards />

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
