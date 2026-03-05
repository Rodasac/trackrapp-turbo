"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent } from "@repo/ui/card";

interface ProFeatureGateProps {
  feature: string;
  description: string;
}

export function ProFeatureGate({ feature, description }: ProFeatureGateProps) {
  const t = useTranslations("proGate");
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 rounded-full bg-muted p-3">
          <Lock className="size-6 text-muted-foreground" />
        </div>
        <Badge className="mb-3">{t("proBadge")}</Badge>
        <h3 className="mb-2 text-lg font-semibold">{feature}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
        <Button asChild>
          <Link href="/pricing">{t("viewPlans")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
