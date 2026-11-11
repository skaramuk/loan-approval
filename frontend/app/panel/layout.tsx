import { Suspense } from "react";

import { PanelHeader } from "@/components/panel/panel-header";
import { SiteFooter, SkipLink } from "@/components/site-chrome";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      {/* The header highlights the current path, which is only known at request time. */}
      <Suspense fallback={<div className="h-[109px] border-b" aria-hidden />}>
        <PanelHeader />
      </Suspense>
      <main id="icerik" className="container-page flex-1 py-8 sm:py-10">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
