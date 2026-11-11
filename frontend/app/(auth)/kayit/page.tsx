import type { Metadata } from "next";
import Link from "next/link";

import { SignupForm } from "@/components/auth/auth-forms";
import { ALT_BILGI, AUTH } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: AUTH.kayit.dugme };

const linkClass = "font-medium text-primary underline-offset-4 hover:underline";

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">{AUTH.kayit.baslik}</h1>
      <p className="mt-1.5 mb-6 text-muted-foreground">{AUTH.kayit.altBaslik}</p>
      <SignupForm />
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        {AUTH.kayit.kabul.once}
        <Link href={ROUTES.kosullar} className={linkClass}>
          {ALT_BILGI.kosullar}
        </Link>
        {AUTH.kayit.kabul.ve}
        <Link href={ROUTES.gizlilik} className={linkClass}>
          {ALT_BILGI.gizlilik}
        </Link>
        {AUTH.kayit.kabul.sonra}
      </p>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {AUTH.kayit.hesapVar}{" "}
        <Link href={ROUTES.giris} className={linkClass}>
          {AUTH.kayit.girisYap}
        </Link>
      </p>
    </>
  );
}
