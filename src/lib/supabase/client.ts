import { createBrowserClient } from "@supabase/ssr";

/** Supabase client for the browser. Only ever sees the publishable key. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
