import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { formatPercent } from "@/lib/bicim";
import { YONLER } from "@/lib/metinler";
import { cn } from "@/lib/utils";

export type Factor = {
  feature?: string;
  label: string;
  direction: "olumlu" | "olumsuz";
  impact: number;
};

/** Horizontal bars, strongest factor first. Direction is shown by icon and text, not colour alone. */
export function FactorBars({ factors }: { factors: Factor[] }) {
  const strongest = Math.max(...factors.map((f) => f.impact), 0.0001);

  return (
    <ul className="space-y-4">
      {factors.map((factor) => {
        const positive = factor.direction === "olumlu";
        const Icon = positive ? ArrowUpRight : ArrowDownRight;
        return (
          <li key={factor.feature ?? factor.label}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{factor.label}</span>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 text-xs font-medium",
                  positive ? "text-success" : "text-danger",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                {YONLER[factor.direction]}
                <span className="figures text-muted-foreground">
                  · {formatPercent(factor.impact)}
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2 rounded-full bg-muted" aria-hidden>
              <div
                className={cn("h-full rounded-full", positive ? "bg-success" : "bg-danger")}
                style={{ width: `${Math.max((factor.impact / strongest) * 100, 3)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
