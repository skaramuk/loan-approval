import { CircleAlert, FileSearch, Info, Plus, RotateCw, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

import { DecisionBadge } from "@/components/prediction/decision-badge";
import { FactorBars, type Factor } from "@/components/prediction/factor-bars";
import { ProbabilityMeter } from "@/components/prediction/probability-meter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ALANLAR, TASARIM, UYARILAR, UYGULAMA } from "@/lib/metinler";

export const metadata: Metadata = {
  title: TASARIM.baslik,
  robots: { index: false, follow: false },
};

const SWATCHES: Array<{ token: keyof typeof TASARIM.renkler; className: string }> = [
  { token: "background", className: "bg-background" },
  { token: "card", className: "bg-card" },
  { token: "primary", className: "bg-primary" },
  { token: "primary-soft", className: "bg-primary-soft" },
  { token: "muted", className: "bg-muted" },
  { token: "border", className: "bg-border" },
  { token: "success", className: "bg-success" },
  { token: "warning", className: "bg-warning" },
  { token: "danger", className: "bg-danger" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t py-10 first:border-t-0">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  const t = TASARIM;
  const factors = t.sonuc.ornekFaktorler.map(
    (f): Factor => ({ label: f.etiket, direction: f.yon, impact: f.etki }),
  );

  return (
    <div className="container-page py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-heading text-lg font-bold">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
            {UYGULAMA.ad}
          </p>
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{t.baslik}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t.altBaslik}</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="mt-8">
        <Section title={t.bolumler.renkler}>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {SWATCHES.map(({ token, className }) => (
              <li key={token}>
                <div className={`h-16 rounded-lg border ${className}`} />
                <p className="mt-2 text-xs font-medium">{t.renkler[token]}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{token}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.bolumler.tipografi}>
          <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-5">
              <p className="font-heading text-4xl leading-tight font-extrabold tracking-tight text-balance sm:text-5xl">
                {t.tipografi.baslik1}
              </p>
              <p className="font-heading text-2xl font-bold">{t.tipografi.baslik2}</p>
              <p className="font-heading text-lg font-semibold">{t.tipografi.baslik3}</p>
              <p className="max-w-prose text-base leading-relaxed">{t.tipografi.govde}</p>
              <p className="text-sm text-muted-foreground">{t.tipografi.kucuk}</p>
              <p className="text-2xl font-semibold figures">{t.tipografi.rakam}</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{t.tipografi.etiketler.baslik}</li>
              <li>{t.tipografi.etiketler.govde}</li>
              <li>{t.tipografi.etiketler.rakam}</li>
            </ul>
          </div>
        </Section>

        <Section title={t.bolumler.dugmeler}>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">
              <Plus aria-hidden />
              {t.dugmeler.birincil}
            </Button>
            <Button>{t.dugmeler.birincil}</Button>
            <Button variant="secondary">{t.dugmeler.ikincil}</Button>
            <Button variant="outline">{t.dugmeler.cerceveli}</Button>
            <Button variant="ghost">{t.dugmeler.hayalet}</Button>
            <Button variant="destructive">{t.dugmeler.tehlikeli}</Button>
            <Button disabled>{t.dugmeler.devreDisi}</Button>
          </div>
        </Section>

        <Section title={t.bolumler.form}>
          <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ornek-gelir">{ALANLAR.person_income}</Label>
              <Input
                id="ornek-gelir"
                inputMode="numeric"
                defaultValue={t.form.ornekGelir}
                aria-describedby="ornek-gelir-yardim"
                className="figures"
              />
              <p id="ornek-gelir-yardim" className="text-sm text-muted-foreground">
                {t.form.yardimGelir}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ornek-skor">{ALANLAR.credit_score}</Label>
              <Input
                id="ornek-skor"
                inputMode="numeric"
                defaultValue={t.form.ornekSkor}
                aria-invalid
                aria-describedby="ornek-skor-hata"
                className="figures"
              />
              <p
                id="ornek-skor-hata"
                className="flex items-center gap-1.5 text-sm font-medium text-danger"
              >
                <CircleAlert className="size-4" aria-hidden />
                {t.form.hataSkor}
              </p>
            </div>
          </div>
        </Section>

        <Section title={t.bolumler.sonuc}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <DecisionBadge band="sinirda" size="lg" className="w-fit" />
              </CardHeader>
              <CardContent className="space-y-6">
                <ProbabilityMeter probability={0.444} threshold={0.461} band="sinirda" />
                <Alert>
                  <Info aria-hidden />
                  <AlertDescription>{UYARILAR.onDegerlendirme}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.tipografi.baslik3}</CardTitle>
                <CardDescription>{UYARILAR.faktorler}</CardDescription>
              </CardHeader>
              <CardContent>
                <FactorBars factors={factors} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <DecisionBadge band="yuksek" size="lg" />
            <DecisionBadge band="sinirda" size="lg" />
            <DecisionBadge band="dusuk" size="lg" />
            <DecisionBadge band="yuksek" />
            <DecisionBadge band="sinirda" />
            <DecisionBadge band="dusuk" />
          </div>
        </Section>

        <Section title={t.bolumler.durumlar}>
          <div className="grid gap-6 md:grid-cols-3">
            <Card aria-busy aria-label={t.durumlar.yukleniyor}>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center py-4 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <FileSearch className="size-6" aria-hidden />
                </span>
                <p className="mt-4 font-heading font-semibold">{t.durumlar.bos}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.durumlar.bosAciklama}</p>
                <Button className="mt-4">
                  <Plus aria-hidden />
                  {t.dugmeler.birincil}
                </Button>
              </CardContent>
            </Card>

            <Alert variant="destructive" className="h-fit">
              <CircleAlert aria-hidden />
              <AlertTitle>{t.durumlar.hata}</AlertTitle>
              <AlertDescription>
                <p>{t.durumlar.hataAciklama}</p>
                <Button variant="outline" size="sm" className="mt-3">
                  <RotateCw aria-hidden />
                  {t.durumlar.tekrar}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </Section>
      </div>
    </div>
  );
}
