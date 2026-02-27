import Link from "next/link";
import { CreditCard } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-brand flex size-7 items-center justify-center rounded-md">
            <CreditCard className="text-brand-foreground size-4" />
          </div>
          <span className="font-semibold">TrackrApp</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-muted-foreground text-sm">
          &copy; {year} TrackrApp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
