import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { SubscriptionList } from "@/components/subscription-list";

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

      <SubscriptionList />
    </div>
  );
}
