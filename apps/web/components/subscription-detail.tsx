"use client";

import { useState } from "react";
import { Pencil, X, ExternalLink } from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Separator } from "@repo/ui/separator";
import { SubscriptionForm } from "@/components/subscription-form";
import { DeleteSubscriptionDialog } from "@/components/delete-subscription-dialog";
import {
  formatPrice,
  billingCycleLabel,
  formatShortDate,
  formatRenewalDate,
} from "@repo/shared/format";
import { useSubscription } from "@/hooks/use-subscription";
import type { SubscriptionFormValues } from "@repo/shared/validations";

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
  const [mode, setMode] = useState<"view" | "edit">("view");
  const { data: sub, isLoading, isError } = useSubscription(id);

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
        Subscription not found.
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
            Cancel
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
            {!sub.isActive && <Badge variant="secondary">Inactive</Badge>}
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
              {sub.category.icon ? `${sub.category.icon} ` : ""}
              {sub.category.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
            <Pencil className="mr-1 size-4" />
            Edit
          </Button>
          <DeleteSubscriptionDialog
            subscriptionId={id}
            subscriptionName={sub.name}
          />
        </div>
      </div>

      {/* Details grid */}
      <Card>
        <CardContent className="pt-4">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoRow
              label="Price"
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
              label="Billing cycle"
              value={
                sub.billingCycle.charAt(0).toUpperCase() +
                sub.billingCycle.slice(1)
              }
            />
            <InfoRow label="Currency" value={sub.currency} />
            <InfoRow
              label="Next renewal"
              value={formatRenewalDate(sub.nextRenewalDate)}
            />
            <InfoRow
              label="Start date"
              value={sub.startDate ? formatShortDate(sub.startDate) : null}
            />
            <InfoRow
              label="Status"
              value={
                <Badge variant={sub.isActive ? "default" : "secondary"}>
                  {sub.isActive ? "Active" : "Inactive"}
                </Badge>
              }
            />
            {sub.websiteUrl && (
              <InfoRow
                label="Website"
                value={
                  <a
                    href={sub.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand flex items-center gap-1 hover:underline"
                  >
                    Visit
                    <ExternalLink className="size-3" />
                  </a>
                }
              />
            )}
            {sub.description && (
              <div className="col-span-2 sm:col-span-3">
                <InfoRow label="Description" value={sub.description} />
              </div>
            )}
            {sub.notes && (
              <div className="col-span-2 sm:col-span-3">
                <InfoRow label="Notes" value={sub.notes} />
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Price history */}
      {sub.priceHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Price history</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
