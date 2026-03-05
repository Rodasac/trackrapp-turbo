import { Link } from "@/i18n/navigation";
import { CreditCard } from "lucide-react";
import { Separator } from "@repo/ui/separator";
import { getTranslations } from "next-intl/server";

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <ul className="flex flex-col gap-2">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const t = await getTranslations("landing.footer");
  const tNav = await getTranslations("landing.nav");

  const year = new Date().getFullYear();

  const PRODUCT_LINKS = [
    { href: "/#features", label: tNav("features") },
    { href: "/#how-it-works", label: tNav("howItWorks") },
    { href: "/#pricing", label: tNav("pricing") },
  ];

  const COMPANY_LINKS = [
    { href: "/login", label: tNav("signIn") },
    { href: "/signup", label: tNav("getStarted") },
  ];

  const LEGAL_LINKS = [
    { href: "/terms", label: t("terms") },
    { href: "/privacy", label: t("privacy") },
    { href: "/cookies", label: t("cookies") },
  ];

  return (
    <footer className="bg-card border-t">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + tagline */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-brand flex size-7 items-center justify-center rounded-md">
                <CreditCard className="text-brand-foreground size-4" />
              </div>
              <span className="font-semibold">TrackrApp</span>
            </Link>
            <p className="text-muted-foreground mt-3 text-sm">
              {t("tagline")}
            </p>
          </div>

          <FooterLinkGroup title={t("product")} links={PRODUCT_LINKS} />
          <FooterLinkGroup title={t("company")} links={COMPANY_LINKS} />
          <FooterLinkGroup title={t("legal")} links={LEGAL_LINKS} />
        </div>

        <Separator className="my-8" />

        <p className="text-muted-foreground text-center text-sm">
          &copy; {year} TrackrApp. {t("allRightsReserved")}
        </p>
      </div>
    </footer>
  );
}
