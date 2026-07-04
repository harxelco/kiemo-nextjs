import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerAuthClient } from "@/lib/supabase/server-auth";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json(
      { error: "status must be 'approved' or 'rejected'." },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseServerAuthClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // Deliberately using the signed-in user's own session (not the service
  // role key) — this update is only actually allowed to succeed because
  // of the "Admins can moderate reviews" RLS policy from migration 0004.
  // If this user isn't in admin_roles, the update below silently affects
  // zero rows rather than throwing, which the count check catches.
  const { data, error } = await supabase
    .from("reviews")
    .update({
      status: body.status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("[api/admin/reviews] update failed:", error.message);
    return NextResponse.json({ error: "Update failed." }, { status: 502 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      { error: "Review not found, or you don't have admin access." },
      { status: 403 }
    );
  }

  return NextResponse.json({ review: data[0] });
}
