import type { Metadata } from "next";
import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/auth-forms";
import { AUTH } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: AUTH.unuttum.baslik };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">{AUTH.unuttum.baslik}</h1>
      <p className="mt-1.5 mb-6 text-muted-foreground">{AUTH.unuttum.altBaslik}</p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm">
        <Link href={ROUTES.giris} className="font-medium text-primary underline-offset-4 hover:underline">
          {AUTH.unuttum.geri}
        </Link>
      </p>
    </>
  );
}
