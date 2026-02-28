"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CircleQuestionMarkIcon, icons, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/form";
import { Input } from "@repo/ui/input";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@repo/shared/validations";
import { useCreateCategory } from "@/hooks/use-subscription-mutations";
import type { Category } from "@repo/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { DynamicIcon, dynamicIconImports } from "lucide-react/dynamic";

interface AddCategoryDialogProps {
  onCreated: (category: Category) => void;
}

export function AddCategoryDialog({ onCreated }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const createCategory = useCreateCategory();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", color: "", icon: undefined },
  });

  async function onSubmit(values: CategoryFormValues) {
    try {
      const cat: Category = await createCategory.mutateAsync(values);
      onCreated(cat);
      setOpen(false);
      form.reset();
      toast.success("Category created");
    } catch {
      toast.error("Failed to create category");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Plus className="size-3" />
        New category
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Entertainment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (hex)</FormLabel>
                    <FormControl>
                      <Input placeholder="#6366f1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  //Select
                  <FormItem>
                    <FormLabel>Icon (name from lucide)</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select
                        value={
                          field.value !== undefined
                            ? String(field.value)
                            : "none"
                        }
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? undefined : v)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="No icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No icon</SelectItem>
                          {Object.keys(dynamicIconImports).map((cat) => (
                            <SelectItem key={cat} value={String(cat)}>
                              <DynamicIcon
                                name={cat as keyof typeof dynamicIconImports}
                                fallback={() => <CircleQuestionMarkIcon />}
                                size={16}
                              />
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
