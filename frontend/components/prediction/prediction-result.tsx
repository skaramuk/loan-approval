import { TriangleAlert } from "lucide-react";

import { DecisionBadge } from "@/components/prediction/decision-badge";
import { FactorBars } from "@/components/prediction/factor-bars";
import { ProbabilityMeter } from "@/components/prediction/probability-meter";
import { Disclaimer } from "@/components/site-chrome";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Prediction } from "@/lib/api";
import { ALANLAR, SONUC, UYARILAR } from "@/lib/metinler";

const TOP_FACTORS = 6;

function fieldLabel(name: string): string {
  // "Yıllık gelir (USD)" -> "Yıllık gelir": units are noise inside a sentence.
  const label = ALANLAR[name as keyof typeof ALANLAR] ?? name;
  return label.replace(/\s*\(.*\)$/, "").replace(/\?$/, "");
}

export function PredictionResult({ prediction }: { prediction: Prediction }) {
  const { band, probability, threshold, approved, factors, low_confidence_fields } = prediction;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <DecisionBadge band={band} size="lg" className="w-fit" />
            <CardDescription className="pt-2 text-base">{SONUC.aciklama[band]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProbabilityMeter probability={probability} threshold={threshold} band={band} />
            <p className="text-sm font-medium">{approved ? SONUC.karar.onay : SONUC.karar.ret}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2 className="text-lg">{SONUC.faktorler}</h2>
            </CardTitle>
            <CardDescription>{UYARILAR.faktorler}</CardDescription>
          </CardHeader>
          <CardContent>
            <FactorBars factors={factors.slice(0, TOP_FACTORS)} />
          </CardContent>
        </Card>
      </div>

      {low_confidence_fields.length > 0 ? (
        <Alert>
          <TriangleAlert aria-hidden />
          <AlertTitle>{SONUC.dusukGuvenBaslik}</AlertTitle>
          <AlertDescription>
            {SONUC.dusukGuvenAciklama(low_confidence_fields.map(fieldLabel).join(", "))}
          </AlertDescription>
        </Alert>
      ) : null}

      <Disclaimer />
    </div>
  );
}
