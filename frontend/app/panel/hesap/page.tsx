import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { Account } from "@/components/panel/account";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/bicim";
import { HESAP } from "@/lib/metinler";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: HESAP.baslik };

async function Profile() {
  // Session checks read the clock; opt this subtree into request-time rendering first.
  await connection();
  const supabase = await createClient();
  // getUser asks the Auth server for the current record (email, sign-up date).
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <dl className="space-y-3">
      <div>
        <dt className="text-sm text-muted-foreground">{HESAP.profil.eposta}</dt>
        <dd className="font-medium break-all">{user?.email ?? "—"}</dd>
      </div>
      {user?.created_at ? (
        <div>
          <dt className="text-sm text-muted-foreground">{HESAP.profil.uyelik}</dt>
          <dd className="font-medium">{formatDate(user.created_at)}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export default function AccountPage() {
  return (
    <Account
      profile={
        <Suspense fallback={<Skeleton aria-busy className="h-24 w-full" />}>
          <Profile />
        </Suspense>
      }
    />
  );
}
