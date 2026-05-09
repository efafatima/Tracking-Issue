"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Bell, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { api, supabase } from "@/lib/clientApi";
import StatCard from "@/components/StatCard";
import ComplaintCard from "@/components/ComplaintCard";
import ComplaintForm from "@/components/ComplaintForm";
import DepartmentManager from "@/components/DepartmentManager";
import PasswordField from "@/components/PasswordField";
import { validatePassword } from "@/lib/password";

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setError("");
    try {
      const profileData = await api("/api/auth/profile");
      setProfile(profileData);
      const [complaintData, statData, analyticsData, notificationData] = await Promise.all([
        api("/api/complaints"),
        api("/api/complaints/stats"),
        api("/api/complaints/analytics"),
        api("/api/complaints/notifications")
      ]);
      setComplaints(complaintData);
      setStats(statData);
      setAnalytics(analyticsData);
      setNotifications(notificationData);

      if (["HOD", "DSA", "Supervisor"].includes(profileData.role)) {
        setTeachers(await api("/api/complaints/teachers"));
      }
      if (profileData.role === "Supervisor") {
        setActivity(await api("/api/complaints/activity"));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
      else load();
    });
  }, []);

  const statCards = useMemo(() => {
    if (!profile) return [];
    if (profile.role === "Student") {
      return [
        ["Total", stats.total, "var(--primary)"],
        ["Pending", stats.pending, "var(--warning)"],
        ["In Progress", stats.inProgress, "var(--primary-dark)"],
        ["Solved", stats.solved, "var(--success)"]
      ];
    }
    if (profile.role === "Faculty Member") {
      return [
        ["Assigned", stats.total, "var(--primary)"],
        ["Active", stats.inProgress, "var(--warning)"],
        ["Resolved", stats.solved, "var(--success)"],
        ["Overdue", stats.overdue, "var(--danger)"]
      ];
    }
    return [
      ["Needs Assignment", stats.needsAssignment, "var(--warning)"],
      ["In Progress", stats.inProgress, "var(--primary)"],
      ["Resolved Review", stats.resolvedForReview, "var(--success)"],
      ["Rejected", stats.rejected, "var(--danger)"]
    ];
  }, [profile, stats]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function action(type, complaint, body = {}) {
    const map = {
      review: `/api/complaints/${complaint.id}/review`,
      assign: `/api/complaints/${complaint.id}/assign`,
      status: `/api/complaints/${complaint.id}/status`,
      finalize: `/api/complaints/${complaint.id}/finalize`,
      rate: `/api/complaints/${complaint.id}/rate`
    };
    await api(map[type], { method: "POST", body: JSON.stringify(body) });
    await load();
  }

  async function comment(complaint, text) {
    if (!text.trim()) return;
    await api(`/api/complaints/${complaint.id}/comments`, { method: "POST", body: JSON.stringify({ comment: text }) });
    await load();
  }

  if (loading) {
    return <main className="shell" style={{ display: "grid", placeItems: "center" }}><div className="panel auth-card">Loading dashboard...</div></main>;
  }

  if (!profile) {
    return <main className="shell" style={{ display: "grid", placeItems: "center" }}><div className="panel auth-card">{error || "No profile found"}</div></main>;
  }

  return (
    <main className="dashboard-grid">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">IT</div><span>IssueTracker</span></div>
        <div style={{ marginTop: 28 }}>
          <h2 style={{ margin: 0 }}>{profile.username}</h2>
          <p className="muted">{profile.role} · {profile.departments?.name || "No department"}</p>
        </div>
        <div className="grid" style={{ marginTop: 24 }}>
          <span className="badge"><ShieldCheck size={14} /> Scoped Access</span>
          <span className="badge"><Bell size={14} /> {notifications.length} Notifications</span>
          {profile.role === "Supervisor" && <span className="badge"><Activity size={14} /> {activity.length} Logs</span>}
        </div>
        <button className="btn secondary" onClick={logout} style={{ marginTop: 24, width: "100%" }}><LogOut size={15} /> Logout</button>
      </aside>

      <section className="main">
        <div className="header-row">
          <div>
            <h1 style={{ margin: 0 }}>{profile.role} Dashboard</h1>
            <p className="muted" style={{ marginTop: 6 }}>Manage issues, routing, assignment, resolution, analytics, and feedback.</p>
          </div>
          <button className="btn secondary" onClick={load}><RefreshCw size={16} /> Refresh</button>
        </div>

        {error && <div className="badge" style={{ marginTop: 14, color: "var(--danger)", background: "#fee2e2" }}>{error}</div>}

        <div className="stat-grid">
          {statCards.map(([label, value, tone]) => <StatCard key={label} label={label} value={value} tone={tone} />)}
        </div>

        {profile.role === "Student" && <ComplaintForm onCreated={(created) => setComplaints((prev) => [created, ...prev])} />}

        <div className="split" style={{ marginTop: 16 }}>
          <section className="section">
            <div className="header-row">
              <div>
                <h2 style={{ margin: 0 }}>Complaints</h2>
                <p className="muted" style={{ marginTop: 4 }}>{complaints.length} records in your scope</p>
              </div>
            </div>
            <div className="card-list" style={{ marginTop: 12 }}>
              {complaints.length === 0 ? (
                <div className="complaint-card muted">No complaints found.</div>
              ) : complaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                  profile={profile}
                  teachers={teachers}
                  onAction={action}
                  onComment={comment}
                />
              ))}
            </div>
          </section>

          <aside className="section">
            <h2 style={{ marginTop: 0 }}><BarChart3 size={18} /> Analytics</h2>
            <div className="card-list">
              {(analytics?.status_data || []).map((item) => (
                <div className="complaint-card" key={item.label}>
                  <div className="header-row"><strong>{item.label}</strong><span className="badge">{item.value}</span></div>
                </div>
              ))}
            </div>
            <h3>Notifications</h3>
            <div className="card-list">
              {notifications.slice(0, 5).map((item) => <div className="complaint-card muted" key={item.id}>{item.message}</div>)}
              {notifications.length === 0 && <div className="complaint-card muted">No notifications.</div>}
            </div>
            {profile.role === "Supervisor" && (
              <>
                <h3>Activity Feed</h3>
                <div className="card-list">
                  {activity.slice(0, 6).map((item) => <div className="complaint-card muted" key={item.id}>{item.action}</div>)}
                </div>
              </>
            )}
          </aside>
        </div>

        {profile.role === "Supervisor" && <div style={{ marginTop: 16 }}><DepartmentManager /></div>}
        {["DSA", "HOD"].includes(profile.role) && <FacultyQuickCreate onCreated={load} />}
      </section>
    </main>
  );
}

function FacultyQuickCreate({ onCreated }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "Faculty Member", faculty_designation: "Faculty Member" });
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setError("");
    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }
    try {
      await api("/api/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ username: "", email: "", password: "", role: "Faculty Member", faculty_designation: "Faculty Member" });
      onCreated();
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <section className="section" style={{ marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Faculty Management</h2>
      {error && <div className="badge" style={{ marginBottom: 12, color: "var(--danger)", background: "#fee2e2" }}>{error}</div>}
      <form className="form" onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <input className="input" placeholder="Name" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <PasswordField placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} showRules autoComplete="new-password" />
          <input className="input" placeholder="Designation" value={form.faculty_designation} onChange={(e) => setForm({ ...form, faculty_designation: e.target.value })} />
        </div>
        <button className="btn">Create Faculty Member</button>
      </form>
    </section>
  );
}
