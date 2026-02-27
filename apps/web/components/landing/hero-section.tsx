import Link from "next/link";
import { Button } from "@repo/ui/button";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-brand via-blue-600 to-indigo-700 dark:from-brand/80 dark:via-blue-800 dark:to-indigo-950">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32 lg:py-40">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Track Every Subscription
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
          Never miss a renewal. Get insights on your spending, AI-powered tips,
          and reminders before you&apos;re charged.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-white text-brand hover:bg-white/90 shadow-lg shadow-white/25"
          >
            <Link href="/signup">Start free</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 bg-transparent"
          >
            <Link href="#pricing">See pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
