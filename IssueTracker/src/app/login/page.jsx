"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/clientApi";

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
    <main className="shell">
      <div className="container">
        <nav className="topbar">
          <Link className="brand" href="/"><span className="brand-mark">IT</span> IssueTracker</Link>
        </nav>
        <div className="hero" style={{ gridTemplateColumns: "1fr 420px" }}>
          <div>
            <h1>Welcome back</h1>
            <p>Login to manage complaints, assignments, department staff, reports, and notifications.</p>
          </div>
          <form className="panel auth-card form" onSubmit={submit}>
            <h2 style={{ margin: 0 }}>Login</h2>
            {error && <div className="badge" style={{ color: "var(--danger)", background: "#fee2e2" }}>{error}</div>}
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button className="btn" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
            <Link className="muted" href="/register">Student? Create an account</Link>
          </form>
        </div>
      </div>
    </main>
  );
}
