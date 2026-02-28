"use client";

import { useRef } from "react";
import Image from "next/image";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@repo/ui/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";

interface AvatarUploadProps {
  image?: string | null;
  name: string;
  onUploadComplete: (url: string) => void;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function AvatarUpload({
  image,
  name,
  onUploadComplete,
  className,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("avatarUploader");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await startUpload([file]);
      const url = result?.[0]?.ufsUrl;
      if (url) {
        onUploadComplete(url);
      }
    } catch {
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      // Reset input so the same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Avatar circle */}
      <div className="relative">
        <div className="bg-muted relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background ring-border">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-muted-foreground text-xl font-semibold select-none">
              {getInitials(name)}
            </span>
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload avatar"
      />

      {/* Trigger button */}
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
        aria-label={isUploading ? "Uploading…" : "Change photo"}
      >
        <Camera className="h-3.5 w-3.5" />
        {isUploading ? "Uploading…" : "Change photo"}
      </button>
    </div>
  );
}
