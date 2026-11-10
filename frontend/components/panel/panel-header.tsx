"use client";

import { useQueryClient } from "@tanstack/react-query";
import { History, LayoutDashboard, LogOut, PlusCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/site-chrome";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: ROUTES.panel, label: NAV.ozet, icon: LayoutDashboard, exact: true },
  { href: ROUTES.yeni, label: NAV.yeni, icon: PlusCircle, exact: false },
  { href: ROUTES.gecmis, label: NAV.gecmis, icon: History, exact: false },
  { href: ROUTES.hesap, label: NAV.hesap, icon: UserRound, exact: false },
];

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return async () => {
    await createClient().auth.signOut();
    // Drop every cached record so the next user of this browser cannot see them.
    queryClient.clear();
    router.replace(ROUTES.giris);
    router.refresh();
  };
}

export function PanelHeader() {
  const pathname = usePathname();
  const signOut = useSignOut();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Logo href={ROUTES.panel} />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" onClick={signOut}>
            <LogOut aria-hidden />
            <span className="hidden sm:inline">{NAV.cikis}</span>
            <span className="sr-only sm:hidden">{NAV.cikis}</span>
          </Button>
        </div>
      </div>
      <nav aria-label={NAV.panelMenu} className="container-page -mb-px overflow-x-auto">
        <ul className="flex gap-1">
          {LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-11 items-center gap-2 border-b-2 px-3 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
