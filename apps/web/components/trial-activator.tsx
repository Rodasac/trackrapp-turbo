"use client";

import { useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { useUpgradeToPro } from "@/hooks/use-subscription-plan-mutations";

/**
 * Headless component that auto-triggers Stripe checkout when a user signed up
 * via a "Start free trial" link (which sets `pending_trial` in localStorage).
 * Renders nothing — purely a side-effect component.
 */
export function TrialActivator() {
  const { data: session } = useSession();
  const upgrade = useUpgradeToPro();
  const triggered = useRef(false);

  useEffect(() => {
    if (!session || triggered.current) return;
    const pending = localStorage.getItem("pending_trial");
    if (pending !== "pro") return;

    triggered.current = true;
    localStorage.removeItem("pending_trial");

    upgrade
      .mutateAsync({
        annual: false,
        successUrl: `${window.location.origin}/settings?tab=billing&upgraded=true`,
        cancelUrl: `${window.location.origin}/dashboard`,
      })
      .catch(() => {
        // If checkout creation fails, user stays on dashboard as a free user.
        // They can manually upgrade later via the pricing page.
      });
  }, [session, upgrade]);

  return null;
}
