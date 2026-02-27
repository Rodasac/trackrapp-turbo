"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Eye,
  PowerOff,
  Trash2,
  Search,
  Plus,
} from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Switch } from "@repo/ui/switch";
import { Label } from "@repo/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";
import { toast } from "sonner";
import { formatPrice, billingCycleLabel, formatRenewalDate } from "@repo/shared/format";
import { DeleteSubscriptionDialog } from "@/components/delete-subscription-dialog";
import { CsvExportButton } from "@/components/csv-export-button";
import { useCategories } from "@/hooks/use-categories";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useDeactivateSubscription } from "@/hooks/use-subscription-mutations";
import type { SubscriptionListItem } from "@/lib/types/api";

function computeImgSrc(
  logoUrl: string | null,
  websiteUrl: string | null,
): string | null {
  if (logoUrl) return logoUrl;
  if (websiteUrl) {
    try {
      const { hostname } = new URL(websiteUrl);
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
      return null;
    }
  }
  return null;
}

function SubscriptionLogo({
  name,
  logoUrl,
  websiteUrl,
}: {
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
}) {
  const [broken, setBroken] = useState(false);
  const src = broken ? null : computeImgSrc(logoUrl, websiteUrl);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="size-8 shrink-0 rounded object-contain"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded text-sm font-medium uppercase">
      {name.charAt(0)}
    </div>
  );
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableCell key={i}>
          <div className="bg-muted h-4 animate-pulse rounded" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function SubscriptionList() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sort, setSort] = useState("nextRenewalDate");
  const [order, setOrder] = useState("asc");
  const [showInactive, setShowInactive] = useState(false);

  const { data: categories = [] } = useCategories();
  const {
    data: subscriptions = [],
    isLoading,
    isError,
  } = useSubscriptions({
    search,
    category: categoryFilter === "all" ? "" : categoryFilter,
    sort,
    order,
    active: showInactive ? undefined : true,
  });
  const deactivate = useDeactivateSubscription();

  async function handleDeactivate(id: number) {
    try {
      await deactivate.mutateAsync(id);
      toast.success("Subscription deactivated");
    } catch {
      toast.error("Failed to deactivate");
    }
  }

  if (isError) {
    toast.error("Failed to load subscriptions");
  }

  const hasFilters = !!(search || categoryFilter !== "all");

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search subscriptions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40" data-testid="category-filter">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.icon ? `${cat.icon} ` : ""}
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={`${sort}:${order}`}
          onValueChange={(v) => {
            const [s, o] = v.split(":");
            setSort(s!);
            setOrder(o!);
          }}
        >
          <SelectTrigger className="w-44" data-testid="sort-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nextRenewalDate:asc">Renewal ↑</SelectItem>
            <SelectItem value="nextRenewalDate:desc">Renewal ↓</SelectItem>
            <SelectItem value="name:asc">Name A–Z</SelectItem>
            <SelectItem value="name:desc">Name Z–A</SelectItem>
            <SelectItem value="price:asc">Price ↑</SelectItem>
            <SelectItem value="price:desc">Price ↓</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="show-inactive"
            checked={showInactive}
            onCheckedChange={setShowInactive}
          />
          <Label htmlFor="show-inactive" className="text-sm">
            Show inactive
          </Label>
        </div>

        <CsvExportButton />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Next renewal</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))
              : subscriptions.map((sub: SubscriptionListItem) => (
                  <TableRow
                    key={sub.id}
                    className={!sub.isActive ? "opacity-50" : undefined}
                  >
                    <TableCell>
                      <SubscriptionLogo
                        name={sub.name}
                        logoUrl={sub.logoUrl}
                        websiteUrl={sub.websiteUrl}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sub.name}</span>
                        {!sub.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatPrice(sub.price, sub.currency)}
                      <span className="text-muted-foreground">
                        {billingCycleLabel(sub.billingCycle)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {sub.category ? (
                        <Badge
                          variant="outline"
                          style={
                            sub.category.color
                              ? { borderColor: sub.category.color }
                              : undefined
                          }
                        >
                          {sub.category.icon ? `${sub.category.icon} ` : ""}
                          {sub.category.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatRenewalDate(sub.nextRenewalDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/subscriptions/${sub.id}`}>
                              <Eye className="mr-2 size-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/subscriptions/${sub.id}?edit=1`}>
                              <Pencil className="mr-2 size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {sub.isActive && (
                            <DropdownMenuItem
                              onClick={() => handleDeactivate(sub.id)}
                            >
                              <PowerOff className="mr-2 size-4" />
                              Deactivate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <DeleteSubscriptionDialog
                              subscriptionId={sub.id}
                              subscriptionName={sub.name}
                              trigger={
                                <span className="flex cursor-pointer items-center px-2 py-1.5 text-sm">
                                  <Trash2 className="mr-2 size-4 text-destructive" />
                                  <span className="text-destructive">Delete</span>
                                </span>
                              }
                            />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty states */}
      {!isLoading && subscriptions.length === 0 && (
        <div className="text-muted-foreground rounded-lg border border-dashed py-16 text-center text-sm">
          {hasFilters ? (
            <>
              <p className="font-medium">No matches</p>
              <p className="mt-1">Try adjusting your filters.</p>
            </>
          ) : (
            <>
              <p className="font-medium">No subscriptions yet</p>
              <p className="mt-1">Add your first subscription to get started.</p>
              <Button asChild className="mt-4">
                <Link href="/subscriptions/new">
                  <Plus className="size-4" />
                  Add subscription
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
