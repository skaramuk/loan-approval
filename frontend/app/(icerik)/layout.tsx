import { SiteFooter, SiteHeader, SkipLink } from "@/components/site-chrome";

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="icerik" className="container-page flex-1 py-10 sm:py-14">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
