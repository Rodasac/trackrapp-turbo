import { SidebarNav } from "@/components/sidebar-nav";
import { TrialActivator } from "@/components/trial-activator";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-svh overflow-hidden">
      <TrialActivator />
      <SidebarNav />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
