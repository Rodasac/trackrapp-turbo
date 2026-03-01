"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { authClient } from "@/lib/auth-client";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isSending, setIsSending] = useState(false);

  async function handleResend() {
    if (!email) return;
    setIsSending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/dashboard",
      });
      if (error) {
        toast.error(error.message ?? "Failed to resend verification email");
      } else {
        toast.success("Verification email sent");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>We sent a verification link to</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {email && (
          <p className="bg-muted rounded-md px-3 py-2 text-sm font-medium">
            {email}
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          Click the link in the email to verify your account and sign in.
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
      </CardContent>
    </Card>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}
