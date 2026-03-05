"use client";

import { Link } from "@/i18n/navigation";
import { PricingCards } from "@/components/landing/pricing-cards";
import { useTranslations } from "next-intl";

export default function PricingPage() {
  const t = useTranslations("pricing");

  return (
    <div className="flex min-h-svh flex-col items-center px-4 py-16">
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      <PricingCards />

      <p className="text-muted-foreground mt-8 text-center text-sm">
        {t("haveAccountPrompt")}{" "}
        <Link href="/login" className="text-foreground hover:underline">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
