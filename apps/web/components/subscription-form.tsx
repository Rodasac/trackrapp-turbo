"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { CalendarIcon, CircleQuestionMarkIcon } from "lucide-react";
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
} from "@repo/shared/validations";
import { formatShortDate, parseDateString, toDateString } from "@repo/shared";
import { ServiceCatalogSearch } from "@/components/service-catalog-search";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { useCategories } from "@/hooks/use-categories";
import { useSaveSubscription } from "@/hooks/use-subscription-mutations";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import type { Category, ServiceCatalogEntry } from "@repo/database";
import { DynamicIcon } from "lucide-react/dynamic";
import { CURRENCIES } from "@repo/shared/constants";

interface SubscriptionFormProps {
  mode: "create" | "edit";
  initialValues?: Partial<SubscriptionFormValues>;
  subscriptionId?: number;
  /** Called after a successful save instead of redirecting (e.g. from detail page) */
  onSuccess?: () => void;
}

export function SubscriptionForm({
  mode,
  initialValues,
  subscriptionId,
  onSuccess,
}: SubscriptionFormProps) {
  const t = useTranslations("subscriptions.form");
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const { data: userPrefs } = useUserPreferences();
  const saveSubscription = useSaveSubscription(mode, subscriptionId);
  const [nextRenewalOpen, setNextRenewalOpen] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const currencyApplied = useRef(false);

  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: "",
      price: "",
      currency: initialValues?.currency ?? userPrefs?.defaultCurrency ?? "USD",
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

  // Apply preference once it loads for new subscriptions that have no explicit currency
  useEffect(() => {
    if (
      mode === "create" &&
      !initialValues?.currency &&
      userPrefs?.defaultCurrency &&
      !currencyApplied.current
    ) {
      currencyApplied.current = true;
      form.setValue("currency", userPrefs.defaultCurrency);
    }
  }, [userPrefs?.defaultCurrency, mode, initialValues?.currency, form]);

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
        (c) => c.name.toLowerCase() === entry.defaultCategory!.toLowerCase(),
      );
      if (match) form.setValue("categoryId", match.id);
    }
  }

  function handleCategoryCreated(cat: Category) {
    // Mutation in AddCategoryDialog invalidates categories.all — just set the value
    form.setValue("categoryId", cat.id);
  }

  async function onSubmit(values: SubscriptionFormValues) {
    try {
      await saveSubscription.mutateAsync(values);
      toast.success(
        mode === "create" ? t("addedToast") : t("updatedToast"),
      );
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/subscriptions");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("saveFailed"));
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
              {t("quickAdd")}
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
              <FormLabel>{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input placeholder={t("namePlaceholder")} {...field} />
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
                  <FormLabel>{t("priceLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("pricePlaceholder")} {...field} />
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
                <FormLabel>{t("currencyLabel")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("currencyPlaceholder")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>{t("billingCycleLabel")}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("billingCyclePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="monthly">{t("cycleMonthly")}</SelectItem>
                  <SelectItem value="yearly">{t("cycleYearly")}</SelectItem>
                  <SelectItem value="quarterly">{t("cycleQuarterly")}</SelectItem>
                  <SelectItem value="weekly">{t("cycleWeekly")}</SelectItem>
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
                <FormLabel>{t("nextRenewalLabel")}</FormLabel>
                <Popover
                  open={nextRenewalOpen}
                  onOpenChange={setNextRenewalOpen}
                >
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
                          : t("nextRenewalPlaceholder")}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value ? parseDateString(field.value) : undefined
                      }
                      onSelect={(d) => {
                        field.onChange(d ? toDateString(d) : "");
                        setNextRenewalOpen(false);
                      }}
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
                <FormLabel>{t("startDateLabel")}</FormLabel>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
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
                          : t("startDatePlaceholder")}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value ? parseDateString(field.value) : undefined
                      }
                      onSelect={(d) => {
                        field.onChange(d ? toDateString(d) : "");
                        setStartDateOpen(false);
                      }}
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
              <FormLabel>{t("categoryLabel")}</FormLabel>
              <div className="flex items-center gap-2">
                <Select
                  value={
                    field.value !== undefined ? String(field.value) : "none"
                  }
                  onValueChange={(v) =>
                    field.onChange(v === "none" ? undefined : Number(v))
                  }
                >
                  <FormControl>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">{t("categoryNone")}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        <DynamicIcon
                          name={
                            cat.icon ? `${cat.icon}` : "circle-question-mark"
                          }
                          fallback={() => <CircleQuestionMarkIcon />}
                          size={16}
                        />
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
                <FormLabel>{t("logoUrlLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("logoUrlPlaceholder")} {...field} />
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
                <FormLabel>{t("websiteUrlLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("websiteUrlPlaceholder")} {...field} />
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
              <FormLabel>{t("descriptionLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("descriptionPlaceholder")}
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
              <FormLabel>{t("notesLabel")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("notesPlaceholder")}
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
              ? t("addButtonLoading")
              : t("saveButtonLoading")
            : mode === "create"
              ? t("addButton")
              : t("saveButton")}
        </Button>
      </form>
    </Form>
  );
}
