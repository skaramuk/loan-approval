import type { Metadata } from "next";
import { Suspense } from "react";

import { Overview } from "@/components/panel/overview";
import { OZET } from "@/lib/metinler";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: OZET.baslik };

// Reads the session cookie, so it streams in inside <Suspense>.
async function Greeting() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : null;
  return email ? `${OZET.hosgeldin}, ${email}` : OZET.hosgeldin;
}

export default function PanelPage() {
  return (
    <Overview
      greeting={
        <Suspense fallback={OZET.hosgeldin}>
          <Greeting />
        </Suspense>
      }
    />
  );
}
