import { Compass } from "lucide-react";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { HATALAR } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  const t = HATALAR.sayfaBulunamadi;
  return (
    <>
      <SiteHeader />
      <main className="container-page flex-1 py-16">
        <h1 className="sr-only">{t.baslik}</h1>
        <EmptyState
          icon={Compass}
          title={t.baslik}
          description={t.aciklama}
          action={
            <Button asChild>
              <Link href={ROUTES.anaSayfa}>{t.don}</Link>
            </Button>
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
