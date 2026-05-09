import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../../components/Complaint/helpers";
import ComplaintForm from "../../components/Complaint/ComplaintForm";
import ComplaintList from "../../components/Complaint/ComplaintList";
import RatingModal from "../../components/Complaint/RatingModal";
import { submitComplaint, rateComplaint, getStudentComplaints, getStudentStats, getNotifications, updateStudentComplaint, deleteStudentComplaint } from "../../services/api";
import ComplaintDetailModal from "../../components/Complaint/ComplaintDetailModal";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import BotpressChat from "../../components/Chatbot/BotpressChat";

const CATEGORIES = ["Academic", "Administrative", "Facilities", "Behavior-related", "Other"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

function EditComplaintModal({ complaint, onClose, onSave }) {
  const [title, setTitle] = useState(complaint.title || "");
  const [description, setDescription] = useState(complaint.description || "");
  const [category, setCategory] = useState(complaint.category || "Academic");
  const [priority, setPriority] = useState(complaint.priority || complaint.severity || "Medium");
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "10px 13px",
    borderRadius: 10,
    border: "1.5px solid #e2e8f0",
    fontSize: 13,
    color: "#1e293b",
    background: "#f8faff",
    outline: "none",
    boxSizing: "border-box",
  };

  const handleSave = async () => {
    if (!title.trim()) return setErr("Title is required.");
    if (!description.trim()) return setErr("Description is required.");
    setSaving(true);
    setErr("");
    try {
      await onSave(complaint.id, { title: title.trim(), description: description.trim(), category, priority, attachments });
      onClose();
    } catch (e) {
      setErr(e.response?.data?.detail || "Could not save. Only submitted complaints can be edited.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={saving ? undefined : onClose}
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(520px, 100%)", background: "white", borderRadius: 20, boxShadow: "0 24px 70px rgba(15,23,42,0.22)", border: "1px solid #e2e8f0", overflow: "hidden" }}
      >
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#3d72e0", textTransform: "uppercase", marginBottom: 4 }}>Edit Complaint</div>
            <h2 style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", margin: 0 }}>#{complaint.id}</h2>
          </div>
          <button onClick={onClose} disabled={saving} style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 16, color: "#64748b" }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {err && <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 9, padding: "9px 13px", fontSize: 12.5, color: "#b91c1c", fontWeight: 600 }}>⚠ {err}</div>}

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5 }}>Title *</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Complaint title" />
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5 }}>Description *</p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} placeholder="Describe your issue..." />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5 }}>Category</p>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5 }}>Priority</p>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5 }}>Update Attachments (optional)</p>
            <label style={{ display: "block", border: "1.5px dashed #cbd5e1", borderRadius: 10, padding: "13px", textAlign: "center", cursor: "pointer", background: "#f8faff" }}>
              <input type="file" multiple accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt" onChange={(e) => setAttachments(Array.from(e.target.files || []))} style={{ display: "none" }} />
              <div style={{ fontSize: 12.5, color: "#94a3b8" }}>Drop files or <span style={{ color: "#5b9af5", fontWeight: 700 }}>browse</span></div>
            </label>
            {attachments.length > 0 && <p style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600, marginTop: 5 }}>{attachments.length} file(s) selected</p>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 22px 18px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={saving} style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={!saving ? { scale: 1.02, boxShadow: "0 6px 20px rgba(61,114,224,0.3)" } : {}}
            whileTap={{ scale: 0.97 }}
            style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: saving ? "#94a3b8" : "linear-gradient(90deg,#5b9af5,#3d72e0)", color: "white", fontWeight: 800, fontSize: 13, cursor: saving ? "not-allowed" : "pointer" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [ratingTarget, setRatingTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [submitResult, setSubmitResult] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [complaintsRes, statsRes, notificationsRes] = await Promise.all([
        getStudentComplaints(),
        getStudentStats(),
        getNotifications(),
      ]);
      setComplaints(Array.isArray(complaintsRes) ? complaintsRes : []);
      setStatsData(statsRes || null);
      setNotifications(Array.isArray(notificationsRes) ? notificationsRes : []);
    } catch (err) {
      console.error(err);
      setError("Could not load your complaints. Retrying…");
      setComplaints([]);
    }
  }, []);

  useAutoRefresh(fetchData, 30000);

  const handleNewComplaint = async (form) => {
    try {
      const res = await submitComplaint({
        title: form.title,
        description: form.details,
        category: form.category,
        priority: form.priority,
        attachments: form.attachments,
        anonymous: form.anonymous,
      });
      setSubmitResult(res);
      setComplaints((prev) => [
        {
          id: res.id,
          title: form.title,
          description: form.details,
          category: res.category || form.category,
          priority: res.priority || form.priority,
          severity: res.priority || form.priority,
          status: "Submitted",
          is_anonymous: form.anonymous,
          rated: false,
        },
        ...prev,
      ]);
      return res;
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      throw err;
    }
  };

  const handleRatingSubmit = async (id, stars, feedback) => {
    try {
      const res = await rateComplaint(id, { rating: stars, feedback });
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...res, rated: true } : c))
      );
      setRatingTarget(null);
    } catch (err) {
      console.error("Rating error:", err.response?.data);
    }
  };

  const handleSaveEdit = async (id, data) => {
    const updated = await updateStudentComplaint(id, data);
    setComplaints((prev) => prev.map((item) => item.id === id ? { ...item, ...updated } : item));
    await fetchData();
  };

  const handleDeleteComplaint = async (complaint) => {
    if (!window.confirm(`Delete complaint #${complaint.id}?`)) return;
    try {
      await deleteStudentComplaint(complaint.id);
      setComplaints((prev) => prev.filter((item) => item.id !== complaint.id));
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Only submitted complaints can be deleted.");
    }
  };

  const filtered =
    filterStatus === "All"
      ? complaints
      : complaints.filter((c) => c.status === filterStatus);

  const stats = [
    { label: "Total", value: statsData?.total || 0, icon: "📋", color: "#5b9af5" },
    { label: "Resolved", value: statsData?.resolved || statsData?.solved || 0, icon: "✅", color: "#22c55e" },
    { label: "In Progress", value: statsData?.in_progress || 0, icon: "⚡", color: "#8b5cf6" },
    { label: "Pending", value: statsData?.pending || 0, icon: "⏳", color: "#f59e0b" },
  ];

  const fullName = localStorage.getItem("full_name") || localStorage.getItem("username") || "Student";
  const departmentName = localStorage.getItem("department_name") || "No Department Assigned";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <BotpressChat />
      <style>{`select option { background: white; color: #1e293b; }`}</style>

      <div className="dash-page">

        {/* ── Header ───────────────────────────────────────────── */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <div className="dash-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 600, marginBottom: 5 }}>
                {greeting} 👋
              </div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                {fullName},
                <br />
                <span style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Student Dashboard
                </span>
              </h1>
              <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginTop: 7 }}>
                Submit complaints and track their resolution in real-time.
              </p>
              <div style={{ marginTop: 8, display: "inline-flex", padding: "6px 11px", borderRadius: 999, background: "rgba(91,154,245,0.08)", border: "1px solid rgba(91,154,245,0.18)", color: "#3d72e0", fontSize: 11, fontWeight: 800 }}>
                Department: {departmentName}
              </div>
            </div>
            <div className="dash-date-badge" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
              <div style={{ padding: "9px 16px", borderRadius: 12, background: "white", border: "1px solid rgba(91,154,245,0.15)", boxShadow: "0 2px 12px rgba(61,114,224,0.07)", fontSize: 12, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>
                📅 {dateStr}
              </div>
              <div style={{ padding: "6px 12px", borderRadius: 20, background: "rgba(91,154,245,0.08)", border: "1px solid rgba(91,154,245,0.18)", fontSize: 11, color: "#3d72e0", fontWeight: 700 }}>
                Student Portal
              </div>
            </div>
          </div>
        </motion.div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* ── Stat Cards ────────────────────────────────────────── */}
        <div className="stat-grid">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: "0 14px 36px rgba(61,114,224,0.13)" }}
              style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 3px 16px rgba(61,114,224,0.06)", border: "1px solid rgba(91,154,245,0.09)", cursor: "default" }}>
              <div style={{ height: 4, background: s.color, opacity: 0.85 }} />
              <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, marginBottom: 12 }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Complaint Form ────────────────────────────────────── */}
        <ComplaintForm onSubmit={handleNewComplaint} />

        {/* ── My Complaints ─────────────────────────────────────── */}
        <motion.div {...fadeUp(0.1)} style={{ marginTop: 24 }}>
          <div className="section-card">
            <div className="section-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="icon-box" style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", color: "white" }}>📋</div>
                <div>
                  <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>My Complaints</h2>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{complaints.length} total submitted</p>
                </div>
              </div>
              <div style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(91,154,245,0.08)", border: "1px solid rgba(91,154,245,0.18)", fontSize: 11, color: "#3d72e0", fontWeight: 700 }}>
                Auto-refreshes every 30s
              </div>
            </div>
            <ComplaintList
              complaints={filtered}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onRate={setRatingTarget}
              onEdit={setEditTarget}
              onDelete={handleDeleteComplaint}
              onView={setDetailTarget}
            />
          </div>
        </motion.div>

        {/* ── Notifications ─────────────────────────────────────── */}
        <motion.div {...fadeUp(0.12)} style={{ marginTop: 22 }}>
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>Notifications</h2>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{notifications.length} recent updates</p>
              </div>
            </div>
            <div className="section-card-body" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {notifications.length === 0 ? (
                <div className="empty-state">No notifications yet.</div>
              ) : notifications.slice(0, 6).map((n) => (
                <div key={n.id} style={{ padding: "10px 12px", borderRadius: 10, background: n.is_read ? "#f8fafc" : "rgba(91,154,245,0.08)", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>{n.message}</div>
                  <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 3 }}>{new Date(n.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Pending Ratings ───────────────────────────────────── */}
        {complaints.some((c) => ["Solved", "Fulfilled", "Resolved"].includes(c.status) && !c.rated) && (
          <motion.div {...fadeUp(0.2)} style={{ marginTop: 22 }}>
            <div className="section-card" style={{ border: "1px solid rgba(245,158,11,0.22)" }}>
              <div className="section-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="icon-box" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "white" }}>⭐</div>
                  <div>
                    <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>Pending Ratings</h2>
                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Share your feedback on resolved complaints</p>
                  </div>
                </div>
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 20, color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
                  ● Action Needed
                </motion.span>
              </div>
              <div className="section-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {complaints.filter((c) => ["Solved", "Fulfilled", "Resolved"].includes(c.status) && !c.rated).map((c, i) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderRadius: 12, background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{c.category} · #{c.id}</div>
                    </div>
                    <motion.button onClick={() => setRatingTarget(c)}
                      whileHover={{ scale: 1.05, boxShadow: "0 6px 18px rgba(245,158,11,0.35)" }}
                      whileTap={{ scale: 0.95 }}
                      style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", background: "linear-gradient(90deg,#f59e0b,#f97316)", color: "white", fontWeight: 700, fontSize: 12.5, boxShadow: "0 3px 12px rgba(245,158,11,0.25)" }}>
                      ⭐ Rate Now
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {ratingTarget && (
          <RatingModal complaint={ratingTarget} onClose={() => setRatingTarget(null)} onSubmit={handleRatingSubmit} />
        )}
        {editTarget && (
          <EditComplaintModal complaint={editTarget} onClose={() => setEditTarget(null)} onSave={handleSaveEdit} />
        )}
        {detailTarget && (
          <ComplaintDetailModal
            complaint={detailTarget}
            onClose={() => setDetailTarget(null)}
            onCommentAdded={fetchData}
          />
        )}
      </AnimatePresence>
    </>
  );
}
