import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 *
 * This must never be imported from a "use client" component or anything
 * that ends up in a browser bundle — the service role key bypasses Row
 * Level Security entirely. It is only ever used inside app/api/* route
 * handlers, which run exclusively on the server.
 *
 * Returns `null` (instead of throwing) when Supabase hasn't been set up
 * yet, so the rest of the app can degrade gracefully — see
 * app/api/orders/route.ts for how the checkout flow handles this.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Server-side client using the ANON key — for endpoints that should stay
 * subject to RLS rather than bypass it, like public review submission
 * (app/api/reviews/route.ts). Using this instead of the service-role
 * client means the database's own "status must be pending" check
 * (migration 0004) is the actual enforcement, not application code that
 * could have a bug in it.
 */
export function getSupabaseAnonServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
