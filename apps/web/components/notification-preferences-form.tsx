"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@repo/ui/form";
import { Switch } from "@repo/ui/switch";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { PushNotificationManager } from "@/components/push-notification-manager";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { useUpdateNotificationPreferences } from "@/hooks/use-notification-mutations";
import { useIsPro } from "@/hooks/use-subscription-plan";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  createNotificationPreferencesSchema,
  type NotificationPreferencesValues,
} from "@repo/shared/validations";

const REMINDER_DAY_VALUES = [30, 14, 7, 3, 1];

export function NotificationPreferencesForm() {
  const t = useTranslations("settings.notifications");
  const tv = useTranslations("validation");
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutateAsync: updatePrefs } = useUpdateNotificationPreferences();
  const isPro = useIsPro();

  const schema = useMemo(
    () =>
      createNotificationPreferencesSchema({
        reminderDaysMin: tv("atLeastOneReminderDay"),
      }),
    [tv],
  );

  const form = useForm<NotificationPreferencesValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      emailEnabled: true,
      pushEnabled: false,
      reminderDaysBefore: [7, 3, 1],
    },
  });

  // Populate form once preferences load
  useEffect(() => {
    if (prefs) {
      form.reset({
        emailEnabled: prefs.emailEnabled,
        pushEnabled: prefs.pushEnabled,
        reminderDaysBefore: prefs.reminderDaysBefore,
      });
    }
  }, [prefs, form]);

  async function onSubmit(values: NotificationPreferencesValues) {
    try {
      await updatePrefs(values);
      toast.success(t("savedToast"));
    } catch {
      toast.error(t("failedToSaveToast"));
    }
  }

  const pushEnabled = useWatch({ control: form.control, name: "pushEnabled" });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-10 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Email toggle */}
        <FormField
          control={form.control}
          name="emailEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {t("emailRemindersLabel")}
                </FormLabel>
                <FormDescription>
                  {t("emailRemindersDescription")}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Push toggle — Pro only */}
        {isPro ? (
          <>
            <FormField
              control={form.control}
              name="pushEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {t("pushNotificationsLabel")}
                    </FormLabel>
                    <FormDescription>
                      {t("pushNotificationsDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {pushEnabled && (
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground mb-3 text-sm">
                  {t("allowBrowserNotifications")}
                </p>
                <PushNotificationManager
                  vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between rounded-lg border p-4 opacity-60">
            <div className="space-y-0.5">
              <p className="text-base font-medium leading-none">
                {t("pushNotificationsLabel")}
              </p>
              <p className="text-muted-foreground text-sm">
                {t("pushNotificationsDescription")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge>Pro</Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href="/pricing">{t("upgradeLabel")}</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Reminder days checkboxes */}
        <FormField
          control={form.control}
          name="reminderDaysBefore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("remindMeLabel")}</FormLabel>
              <FormDescription>{t("remindMeDescription")}</FormDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                {REMINDER_DAY_VALUES.map((value) => {
                  const checked = field.value.includes(value);
                  const label = t(
                    value === 1
                      ? "1Day"
                      : (`${value}Days` as
                          | "30Days"
                          | "14Days"
                          | "7Days"
                          | "3Days"
                          | "1Day"),
                  );
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        if (checked) {
                          // Keep at least one day selected
                          if (field.value.length > 1) {
                            field.onChange(
                              field.value.filter((d) => d !== value),
                            );
                          }
                        } else {
                          field.onChange(
                            [...field.value, value].sort((a, b) => b - a),
                          );
                        }
                      }}
                      className={[
                        "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                        checked
                          ? "bg-brand text-brand-foreground border-brand"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? t("saveButtonLoading")
            : t("saveButton")}
        </Button>
      </form>
    </Form>
  );
}
