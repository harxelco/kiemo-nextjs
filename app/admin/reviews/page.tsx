import { redirect } from "next/navigation";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server-auth";
import { ReviewModerationList } from "@/components/admin/ReviewModerationList";
import { SignOutButton } from "@/components/admin/SignOutButton";
import type { Review } from "@/types/review";

export default async function AdminReviewsPage() {
  const supabase = await getSupabaseServerAuthClient();

  // Defense in depth: proxy.ts already redirects unauthenticated
  // requests to /admin/* before they reach this page, but this page
  // doesn't rely on that alone — a missing session here redirects too.
  if (!supabase) redirect("/admin/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // No app-level "is this user an admin" check needed here — the RLS
  // policy from migration 0004 (using is_admin()) already restricts which
  // rows this query can even see. A signed-in non-admin user gets an
  // empty array back, not an error and not someone else's data.
  const { data, error } = await supabase
    .from("reviews")
    .select("id, name, rating, message, status, created_at, reviewed_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/reviews] fetch failed:", error.message);
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <div className="admin-topbar-title">
          Kiemo <span>Admin</span>
        </div>
        <SignOutButton />
      </div>
      <div className="admin-main">
        <h1 className="admin-page-title">Reviews</h1>
        <p className="admin-page-sub">
          Approve or reject reviews submitted from the storefront. Approved
          reviews appear on the site immediately.
        </p>
        <ReviewModerationList initialReviews={(data as Review[]) ?? []} />
      </div>
    </div>
  );
}
