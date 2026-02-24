import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/subscriptions">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Subscription detail</h1>
          <p className="text-muted-foreground text-sm">ID: {id}</p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Full detail view — implemented in Step 4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground rounded border border-dashed py-8 text-center text-sm">
            Subscription detail — coming in Step 4
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
