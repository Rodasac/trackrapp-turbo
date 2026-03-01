"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { useChangeEmail } from "@/hooks/use-change-email";
import {
  changeEmailSchema,
  type ChangeEmailValues,
} from "@repo/shared/validations";

export function ChangeEmailForm() {
  const { mutateAsync: changeEmail, isPending } = useChangeEmail();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "" },
  });

  async function onSubmit(values: ChangeEmailValues) {
    try {
      await changeEmail({ newEmail: values.newEmail });
      setSentTo(values.newEmail);
      form.reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send change email request",
      );
    }
  }

  if (sentTo) {
    return (
      <p className="text-sm" role="status">
        Verification email sent to <strong>{sentTo}</strong>. Click the link in
        the email to confirm your new address.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New email address</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="new@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending…" : "Send verification email"}
        </Button>
      </form>
    </Form>
  );
}
