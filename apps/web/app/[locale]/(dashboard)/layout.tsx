import { CreditCard } from "lucide-react";
import { MobileSidebar, SidebarNav } from "@/components/sidebar-nav";
import { TrialActivator } from "@/components/trial-activator";
import { Link } from "@/i18n/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-svh overflow-hidden">
      <TrialActivator />
      <SidebarNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-card flex h-14 items-center gap-2 border-b px-3 md:hidden">
          <MobileSidebar />
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-brand flex size-7 items-center justify-center rounded-md">
              <CreditCard className="text-brand-foreground size-4" />
            </div>
            <span className="font-semibold">TrackrApp</span>
          </Link>
        </header>
        <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
