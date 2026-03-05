"use client";

import { Suspense, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

function CheckEmailResetContent() {
  const t = useTranslations("auth.checkEmailReset");
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isSending, setIsSending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setIsSending(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${origin}/reset-password`,
      });
      if (error) {
        toast.error(error.message ?? t("failedToResendEmail"));
      } else {
        toast.success(t("resetEmailSent"));
      }
    } finally {
      setIsSending(false);
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

      {email && (
        <p className="bg-muted rounded-md px-3 py-2 text-sm font-medium">
          {email}
        </p>
      )}

      <p className="text-muted-foreground text-sm">
        {t("instructions")}
      </p>

      <Button
        variant="outline"
        onClick={handleResend}
        disabled={isSending || !email}
      >
        {isSending ? t("resendEmailButtonLoading") : t("resendEmailButton")}
      </Button>

      <Link
        href="/login"
        className="text-muted-foreground text-center text-sm hover:underline"
      >
        {t("backToSignIn")}
      </Link>
    </div>
  );
}

export default function CheckEmailResetPage() {
  return (
    <Suspense>
      <CheckEmailResetContent />
    </Suspense>
  );
}
