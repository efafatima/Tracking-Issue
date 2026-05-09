import Link from "next/link";
import { ArrowRight, BarChart3, Brain, ShieldCheck, Workflow } from "lucide-react";

export default function Home() {
  return (
    <main className="shell">
      <div className="container">
        <nav className="topbar">
          <div className="brand">
            <div className="brand-mark">IT</div>
            <span>IssueTracker</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link className="btn secondary" href="/login">Login</Link>
            <Link className="btn" href="/register">Student Signup</Link>
          </div>
        </nav>

        <section className="hero">
          <div>
            <div className="badge" style={{ marginBottom: 16 }}>University complaint workflow platform</div>
            <h1>IssueTracker</h1>
            <p>
              A complete complaint management system for students, HODs, DSA,
              faculty, and supervisors. It keeps department routing, assignment,
              escalation, analytics, feedback, notifications, and AI-assisted
              category suggestions in one reliable workflow.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              <Link className="btn" href="/login">Open Dashboard <ArrowRight size={16} /></Link>
              <Link className="btn secondary" href="/register">Create Student Account</Link>
            </div>
          </div>

          <div className="panel" style={{ padding: 22 }}>
            <div className="grid">
              {[
                ["Smart routing", "Category rules route issues to HOD or DSA.", Workflow],
                ["AI assistance", "Suggestion, severity, and duplicate similarity checks.", Brain],
                ["Role security", "Scoped dashboards and server-side object checks.", ShieldCheck],
                ["Analytics", "Status, category, teacher performance, and weekly reports.", BarChart3]
              ].map(([title, text, Icon]) => (
                <div key={title} className="complaint-card" style={{ display: "flex", gap: 12 }}>
                  <div className="brand-mark" style={{ width: 34, height: 34 }}><Icon size={17} /></div>
                  <div>
                    <strong>{title}</strong>
                    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
