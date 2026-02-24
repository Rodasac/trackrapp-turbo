"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const deactivate = useDeactivateSubscription();
  const hardDelete = useDeleteSubscription();

  const pending = deactivate.isPending || hardDelete.isPending;

  async function handleDeactivate() {
    try {
      await deactivate.mutateAsync(subscriptionId);
      toast.success("Subscription deactivated");
      setOpen(false);
      onDeactivate?.();
    } catch {
      toast.error("Failed to deactivate");
    }
  }

  async function handleDelete() {
    try {
      await hardDelete.mutateAsync(subscriptionId);
      toast.success("Subscription deleted");
      setOpen(false);
      onDelete?.();
      router.push("/subscriptions");
    } catch {
      toast.error("Failed to delete");
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
            <DialogTitle>Remove subscription?</DialogTitle>
            <DialogDescription>
              Choose how to remove &ldquo;{subscriptionName}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">Deactivate</p>
            <p className="text-muted-foreground mt-0.5">
              Hides it from your active list but keeps history.
            </p>
          </div>
          <div className="rounded-md border border-destructive/30 p-3 text-sm">
            <p className="text-destructive font-medium">Delete permanently</p>
            <p className="text-muted-foreground mt-0.5">
              Removes all data including price history. This cannot be undone.
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleDeactivate}
              disabled={pending}
            >
              {deactivate.isPending ? "Deactivating…" : "Deactivate"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
            >
              {hardDelete.isPending ? "Deleting…" : "Delete permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
