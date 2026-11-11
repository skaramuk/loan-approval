import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { ROUTES, safeNext } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for links in Supabase emails (sign-up confirmation, password reset).
 * Handles both link styles: `?code=` (default templates, PKCE) and
 * `?token_hash=&type=` (custom templates).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const target = request.nextUrl.clone();
  target.search = "";
  target.pathname = safeNext(searchParams.get("sonraki"));

  const supabase = await createClient();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  }

  if (!ok) {
    target.pathname = ROUTES.giris;
    target.searchParams.set("hata", "baglanti");
  }
  return NextResponse.redirect(target);
}
