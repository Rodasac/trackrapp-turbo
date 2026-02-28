"use client";

import { useState } from "react";
import { Calendar } from "@repo/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { useRenewalCalendar } from "@/hooks/use-renewal-calendar";
import {
  formatPrice,
  formatShortDate,
  billingCycleLabel,
} from "@repo/shared/format";
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

  const selectedDateStr = selectedDate ? toDateString(selectedDate) : null;
  const renewalsOnSelected = selectedDateStr
    ? renewals.filter((r) => r.nextRenewalDate === selectedDateStr)
    : [];

  const isFiltered = selectedDateStr !== null && renewalsOnSelected.length > 0;
  const displayList = isFiltered ? renewalsOnSelected : renewals;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming renewals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Calendar
          mode="single"
          numberOfMonths={2}
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{ renewal: renewalDates }}
          modifiersClassNames={{
            renewal: "bg-brand/20 font-semibold text-brand rounded-full",
          }}
          className="rounded-md border"
        />

        {renewals.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No renewals in the next 30 days
          </p>
        ) : (
          <>
            {isFiltered && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatShortDate(selectedDateStr!)}
                </span>
                <button
                  data-testid="clear-date-filter"
                  onClick={() => setSelectedDate(undefined)}
                  className="text-brand hover:underline"
                >
                  Show all
                </button>
              </div>
            )}

            {selectedDateStr && !isFiltered && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  No renewals on {formatShortDate(selectedDateStr)}
                </span>
                <button
                  data-testid="clear-date-filter"
                  onClick={() => setSelectedDate(undefined)}
                  className="text-brand hover:underline"
                >
                  Show all
                </button>
              </div>
            )}

            <ul
              className="max-h-64 space-y-2 overflow-y-auto"
              data-testid="renewal-list"
            >
              {displayList.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 flex-col">
                    <span className="font-medium">{r.name}</span>
                    {!isFiltered && (
                      <span className="text-xs text-muted-foreground">
                        {formatShortDate(r.nextRenewalDate)}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">
                    {formatPrice(r.price, r.currency)}
                    {billingCycleLabel(r.billingCycle)}
                  </Badge>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
