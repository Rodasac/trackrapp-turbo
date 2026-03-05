"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useAdminUsers } from "@/hooks/use-admin-users";

export default function AdminPage() {
  const t = useTranslations("admin");
  const isAdmin = useIsAdmin();
  const [search, setSearch] = useState("");
  const { data } = useAdminUsers({ search });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <ShieldAlert className="text-destructive size-12" />
        <h1 className="text-2xl font-semibold">{t("accessDenied")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("accessDeniedMessage")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("description")}
        </p>
      </div>

      <AdminStats />

      <div>
        <h2 className="mb-4 text-lg font-medium">{t("usersSection")}</h2>
        <AdminUserTable
          users={data?.users ?? []}
          total={data?.total ?? 0}
          onSearch={setSearch}
        />
      </div>
    </div>
  );
}
