"use client";

import { useQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, queryKeys, type MetricSet } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/bicim";
import { MODEL_KARTI } from "@/lib/metinler";

const METRIC_ROWS: Array<keyof typeof MODEL_KARTI.metrikler.satirlar> = [
  "roc_auc",
  "pr_auc",
  "f1",
  "precision",
  "recall",
  "brier",
  "n",
];

function metric(set: MetricSet, key: keyof MetricSet): string {
  // Metrics always show three decimals so the columns read evenly (0,940 rather than 0,94).
  return key === "n" ? formatNumber(set[key]) : formatNumber(set[key], 3, 3);
}

/** Live facts about the active model, read from the backend so the page never goes stale. */
export function ModelFacts() {
  const t = MODEL_KARTI;
  const query = useQuery({ queryKey: queryKeys.model, queryFn: api.model, staleTime: Infinity });

  if (query.isPending) {
    return (
      <div aria-busy className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  if (query.isError) {
    return <ErrorState title={t.yuklenemedi} error={query.error} onRetry={() => query.refetch()} />;
  }

  const model = query.data;
  const facts: Array<[string, string]> = [
    [t.ozet.surum, model.model_version],
    [t.ozet.algoritma, "XGBoost"],
    [t.ozet.egitim, formatDate(model.trained_at)],
    [t.ozet.veri, formatNumber(model.training_rows)],
    [t.ozet.esik, formatNumber(model.threshold, 3)],
  ];

  return (
    <>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border bg-card p-5 sm:grid-cols-3 lg:grid-cols-5">
        {facts.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-heading font-bold figures">{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-2xl font-bold">{t.metrikler.baslik}</h2>
      <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{t.metrikler.aciklama}</p>
      <div className="mt-5 overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.metrikler.sutunlar.metrik}</TableHead>
              <TableHead className="text-right">{t.metrikler.sutunlar.genel}</TableHead>
              <TableHead className="text-right">{t.metrikler.sutunlar.altGrup}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {METRIC_ROWS.map((key) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{t.metrikler.satirlar[key]}</TableCell>
                <TableCell className="text-right figures">
                  {metric(model.metrics.overall, key)}
                </TableCell>
                <TableCell className="text-right font-semibold figures">
                  {metric(model.metrics.no_default, key)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
