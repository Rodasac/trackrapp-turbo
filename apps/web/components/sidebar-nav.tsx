"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Lightbulb,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@repo/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Separator } from "@repo/ui/separator";
import { useSession, signOut } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";

// Notifications uses a custom icon component; others use lucide icons directly.
const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/notifications", label: "Notifications", icon: null },
  { href: "/tips", label: "Tips", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
];

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <aside className="bg-card flex h-full w-64 flex-col border-r">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-brand flex size-7 items-center justify-center rounded-md">
            <CreditCard className="text-brand-foreground size-4" />
          </div>
          <span className="font-semibold">TrackrApp</span>
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")}
            >
              {Icon ? (
                <Icon className="size-4 shrink-0" />
              ) : (
                <NotificationBell />
              )}
              {label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User menu */}
      <div className="p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar className="size-8">
            <AvatarImage src={session?.user.image ?? undefined} />
            <AvatarFallback>{initials(session?.user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-none">
              {session?.user.name ?? "—"}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
              {session?.user.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
