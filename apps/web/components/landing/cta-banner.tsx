"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@repo/ui/button";
import { FadeIn } from "@/components/landing/motion/fade-in";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      {/* Gradient orb */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <div
          className="size-[600px] rounded-full opacity-20 blur-3xl animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, oklch(0.696 0.17 162.48), transparent 60%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <FadeIn>
          <h2 className="font-display text-4xl font-normal tracking-tight text-white sm:text-5xl">
            Ready to take control of{" "}
            <span className="text-emerald-400">your subscriptions?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/60">
            Join thousands of users who&apos;ve stopped paying for services they don&apos;t use.
            Start free, no credit card required.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-lg shadow-emerald-500/25"
            >
              <Link href="/signup">
                Start free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 text-white/80 hover:bg-white/5 hover:text-white bg-transparent"
            >
              <Link href="#pricing">View pricing</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
