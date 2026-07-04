import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client that reads/writes the SAME session cookies
 * the browser client (lib/supabase/browser.ts) sets on login. Uses the
 * anon key + the signed-in user's session — NOT the service role key —
 * so queries through this client are subject to RLS exactly as that
 * specific admin, same as if they'd logged into the Supabase dashboard
 * directly. This is what admin pages/API routes use to check "is there a
 * logged-in admin" and to read data the is_admin() RLS policies allow.
 *
 * Distinct from lib/supabase/server.ts, which uses the service role key
 * and bypasses RLS entirely — that one is only for the checkout route,
 * which has no user session to speak of.
 */
export async function getSupabaseServerAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll can be called from a Server Component, where cookie
          // writes aren't allowed — safe to ignore as long as middleware
          // (proxy.ts) is also refreshing the session, which it is.
        }
      },
    },
  });
}
