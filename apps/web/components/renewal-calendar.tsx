"use client";

import { useState } from "react";
import { Calendar } from "@repo/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { useRenewalCalendar } from "@/hooks/use-renewal-calendar";
import { formatPrice } from "@repo/shared/format";
import { parseDateString, toDateString } from "@repo/shared/dates";
import type { RenewalItem } from "@/lib/types/api";

function getRenewalDates(renewals: RenewalItem[]): Date[] {
  return renewals.map((r) => parseDateString(r.nextRenewalDate));
}

export function RenewalCalendar() {
  const { data: renewals = [], isLoading } = useRenewalCalendar();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;
  }

  const renewalDates = getRenewalDates(renewals);

  // Find renewals on the selected date
  const selectedDateStr = selectedDate
    ? toDateString(selectedDate)
    : null;
  const renewalsOnSelected = selectedDateStr
    ? renewals.filter((r) => r.nextRenewalDate === selectedDateStr)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming renewals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{ renewal: renewalDates }}
          modifiersClassNames={{
            renewal:
              "bg-brand/20 font-semibold text-brand rounded-full",
          }}
          className="rounded-md border"
        />

        {renewalsOnSelected.length > 0 ? (
          <ul className="space-y-2" data-testid="renewal-detail-list">
            {renewalsOnSelected.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <span className="font-medium">{r.name}</span>
                <Badge variant="outline">
                  {formatPrice(r.price, r.currency)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : renewals.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No renewals in the next 30 days
          </p>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {renewals.length} renewal{renewals.length !== 1 ? "s" : ""} this
            month — click a highlighted date to see details
          </p>
        )}
      </CardContent>
    </Card>
  );
}
