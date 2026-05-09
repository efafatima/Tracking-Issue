"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/clientApi";
import PasswordField from "@/components/PasswordField";
import { validatePassword } from "@/lib/password";

export default function Register() {
  const router = useRouter();
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", password: "", department_id: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/public/departments").then((res) => res.json()).then((payload) => setDepartments(payload.data || []));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError("");
    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }
    setLoading(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      setLoading(false);
      setError(payload.message || "Registration failed");
      return;
    }
    await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <main className="shell">
      <div className="container">
        <nav className="topbar">
          <Link className="brand" href="/"><span className="brand-mark">IT</span> IssueTracker</Link>
        </nav>
        <div className="hero" style={{ gridTemplateColumns: "1fr 440px" }}>
          <div>
            <h1>Student signup</h1>
            <p>Create an account and submit complaints with AI-assisted category, priority, and similarity checks.</p>
          </div>
          <form className="panel auth-card form" onSubmit={submit}>
            <h2 style={{ margin: 0 }}>Create Account</h2>
            {error && <div className="badge" style={{ color: "var(--danger)", background: "#fee2e2" }}>{error}</div>}
            <input className="input" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <PasswordField placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} showRules autoComplete="new-password" />
            <select className="input" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
              <option value="">Select Department</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <button className="btn" disabled={loading}>{loading ? "Creating..." : "Create Student Account"}</button>
            <Link className="muted" href="/login">Already have an account?</Link>
          </form>
        </div>
      </div>
    </main>
  );
}
