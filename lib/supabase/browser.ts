"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client for the admin login form, built with
 * @supabase/ssr (not plain @supabase/supabase-js) specifically so the
 * session it creates is written to cookies that the server-side clients
 * below can also read — that's what lets a Server Component protect
 * /admin routes based on a login that happened client-side.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
