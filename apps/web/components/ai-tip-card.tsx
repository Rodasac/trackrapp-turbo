"use client";

import {
  TrendingDown,
  AlertTriangle,
  Info,
  Scale,
  Sparkles,
} from "lucide-react";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/lib/utils";
import type { AiTipItem } from "@/lib/types/api";

const categoryConfig = {
  savings: {
    label: "Savings",
    icon: TrendingDown,
    borderColor: "border-l-emerald-500",
    iconColor: "text-emerald-500",
    badgeClass:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-500",
    badgeClass:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  info: {
    label: "Info",
    icon: Info,
    borderColor: "border-l-sky-500",
    iconColor: "text-sky-500",
    badgeClass: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  },
  comparison: {
    label: "Comparison",
    icon: Scale,
    borderColor: "border-l-violet-500",
    iconColor: "text-violet-500",
    badgeClass:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300",
  },
} as const;

interface AiTipCardProps {
  tip: AiTipItem;
  index?: number;
}

export function AiTipCard({ tip, index = 0 }: AiTipCardProps) {
  const config = categoryConfig[tip.category];
  const Icon = config.icon;

  const generatedDate = new Date(tip.generatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/20 bg-white/60 dark:bg-white/5",
        "backdrop-blur-xl shadow-sm",
        "border-l-4",
        config.borderColor,
        "p-5 flex flex-col gap-3",
        "animate-fade-in",
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={cn("size-4 shrink-0 mt-0.5", config.iconColor)} />
          <h3 className="font-semibold text-sm leading-snug text-foreground">
            {tip.title}
          </h3>
        </div>
        <Badge
          className={cn(
            "shrink-0 text-xs font-medium border-0",
            config.badgeClass,
          )}
        >
          {config.label}
        </Badge>
      </div>

      {/* Message */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {tip.message}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mt-auto pt-1 border-t border-white/10">
        <Sparkles className="size-3" />
        <span>Generated {generatedDate}</span>
      </div>
    </div>
  );
}
