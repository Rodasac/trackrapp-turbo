import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";

export default function TipsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Tips</h1>
            <Badge variant="secondary">Pro</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            AI-powered insights based on your spending
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </div>

      <div className="text-muted-foreground rounded-lg border border-dashed py-24 text-center text-sm">
        <Lightbulb className="mx-auto mb-3 size-8 opacity-40" />
        <p className="font-medium">AI tips are a Pro feature</p>
        <p className="mt-1">
          Upgrade to get personalized spending insights and recommendations.
        </p>
        <Button asChild className="mt-4">
          <Link href="/pricing">View plans</Link>
        </Button>
      </div>
    </div>
  );
}
