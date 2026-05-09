import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeacherComplaints, updateComplaintStatus, addTeacherComment } from "../../services/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";
import ConfidenceBar from "../../components/Teacher/ConfidenceBar";
import SolutionModal from "../../components/Teacher/SolutionModal";
import ComplaintCard from "../../components/Teacher/ComplaintCard";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

export default function TeacherDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [solutionTarget, setSolutionTarget] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const data = await getTeacherComplaints();
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints. Retrying…");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-refresh every 30s ─────────────────────────────────────
  useAutoRefresh(fetchData, 30000);

  const handleSolutionSubmit = async (id, text) => {
    try {
      await addTeacherComment(id, text);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, teacher_comments: text } : c))
      );
    } catch (err) {
      console.error("Comment save failed:", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!newStatus) return;
    try {
      const res = await updateComplaintStatus(id, newStatus.trim());
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: res?.status ?? newStatus } : c))
      );
    } catch (err) {
      console.error("Status update failed:", err.response?.data || err);
    }
  };

  const filtered =
    filter === "All" ? complaints : complaints.filter((c) => c.status === filter);

  const stats = [
    { label: "Assigned", value: complaints.length, icon: "📋", color: "#5b9af5", bg: "rgba(91,154,245,0.1)" },
    { label: "In Progress", value: complaints.filter((c) => c.status === "In Progress").length, icon: "⚡", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { label: "Resolved", value: complaints.filter((c) => ["Resolved", "Solved"].includes(c.status)).length, icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "Submitted", value: complaints.filter((c) => ["Submitted", "Pending"].includes(c.status)).length, icon: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Loading complaints…</span>
    </div>
  );

  const fullName = localStorage.getItem("full_name") || localStorage.getItem("username") || "Teacher";
  const designation = localStorage.getItem("faculty_designation") || "";
  const departmentName = localStorage.getItem("department_name") || "";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <div className="dash-page">

        {/* ── Header ───────────────────────────────────────────── */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <div className="dash-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 600, marginBottom: 5 }}>{greeting} 👋</div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                {fullName},
                <br />
                <span style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Faculty Member Dashboard
                </span>
              </h1>
              <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginTop: 7 }}>
                Manage assigned complaints and provide resolutions.
              </p>
              <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {designation && (
                  <div style={{ display: "inline-flex", padding: "6px 11px", borderRadius: 999, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", color: "#7c3aed", fontSize: 11, fontWeight: 800 }}>
                    Role: {designation}
                  </div>
                )}
                {departmentName && (
                  <div style={{ display: "inline-flex", padding: "6px 11px", borderRadius: 999, background: "rgba(91,154,245,0.08)", border: "1px solid rgba(91,154,245,0.18)", color: "#3d72e0", fontSize: 11, fontWeight: 800 }}>
                    Dept: {departmentName}
                  </div>
                )}
              </div>
            </div>
            <div className="dash-date-badge" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
              <div style={{ padding: "9px 16px", borderRadius: 12, background: "white", border: "1px solid rgba(91,154,245,0.15)", boxShadow: "0 2px 12px rgba(61,114,224,0.07)", fontSize: 12, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>
                📅 {dateStr}
              </div>
              <div style={{ padding: "6px 12px", borderRadius: 20, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", fontSize: 11, color: "#8b5cf6", fontWeight: 700 }}>
                Teacher Portal
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Error banner ──────────────────────────────────────── */}
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
                <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Complaints Section ────────────────────────────────── */}
        <motion.div {...fadeUp(0.15)}>
          <div className="section-card">
            <div className="section-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="icon-box" style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", color: "white" }}>📋</div>
                <div>
                  <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>Assigned Complaints</h2>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{complaints.length} total assigned to you</p>
                </div>
              </div>
              <div className="filter-pills">
                {["All", "Submitted", "In Progress", "Resolved"].map((s) => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`pill ${filter === s ? "active" : ""}`}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
              <AnimatePresence>
                {filtered.length === 0
                  ? <div className="empty-state">No complaints in this category 🔍</div>
                  : filtered.map((c, i) => (
                      <ComplaintCard key={c.id} c={c} index={i}
                        onOpenSolution={setSolutionTarget}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                }
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {solutionTarget && (
          <SolutionModal
            complaint={solutionTarget}
            onClose={() => setSolutionTarget(null)}
            onSubmit={handleSolutionSubmit}
          />
        )}
      </AnimatePresence>
    </>
  );
}



