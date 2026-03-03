"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { signIn, authClient } from "@/lib/auth-client";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setUnverifiedEmail(null);
    const { error } = await signIn.email(values);
    if (error) {
      if (error.message === "Email not verified") {
        setUnverifiedEmail(values.email);
      } else {
        toast.error(error.message ?? "Invalid email or password");
      }
    } else {
      router.push("/dashboard");
    }
  }

  async function handleResendVerification() {
    if (!unverifiedEmail) return;
    setIsResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email: unverifiedEmail,
        callbackURL: "/dashboard",
      });
      if (error) {
        toast.error(error.message ?? "Failed to resend verification email");
      } else {
        toast.success("Verification email sent");
      }
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and password to continue
        </p>
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
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
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground text-xs hover:text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {unverifiedEmail && (
            <div className="bg-muted rounded-md p-3 text-sm">
              <p className="font-medium">Please verify your email first.</p>
              <p className="text-muted-foreground mt-1">
                We sent a link to {unverifiedEmail}.
              </p>
              <Button
                type="button"
                variant="link"
                className="mt-1 h-auto p-0 text-sm"
                onClick={handleResendVerification}
                disabled={isResending}
              >
                {isResending ? "Sending…" : "Resend verification email"}
              </Button>
            </div>
          )}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="mt-1"
          >
            {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <GoogleSignInButton label="Sign in with Google" />

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-foreground font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>

      {process.env.NEXT_PUBLIC_APP_ENV === "development" && (
        <div className="bg-muted rounded-md p-3 text-sm">
          <p className="font-medium">Development mode</p>
          <p className="text-muted-foreground mt-1">
            This is a development environment.
          </p>
          <p>users:</p>
          <ul>
            <li>demo@trackrapp.local: Demo1234!</li>
            <li>demo-free@trackrapp.local: Demo1234!</li>
          </ul>
          <p>
            Demo mail server:{" "}
            <a
              href="https://mail-staging.trackrapp.xyz"
              rel="noopener noreferrer"
              target="_blank"
            >
              https://mail-staging.trackrapp.xyz
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
