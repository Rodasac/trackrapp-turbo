"use client";

import { useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Switch } from "@repo/ui/switch";
import { getCookieConsent, setCookieConsent } from "@/lib/cookie-consent";

// Hydration-safe mounted guard — same pattern as ThemeToggle
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function CookieConsentBanner() {
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  if (!mounted || dismissed || getCookieConsent() !== null) return null;

  function handleAcceptAll() {
    setCookieConsent({ functional: true, analytics: true });
    setDismissed(true);
  }

  function handleSavePreferences() {
    setCookieConsent({ functional, analytics });
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Logo row */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-sm font-bold"
            style={{ background: "#10b981" }}
          >
            T
          </div>
          <span className="font-semibold text-foreground">TrackrApp</span>
        </div>

        <h2 className="font-serif text-xl font-normal text-foreground mb-2">
          We use cookies
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          We use cookies to improve your experience and analyse site usage. Read
          our{" "}
          <Link
            href="/cookies"
            className="underline text-foreground hover:text-brand"
          >
            Cookie Policy
          </Link>
          .
        </p>

        {/* Accept all */}
        <Button
          onClick={handleAcceptAll}
          className="w-full mb-3 bg-brand hover:bg-brand/90 text-white"
        >
          Accept all cookies
        </Button>

        {/* Manage preferences toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowPreferences((v) => !v)}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          Manage preferences
          {showPreferences ? (
            <ChevronUp className="ml-2 size-4" />
          ) : (
            <ChevronDown className="ml-2 size-4" />
          )}
        </Button>

        {/* Preferences panel */}
        {showPreferences && (
          <div className="mt-4 space-y-4">
            {/* Strictly necessary */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Strictly necessary
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Required for the site to function. Cannot be disabled.
                </p>
              </div>
              <Switch
                checked
                disabled
                aria-label="Strictly necessary cookies"
              />
            </div>

            {/* Functional */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Functional
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Remembers your preferences and settings.
                </p>
              </div>
              <Switch
                checked={functional}
                onCheckedChange={setFunctional}
                aria-label="Functional cookies"
              />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Analytics</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Helps us understand how you use the app.
                </p>
              </div>
              <Switch
                checked={analytics}
                onCheckedChange={setAnalytics}
                aria-label="Analytics cookies"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleSavePreferences}
              className="w-full mt-2"
            >
              Save preferences
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
