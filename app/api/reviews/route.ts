import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import type { ReviewRequestBody } from "@/types/review";

export const runtime = "nodejs";

// Same lightweight in-memory rate limiter as app/api/orders/route.ts —
// see that file's comment for the per-instance caveat.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX;
}

function clean(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many reviews submitted. Please try again later." },
      { status: 429 }
    );
  }

  let body: ReviewRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = clean(body.name, 60);
  const message = clean(body.message, 400);
  const rating = Number(body.rating);

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Please share a bit more detail in your review." },
      { status: 400 }
    );
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
  }

  const supabase = getSupabaseAnonServerClient();
  if (!supabase) {
    console.error(
      "[api/reviews] Supabase is not configured — review NOT saved. " +
        "See docs/SUPABASE_PHASE1_SETUP.md and docs/MANUAL_01_SUPABASE.md."
    );
    return NextResponse.json(
      { error: "Reviews aren't accepting submissions yet — please check back soon." },
      { status: 503 }
    );
  }

  // Deliberately using the ANON client here, not the service-role one —
  // the "status must be pending" rule in migration 0004_phase2_reviews.sql
  // is enforced by the database itself via RLS WITH CHECK, not by this
  // route trusting itself to always pass status: "pending".
  const { error } = await supabase
    .from("reviews")
    .insert({ name, rating, message, status: "pending" });

  if (error) {
    console.error("[api/reviews] Supabase insert failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't submit your review. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
