"use client";

import { Link } from "@/i18n/navigation";
import { CreditCard, Menu } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@repo/ui/sheet";
import { useSession } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";

export function Navbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const t = useTranslations("landing.nav");

  const NAV_LINKS = [
    { href: "/#features", label: t("features") },
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/#pricing", label: t("pricing") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="bg-brand flex size-7 items-center justify-center rounded-md">
            <CreditCard className="text-brand-foreground size-4" />
          </div>
          <span className="font-semibold">TrackrApp</span>
        </Link>

        {/* Nav links — hidden on small screens */}
        <nav className="hidden items-center gap-6 text-sm sm:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          {isLoggedIn ? (
            <Button asChild size="sm">
              <Link href="/dashboard">{t("dashboard")}</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden bg-brand hover:bg-brand/90 sm:inline-flex"
              >
                <Link href="/signup">{t("getStarted")}</Link>
              </Button>
            </>
          )}

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label={t("openMenu")}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-6 flex flex-col gap-4 text-base">
                {NAV_LINKS.map(({ href, label }) => (
                  <SheetClose key={href} asChild>
                    <Link
                      href={href}
                      className="text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      {label}
                    </Link>
                  </SheetClose>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t pt-4">
                  {isLoggedIn ? (
                    <SheetClose asChild>
                      <Button asChild size="sm" className="w-full">
                        <Link href="/dashboard">{t("dashboard")}</Link>
                      </Button>
                    </SheetClose>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Link href="/login">{t("signIn")}</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button
                          asChild
                          size="sm"
                          className="bg-brand hover:bg-brand/90 w-full"
                        >
                          <Link href="/signup">{t("getStarted")}</Link>
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
