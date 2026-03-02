"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import { authClient } from "@/lib/auth-client";

function CheckEmailResetContent() {
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
        toast.error(error.message ?? "Failed to resend reset email");
      } else {
        toast.success("Reset email sent — check your inbox");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl tracking-tight">
          Check your email
        </h1>
        <p className="text-muted-foreground text-sm">
          We sent a password reset link to
        </p>
      </div>

      {email && (
        <p className="bg-muted rounded-md px-3 py-2 text-sm font-medium">
          {email}
        </p>
      )}

      <p className="text-muted-foreground text-sm">
        Click the link in the email to reset your password. The link expires in
        1 hour.
      </p>

      <Button
        variant="outline"
        onClick={handleResend}
        disabled={isSending || !email}
      >
        {isSending ? "Sending…" : "Resend email"}
      </Button>

      <Link
        href="/login"
        className="text-muted-foreground text-center text-sm hover:underline"
      >
        Back to sign in
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
