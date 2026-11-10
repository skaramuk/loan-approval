import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TASARIM, UYARILAR, UYGULAMA } from "@/lib/metinler";

// Placeholder until the landing page is built later in this phase.
export default function HomePage() {
  return (
    <main className="container-page flex flex-1 flex-col items-center justify-center py-16 text-center">
      <ShieldCheck className="size-10 text-primary" aria-hidden />
      <h1 className="mt-6 text-4xl font-extrabold sm:text-5xl">{UYGULAMA.ad}</h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">{UYGULAMA.aciklama}</p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/tasarim">{TASARIM.baslik}</Link>
      </Button>
      <p className="mt-10 max-w-md text-sm text-muted-foreground">{UYARILAR.onDegerlendirme}</p>
    </main>
  );
}
