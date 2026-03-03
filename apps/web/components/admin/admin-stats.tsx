"use client";

import { Users, Activity, Crown, UserX, CreditCard, UserPlus, CalendarPlus, ShieldBan } from "lucide-react";
import { KpiCard } from "@repo/ui/kpi-card";
import { useAdminStats } from "@/hooks/use-admin-stats";

export function AdminStats() {
  const { data } = useAdminStats();

  const cards = [
    {
      title: "Total Users",
      value: data?.totalUsers ?? "—",
      icon: Users,
    },
    {
      title: "Active (30d)",
      value: data?.activeUsers30d ?? "—",
      icon: Activity,
    },
    {
      title: "Pro Users",
      value: data?.proUsers ?? "—",
      icon: Crown,
    },
    {
      title: "Free Users",
      value: data?.freeUsers ?? "—",
      icon: Users,
    },
    {
      title: "Tracked Subscriptions",
      value: data?.totalSubscriptions ?? "—",
      icon: CreditCard,
    },
    {
      title: "Signups (7d)",
      value: data?.signups7d ?? "—",
      icon: UserPlus,
    },
    {
      title: "Signups (30d)",
      value: data?.signups30d ?? "—",
      icon: CalendarPlus,
    },
    {
      title: "Banned Users",
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
