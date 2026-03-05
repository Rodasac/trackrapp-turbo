"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { NotificationPreferencesForm } from "@/components/notification-preferences-form";
import { BillingSettings } from "@/components/billing-settings";
import { ProfileForm } from "@/components/profile-form";
import { SubscriptionPreferencesForm } from "@/components/subscription-preferences-form";
import { useTranslations } from "next-intl";

function SettingsContent() {
  const t = useTranslations("settings");
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") ?? "profile";
  const upgraded = searchParams.get("upgraded") === "true";

  useEffect(() => {
    if (upgraded) {
      toast.success(t("upgradedSuccess"));
    }
  }, [upgraded, t]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("description")}
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="max-w-2xl">
        <TabsList>
          <TabsTrigger value="profile">{t("profileTab")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("notificationsTab")}</TabsTrigger>
          <TabsTrigger value="billing">{t("billingTab")}</TabsTrigger>
          <TabsTrigger value="preferences">{t("preferencesTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("profileTitle")}</CardTitle>
              <CardDescription>{t("profileDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("notificationsTitle")}</CardTitle>
              <CardDescription>
                {t("notificationsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferencesForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("billingTitle")}</CardTitle>
              <CardDescription>{t("billingDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <BillingSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("preferencesTitle")}</CardTitle>
              <CardDescription>
                {t("preferencesDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionPreferencesForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
