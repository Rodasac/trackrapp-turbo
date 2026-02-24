import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <p className="text-muted-foreground text-sm">
            Manage your recurring expenses
          </p>
        </div>
        <Button asChild>
          <Link href="/subscriptions/new">
            <Plus className="size-4" />
            Add subscription
          </Link>
        </Button>
      </div>

      {/* Placeholder — list implemented in Step 4 */}
      <div className="text-muted-foreground rounded-lg border border-dashed py-24 text-center text-sm">
        <p className="font-medium">No subscriptions yet</p>
        <p className="mt-1">Add your first subscription to get started.</p>
        <Button asChild className="mt-4">
          <Link href="/subscriptions/new">
            <Plus className="size-4" />
            Add subscription
          </Link>
        </Button>
      </div>
    </div>
  );
}
