import type { Metadata } from "next";

import { PredictionForm } from "@/components/prediction/prediction-form";
import { FORM } from "@/lib/metinler";

export const metadata: Metadata = { title: FORM.baslik };

export default function NewPredictionPage() {
  return <PredictionForm />;
}
