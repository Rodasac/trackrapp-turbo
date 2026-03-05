"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Pencil,
  X,
  ExternalLink,
  RefreshCw,
  Undo2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { Switch } from "@repo/ui/switch";
import { Label } from "@repo/ui/label";
import { SubscriptionForm } from "@/components/subscription-form";
import { DeleteSubscriptionDialog } from "@/components/delete-subscription-dialog";
import { PriceHistoryChart } from "@/components/charts/price-history-chart";
import {
  formatPrice,
  billingCycleLabel,
  formatShortDate,
  formatRenewalDate,
} from "@repo/shared/format";
import { isDue } from "@repo/shared/billing";
import { useSubscription } from "@/hooks/use-subscription";
import {
  useDeactivateSubscription,
  useRenewSubscription,
  useUndoRenewal,
  useReactivateSubscription,
  useSaveSubscription,
} from "@/hooks/use-subscription-mutations";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import type { SubscriptionFormValues } from "@repo/shared/validations";
import { DynamicIcon } from "lucide-react/dynamic";

interface SubscriptionDetailProps {
  id: number;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm">
        {value ?? <span className="text-muted-foreground">—</span>}
      </dd>
    </div>
  );
}

export function SubscriptionDetail({ id }: SubscriptionDetailProps) {
  const t = useTranslations("subscriptions.detail");
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"view" | "edit">(
    searchParams.get("edit") ? "edit" : "view",
  );
  const { data: sub, isLoading, isError } = useSubscription(id);
  const { data: prefs } = useUserPreferences();
  const renewMutation = useRenewSubscription();
  const undoMutation = useUndoRenewal();
  const cancelMutation = useDeactivateSubscription();
  const reactivateMutation = useReactivateSubscription();
  const saveAutoRenew = useSaveSubscription("edit", id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !sub) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed py-12 text-center text-sm">
        {t("notFound")}
      </div>
    );
  }

  if (mode === "edit") {
    const initialValues: Partial<SubscriptionFormValues> = {
      name: sub.name,
      price: sub.price,
      currency: sub.currency,
      billingCycle: sub.billingCycle as SubscriptionFormValues["billingCycle"],
      nextRenewalDate: sub.nextRenewalDate,
      startDate: sub.startDate ?? "",
      categoryId: sub.categoryId ?? undefined,
      serviceCatalogId: sub.serviceCatalogId ?? undefined,
      logoUrl: sub.logoUrl ?? "",
      websiteUrl: sub.websiteUrl ?? "",
      description: sub.description ?? "",
      notes: sub.notes ?? "",
    };

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setMode("view")}>
            <X className="mr-1 size-4" />
            {t("cancelButton")}
          </Button>
        </div>
        <SubscriptionForm
          mode="edit"
          subscriptionId={id}
          initialValues={initialValues}
          onSuccess={() => setMode("view")}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header actions */}
      <div className="flex items-center gap-2">
        {sub.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sub.logoUrl}
            alt=""
            className="size-10 rounded object-contain"
          />
        ) : (
          <div className="bg-muted flex size-10 items-center justify-center rounded text-base font-semibold uppercase">
            {sub.name.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{sub.name}</h2>
            {!sub.isActive && (
              <Badge variant="secondary">{t("inactiveBadge")}</Badge>
            )}
          </div>
          {sub.category && (
            <Badge
              variant="outline"
              className="mt-0.5 text-xs"
              style={
                sub.category.color
                  ? { borderColor: sub.category.color }
                  : undefined
              }
            >
              <DynamicIcon
                name={
                  sub.category.icon
                    ? `${sub.category.icon}`
                    : "circle-question-mark"
                }
                size={16}
              />
              {sub.category.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sub.isActive ? (
            <>
              {isDue(sub.nextRenewalDate) && !sub.previousRenewalDate && (
                <Button
                  variant="default"
                  size="sm"
                  disabled={renewMutation.isPending}
                  onClick={() => renewMutation.mutate(id)}
                >
                  <RefreshCw className="mr-1 size-4" />
                  {t("renewButton")}
                </Button>
              )}
              {sub.previousRenewalDate && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={undoMutation.isPending}
                  onClick={() => undoMutation.mutate(id)}
                >
                  <Undo2 className="mr-1 size-4" />
                  {t("undoRenewalButton")}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("edit")}
              >
                <Pencil className="mr-1 size-4" />
                {t("editButton")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(id)}
              >
                <XCircle className="mr-1 size-4" />
                {t("cancelButton")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                disabled={reactivateMutation.isPending}
                onClick={() => reactivateMutation.mutate(id)}
              >
                <RotateCcw className="mr-1 size-4" />
                {t("reactivateButton")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("edit")}
              >
                <Pencil className="mr-1 size-4" />
                {t("editButton")}
              </Button>
              <DeleteSubscriptionDialog
                subscriptionId={id}
                subscriptionName={sub.name}
              />
            </>
          )}
        </div>
      </div>

      {/* Details grid */}
      <Card>
        <CardContent className="pt-4">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow
              label={t("priceLabel")}
              value={
                <span className="font-mono font-medium">
                  {formatPrice(sub.price, sub.currency)}
                  <span className="text-muted-foreground font-normal">
                    {billingCycleLabel(sub.billingCycle)}
                  </span>
                </span>
              }
            />
            <InfoRow
              label={t("billingCycleLabel")}
              value={
                sub.billingCycle.charAt(0).toUpperCase() +
                sub.billingCycle.slice(1)
              }
            />
            <InfoRow label={t("currencyLabel")} value={sub.currency} />
            <InfoRow
              label={t("nextRenewalLabel")}
              value={formatRenewalDate(sub.nextRenewalDate)}
            />
            <InfoRow
              label={t("startDateLabel")}
              value={sub.startDate ? formatShortDate(sub.startDate) : null}
            />
            <InfoRow
              label={t("statusLabel")}
              value={
                <div className="flex items-center gap-2">
                  <Badge variant={sub.isActive ? "default" : "secondary"}>
                    {sub.isActive ? t("activeBadge") : t("inactiveBadge")}
                  </Badge>
                  {sub.isActive && isDue(sub.nextRenewalDate) && (
                    <Badge
                      variant="outline"
                      className="border-amber-500 text-amber-600 dark:text-amber-400"
                    >
                      {t("dueBadge")}
                    </Badge>
                  )}
                </div>
              }
            />
            <div className="flex flex-col gap-1.5">
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {t("autoRenewLabel")}
              </dt>
              <dd className="flex items-center gap-2">
                <Switch
                  id={`auto-renew-${id}`}
                  checked={
                    sub.autoRenew !== null
                      ? sub.autoRenew
                      : (prefs?.autoRenewDefault ?? true)
                  }
                  onCheckedChange={(checked) => {
                    // Send a partial PUT body — backend handles autoRenew outside form schema
                    void saveAutoRenew.mutateAsync({
                      autoRenew: checked,
                    } as unknown as SubscriptionFormValues);
                  }}
                />
                <Label
                  htmlFor={`auto-renew-${id}`}
                  className="text-sm font-normal"
                >
                  {sub.autoRenew === null ? t("autoRenewDefault") : ""}
                </Label>
              </dd>
            </div>
            {sub.websiteUrl && (
              <InfoRow
                label={t("websiteLabel")}
                value={
                  <a
                    href={sub.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand flex items-center gap-1 hover:underline"
                  >
                    {t("visitLink")}
                    <ExternalLink className="size-3" />
                  </a>
                }
              />
            )}
            {sub.description && (
              <div className="col-span-2 sm:col-span-3">
                <InfoRow
                  label={t("descriptionLabel")}
                  value={sub.description}
                />
              </div>
            )}
            {sub.notes && (
              <div className="col-span-2 sm:col-span-3">
                <InfoRow label={t("notesLabel")} value={sub.notes} />
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Price history */}
      {sub.priceHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("priceHistoryTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sub.priceHistory.length >= 2 ? (
              <PriceHistoryChart
                data={sub.priceHistory}
                currency={sub.currency}
              />
            ) : (
              <div className="space-y-2">
                {sub.priceHistory.map((ph, i) => (
                  <div key={ph.id}>
                    {i > 0 && <Separator className="my-2" />}
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono font-medium">
                        {formatPrice(ph.price, sub.currency)}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(ph.recordedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
