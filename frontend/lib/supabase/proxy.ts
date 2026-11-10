import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/lib/routes";

const PROTECTED_PREFIX = "/panel";
const GUEST_ONLY = [ROUTES.giris, ROUTES.kayit, ROUTES.sifremiUnuttum];

/**
 * Refreshes the Supabase session cookie and applies the optimistic route guard.
 * This is a convenience redirect, not the security boundary: the backend verifies the
 * access token on every data request.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims(): it refreshes the token.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!signedIn && pathname.startsWith(PROTECTED_PREFIX)) {
    return redirectKeepingCookies(request, response, ROUTES.giris, pathname);
  }
  if (signedIn && GUEST_ONLY.some((path) => pathname === path)) {
    return redirectKeepingCookies(request, response, ROUTES.panel);
  }
  return response;
}

function redirectKeepingCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
  next?: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (next) url.searchParams.set("sonraki", next);
  const redirect = NextResponse.redirect(url);
  // Carry over any refreshed session cookies, or the browser and server fall out of sync.
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
