import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import PendingCard from "../../components/admin/PendingCard";
import SolvedCard from "../../components/admin/SolvedCard";
import ActivityFeed from "../../components/admin/ActivityFeed";
import AssignTeacherModal from "../../components/admin/AssignTeacherModal";
import FinalizeModal from "../../components/admin/FinalizeModal";
import FacultyManagementPanel from "../../components/staff/FacultyManagementPanel";
import {
  getSolvedComplaints,
  getActivityFeed,
  getReadyComplaints,
  getWeeklyReport,
  downloadWeeklyReportPdf,
  getDepartments,
} from "../../services/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function AdminDashboard({ dashboardRole = "Supervisor" }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [solved, setSolved] = useState([]);
  const [activity, setActivity] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [finalTarget, setFinalTarget] = useState(null);
  const [filterPending, setFilterPending] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const data = await getReadyComplaints();
      setPending(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("pending fetch:", e);
    }
  }, []);

  const fetchSolved = useCallback(async () => {
    try {
      const data = await getSolvedComplaints();
      setSolved(Array.isArray(data) ? data : data?.results ?? []);
    } catch (e) {
      console.error("solved fetch:", e);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    if (dashboardRole !== "Supervisor") return;
    try {
      const data = await getActivityFeed();
      setActivity(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("activity fetch:", e);
    }
  }, [dashboardRole]);

  const fetchDepartments = useCallback(async () => {
    if (dashboardRole !== "Supervisor") return;
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("dept fetch:", e);
    }
  }, [dashboardRole]);

  const fetchWeeklyReport = async () => {
    try {
      setLoadingWeekly(true);
      const data = await getWeeklyReport();
      setWeeklyData(data);
    } catch (err) {
      console.log("Weekly report error:", err);
    } finally {
      setLoadingWeekly(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReport();
    fetchDepartments();
  }, [fetchDepartments]);

  const initLoad = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([
        fetchPending(),
        fetchSolved(),
        dashboardRole === "Supervisor" ? fetchActivity() : Promise.resolve(),
        fetchDepartments(),
      ]);
    } catch {
      setError("Failed to load dashboard. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [dashboardRole, fetchPending, fetchSolved, fetchActivity, fetchDepartments]);

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await downloadWeeklyReportPdf();
      if (!res.data?.type?.includes("application/pdf")) {
        throw new Error("Server did not return a PDF file.");
      }
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Weekly_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("PDF download error:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  useAutoRefresh(initLoad, 30000);
  useAutoRefresh(fetchActivity, 15000);

  const handleAssigned = (complaintId) => {
    setPending((prev) => prev.filter((c) => c.id !== complaintId));
    if (dashboardRole === "Supervisor") fetchActivity();
    fetchSolved();
  };

  const handleFinalized = (complaintId) => {
    setSolved((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: "Fulfilled" } : c))
    );
    if (dashboardRole === "Supervisor") fetchActivity();
  };

  const handleRejected = (complaintId) => {
    setSolved((prev) => prev.filter((c) => c.id !== complaintId));
    if (dashboardRole === "Supervisor") fetchActivity();
  };

  const filteredPending =
    filterPending === "All"
      ? pending
      : pending.filter((c) => c.severity?.toLowerCase() === filterPending.toLowerCase());

  const totalDeptComplaints = departments.reduce((sum, d) => sum + (d.complaint_stats?.total || 0), 0);
  const activeDepts = departments.filter((d) => d.hod || d.dsa).length;

  const stats = [
    { label: "Needs Assignment", value: pending.length, icon: "📋", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Solved / Review", value: solved.length, icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "Finalized", value: solved.filter((c) => c.status === "Fulfilled" || c.status === "Closed").length, icon: "🔒", color: "#5b9af5", bg: "rgba(91,154,245,0.1)" },
    ...(dashboardRole === "Supervisor"
      ? [{ label: "Activity Logs", value: activity.length, icon: "⚡", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" }]
      : []),
  ];

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Loading dashboard…</span>
    </div>
  );

  if (error) return (
    <div className="loading-screen">
      <div style={{ fontSize: 36 }}>⚠️</div>
      <p style={{ fontSize: 14, color: "#ef4444", fontWeight: 600 }}>{error}</p>
      <button onClick={initLoad} style={{ padding: "9px 22px", borderRadius: 10, background: "linear-gradient(135deg,#5b9af5,#3d72e0)", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
        Retry
      </button>
    </div>
  );

  const fullName = localStorage.getItem("full_name") || localStorage.getItem("username") || dashboardRole;
  const departmentName = localStorage.getItem("department_name") || "All Departments";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
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
                {dashboardRole} Dashboard
              </span>
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginTop: 7 }}>
              {dashboardRole === "Supervisor"
                ? "System-wide oversight, complaint management, and department control."
                : "Complaint assignment, final review, and activity oversight."}
            </p>
            <div style={{ marginTop: 8, display: "inline-flex", padding: "6px 11px", borderRadius: 999, background: "rgba(91,154,245,0.08)", border: "1px solid rgba(91,154,245,0.18)", color: "#3d72e0", fontSize: 11, fontWeight: 800 }}>
              {dashboardRole === "Supervisor" ? "All Departments" : `Department: ${departmentName}`}
            </div>
          </div>
          <div className="dash-date-badge" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <div style={{ padding: "9px 16px", borderRadius: 12, background: "white", border: "1px solid rgba(91,154,245,0.15)", boxShadow: "0 2px 12px rgba(61,114,224,0.07)", fontSize: 12, color: "#64748b", fontWeight: 600, whiteSpace: "nowrap" }}>
              📅 {dateStr}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e" }} />
              <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>System Online</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── SUPERVISOR: System Overview ──────────────────────── */}
      {dashboardRole === "Supervisor" && (
        <motion.div {...fadeUp(0.04)} style={{ marginBottom: 22 }}>
          <div className="section-card">
            <div className="section-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="icon-box" style={{ background: "linear-gradient(135deg,#7c3aed,#5b21b6)", color: "white" }}>🏛</div>
                <div>
                  <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>System Overview</h2>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>All departments and complaint routing status</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(91,154,245,0.28)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/supervisor-dashboard/departments")}
                style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "linear-gradient(90deg,#5b9af5,#3d72e0)", color: "white", fontWeight: 800, fontSize: 12, cursor: "pointer" }}
              >
                Manage Departments →
              </motion.button>
            </div>

            {/* System stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
              {[
                { label: "Departments", value: departments.length, icon: "🏛", color: "#7c3aed" },
                { label: "Active (HOD/DSA)", value: activeDepts, icon: "✅", color: "#22c55e" },
                { label: "Total Complaints", value: totalDeptComplaints, icon: "📋", color: "#f59e0b" },
                { label: "Pending Assignment", value: pending.length, icon: "⏳", color: "#ef4444" },
              ].map((item) => (
                <div key={item.label} style={{ background: "#f8fafc", borderRadius: 12, padding: "12px 14px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 18, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: item.color }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{item.label}</div>
                </div>
              ))}
            </div>

            {/* Departments list */}
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
              {departments.length === 0 ? (
                <div className="empty-state">
                  No departments found.{" "}
                  <span
                    onClick={() => navigate("/supervisor-dashboard/departments")}
                    style={{ color: "#5b9af5", cursor: "pointer", fontWeight: 700 }}
                  >
                    Add departments
                  </span>
                </div>
              ) : departments.map((dept) => {
                const s = dept.complaint_stats || {};
                return (
                  <div key={dept.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{dept.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 2 }}>
                        HOD: {dept.hod_name || <span style={{ color: "#ef4444" }}>Not set</span>}
                        {" · "}
                        DSA: {dept.dsa_name || <span style={{ color: "#ef4444" }}>Not set</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[
                        ["Total", s.total || 0, "#64748b"],
                        ["Pending", s.submitted || 0, "#f59e0b"],
                        ["In Progress", s.in_progress || 0, "#3d72e0"],
                        ["Resolved", (s.resolved || 0) + (s.closed || 0), "#22c55e"],
                      ].map(([label, val, color]) => (
                        <div key={label} style={{ textAlign: "center", minWidth: 50 }}>
                          <div style={{ fontSize: 14, fontWeight: 900, color }}>{val}</div>
                          <div style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 700 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.07)}>
        <div className="stat-grid">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: "0 14px 36px rgba(61,114,224,0.13)" }}
              style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 3px 16px rgba(61,114,224,0.06)", border: "1px solid rgba(91,154,245,0.09)", cursor: "default" }}
            >
              <div style={{ height: 4, background: s.color, opacity: 0.85 }} />
              <div style={{ padding: "16px 18px 18px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: "1.75rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Assignment + Supervisor Activity ─────────────── */}
      <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 22, alignItems: "start" }}>

        {/* Ready for Assignment — DSA only */}
        {dashboardRole !== "Supervisor" && (
          <motion.div {...fadeUp(0.14)}>
            <div className="section-card">
              <div className="section-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="icon-box" style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "white" }}>📋</div>
                  <div>
                    <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>Ready for Assignment</h2>
                    <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{pending.length} complaints waiting</p>
                  </div>
                </div>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="badge"
                  style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}
                >
                  ● Needs Action
                </motion.span>
              </div>
              <div style={{ padding: "12px 16px 8px", borderBottom: "1px solid #f1f5f9" }}>
                <div className="filter-pills">
                  {["All", "Low", "Medium", "High"].map((s) => (
                    <button key={s} onClick={() => setFilterPending(s)}
                      className={`pill ${filterPending === s ? "active" : ""}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
                <AnimatePresence>
                  {filteredPending.length === 0
                    ? <div className="empty-state">🎉 All complaints assigned!</div>
                    : filteredPending.map((c, i) => <PendingCard key={c.id} c={c} index={i} onAssign={setAssignTarget} />)
                  }
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {dashboardRole === "Supervisor" && (
          <motion.div {...fadeUp(0.18)}>
            <ActivityFeed activities={activity} onRefresh={fetchActivity} />
          </motion.div>
        )}
      </div>

      {/* ── Solved Complaints ─────────────────────────────────── */}
      <motion.div {...fadeUp(0.22)}>
        <div className="section-card">
          <div className="section-card-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="icon-box" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "white" }}>✅</div>
              <div>
                <h2 style={{ fontSize: 14.5, fontWeight: 900, color: "#0f172a" }}>Solved Complaints</h2>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Review and finalize resolved cases</p>
              </div>
            </div>
            <span className="badge" style={{ color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>
              {solved.filter((c) => c.status !== "Fulfilled" && c.status !== "Closed").length} pending finalization
            </span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence>
              {solved.length === 0
                ? <div className="empty-state">No solved complaints yet.</div>
                : solved.map((c, i) => (
                  <SolvedCard key={c.id} c={c} index={i} onFinalize={setFinalTarget} onReject={handleRejected} />
                ))
              }
            </AnimatePresence>
          </div>
        </div>

        {/* Weekly Report PDF Download */}
        <div style={{ marginTop: 14 }}>
          {weeklyData && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Total Complaints", value: weeklyData.total_complaints, color: "#64748b" },
                { label: "Solved", value: weeklyData.solved, color: "#22c55e" },
                { label: "Pending", value: weeklyData.pending, color: "#f59e0b" },
                { label: "In Progress", value: weeklyData.in_progress, color: "#5b9af5" },
              ].map((item) => (
                <div key={item.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.value ?? 0}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}
          <motion.button
            whileHover={!downloadingPdf ? { y: -2, boxShadow: "0 8px 20px rgba(34,197,94,0.25)" } : {}}
            whileTap={!downloadingPdf ? { scale: 0.97 } : {}}
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{
              width: "100%",
              padding: "13px 14px",
              borderRadius: 12,
              border: "none",
              cursor: downloadingPdf ? "not-allowed" : "pointer",
              fontWeight: 800,
              fontSize: 13,
              color: "white",
              background: downloadingPdf ? "#94a3b8" : "linear-gradient(135deg,#22c55e,#16a34a)",
              boxShadow: "0 3px 16px rgba(34,197,94,0.15)",
            }}
          >
            {downloadingPdf ? "Downloading..." : "⬇ Download Weekly Report PDF"}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Faculty Management (DSA only) ────────────────────── */}
      {dashboardRole === "DSA" && (
        <FacultyManagementPanel title="DSA Faculty Management" />
      )}

      {/* ── Modals ────────────────────────────────────────────── */}
      <AnimatePresence>
        {assignTarget && <AssignTeacherModal complaint={assignTarget} onClose={() => setAssignTarget(null)} onAssigned={handleAssigned} />}
        {finalTarget && <FinalizeModal complaint={finalTarget} onClose={() => setFinalTarget(null)} onFinalized={handleFinalized} />}
      </AnimatePresence>
    </div>
  );
}
