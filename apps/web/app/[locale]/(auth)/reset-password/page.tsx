"use client";

import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl tracking-tight">{t("invalidLinkHeading")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("invalidLinkDescription")}
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-foreground font-medium hover:underline text-sm"
        >
          {t("requestNewLink")}
        </Link>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    const { error } = await authClient.resetPassword({
      newPassword: values.newPassword,
      token: token ?? undefined,
    });
    if (error) {
      toast.error(error.message ?? t("failedToResetPassword"));
    } else {
      toast.success(t("resetPasswordSuccess"));
      router.push("/login");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl tracking-tight">
          {t("heading")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("description")}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("newPasswordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("newPasswordPlaceholder")}
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("confirmPasswordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("confirmPasswordPlaceholder")}
                    autoComplete="new-password"
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
            {form.formState.isSubmitting ? t("resetPasswordButtonLoading") : t("resetPasswordButton")}
          </Button>
        </form>
      </Form>

      <Link
        href="/login"
        className="text-muted-foreground text-center text-sm hover:underline"
      >
        {t("backToSignIn")}
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
