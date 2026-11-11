import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH } from "@/lib/metinler";
import { ROUTES, safeNext } from "@/lib/routes";

export const metadata: Metadata = { title: AUTH.giris.dugme };

type SearchParams = PageProps<"/giris">["searchParams"];

// Reads the query string, so it renders inside <Suspense>; the rest of the page is static.
async function LoginSection({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const notice = params.hata === "baglanti" ? AUTH.hatalar.baglantiGecersiz : undefined;
  return <LoginForm next={safeNext(params.sonraki)} notice={notice} />;
}

function FormFallback() {
  return (
    <div aria-busy className="space-y-5">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/giris">) {
  return (
    <>
      <h1 className="text-2xl font-bold">{AUTH.giris.baslik}</h1>
      <p className="mt-1.5 mb-6 text-muted-foreground">{AUTH.giris.altBaslik}</p>
      <Suspense fallback={<FormFallback />}>
        <LoginSection searchParams={searchParams} />
      </Suspense>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {AUTH.giris.hesapYok}{" "}
        <Link href={ROUTES.kayit} className="font-medium text-primary underline-offset-4 hover:underline">
          {AUTH.giris.kayitOl}
        </Link>
      </p>
    </>
  );
}
