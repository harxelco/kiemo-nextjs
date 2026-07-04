import { getSupabaseAnonServerClient } from "@/lib/supabase/server";
import type { Review } from "@/types/review";

/**
 * Fetches published (status = 'approved') reviews for the storefront.
 * Uses the anon client — the "Public can read approved reviews" RLS
 * policy (migration 0004) is what actually restricts this to approved
 * rows only, not this function's WHERE clause. Returns an empty array
 * (not an error) if Supabase isn't configured yet, so the homepage keeps
 * rendering with just the static curated testimonials.
 */
export async function getApprovedReviews(limit = 12): Promise<Review[]> {
  const supabase = getSupabaseAnonServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, rating, message, status, created_at, reviewed_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getApprovedReviews] fetch failed:", error.message);
    return [];
  }

  return (data as Review[]) ?? [];
}
