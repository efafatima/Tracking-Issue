"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  CircleDashed,
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  Pencil,
  Search,
  ShieldCheck,
  UserPlus,
  X
} from "lucide-react";
import { api, supabase } from "@/lib/clientApi";
import { ROLE_COLORS } from "@/lib/designTokens";
import StatCard from "@/components/StatCard";
import ComplaintCard from "@/components/ComplaintCard";
import ComplaintForm from "@/components/ComplaintForm";
import DepartmentManager from "@/components/DepartmentManager";
import PasswordField from "@/components/PasswordField";
import StudentBotpressChat from "@/components/StudentBotpressChat";
import VoiceRobot from "@/components/VoiceRobot";
import { validatePassword } from "@/lib/password";

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [departmentHistory, setDepartmentHistory] = useState([]);
  const [activity, setActivity] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [lastCreatedComplaint, setLastCreatedComplaint] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: "" });
  const [profileError, setProfileError] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState("");
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
        const [activityData, departmentHistoryData] = await Promise.all([
          api("/api/complaints/activity"),
          api("/api/complaints/department-history")
        ]);
        setActivity(activityData);
        setDepartmentHistory(departmentHistoryData);
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

  useEffect(() => {
    if (!profile) return;
    setProfileForm({ username: profile.username || "" });
    setAvatarDataUrl(localStorage.getItem(`issue-tracker:${profile.id}:avatar`) || "");
  }, [profile]);

  const statCards = useMemo(() => {
    if (!profile) return [];
    if (profile.role === "Student") {
      return [
        ["Total Complaints", stats.total, "var(--role-student)", FileText, "Your submitted cases"],
        ["Pending", stats.pending, "var(--warning)", CircleDashed, "Awaiting review"],
        ["In Progress", stats.inProgress, "var(--status-in-progress)", Activity, "Being handled"],
        ["Solved", stats.solved, "var(--status-resolved)", CheckCircle2, "Completed cases"]
      ];
    }
    if (profile.role === "Faculty Member") {
      return [
        ["Assigned", stats.total, "var(--role-faculty)", FileText, "In your queue"],
        ["Active", stats.inProgress, "var(--status-in-progress)", Activity, "Work in progress"],
        ["Resolved", stats.solved, "var(--status-resolved)", CheckCircle2, "Marked resolved"],
        ["Overdue", stats.overdue, "var(--danger)", Bell, "Needs attention"]
      ];
    }
    return [
      ["Needs Assignment", stats.needsAssignment, "var(--warning)", UserPlus, "Ready to route"],
      ["In Progress", stats.inProgress, "var(--status-in-progress)", Activity, "Active cases"],
      ["Resolved Review", stats.resolvedForReview, "var(--status-resolved)", CheckCircle2, "Final checks"],
      ["Rejected", stats.rejected, "var(--danger)", CircleDashed, "Returned cases"]
    ];
  }, [profile, stats]);

  const roleColor = profile ? ROLE_COLORS[profile.role] : null;
  const activePage = pathname.endsWith("/analytics")
    ? "analytics"
    : pathname.endsWith("/complaints")
      ? "complaints"
      : pathname.endsWith("/departments")
        ? "departments"
        : "dashboard";
  useEffect(() => {
    if (["Supervisor", "Faculty Member"].includes(profile?.role) && activePage === "complaints") {
      router.replace("/dashboard");
    }
  }, [activePage, profile, router]);

  const navItems = [
    ["dashboard", "/dashboard", LayoutDashboard, "Dashboard"],
    ["analytics", "/dashboard/analytics", BarChart3, "Analytics"],
    ...(["Supervisor", "Faculty Member"].includes(profile?.role) ? [] : [["complaints", "/dashboard/complaints", FileText, "Complaints"]]),
    ...(profile?.role === "Supervisor" ? [["departments", "/dashboard/departments", Building2, "Department Insights"]] : [])
  ];
  const chartItems = analytics?.status_data || [];
  const chartMax = Math.max(...chartItems.map((item) => item.value), 1);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function saveProfile(event) {
    event.preventDefault();
    setProfileError("");
    try {
      const updatedProfile = await api("/api/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(profileForm)
      });
      setProfile(updatedProfile);
      setProfileEditorOpen(false);
      setProfileMenuOpen(false);
    } catch (err) {
      setProfileError(err.message);
    }
  }

  function updateAvatar(event) {
    const file = event.target.files?.[0];
    if (!file || !profile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextAvatar = String(reader.result || "");
      localStorage.setItem(`issue-tracker:${profile.id}:avatar`, nextAvatar);
      setAvatarDataUrl(nextAvatar);
    };
    reader.readAsDataURL(file);
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

  function openNotificationComplaint(notification) {
    const fullComplaint = complaints.find((complaint) => complaint.id === notification.complaint_id);
    setSelectedComplaint(fullComplaint || notification.complaint || null);
  }

  if (loading) {
    return <main className="shell" style={{ display: "grid", placeItems: "center" }}><div className="panel auth-card">Loading dashboard...</div></main>;
  }

  if (!profile) {
    return <main className="shell" style={{ display: "grid", placeItems: "center" }}><div className="panel auth-card">{error || "No profile found"}</div></main>;
  }

  return (
    <main className="dashboard-grid" style={{ ['--role-primary']: roleColor?.primary }}>
      <aside className="sidebar" style={{ background: "var(--sidebar-bg)", borderRight: `3px solid ${roleColor?.primary || "var(--success)"}` }}>
        <div className="sidebar-identity">
          <div className="brand-mark" style={{ background: roleColor?.primary || "var(--success)" }}>{profile.username?.slice(0, 2).toUpperCase() || "U"}</div>
          <div>
            <h2>{profile.username}</h2>
            <p>{profile.departments?.name || "No department"}</p>
          </div>
        </div>
        
        <nav className="sidebar-nav" aria-label="Dashboard sections">
          {navItems.map(([key, href, Icon, label]) => (
            <button
              key={key}
              type="button"
              className={`sidebar-link ${activePage === key ? "active" : ""}`}
              onClick={() => router.push(href)}
              style={activePage === key ? { color: "#ffffff", background: roleColor?.primary || "var(--success)", borderRadius: 8 } : undefined}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        
        <div className="grid" style={{ marginTop: 24 }}>
          <span className="badge"><ShieldCheck size={14} /> Scoped Access</span>
          <span className="badge" style={{ background: "rgba(163, 45, 45, 0.12)", color: "var(--danger)" }}><Bell size={14} /> {notifications.length} Notifications</span>
          {profile.role === "Supervisor" && <span className="badge" style={{ background: "rgba(83, 74, 183, 0.14)", color: "var(--supervisor-purple)" }}><Activity size={14} /> {activity.length} Logs</span>}
        </div>
      </aside>

      <section className="main">
        <div className="dashboard-topbar">
          {activePage === "complaints" && (
            <button className="icon-button" aria-label="Search complaints" style={{ background: roleColor?.primary }}><Search size={18} /></button>
          )}
          <div className="profile-menu">
            <button
              className="avatar-button"
              type="button"
              aria-label="Open profile menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <Avatar avatarDataUrl={avatarDataUrl} username={profile.username} roleColor={roleColor} />
            </button>
            {profileMenuOpen && (
              <div className="profile-dropdown">
                <button type="button" onClick={() => setProfileEditorOpen(true)}><Pencil size={15} /> Edit Profile</button>
                <button type="button" onClick={logout}><LogOut size={15} /> Logout</button>
              </div>
            )}
          </div>
        </div>

        {profileEditorOpen && (
          <div className="section profile-editor">
            <div className="header-row">
              <div>
                <h2 style={{ margin: 0, color: "#0F172A" }}>Edit Profile</h2>
                <p className="muted" style={{ margin: "4px 0 0" }}>Update your display name and profile picture.</p>
              </div>
              <button className="icon-button" type="button" aria-label="Close profile editor" onClick={() => setProfileEditorOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {profileError && <div className="badge" style={{ color: "var(--danger)", background: "#fee2e2" }}>{profileError}</div>}
            <form className="form" onSubmit={saveProfile}>
              <div className="profile-photo-row">
                <Avatar avatarDataUrl={avatarDataUrl} username={profile.username} roleColor={roleColor} large />
                <label className="btn secondary">
                  <input type="file" accept="image/*" onChange={updateAvatar} hidden />
                  Choose Photo
                </label>
              </div>
              <div className="responsive-two">
                <label>
                  <span className="field-label">Username</span>
                  <input className="input" value={profileForm.username} onChange={(event) => setProfileForm({ username: event.target.value })} />
                </label>
                <label>
                  <span className="field-label">Department</span>
                  <input className="input" value={profile.departments?.name || "No department"} readOnly />
                </label>
              </div>
              <button className="btn" style={{ background: roleColor?.primary || "var(--primary)" }}>Save Profile</button>
            </form>
          </div>
        )}
        
        <div className="header-row">
          <div className="page-title">
            <h1 style={{ color: "#0F172A" }}>Welcome, {profile.username}</h1>
            <p className="muted">Monitor complaint performance and routing in real time.</p>
          </div>
        </div>

        {error && <div className="badge" style={{ marginTop: 14, color: "var(--danger)", background: "#fee2e2" }}>⚠️ {error}</div>}

        {activePage === "dashboard" && (
          <>
            <div className="stat-grid">
              {statCards.map(([label, value, tone, Icon, helper], index) => (
                <StatCard key={label} label={label} value={value} tone={tone} icon={Icon} helper={helper} featured={index === 0} />
              ))}
            </div>
            {profile.role === "Student" && (
              <ComplaintForm
                onCreated={(created) => {
                  setLastCreatedComplaint(created);
                  setComplaints((prev) => [created, ...prev]);
                  load();
                }}
              />
            )}
            {profile.role === "Faculty Member" && (
              <section className="section" style={{ marginTop: 20 }}>
                <div className="header-row">
                  <div>
                    <h2 style={{ margin: 0, color: "#0F172A" }}>Assigned Complaints</h2>
                    <p className="muted" style={{ marginTop: 4 }}>{complaints.length} complaints in your queue</p>
                  </div>
                </div>
                <div className="card-list" style={{ marginTop: 12 }}>
                  {complaints.length === 0 ? (
                    <div className="complaint-card muted">No assigned complaints found.</div>
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
            )}
            {profile.role === "Supervisor" && <div style={{ marginTop: 16 }}><DepartmentManager /></div>}
            {["DSA", "HOD"].includes(profile.role) && <FacultyQuickCreate onCreated={load} />}
          </>
        )}

        {activePage === "complaints" && (
          <section className="section" style={{ marginTop: 20 }}>
            <div className="header-row">
              <div>
                <h2 style={{ margin: 0, color: "#0F172A" }}>Complaints</h2>
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
        )}

        {activePage === "analytics" && (
          <section className="section" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0, color: "#0F172A" }}><BarChart3 size={18} /> Analytics</h2>
            <div className="mini-chart" aria-hidden="true">
              {chartItems.length === 0 ? (
                <span style={{ height: "8%", background: roleColor?.primary || "var(--success)" }} />
              ) : chartItems.map((item) => (
                <span key={item.label} title={`${item.label}: ${item.value}`} style={{ height: `${Math.max((item.value / chartMax) * 100, 8)}%`, background: roleColor?.primary || "var(--success)" }} />
              ))}
            </div>
            <div className="card-list">
              {(analytics?.status_data || []).map((item) => (
                <div className="complaint-card" key={item.label}>
                  <div className="header-row"><strong>{item.label}</strong><span className="badge">{item.value}</span></div>
                </div>
              ))}
            </div>
            <h3 style={{ color: "#0F172A" }}>Notifications</h3>
            <div className="card-list">
              {notifications.slice(0, 5).map((item) => (
                <div className="complaint-card notification-card" key={item.id}>
                  <div>
                    <strong style={{ color: "#0F172A" }}>{item.complaint?.title || item.message}</strong>
                    <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>{item.message}</p>
                  </div>
                  <button
                    className="btn secondary"
                    type="button"
                    onClick={() => openNotificationComplaint(item)}
                    disabled={!item.complaint && !complaints.some((complaint) => complaint.id === item.complaint_id)}
                  >
                    <Eye size={15} /> View Complaint
                  </button>
                </div>
              ))}
              {notifications.length === 0 && <div className="complaint-card muted">No notifications.</div>}
            </div>
            {profile.role === "Supervisor" && (
              <>
                <h3 style={{ color: "#0F172A" }}>Activity Feed</h3>
                <div className="card-list">
                  {activity.slice(0, 6).map((item) => (
                    <div className="complaint-card notification-card" key={item.id}>
                      <div>
                        <strong style={{ color: "#0F172A" }}>{item.complaint?.title || `Complaint #${item.complaint_id}`}</strong>
                        <p className="muted" style={{ margin: "4px 0 0", fontSize: 13 }}>{item.action}</p>
                      </div>
                      <button className="btn secondary" type="button" onClick={() => setSelectedActivity(item)}>
                        <Eye size={15} /> View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {activePage === "departments" && profile.role === "Supervisor" && (
          <section className="section" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0, color: "#0F172A" }}><Building2 size={18} /> Department Insights</h2>
            <div className="card-list">
              {departmentHistory.map((department) => (
                <div className="complaint-card" key={department.id}>
                  <div className="header-row">
                    <div>
                      <strong style={{ color: "#0F172A" }}>{department.name}</strong>
                      <p className="muted" style={{ margin: "4px 0 0" }}>{department.total} total complaints</p>
                    </div>
                  </div>
                  <div className="responsive-four" style={{ marginTop: 12 }}>
                    <div className="mini-stat"><span>Total</span><strong>{department.total}</strong></div>
                    <div className="mini-stat"><span>In Process</span><strong>{department.inProgress}</strong></div>
                    <div className="mini-stat"><span>Completed</span><strong>{department.completed}</strong></div>
                    <div className="mini-stat"><span>Pending Review</span><strong>{department.pending}</strong></div>
                  </div>
                </div>
              ))}
              {departmentHistory.length === 0 && <div className="complaint-card muted">No department history found.</div>}
            </div>
          </section>
        )}
      </section>
      
      <VoiceRobot profile={profile} complaints={complaints} notifications={notifications} lastCreatedComplaint={lastCreatedComplaint} />
      {profile.role === "Student" && <StudentBotpressChat profile={profile} />}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          timeline={activity.filter((item) => item.complaint_id === selectedActivity.complaint_id)}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </main>
  );
}

function ActivityDetailsModal({ activity, timeline, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Activity details" onClick={(event) => event.stopPropagation()}>
        <div className="header-row">
          <div>
            <h2 style={{ margin: 0, color: "#0F172A" }}>{activity.complaint?.title || `Complaint #${activity.complaint_id}`}</h2>
            <p className="muted" style={{ margin: "6px 0 0" }}>{activity.complaint?.department?.name || "No department"} · {activity.complaint?.status || "No status"}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close activity details" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="card-list" style={{ marginTop: 18 }}>
          {timeline.map((item) => (
            <div className="complaint-card" key={item.id}>
              <div className="header-row">
                <strong style={{ color: "#0F172A" }}>{item.action}</strong>
                <span className="badge">{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                By {item.user?.username || "System"} ({item.user?.role || "Unknown"})
              </p>
              {(item.old_value || item.new_value) && (
                <p className="muted" style={{ margin: "8px 0 0" }}>
                  Changed from {item.old_value || "empty"} to {item.new_value || "empty"}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ComplaintDetailsModal({ complaint, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="modal-panel" role="dialog" aria-modal="true" aria-label="Complaint details" onClick={(event) => event.stopPropagation()}>
        <div className="header-row">
          <div>
            <h2 style={{ margin: 0, color: "#0F172A" }}>{complaint.title || "Complaint details"}</h2>
            <p className="muted" style={{ margin: "6px 0 0" }}>Complaint #{complaint.id}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close complaint details" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="form readonly-form" style={{ marginTop: 18 }}>
          <div className="responsive-two">
            <label>
              <span className="field-label">Title</span>
              <input className="input" value={complaint.title || ""} readOnly />
            </label>
            <label>
              <span className="field-label">Status</span>
              <input className="input" value={complaint.status || ""} readOnly />
            </label>
            <label>
              <span className="field-label">Category</span>
              <input className="input" value={complaint.category || ""} readOnly />
            </label>
            <label>
              <span className="field-label">Priority</span>
              <input className="input" value={complaint.priority || complaint.severity || ""} readOnly />
            </label>
            <label>
              <span className="field-label">Department</span>
              <input className="input" value={complaint.department?.name || "No department"} readOnly />
            </label>
            <label>
              <span className="field-label">Assigned To</span>
              <input className="input" value={complaint.assigned_teacher?.username || "Not assigned"} readOnly />
            </label>
          </div>
          <label>
            <span className="field-label">Description</span>
            <textarea className="input" value={complaint.description || ""} readOnly rows={5} />
          </label>
          <label>
            <span className="field-label">Routed To</span>
            <input className="input" value={complaint.routed_to_role || ""} readOnly />
          </label>
        </form>
      </section>
    </div>
  );
}

function Avatar({ avatarDataUrl, username, roleColor, large = false }) {
  return (
    <span className={`avatar ${large ? "avatar-large" : ""}`} style={{ background: roleColor?.light || "rgba(29, 158, 117, 0.14)", color: roleColor?.primary || "var(--success)" }}>
      {avatarDataUrl ? <img src={avatarDataUrl} alt="" /> : username?.slice(0, 2).toUpperCase() || "U"}
    </span>
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
      <h2 style={{ marginTop: 0, color: "#0F172A" }}>Faculty Management</h2>
      {error && <div className="badge" style={{ marginBottom: 12, color: "var(--danger)", background: "#fee2e2" }}>⚠️ {error}</div>}
      <form className="form" onSubmit={submit}>
        <input className="input" placeholder="Name" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <PasswordField placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
        <input className="input" placeholder="Designation" value={form.faculty_designation} onChange={(e) => setForm({ ...form, faculty_designation: e.target.value })} />
        <button className="btn" style={{ background: "var(--primary)" }}>Create Faculty Member</button>
      </form>
    </section>
  );
}
