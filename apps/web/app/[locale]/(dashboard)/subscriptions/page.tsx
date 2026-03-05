import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { SubscriptionList } from "@/components/subscription-list";

export default async function SubscriptionsPage() {
  const t = await getTranslations("subscriptions");
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("heading")}</h1>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
        <Button asChild>
          <Link href="/subscriptions/new">
            <Plus className="size-4" />
            {t("addButton")}
          </Link>
        </Button>
      </div>

      <SubscriptionList />
    </div>
  );
}
