"use client";

import {
  Users,
  Activity,
  Crown,
  CreditCard,
  UserPlus,
  CalendarPlus,
  ShieldBan,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { KpiCard } from "@repo/ui/kpi-card";
import { useAdminStats } from "@/hooks/use-admin-stats";

export function AdminStats() {
  const t = useTranslations("admin.stats");
  const { data } = useAdminStats();

  const cards = [
    {
      title: t("totalUsers"),
      value: data?.totalUsers ?? "—",
      icon: Users,
    },
    {
      title: t("activeUsers30d"),
      value: data?.activeUsers30d ?? "—",
      icon: Activity,
    },
    {
      title: t("proUsers"),
      value: data?.proUsers ?? "—",
      icon: Crown,
    },
    {
      title: t("freeUsers"),
      value: data?.freeUsers ?? "—",
      icon: Users,
    },
    {
      title: t("totalSubscriptions"),
      value: data?.totalSubscriptions ?? "—",
      icon: CreditCard,
    },
    {
      title: t("signups7d"),
      value: data?.signups7d ?? "—",
      icon: UserPlus,
    },
    {
      title: t("signups30d"),
      value: data?.signups30d ?? "—",
      icon: CalendarPlus,
    },
    {
      title: t("bannedUsers"),
      value: data?.bannedUsers ?? "—",
      icon: ShieldBan,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <KpiCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
