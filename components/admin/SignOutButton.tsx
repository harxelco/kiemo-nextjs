"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button className="admin-signout-btn" onClick={handleSignOut}>
      Sign Out
    </button>
  );
}
