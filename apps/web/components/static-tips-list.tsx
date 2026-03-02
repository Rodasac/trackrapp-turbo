"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Lightbulb, AlertTriangle, TrendingDown, Info } from "lucide-react";
import { useStaticTips } from "@/hooks/use-static-tips";
import type { StaticTip } from "@/lib/types/api";

const typeConfig = {
  savings: {
    icon: TrendingDown,
    badgeVariant: "default" as const,
    label: "Savings",
    className: "text-green-600 dark:text-green-400",
  },
  warning: {
    icon: AlertTriangle,
    badgeVariant: "destructive" as const,
    label: "Warning",
    className: "text-amber-600 dark:text-amber-400",
  },
  info: {
    icon: Info,
    badgeVariant: "secondary" as const,
    label: "Info",
    className: "text-blue-600 dark:text-blue-400",
  },
} satisfies Record<
  StaticTip["type"],
  {
    icon: React.ComponentType<{ className?: string }>;
    badgeVariant: "default" | "destructive" | "secondary";
    label: string;
    className: string;
  }
>;

interface TipItemProps {
  tip: StaticTip;
}

function TipItem({ tip }: TipItemProps) {
  const config = typeConfig[tip.type];
  const Icon = config.icon;

  return (
    <li className="flex gap-3 rounded-lg border p-3">
      <Icon className={`mt-0.5 size-4 shrink-0 ${config.className}`} />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{tip.title}</span>
          <Badge variant={config.badgeVariant} className="text-xs">
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{tip.message}</p>
      </div>
    </li>
  );
}

export function StaticTipsList() {
  const { data: tips, isLoading } = useStaticTips();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4" />
          Spending insights
        </CardTitle>
        <CardDescription>
          These info and tips are generated based on common financial advice and
          are not personalized.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tips && tips.length > 0 ? (
          <ul className="space-y-2" data-testid="tips-list">
            {tips.map((tip) => (
              <TipItem key={tip.id} tip={tip} />
            ))}
          </ul>
        ) : (
          <p
            className="text-center text-sm text-muted-foreground"
            data-testid="tips-empty"
          >
            No insights yet — add more subscriptions to get personalized tips.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
