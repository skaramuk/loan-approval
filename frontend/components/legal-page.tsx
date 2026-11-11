import { TriangleAlert } from "lucide-react";

import { YASAL } from "@/lib/metinler";

type Section = { baslik: string; paragraflar: readonly string[] };

export function LegalPage({ title, sections }: { title: string; sections: readonly Section[] }) {
  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{YASAL.guncelleme}</p>
      <p className="mt-5 flex gap-2 rounded-lg border border-warning/40 bg-warning-soft px-3.5 py-3 text-sm">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        {YASAL.taslak}
      </p>
      {sections.map((section) => (
        <section key={section.baslik} className="mt-10">
          <h2 className="text-xl font-bold">{section.baslik}</h2>
          <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
            {section.paragraflar.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
