import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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
  const t = await getTranslations("subscriptions");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/subscriptions">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("detail.heading")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("detail.description")}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        {isNaN(idNum) ? (
          <p className="text-muted-foreground text-sm">
            {t("detail.invalidId")}
          </p>
        ) : (
          <SubscriptionDetail id={idNum} />
        )}
      </div>
    </div>
  );
}
