"use client";

import { Suspense, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
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
import { signUp } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { createStrongPasswordSchema } from "@repo/shared";
import { useTranslations } from "next-intl";

type FormValues = { name: string; email: string; password: string };

function SignupForm() {
  const t = useTranslations("auth.signup");
  const tGoogle = useTranslations("auth.google");
  const tv = useTranslations("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, tv("nameMin2")),
        email: z.string().email(tv("emailInvalid")),
        password: createStrongPasswordSchema({
          minLength: tv("passwordMin8"),
          uppercase: tv("passwordUppercase"),
          lowercase: tv("passwordLowercase"),
          number: tv("passwordNumber"),
          symbol: tv("passwordSymbol"),
        }),
      }),
    [tv],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    const { error } = await signUp.email(values);
    if (error) {
      toast.error(error.message ?? t("signUpFailure"));
    } else {
      if (plan === "pro") {
        localStorage.setItem("pending_trial", "pro");
      }
      toast.success(t("signUpSuccess"));
      router.push(`/check-email?email=${encodeURIComponent(values.email)}`);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("nameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("namePlaceholder")}
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("passwordPlaceholder")}
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
            {form.formState.isSubmitting
              ? t("signUpButtonLoading")
              : t("signUpButton")}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("orDivider")}
          </span>
        </div>
      </div>

      <GoogleSignInButton label={tGoogle("signUpWithGoogle")} />

      <p className="text-muted-foreground text-center text-sm">
        {t("haveAccountPrompt")}{" "}
        <Link
          href="/login"
          className="text-foreground font-medium hover:underline"
        >
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
