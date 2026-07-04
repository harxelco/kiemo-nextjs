"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = getSupabaseBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!supabase) {
      setError(
        "Supabase isn't configured yet — see docs/SUPABASE_PHASE1_SETUP.md."
      );
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/admin/reviews");
    router.refresh();
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1 className="admin-login-title">Kiemo Admin</h1>
        <p className="admin-login-sub">Sign in to moderate reviews.</p>

        {!supabase && (
          <div className="admin-login-error">
            Supabase isn&apos;t configured yet. See{" "}
            <code>docs/SUPABASE_PHASE1_SETUP.md</code>.
          </div>
        )}
        {error && <div className="admin-login-error">{error}</div>}

        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <p className="admin-login-note">
          No self-service signup — admin accounts are created directly in
          Supabase. See migration <code>0002_phase2_admin_roles.sql</code>.
        </p>
      </form>
    </div>
  );
}
