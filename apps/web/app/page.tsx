import Link from "next/link";
import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">TrackrApp</h1>
      <p className="text-muted-foreground max-w-sm text-lg">
        Track your subscriptions, get renewal reminders, and insights on your
        spending.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/login">Get started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </main>
  );
}
