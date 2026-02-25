"use client";

import { Bell } from "lucide-react";
import { useUnreadNotificationCount } from "@/hooks/use-unread-notification-count";

export function NotificationBell() {
  const { data } = useUnreadNotificationCount();
  const count = data?.count ?? 0;

  return (
    <span className="relative inline-flex">
      <Bell className="size-4 shrink-0" />
      {count > 0 && (
        <span className="bg-brand text-brand-foreground absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}
