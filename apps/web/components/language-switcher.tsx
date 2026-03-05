"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/ui/dropdown-menu";
import { Check } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useUpdateUserPreferences } from "@/hooks/use-user-preferences";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
] as const;

// SSR/client detection via useSyncExternalStore
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const { data: session } = useSession();
  const update = useUpdateUserPreferences();

  if (!mounted) return null;

  async function handleLocaleChange(nextLocale: string) {
    // Persist to DB if user is authenticated
    if (session?.user) {
      try {
        await update.mutateAsync({ locale: nextLocale });
      } catch {
        // Non-fatal — navigate anyway
      }
    }
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-7 shrink-0">
          <Globe className="size-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ value, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => handleLocaleChange(value)}
            className="gap-2"
          >
            <Globe className="size-4" />
            {label}
            {locale === value && <Check className="ml-auto size-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
