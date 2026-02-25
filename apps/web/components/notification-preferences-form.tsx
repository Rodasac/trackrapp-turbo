"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Button } from "@repo/ui/button";
import { PushNotificationManager } from "@/components/push-notification-manager";
import { useNotificationPreferences } from "@/hooks/use-notification-preferences";
import { useUpdateNotificationPreferences } from "@/hooks/use-notification-mutations";
import {
  notificationPreferencesSchema,
  type NotificationPreferencesValues,
} from "@repo/shared/validations";

const REMINDER_DAY_OPTIONS = [
  { value: 30, label: "30 days" },
  { value: 14, label: "14 days" },
  { value: 7, label: "7 days" },
  { value: 3, label: "3 days" },
  { value: 1, label: "1 day" },
];

export function NotificationPreferencesForm() {
  const { data: prefs, isLoading } = useNotificationPreferences();
  const { mutateAsync: updatePrefs } = useUpdateNotificationPreferences();

  const form = useForm<NotificationPreferencesValues>({
    resolver: zodResolver(notificationPreferencesSchema),
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
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save preferences");
    }
  }

  const pushEnabled = form.watch("pushEnabled");

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
                <FormLabel className="text-base">Email reminders</FormLabel>
                <FormDescription>
                  Receive renewal reminders via email
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

        {/* Push toggle */}
        <FormField
          control={form.control}
          name="pushEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Browser push notifications
                </FormLabel>
                <FormDescription>
                  Get notified directly in your browser
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
              Allow browser notifications to receive push alerts
            </p>
            <PushNotificationManager
              vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
            />
          </div>
        )}

        {/* Reminder days checkboxes */}
        <FormField
          control={form.control}
          name="reminderDaysBefore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remind me before renewal</FormLabel>
              <FormDescription>
                Select when to receive renewal reminders
              </FormDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                {REMINDER_DAY_OPTIONS.map(({ value, label }) => {
                  const checked = field.value.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        if (checked) {
                          // Keep at least one day selected
                          if (field.value.length > 1) {
                            field.onChange(field.value.filter((d) => d !== value));
                          }
                        } else {
                          field.onChange([...field.value, value].sort((a, b) => b - a));
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
          {form.formState.isSubmitting ? "Saving…" : "Save preferences"}
        </Button>
      </form>
    </Form>
  );
}
