"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, FileSearch, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { DecisionBadge } from "@/components/prediction/decision-badge";
import { PredictionResult } from "@/components/prediction/prediction-result";
import { PageHeading } from "@/components/site-chrome";
import { EmptyState, ErrorState } from "@/components/states";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, ApiError, queryKeys, type PredictionListItem } from "@/lib/api";
import { formatDate, formatNumber, formatPercent, formatUsd } from "@/lib/bicim";
import { ALANLAR, FORM, GECMIS, HATALAR, NAV, SECENEKLER, SONUC } from "@/lib/metinler";
import { gecmisDetay, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;
type Filter = "tumu" | "onay" | "ret";
const FILTERS: Filter[] = ["tumu", "onay", "ret"];

function intentLabel(value: string): string {
  return (SECENEKLER.loan_intent as Record<string, string>)[value] ?? value;
}

export function NewPredictionButton() {
  return (
    <Button asChild>
      <Link href={ROUTES.yeni}>
        <Plus aria-hidden />
        {NAV.yeni}
      </Link>
    </Button>
  );
}

/** Rows as a table on wide screens and as cards on phones. */
export function PredictionRows({ items }: { items: PredictionListItem[] }) {
  return (
    <>
      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={gecmisDetay(item.id)}
              className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-lg font-bold figures">{formatUsd(item.loan_amnt)}</p>
                  <p className="text-sm text-muted-foreground">{intentLabel(item.loan_intent)}</p>
                </div>
                <DecisionBadge band={item.band} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                <span className="font-medium text-foreground figures">
                  {formatPercent(item.probability)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{GECMIS.sutunlar.tarih}</TableHead>
              <TableHead className="text-right">{GECMIS.sutunlar.tutar}</TableHead>
              <TableHead>{GECMIS.sutunlar.amac}</TableHead>
              <TableHead className="text-right">{GECMIS.sutunlar.olasilik}</TableHead>
              <TableHead>{GECMIS.sutunlar.sonuc}</TableHead>
              <TableHead>
                <span className="sr-only">{GECMIS.goruntule}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <time dateTime={item.created_at}>{formatDate(item.created_at)}</time>
                </TableCell>
                <TableCell className="text-right font-medium figures">
                  {formatUsd(item.loan_amnt)}
                </TableCell>
                <TableCell>{intentLabel(item.loan_intent)}</TableCell>
                <TableCell className="text-right figures">{formatPercent(item.probability)}</TableCell>
                <TableCell>
                  <DecisionBadge band={item.band} />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={gecmisDetay(item.id)}>{GECMIS.goruntule}</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-20 w-full md:h-12" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- list

export function HistoryList() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("tumu");
  const params = {
    page,
    pageSize: PAGE_SIZE,
    approved: filter === "tumu" ? undefined : filter === "onay",
  };
  const query = useQuery({
    queryKey: queryKeys.predictionList(params),
    queryFn: () => api.listPredictions(params),
    placeholderData: keepPreviousData,
  });

  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeading title={GECMIS.baslik} description={GECMIS.altBaslik} action={<NewPredictionButton />} />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={GECMIS.filtre.etiket} className="inline-flex rounded-lg border bg-card p-1">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
              className={cn(
                "h-9 rounded-md px-3.5 text-sm font-medium transition-colors",
                filter === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {GECMIS.filtre[value]}
            </button>
          ))}
        </div>
        {query.data ? (
          <p className="text-sm text-muted-foreground figures" aria-live="polite">
            {GECMIS.toplam(total)}
          </p>
        ) : null}
      </div>

      <div className={cn("mt-4", query.isPlaceholderData && "opacity-60")}>
        {query.isPending ? (
          <RowsSkeleton />
        ) : query.isError ? (
          <ErrorState title={GECMIS.yuklenemedi} error={query.error} onRetry={() => query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title={filter === "tumu" ? GECMIS.bos.baslik : GECMIS.bos.filtreli}
            description={filter === "tumu" ? GECMIS.bos.aciklama : undefined}
            action={filter === "tumu" ? <NewPredictionButton /> : undefined}
          />
        ) : (
          <PredictionRows items={query.data.items} />
        )}
      </div>

      {total > PAGE_SIZE ? (
        <nav className="mt-6 flex items-center justify-between gap-3" aria-label={GECMIS.baslik}>
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft aria-hidden />
            {GECMIS.onceki}
          </Button>
          <p className="text-sm text-muted-foreground figures">{GECMIS.sayfa(page, pageCount)}</p>
          <Button variant="outline" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
            {GECMIS.sonraki}
            <ChevronRight aria-hidden />
          </Button>
        </nav>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------- detail

export function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.prediction(id), queryFn: () => api.getPrediction(id) });

  const remove = useMutation({
    mutationFn: () => api.deletePrediction(id),
    onSuccess: () => {
      toast.success(GECMIS.sil.basarili);
      queryClient.removeQueries({ queryKey: queryKeys.prediction(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.predictions });
      router.replace(ROUTES.gecmis);
    },
    onError: (error) => toast.error(error.message),
  });

  const back = (
    <Button asChild variant="ghost" className="-ml-3">
      <Link href={ROUTES.gecmis}>
        <ArrowLeft aria-hidden />
        {SONUC.gecmis}
      </Link>
    </Button>
  );

  if (query.isPending) {
    return (
      <div aria-busy className="space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    const notFound = query.error instanceof ApiError && [404, 422].includes(query.error.status);
    return (
      <div className="space-y-4">
        {back}
        {notFound ? (
          <EmptyState icon={FileSearch} title={HATALAR.bulunamadi} action={<NewPredictionButton />} />
        ) : (
          <ErrorState title={GECMIS.yuklenemedi} error={query.error} onRetry={() => query.refetch()} />
        )}
      </div>
    );
  }

  const prediction = query.data;
  const input = prediction.input;
  const choice = (group: keyof typeof SECENEKLER, value: string) =>
    (SECENEKLER[group] as Record<string, string>)[value] ?? value;

  const rows: Array<[string, string]> = [
    [ALANLAR.person_age, formatNumber(input.person_age)],
    [ALANLAR.person_education, choice("person_education", input.person_education)],
    [ALANLAR.person_income, formatUsd(input.person_income)],
    [ALANLAR.person_emp_exp, formatNumber(input.person_emp_exp)],
    [ALANLAR.person_home_ownership, choice("person_home_ownership", input.person_home_ownership)],
    [ALANLAR.loan_amnt, formatUsd(input.loan_amnt)],
    [ALANLAR.loan_intent, choice("loan_intent", input.loan_intent)],
    [ALANLAR.loan_int_rate, formatPercent(input.loan_int_rate / 100, 2)],
    [ALANLAR.loan_percent_income, formatPercent(input.loan_percent_income)],
    [ALANLAR.cb_person_cred_hist_length, formatNumber(input.cb_person_cred_hist_length)],
    [ALANLAR.credit_score, formatNumber(input.credit_score)],
    [
      ALANLAR.previous_loan_defaults_on_file,
      input.previous_loan_defaults_on_file ? FORM.evet : FORM.hayir,
    ],
  ];

  return (
    <div>
      {back}
      <div className="mt-2">
        <PageHeading
          title={SONUC.baslik}
          description={`${formatDate(prediction.created_at)} · ${SONUC.modelSurumu(prediction.model_version)}`}
          action={
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={remove.isPending}>
                  <Trash2 aria-hidden />
                  {GECMIS.sil.dugme}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{GECMIS.sil.baslik}</AlertDialogTitle>
                  <AlertDialogDescription>{GECMIS.sil.aciklama}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{GECMIS.sil.vazgec}</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={() => remove.mutate()}>
                    {GECMIS.sil.onay}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
        />
      </div>

      <div className="mt-6 space-y-6">
        <PredictionResult prediction={prediction} />

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">{SONUC.girdiler}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 border-b py-2.5">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium figures">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
