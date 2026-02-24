import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import { SubscriptionDetail } from "@/components/subscription-detail";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idNum = parseInt(id);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/subscriptions">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Subscription</h1>
          <p className="text-muted-foreground text-sm">
            View and manage details
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        {isNaN(idNum) ? (
          <p className="text-muted-foreground text-sm">
            Invalid subscription ID.
          </p>
        ) : (
          <SubscriptionDetail id={idNum} />
        )}
      </div>
    </div>
  );
}
