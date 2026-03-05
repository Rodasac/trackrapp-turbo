"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  useDeactivateSubscription,
  useDeleteSubscription,
} from "@/hooks/use-subscription-mutations";

interface DeleteSubscriptionDialogProps {
  subscriptionId: number;
  subscriptionName: string;
  onDelete?: () => void;
  onDeactivate?: () => void;
  /** If provided, the dialog trigger is replaced with this element */
  trigger?: React.ReactNode;
}

export function DeleteSubscriptionDialog({
  subscriptionId,
  subscriptionName,
  onDelete,
  onDeactivate,
  trigger,
}: DeleteSubscriptionDialogProps) {
  const t = useTranslations("subscriptions.deleteDialog");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deactivate = useDeactivateSubscription();
  const hardDelete = useDeleteSubscription();

  const pending = deactivate.isPending || hardDelete.isPending;

  async function handleDeactivate() {
    try {
      await deactivate.mutateAsync(subscriptionId);
      toast.success(t("deactivatedToast"));
      setOpen(false);
      onDeactivate?.();
    } catch {
      toast.error(t("failedToDeactivateToast"));
    }
  }

  async function handleDelete() {
    try {
      await hardDelete.mutateAsync(subscriptionId);
      toast.success(t("deletedToast"));
      setOpen(false);
      onDelete?.();
      router.push("/subscriptions");
    } catch {
      toast.error(t("failedToDeleteToast"));
    }
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("description", { name: subscriptionName })}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">{t("deactivateTitle")}</p>
            <p className="text-muted-foreground mt-0.5">
              {t("deactivateDescription")}
            </p>
          </div>
          <div className="rounded-md border border-destructive/30 p-3 text-sm">
            <p className="text-destructive font-medium">{t("deleteTitle")}</p>
            <p className="text-muted-foreground mt-0.5">
              {t("deleteDescription")}
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              {t("cancelButton")}
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeactivate}
              disabled={pending}
            >
              {deactivate.isPending ? t("deactivateButtonLoading") : t("deactivateButton")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {hardDelete.isPending ? t("deleteButtonLoading") : t("deleteButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
