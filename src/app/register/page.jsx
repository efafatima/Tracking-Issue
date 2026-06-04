"use client";

import Image from "next/image";
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
    <main className="shell auth-shell">
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card-brand">
            <div className="auth-logo-shell">
              <Image src="/bzu-logo.png" alt="BZU Logo" width={64} height={64} style={{ borderRadius: "50%" }} />
            </div>
            <div className="auth-title-row">
              <div className="mini-label">Student signup</div>
              <h1>Create your account</h1>
              <p className="auth-description">Register now to submit and manage complaints with secure campus workflows.</p>
            </div>
          </div>

          <form className="form" onSubmit={submit}>
            {error && <div className="alert error">⚠️ {error}</div>}
            <input
              className="input"
              placeholder="Full name"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
            <input
              className="input"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <PasswordField
              placeholder="Create password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
            <select
              className="input"
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: e.target.value })}
              required
            >
              <option value="">Select your department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.name}</option>
              ))}
            </select>
            <button className="btn" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="auth-card-footer">
            <span>Already have an account?</span>
            <Link href="/login">Login here</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
