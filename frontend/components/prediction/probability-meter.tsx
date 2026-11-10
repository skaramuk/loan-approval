import type { Band } from "@/components/prediction/decision-badge";
import { formatPercent } from "@/lib/bicim";
import { SONUC } from "@/lib/metinler";
import { cn } from "@/lib/utils";

const FILL: Record<Band, string> = {
  yuksek: "bg-success",
  sinirda: "bg-warning",
  dusuk: "bg-danger",
};

/** Probability as a large figure plus a bar with the decision threshold marked on it. */
export function ProbabilityMeter({
  probability,
  threshold,
  band,
}: {
  probability: number;
  threshold: number;
  band: Band;
}) {
  const labels = SONUC;
  const percent = Math.round(probability * 100);
  const thresholdPercent = Math.round(threshold * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted-foreground">{labels.olasilik}</span>
        <span className="font-heading text-5xl font-bold figures tracking-tight">
          {formatPercent(probability)}
        </span>
      </div>

      <div
        role="meter"
        aria-label={labels.olasilik}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${formatPercent(probability)} — ${labels.esik}: ${formatPercent(threshold)}`}
        className="relative mt-4 h-3 rounded-full bg-muted"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", FILL[band])}
          style={{ width: `${Math.max(percent, 2)}%` }}
        />
        <div
          className="absolute -top-1.5 h-6 w-0.5 rounded-full bg-foreground"
          style={{ left: `${thresholdPercent}%` }}
          aria-hidden
        />
      </div>

      <div className="relative mt-2 h-5 text-xs text-muted-foreground" aria-hidden>
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap figures"
          style={{ left: `clamp(3rem, ${thresholdPercent}%, calc(100% - 3rem))` }}
        >
          {labels.esik} {formatPercent(threshold)}
        </span>
      </div>
    </div>
  );
}
