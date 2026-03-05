"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Separator } from "@repo/ui/separator";
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
import { Skeleton } from "@repo/ui/skeleton";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth-client";
import { useAccountProvider } from "@/hooks/use-account-provider";
import { useUpdateProfile } from "@/hooks/use-profile-mutations";
import { AvatarUpload } from "@/components/avatar-upload";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ChangeEmailForm } from "@/components/change-email-form";
import {
  createProfileFormSchema,
  type ProfileFormValues,
} from "@repo/shared/validations";

export function ProfileForm() {
  const t = useTranslations("settings.profile");
  const tv = useTranslations("validation");
  const { data: sessionData, isPending: sessionLoading } = useSession();
  const { data: providerData, isLoading: providerLoading } =
    useAccountProvider();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();
  const [showChangeEmail, setShowChangeEmail] = useState(false);

  const user = sessionData?.user;
  const isLoading = sessionLoading || providerLoading;
  const isCredentialUser = providerData?.provider === "credential";

  const schema = useMemo(
    () => createProfileFormSchema({ nameRequired: tv("nameRequired") }),
    [tv],
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", image: undefined },
  });

  // Pre-populate name from session once loaded
  useEffect(() => {
    if (user) {
      form.reset({ name: user.name ?? "", image: user.image ?? undefined });
    }
  }, [user, form]);

  async function handleAvatarUpload(url: string) {
    try {
      await updateProfile({
        name: form.getValues("name") || user?.name || "",
        image: url,
      });
      toast.success(t("photoUpdatedToast"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("failedToSavePhotoToast"),
      );
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    try {
      await updateProfile({
        name: values.name,
        image: user?.image ?? undefined,
      });
      toast.success(t("profileSavedToast"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("failedToSaveProfileToast"),
      );
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="animate-pulse h-20 w-20 rounded-full" />
          <Skeleton className="animate-pulse h-8 w-28 rounded-md" />
        </div>
        <Skeleton className="animate-pulse h-10 w-full rounded-md" />
        <Skeleton className="animate-pulse h-10 w-32 rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <AvatarUpload
        image={user?.image}
        name={user?.name ?? ""}
        onUploadComplete={handleAvatarUpload}
      />

      {/* Name + Save */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <Button type="submit" disabled={isPending}>
            {isPending ? t("saveButtonLoading") : t("saveButton")}
          </Button>
        </form>
      </Form>

      {/* Email section */}
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{t("emailSectionTitle")}</h3>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
          {isCredentialUser && !showChangeEmail && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowChangeEmail(true)}
            >
              {t("changeEmailButton")}
            </Button>
          )}
        </div>
        {showChangeEmail && <ChangeEmailForm />}
      </div>

      {/* Password section — only for email/password users */}
      {isCredentialUser && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("changePasswordTitle")}</h3>
            <ChangePasswordForm />
          </div>
        </>
      )}
    </div>
  );
}
