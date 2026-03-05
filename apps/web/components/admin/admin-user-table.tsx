"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Input } from "@repo/ui/input";
import {
  useBanUser,
  useUnbanUser,
  useSetUserRole,
} from "@/hooks/use-admin-mutations";
import type { AdminUser } from "@/lib/types/api";

interface AdminUserTableProps {
  users: AdminUser[];
  total: number;
  onSearch: (search: string) => void;
}

export function AdminUserTable({
  users,
  total,
  onSearch,
}: AdminUserTableProps) {
  const t = useTranslations("admin.users");
  const [search, setSearch] = useState("");
  const { mutate: banUser } = useBanUser();
  const { mutate: unbanUser } = useUnbanUser();
  const { mutate: setRole } = useSetUserRole();

  function handleSearch(value: string) {
    setSearch(value);
    onSearch(value);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
        <p className="text-muted-foreground text-sm">
          {t("userCount", { total })}
        </p>
      </div>

      {users.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          {t("noUsersFound")}
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("nameHeader")}</TableHead>
                <TableHead>{t("emailHeader")}</TableHead>
                <TableHead>{t("roleHeader")}</TableHead>
                <TableHead>{t("statusHeader")}</TableHead>
                <TableHead>{t("joinedHeader")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role === "admin" ? t("adminRole") : t("userRole")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned && (
                      <Badge variant="destructive">{t("bannedBadge")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t("openMenu")}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.banned ? (
                          <DropdownMenuItem
                            onClick={() => unbanUser({ userId: user.id })}
                          >
                            {t("unbanAction")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => banUser({ userId: user.id })}
                          >
                            {t("banAction")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {user.role !== "admin" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              setRole({ userId: user.id, role: "admin" })
                            }
                          >
                            {t("makeAdminAction")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              setRole({ userId: user.id, role: "user" })
                            }
                          >
                            {t("removeAdminAction")}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
