"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/clientApi";
import PasswordField from "@/components/PasswordField";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword(form);
    setLoading(false);
    if (loginError) {
      setError(loginError.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="shell auth-shell">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-brand">
            <div className="auth-logo-shell">
              <Image src="/bzu-logo.png" alt="BZU Logo" width={64} height={64} style={{ borderRadius: "50%" }} />
            </div>
            <div className="auth-title-row">
              <div className="mini-label">University complaint portal</div>
              <h1>Login to Issue Tracker</h1>
              <p className="auth-description">Access your dashboard securely and track complaints in a clean, trusted interface.</p>
            </div>
          </div>

          <form className="form" onSubmit={submit}>
            {error && <div className="alert error">⚠️ {error}</div>}
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <PasswordField
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <button className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="auth-card-footer">
            <span>Don't have an account?</span>
            <Link href="/register">Create one</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
