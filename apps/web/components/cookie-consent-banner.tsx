"use client";

import { useSyncExternalStore, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Switch } from "@repo/ui/switch";
import { getCookieConsent, setCookieConsent } from "@/lib/cookie-consent";
import { useTranslations } from "next-intl";

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

  const t = useTranslations("cookies");

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
          {t("heading")}
        </h2>
        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
          {t("description")}{" "}
          <Link
            href="/cookies"
            className="underline text-foreground hover:text-brand"
          >
            {t("cookiePolicyLink")}
          </Link>
          .
        </p>

        {/* Accept all */}
        <Button
          onClick={handleAcceptAll}
          className="w-full mb-3 bg-brand hover:bg-brand/90 text-white"
        >
          {t("acceptAll")}
        </Button>

        {/* Manage preferences toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowPreferences((v) => !v)}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          {t("managePreferences")}
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
                  {t("strictlyNecessaryLabel")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("strictlyNecessaryDesc")}
                </p>
              </div>
              <Switch
                checked
                disabled
                aria-label={t("strictlyNecessaryLabel")}
              />
            </div>

            {/* Functional */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("functionalLabel")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("functionalDesc")}
                </p>
              </div>
              <Switch
                checked={functional}
                onCheckedChange={setFunctional}
                aria-label={t("functionalLabel")}
              />
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {t("analyticsLabel")}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("analyticsDesc")}
                </p>
              </div>
              <Switch
                checked={analytics}
                onCheckedChange={setAnalytics}
                aria-label={t("analyticsLabel")}
              />
            </div>

            <Button
              variant="outline"
              onClick={handleSavePreferences}
              className="w-full mt-2"
            >
              {t("savePreferences")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
