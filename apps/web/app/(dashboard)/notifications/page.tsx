import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-muted-foreground text-sm">
          Renewal reminders and system alerts
        </p>
      </div>

      <div className="text-muted-foreground rounded-lg border border-dashed py-24 text-center text-sm">
        <Bell className="mx-auto mb-3 size-8 opacity-40" />
        <p className="font-medium">All caught up</p>
        <p className="mt-1">Renewal reminders will appear here.</p>
      </div>
    </div>
  );
}
