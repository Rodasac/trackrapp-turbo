"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, AlertCircle, Lightbulb, Info } from "lucide-react";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import {
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notification-mutations";
import type { NotificationItem } from "@/lib/types/api";

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
  switch (type) {
    case "renewal_reminder":
      return <AlertCircle className="size-4 text-amber-500" />;
    case "price_change":
      return <AlertCircle className="size-4 text-blue-500" />;
    case "tip":
      return <Lightbulb className="size-4 text-green-500" />;
    default:
      return <Info className="size-4 text-muted-foreground" />;
  }
}

function NotificationCard({
  notification,
}: {
  notification: NotificationItem;
}) {
  const router = useRouter();
  const { mutate: markRead } = useMarkNotificationRead();

  function handleClick() {
    if (!notification.isRead) {
      markRead(notification.id);
    }
    if (notification.relatedSubscriptionId) {
      router.push(`/subscriptions/${notification.relatedSubscriptionId}`);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-accent",
        !notification.isRead && "bg-accent/40 border-brand/20",
      )}
    >
      <div className="mt-0.5 shrink-0">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm",
            !notification.isRead && "font-semibold",
          )}
        >
          {notification.title}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          {notification.message}
        </p>
      </div>
      <span className="text-muted-foreground shrink-0 text-xs">
        {formatRelativeTime(notification.createdAt)}
      </span>
    </button>
  );
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { mutate: markAllRead, isPending } = useMarkAllNotificationsRead();

  const hasUnread = notifications?.some((n) => !n.isRead) ?? false;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-muted-foreground text-sm">
            Renewal reminders and system alerts
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead()}
            disabled={isPending}
          >
            <CheckCheck className="mr-2 size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-muted h-16 animate-pulse rounded-lg border"
            />
          ))}
        </div>
      ) : !notifications?.length ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-24 text-center text-sm">
          <Bell className="mx-auto mb-3 size-8 opacity-40" />
          <p className="font-medium">All caught up</p>
          <p className="mt-1">Renewal reminders will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
