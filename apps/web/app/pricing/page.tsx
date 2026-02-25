"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { useSession } from "@/lib/auth-client";
import { useSubscriptionPlan } from "@/hooks/use-subscription-plan";
import { useUpgradeToPro } from "@/hooks/use-subscription-plan-mutations";

const FREE_FEATURES = [
  "Unlimited subscriptions",
  "Renewal reminders (email)",
  "Basic spending dashboard",
  "Categories & tags",
  "CSV export",
];

const PRO_FEATURES = [
  "Everything in Free",
  "AI-powered spending tips",
  "Push notifications",
  "Advanced analytics",
  "CSV import",
  "Price comparison",
  "Priority support",
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const { data: plan } = useSubscriptionPlan({ enabled: isLoggedIn });
  const upgrade = useUpgradeToPro();

  const isPro =
    plan?.plan === "pro" &&
    (plan.status === "active" || plan.status === "trialing");

  async function handleUpgrade() {
    try {
      await upgrade.mutateAsync({
        annual,
        successUrl: `${window.location.origin}/settings?tab=billing&upgraded=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upgrade failed");
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Simple pricing</h1>
        <p className="text-muted-foreground mt-2">
          Start free. Upgrade when you need AI insights.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant={annual ? "ghost" : "secondary"}
            size="sm"
            onClick={() => setAnnual(false)}
          >
            Monthly
          </Button>
          <Button
            variant={annual ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setAnnual(true)}
          >
            Annual
          </Button>
          {annual && (
            <Badge variant="outline" className="text-brand border-brand ml-1">
              Save 17%
            </Badge>
          )}
        </div>
      </div>

      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        {/* Free */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>
              Everything you need to get started
            </CardDescription>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground text-sm">/ month</span>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="mt-4">
            <ul className="flex flex-col gap-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="text-brand size-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signup">Get started free</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pro */}
        <Card className="border-brand relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-brand text-brand-foreground">
              Most popular
            </Badge>
          </div>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>AI tips + advanced analytics</CardDescription>
            <div className="mt-2 flex items-baseline gap-1">
              {annual ? (
                <>
                  <span className="text-3xl font-bold">$40</span>
                  <span className="text-muted-foreground text-sm">/ year</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold">$4</span>
                  <span className="text-muted-foreground text-sm">/ month</span>
                </>
              )}
            </div>
            {annual && (
              <p className="text-muted-foreground text-xs">
                $3.33/month effective — save 17%
              </p>
            )}
            <p className="text-muted-foreground text-xs">14-day free trial</p>
          </CardHeader>
          <Separator />
          <CardContent className="mt-4">
            <ul className="flex flex-col gap-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="text-brand size-4 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
              <Button className="w-full" disabled>
                Current plan
              </Button>
            ) : isLoggedIn ? (
              <Button
                className="bg-brand hover:bg-brand/90 w-full"
                onClick={handleUpgrade}
                disabled={upgrade.isPending}
              >
                {upgrade.isPending ? "Redirecting…" : "Start free trial"}
              </Button>
            ) : (
              <Button className="bg-brand hover:bg-brand/90 w-full" asChild>
                <Link href="/signup">Start free trial</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <p className="text-muted-foreground mt-8 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
