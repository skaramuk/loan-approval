import { createBrowserClient } from "@supabase/ssr";

/** Supabase is used for authentication only. All data goes through the FastAPI backend. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
