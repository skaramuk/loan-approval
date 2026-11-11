import { CircleAlert, CircleCheck, CircleX } from "lucide-react";

import { BANTLAR } from "@/lib/metinler";
import { cn } from "@/lib/utils";

export type Band = keyof typeof BANTLAR;

const STYLES: Record<Band, { icon: typeof CircleCheck; className: string }> = {
  yuksek: { icon: CircleCheck, className: "bg-success-soft text-success" },
  sinirda: { icon: CircleAlert, className: "bg-warning-soft text-warning" },
  dusuk: { icon: CircleX, className: "bg-danger-soft text-danger" },
};

/** The decision is carried by text and an icon; colour only reinforces it. */
export function DecisionBadge({
  band,
  size = "sm",
  className,
}: {
  band: Band;
  size?: "sm" | "lg";
  className?: string;
}) {
  const { icon: Icon, className: tone } = STYLES[band];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "lg" ? "px-3.5 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        tone,
        className,
      )}
    >
      <Icon className={size === "lg" ? "size-4" : "size-3.5"} aria-hidden />
      {size === "lg" ? BANTLAR[band].baslik : BANTLAR[band].kisa}
    </span>
  );
}
