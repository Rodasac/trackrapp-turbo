import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Separator } from "@repo/ui/separator";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

const COMPANY_LINKS = [
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Get started" },
];

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/cookies", label: "Cookie Policy" },
];

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

export function Footer() {
  const year = new Date().getFullYear();

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
              Subscription tracking made simple. Know what you pay, cancel what you don&apos;t need.
            </p>
          </div>

          <FooterLinkGroup title="Product" links={PRODUCT_LINKS} />
          <FooterLinkGroup title="Company" links={COMPANY_LINKS} />
          <FooterLinkGroup title="Legal" links={LEGAL_LINKS} />
        </div>

        <Separator className="my-8" />

        <p className="text-muted-foreground text-center text-sm">
          &copy; {year} TrackrApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
