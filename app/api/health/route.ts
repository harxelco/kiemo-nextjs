import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Used by the Deployment Guide's post-deploy smoke test, and can be pointed
// at by any future uptime monitor (e.g. Vercel's own checks, or an external
// one wired up alongside Sentry in Phase 5).
export async function GET() {
  const supabaseConfigured = getSupabaseServerClient() !== null;
  return NextResponse.json({
    status: "ok",
    supabaseConfigured,
    timestamp: new Date().toISOString(),
  });
}
