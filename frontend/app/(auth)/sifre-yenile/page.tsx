import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { NewPasswordForm } from "@/components/auth/auth-forms";
import { Skeleton } from "@/components/ui/skeleton";
import { AUTH } from "@/lib/metinler";
import { ROUTES } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: AUTH.yenile.baslik };

// Reached through the emailed link, which signs the user in via /auth/onay first.
async function GuardedForm() {
  // Session checks read the clock; opt this subtree into request-time rendering first.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(`${ROUTES.giris}?hata=baglanti`);

  return (
    <NewPasswordForm
      redirectTo={ROUTES.panel}
      submitLabel={AUTH.yenile.dugme}
      pendingLabel={AUTH.yenile.bekle}
      successMessage={AUTH.yenile.basarili}
    />
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">{AUTH.yenile.baslik}</h1>
      <p className="mt-1.5 mb-6 text-muted-foreground">{AUTH.yenile.altBaslik}</p>
      <Suspense fallback={<Skeleton aria-busy className="h-48 w-full" />}>
        <GuardedForm />
      </Suspense>
    </>
  );
}
