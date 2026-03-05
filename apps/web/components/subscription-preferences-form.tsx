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
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  useUserPreferences,
  useUpdateUserPreferences,
} from "@/hooks/use-user-preferences";
import { CURRENCIES } from "@repo/shared/constants";

export function SubscriptionPreferencesForm() {
  const t = useTranslations("settings.preferences");
  const { data: prefs, isLoading } = useUserPreferences();
  const update = useUpdateUserPreferences();
  const router = useRouter();
  const pathname = usePathname();

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
      toast.success(t("savedToast"));
    } catch {
      toast.error(t("failedToSaveToast"));
    }
  }

  async function handleCurrencyChange(value: string) {
    try {
      await update.mutateAsync({ defaultCurrency: value });
      toast.success(t("savedToast"));
    } catch {
      toast.error(t("failedToSaveToast"));
    }
  }

  async function handleLocaleChange(value: string) {
    try {
      await update.mutateAsync({ locale: value });
      router.replace(pathname, { locale: value });
      toast.success(t("savedToast"));
    } catch {
      toast.error(t("failedToSaveToast"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label htmlFor="auto-renew-default" className="text-sm font-medium">
            {t("autoRenewLabel")}
          </Label>
          <p className="text-muted-foreground text-sm">
            {t("autoRenewDescription")}
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
          <Label className="text-sm font-medium">{t("defaultCurrencyLabel")}</Label>
          <p className="text-muted-foreground text-sm">
            {t("defaultCurrencyDescription")}
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
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium">{t("languageLabel")}</Label>
          <p className="text-muted-foreground text-sm">
            {t("languageDescription")}
          </p>
        </div>
        <Select
          value={prefs?.locale ?? "en"}
          disabled={update.isPending}
          onValueChange={handleLocaleChange}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("english")}</SelectItem>
            <SelectItem value="es">{t("spanish")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
