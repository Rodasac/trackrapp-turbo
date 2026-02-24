"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Calendar } from "@repo/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Textarea } from "@repo/ui/textarea";
import { cn } from "@repo/ui/lib/utils";
import {
  subscriptionFormSchema,
  type SubscriptionFormValues,
} from "@/lib/validations/subscription";
import { formatShortDate } from "@/lib/utils/format";
import { ServiceCatalogSearch } from "@/components/service-catalog-search";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import type { Category, ServiceCatalogEntry } from "@repo/database";

interface SubscriptionFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<SubscriptionFormValues>;
  subscriptionId?: number;
  /** Called after a successful save instead of redirecting (e.g. from detail page) */
  onSuccess?: () => void;
}

function toCalendarDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined;
  const parts = dateStr.split("-").map(Number);
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SubscriptionForm({
  mode,
  initialValues,
  subscriptionId,
  onSuccess,
}: SubscriptionFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      price: "",
      currency: "USD",
      billingCycle: "monthly",
      nextRenewalDate: "",
      startDate: "",
      logoUrl: "",
      websiteUrl: "",
      description: "",
      notes: "",
      ...initialValues,
    },
  });

  function handleCatalogSelect(entry: ServiceCatalogEntry) {
    form.setValue("name", entry.name);
    form.setValue("serviceCatalogId", entry.id);
    form.setValue("currency", entry.currency || "USD");
    if (entry.logoUrl) form.setValue("logoUrl", entry.logoUrl);
    if (entry.websiteUrl) form.setValue("websiteUrl", entry.websiteUrl);

    // Auto-fill price based on the currently selected billing cycle
    const currentCycle = form.getValues("billingCycle") || "monthly";
    const price =
      currentCycle === "yearly" && entry.typicalYearlyPrice
        ? entry.typicalYearlyPrice
        : (entry.typicalMonthlyPrice ?? "");
    if (price) form.setValue("price", price);

    // Match category by name
    if (entry.defaultCategory && categories.length > 0) {
      const match = categories.find(
        (c) =>
          c.name.toLowerCase() === entry.defaultCategory!.toLowerCase(),
      );
      if (match) form.setValue("categoryId", match.id);
    }
  }

  function handleCategoryCreated(cat: Category) {
    setCategories((prev) =>
      [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)),
    );
    form.setValue("categoryId", cat.id);
  }

  async function onSubmit(values: SubscriptionFormValues) {
    const url =
      mode === "create"
        ? "/api/subscriptions"
        : `/api/subscriptions/${subscriptionId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      toast.success(
        mode === "create" ? "Subscription added!" : "Subscription updated!",
      );
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/subscriptions");
      }
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(
        (data as { error?: string }).error ?? "Something went wrong",
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {/* Service catalog search — create mode only */}
        {mode === "create" && (
          <div>
            <p className="text-muted-foreground mb-1.5 text-sm font-medium">
              Quick add from catalog
            </p>
            <ServiceCatalogSearch onSelect={handleCatalogSelect} />
          </div>
        )}

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Netflix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price + Currency */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price *</FormLabel>
                  <FormControl>
                    <Input placeholder="9.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input placeholder="USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Billing cycle */}
        <FormField
          control={form.control}
          name="billingCycle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing cycle *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Next renewal date + Start date */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="nextRenewalDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Next renewal *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4 shrink-0" />
                        {field.value
                          ? formatShortDate(field.value)
                          : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toCalendarDate(field.value)}
                      onSelect={(d) =>
                        field.onChange(d ? toDateString(d) : "")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 size-4 shrink-0" />
                        {field.value
                          ? formatShortDate(field.value)
                          : "Optional"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toCalendarDate(field.value)}
                      onSelect={(d) =>
                        field.onChange(d ? toDateString(d) : "")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="flex items-center gap-2">
                <Select
                  value={field.value !== undefined ? String(field.value) : ""}
                  onValueChange={(v) =>
                    field.onChange(v ? Number(v) : undefined)
                  }
                >
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.icon ? `${cat.icon} ` : ""}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddCategoryDialog onCreated={handleCategoryCreated} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Logo URL + Website URL */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What this subscription is for…"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Account details, shared with…"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="mt-1"
        >
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Adding…"
              : "Saving…"
            : mode === "create"
              ? "Add subscription"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
}
