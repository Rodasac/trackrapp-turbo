"use client";

import { Link } from "@/i18n/navigation";
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
import { useMemo } from "react";
import { useTranslations } from "next-intl";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const tv = useTranslations("validation");

  const schema = useMemo(
    () => z.object({ email: z.string().email(tv("emailInvalid")) }),
    [tv],
  );
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await authClient.requestPasswordReset({
      email: values.email,
      redirectTo: `${origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message ?? t("failedToSendEmail"));
    } else {
      router.push(
        `/check-email-reset?email=${encodeURIComponent(values.email)}`,
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    autoComplete="email"
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
              ? t("sendResetButtonLoading")
              : t("sendResetButton")}
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
