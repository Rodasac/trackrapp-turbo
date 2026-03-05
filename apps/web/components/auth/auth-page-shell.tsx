"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("auth.shell");
  return (
    <div className="min-h-svh flex flex-col lg:flex-row">
      {/* Mobile header (< lg) */}
      <header className="flex items-center justify-between px-6 py-4 border-b lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <CreditCard className="text-emerald-400 size-5" />
          <span className="font-display text-lg font-medium">TrackrApp</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Left panel (lg+) */}
      <div className="relative hidden lg:flex lg:w-[480px] lg:flex-col bg-slate-950 overflow-hidden">
        {/* Gradient orbs */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 size-[600px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.696 0.17 162.48), transparent 70%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-40 -bottom-40 size-[500px] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.720 0.160 180), transparent 70%)",
          }}
          aria-hidden
        />

        {/* Logo + ThemeToggle */}
        <div className="relative flex items-center justify-between p-8">
          <Link href="/" className="flex items-center gap-2.5">
            <CreditCard className="text-emerald-400 size-6" />
            <span className="font-display text-xl font-medium text-white">
              TrackrApp
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Tagline */}
        <div className="relative flex flex-1 items-center px-8 pb-16">
          <div>
            <h2 className="font-display text-4xl font-normal text-white leading-snug">
              {t("tagline")}
            </h2>
            <p className="mt-3 text-base text-white/50 max-w-xs leading-relaxed">
              {t("taglineDescription")}
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
