import { redirect } from "next/navigation";

export default function AdminIndexPage() {
  // Phase 4 will turn this into the real Overview dashboard section.
  // For now /admin has exactly one destination.
  redirect("/admin/reviews");
}
