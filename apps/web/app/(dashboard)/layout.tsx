import { SidebarNav } from "@/components/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-svh overflow-hidden">
      <SidebarNav />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  );
}
