import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  Gauge,
  History,
  ListChecks,
  ScanSearch,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { DecisionBadge } from "@/components/prediction/decision-badge";
import { FactorBars, type Factor } from "@/components/prediction/factor-bars";
import { ProbabilityMeter } from "@/components/prediction/probability-meter";
import { SiteFooter, SiteHeader, SkipLink } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { SONUC, TANITIM, TASARIM, UYARILAR } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";

const FEATURE_ICONS: LucideIcon[] = [ListChecks, Gauge, History, Eye];

const SAMPLE_FACTORS: Factor[] = TASARIM.sonuc.ornekFaktorler.map((f) => ({
  label: f.etiket,
  direction: f.yon,
  impact: f.etki,
}));

function SampleResult() {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-lg shadow-primary/5 sm:p-6">
      <DecisionBadge band="yuksek" size="lg" />
      <div className="mt-5">
        <ProbabilityMeter probability={0.78} threshold={0.46} band="yuksek" />
      </div>
      <div className="mt-6 border-t pt-5">
        <p className="mb-4 font-heading font-semibold">{SONUC.faktorler}</p>
        <FactorBars factors={SAMPLE_FACTORS} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = TANITIM;

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="icerik">
        {/* Hero */}
        <section className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">
              <ScanSearch className="size-4" aria-hidden />
              {t.rozet}
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-6xl">
              {t.baslik}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              {t.altBaslik}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ROUTES.kayit}>
                  {t.cta}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={ROUTES.model}>{t.ctaIkincil}</Link>
              </Button>
            </div>
            <ul className="mt-7 space-y-2 text-sm text-muted-foreground">
              {t.guven.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div aria-label={t.ornek.baslik} role="img" className="mx-auto w-full max-w-md lg:max-w-none">
            <SampleResult />
            <p className="mt-3 text-center text-xs text-muted-foreground">{t.ornek.aciklama}</p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y bg-muted/40">
          <div className="container-page py-14 sm:py-20">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.nasil.baslik}</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {t.nasil.adimlar.map((step, index) => (
                <li key={step.baslik}>
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground figures">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{step.baslik}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{step.aciklama}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Features */}
        <section className="container-page py-14 sm:py-20">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">{t.ozellikler.baslik}</h2>
          <ul className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {t.ozellikler.liste.map((feature, index) => {
              const Icon = FEATURE_ICONS[index];
              return (
                <li key={feature.baslik} className="flex gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{feature.baslik}</h3>
                    <p className="mt-1 leading-relaxed text-muted-foreground">{feature.aciklama}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* FAQ */}
        <section className="border-t bg-muted/40">
          <div className="container-page grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_2fr]">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">{t.sss.baslik}</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {UYARILAR.onDegerlendirme}
              </p>
            </div>
            <div className="divide-y rounded-2xl border bg-card">
              {t.sss.sorular.map((item) => (
                <details key={item.soru} className="group px-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading font-semibold [&::-webkit-details-marker]:hidden">
                    {item.soru}
                    <ChevronDown
                      className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <p className="pb-5 leading-relaxed text-muted-foreground">{item.cevap}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="container-page py-14 sm:py-20">
          <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
            <h2 className="text-3xl font-bold sm:text-4xl">{t.son.baslik}</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">{t.son.aciklama}</p>
            <Button asChild size="lg" variant="secondary" className="mt-7">
              <Link href={ROUTES.kayit}>
                {t.cta}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
