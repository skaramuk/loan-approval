import type { Metadata } from "next";

import { ModelFacts } from "@/components/model-card";
import { ALANLAR, MODEL_KARTI } from "@/lib/metinler";

export const metadata: Metadata = {
  title: MODEL_KARTI.baslik,
  description: MODEL_KARTI.altBaslik,
};

const INPUTS = Object.values(ALANLAR).map((label) => label.replace(/\?$/, ""));

function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default function ModelCardPage() {
  const t = MODEL_KARTI;
  return (
    <>
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.baslik}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{t.altBaslik}</p>

      <div className="mt-8">
        <ModelFacts />
      </div>

      <Prose title={t.nasil.baslik}>
        {t.nasil.paragraflar.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </Prose>

      <Prose title={t.sinirlar.baslik}>
        <ul className="list-disc space-y-2 pl-5">
          {t.sinirlar.liste.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Prose>

      <Prose title={t.adalet.baslik}>
        {t.adalet.paragraflar.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </Prose>

      <Prose title={t.girdiler.baslik}>
        <p>{t.girdiler.aciklama}</p>
        <ul className="grid list-disc gap-x-8 gap-y-1.5 pl-5 sm:grid-cols-2">
          {INPUTS.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <p className="font-medium text-foreground">{t.girdiler.haric}</p>
      </Prose>
    </>
  );
}
