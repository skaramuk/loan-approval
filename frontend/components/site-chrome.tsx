import { Info, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ALT_BILGI, NAV, UYARILAR, UYGULAMA } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function Logo({ href = ROUTES.anaSayfa }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md font-heading text-lg font-bold tracking-tight"
    >
      <ShieldCheck className="size-5 text-primary" aria-hidden />
      {UYGULAMA.ad}
    </Link>
  );
}

export function SkipLink() {
  return (
    <a
      href="#icerik"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
    >
      {NAV.atla}
    </a>
  );
}

/** Header for public pages. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Logo />
        <nav aria-label={NAV.anaMenu} className="flex items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href={ROUTES.model}>{NAV.model}</Link>
          </Button>
          <ThemeToggle />
          <Button asChild variant="ghost">
            <Link href={ROUTES.giris}>{NAV.giris}</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href={ROUTES.kayit}>{NAV.kayit}</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = 2026;
  return (
    <footer className="mt-auto border-t">
      <div className="container-page py-8">
        <p className="flex max-w-3xl gap-2 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {UYARILAR.onDegerlendirme}
        </p>
        <div className="mt-6 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            © {year} {UYGULAMA.ad}. {ALT_BILGI.telif}
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <FooterLink href={ROUTES.model}>{ALT_BILGI.model}</FooterLink>
            <FooterLink href={ROUTES.gizlilik}>{ALT_BILGI.gizlilik}</FooterLink>
            <FooterLink href={ROUTES.kosullar}>{ALT_BILGI.kosullar}</FooterLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
      {children}
    </Link>
  );
}

/** The permanent "this is a pre-assessment" notice. */
export function Disclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex gap-2 rounded-lg border bg-muted/50 px-3.5 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      {UYARILAR.onDegerlendirme}
    </p>
  );
}

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1.5 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
