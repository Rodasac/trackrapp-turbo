import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { SubscriptionForm } from "@/components/subscription-form";

export default async function NewSubscriptionPage() {
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
          <h1 className="text-2xl font-semibold">{t("new.heading")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("new.description")}
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{t("new.detailsTitle")}</CardTitle>
          <CardDescription>{t("new.detailsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
