import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { generateOrderRef } from "@/lib/format";
import { NAIROBI_DELIVERY_AREAS } from "@/lib/site-config";
import type { Order, OrderRequestBody } from "@/types/order";

export const runtime = "nodejs";

/* ------------------------------------------------------------------ *
 * Lightweight in-memory rate limiting.
 *
 * Good enough for Phase 1 / low traffic, but each Vercel serverless
 * instance has its own memory — under real concurrent load this only
 * throttles per-instance, not globally. Part 9's version-management
 * manual flags upgrading this to a shared store (Upstash Redis is the
 * usual Vercel-native choice) as a pre-launch-at-scale task; it is
 * called out again in the Security Manual (Part 11 / Phase 5).
 * ------------------------------------------------------------------ */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
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

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Basic string sanitizer — strips characters with no legitimate place in a
// name/phone/area field, trims, and caps length. This is defence-in-depth,
// not a substitute for the DB-level constraints in the migration SQL.
function clean(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

const PHONE_RE = /^(?:\+?254|0)7\d{8}$/;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: OrderRequestBody;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const full_name = clean(body.full_name, 100);
  const phoneRaw = clean(body.phone, 20);
  const pickup_method = body.pickup_method === "delivery" ? "delivery" : "pickup";
  const delivery_area = clean(body.delivery_area, 60);
  const items = Array.isArray(body.items) ? body.items : [];

  if (full_name.length < 2) {
    return badRequest("Please enter your full name.");
  }
  if (!PHONE_RE.test(phoneRaw.replace(/\s/g, ""))) {
    return badRequest("Please enter a valid Safaricom/Kenyan phone number.");
  }
  if (items.length === 0) {
    return badRequest("Your order has no items.");
  }
  if (
    pickup_method === "delivery" &&
    !NAIROBI_DELIVERY_AREAS.includes(
      delivery_area as (typeof NAIROBI_DELIVERY_AREAS)[number]
    )
  ) {
    return badRequest(
      "Please select a valid delivery area. We currently deliver within Nairobi only."
    );
  }

  // Re-derive the subtotal server-side from the item prices the client
  // sent, rather than trusting a client-computed total. Prices themselves
  // still originate from the static catalog today (no live stock/price
  // lookup exists until Phase 4's admin-managed products land), but this
  // at least prevents a tampered subtotal field from being trusted blindly.
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const order: Omit<Order, "id"> = {
    order_ref: generateOrderRef(),
    created_at: new Date().toISOString(),
    full_name,
    phone: phoneRaw,
    pickup_method,
    delivery_area: pickup_method === "delivery" ? delivery_area : null,
    items,
    subtotal,
    status: "new",
  };

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    // Supabase hasn't been created/connected yet (expected for a fresh
    // Phase 1 deploy). We deliberately do NOT pretend the order was saved —
    // losing a real customer order silently would be worse than telling
    // them plainly that online checkout isn't live yet.
    console.error(
      "[api/orders] Supabase is not configured — order NOT persisted. " +
        "See docs/SUPABASE_PHASE1_SETUP.md to enable checkout."
    );
    return NextResponse.json(
      {
        error:
          "Online checkout isn't fully connected yet. Please reach us on WhatsApp to complete your order.",
        fallback: "whatsapp",
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error("[api/orders] Supabase insert failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't save your order. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({ order: data as Order }, { status: 201 });
}
