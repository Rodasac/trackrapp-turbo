"use client";

import { toast } from "sonner";
import { Switch } from "@repo/ui/switch";
import { Label } from "@repo/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  useUserPreferences,
  useUpdateUserPreferences,
} from "@/hooks/use-user-preferences";
import { CURRENCIES } from "@repo/shared/constants";

export function SubscriptionPreferencesForm() {
  const { data: prefs, isLoading } = useUserPreferences();
  const update = useUpdateUserPreferences();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="bg-muted h-6 w-48 animate-pulse rounded" />
        <div className="bg-muted h-4 w-72 animate-pulse rounded" />
      </div>
    );
  }

  async function handleAutoRenewToggle(checked: boolean) {
    try {
      await update.mutateAsync({ autoRenewDefault: checked });
      toast.success("Preference saved");
    } catch {
      toast.error("Failed to save preference");
    }
  }

  async function handleCurrencyChange(value: string) {
    try {
      await update.mutateAsync({ defaultCurrency: value });
      toast.success("Preference saved");
    } catch {
      toast.error("Failed to save preference");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor="auto-renew-default" className="text-sm font-medium">
            Auto-renew subscriptions
          </Label>
          <p className="text-muted-foreground text-sm">
            Automatically advance the renewal date when a subscription becomes
            due. Individual subscriptions can override this default.
          </p>
        </div>
        <Switch
          id="auto-renew-default"
          checked={prefs?.autoRenewDefault ?? true}
          disabled={update.isPending}
          onCheckedChange={handleAutoRenewToggle}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Default currency</Label>
          <p className="text-muted-foreground text-sm">
            Used as the default currency when adding new subscriptions.
          </p>
        </div>
        <Select
          value={prefs?.defaultCurrency ?? "USD"}
          disabled={update.isPending}
          onValueChange={handleCurrencyChange}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
