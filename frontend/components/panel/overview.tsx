"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { NewPredictionButton, PredictionRows, RowsSkeleton } from "@/components/panel/history";
import { Disclaimer, PageHeading } from "@/components/site-chrome";
import { EmptyState, ErrorState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api, queryKeys } from "@/lib/api";
import { formatNumber, formatPercent } from "@/lib/bicim";
import { GECMIS, OZET } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";

const RECENT = { page: 1, pageSize: 5 };
const APPROVED = { page: 1, pageSize: 1, approved: true };

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 font-heading text-4xl font-bold figures">{value}</div>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function Overview({ greeting }: { greeting: React.ReactNode }) {
  const recent = useQuery({
    queryKey: queryKeys.predictionList(RECENT),
    queryFn: () => api.listPredictions(RECENT),
  });
  // The approved total comes from the list endpoint's count; no extra backend endpoint needed.
  const approved = useQuery({
    queryKey: queryKeys.predictionList(APPROVED),
    queryFn: () => api.listPredictions(APPROVED),
  });

  const total = recent.data?.total;
  const approvedTotal = approved.data?.total;
  const ready = total !== undefined && approvedTotal !== undefined;

  return (
    <>
      <PageHeading
        title={OZET.baslik}
        description={greeting}
        action={<NewPredictionButton />}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Stat
          label={OZET.toplam}
          value={total === undefined ? <Skeleton className="h-10 w-16" /> : formatNumber(total)}
        />
        <Stat
          label={OZET.onayOrani}
          value={
            !ready ? <Skeleton className="h-10 w-20" /> : total === 0 ? "—" : formatPercent(approvedTotal / total)
          }
          hint={
            !ready
              ? undefined
              : total === 0
                ? OZET.onayOraniBos
                : OZET.onayOraniAciklama(approvedTotal, total)
          }
        />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{OZET.sonTahminler}</h2>
          {total ? (
            <Button asChild variant="ghost">
              <Link href={ROUTES.gecmis}>
                {OZET.tumunuGor}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="mt-4">
          {recent.isPending ? (
            <RowsSkeleton rows={3} />
          ) : recent.isError ? (
            <ErrorState title={GECMIS.yuklenemedi} error={recent.error} onRetry={() => recent.refetch()} />
          ) : recent.data.items.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={OZET.ilk.baslik}
              description={OZET.ilk.aciklama}
              action={<NewPredictionButton />}
            />
          ) : (
            <PredictionRows items={recent.data.items} />
          )}
        </div>
      </section>

      <Disclaimer className="mt-10" />
    </>
  );
}
