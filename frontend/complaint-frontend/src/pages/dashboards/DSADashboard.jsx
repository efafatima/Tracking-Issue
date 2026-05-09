import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import StatsCards from "../../components/hod/Statecards";
import PendingComplaints from "../../components/hod/PendingComplaints";

import AssignTeacherModal from "../../components/admin/AssignTeacherModal";
import FacultyManagementPanel from "../../components/staff/FacultyManagementPanel";
import {
  getDSAStats,
  getDSAPendingComplaints,
  dsaReviewComplaint,
} from "../../services/api";

import { fadeUp } from "../../components/Complaint/helpers";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";

export default function DSADashboard() {
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState({
    needsAssignment: 0,
    inProgress: 0,
    resolvedForReview: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [reviewBusy, setReviewBusy] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      

      const [complaintsData, statsData] = await Promise.all([
  getDSAPendingComplaints(),
  getDSAStats(),
]);
      setPending(Array.isArray(complaintsData) ? complaintsData : []);
      setStats(
        statsData || {
          needsAssignment: 0,
          inProgress: 0,
          resolvedForReview: 0,
          overdue: 0,
        }
      );

    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to load data. Retrying…");
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    init();
  }, [refreshData]);

  // Silent background refresh every 30s
  useAutoRefresh(refreshData, 30000);

  const handleReviewAccept = async (complaintId, note = "") => {
    setReviewBusy(true);
    try {
      await dsaReviewComplaint(complaintId, "accept", note);
      const targetComplaint = pending.find((c) => c.id === complaintId);
      setReviewTarget(null);
      if (targetComplaint) setAssignTarget(targetComplaint);
    } catch (err) {
      console.error("Accept failed:", err);
      setError("Could not accept complaint. Please try again.");
    } finally {
      setReviewBusy(false);
    }
  };

  const handleReviewReject = async (complaintId, note = "") => {
    setReviewBusy(true);
    try {
      await dsaReviewComplaint(complaintId, "reject", note);
      setReviewTarget(null);
      await refreshData();
    } catch (err) {
      console.error("Reject failed:", err);
      setError("Could not reject complaint. Please try again.");
    } finally {
      setReviewBusy(false);
    }
  };

  const handleAssigned = async () => {
    setAssignTarget(null);
    await refreshData();
  };

  const statsCards = [
    {
      label: "Needs Assignment",
      value: stats.needsAssignment,
      icon: "⚡",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      icon: "🔄",
      color: "#5b9af5",
      bg: "rgba(91,154,245,0.1)",
    },
    {
      label: "Resolved for Review",
      value: stats.resolvedForReview,
      icon: "✅",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      label: "Overdue",
      value: stats.overdue,
      icon: "🔴",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.1)",
    },
  ];

  if (loading)
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
          Loading dashboard…
        </span>
      </div>
    );

  const fullName =
    localStorage.getItem("full_name") ||
    localStorage.getItem("username") ||
    "DSA";
  const departmentName =
    localStorage.getItem("department_name") || "No Department Assigned";
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <div className="dash-page">

        {/* ── Header ─────────────────────────────────────────── */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 32 }}>
          <div
            className="dash-header-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "#94a3b8",
                  fontWeight: 600,
                  marginBottom: 5,
                }}
              >
                {greeting} 👋
              </div>
              <h1
                style={{
                  fontSize: "1.85rem",
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.15,
                }}
              >
                {fullName},
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg,#5b9af5,#3d72e0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  DSA Dashboard
                </span>
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: "#94a3b8",
                  fontWeight: 500,
                  marginTop: 7,
                }}
              >
                Manage administrative complaints, assign faculty
              </p>
              <div
                style={{
                  marginTop: 8,
                  display: "inline-flex",
                  padding: "6px 11px",
                  borderRadius: 999,
                  background: "rgba(91,154,245,0.08)",
                  border: "1px solid rgba(91,154,245,0.18)",
                  color: "#3d72e0",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                Department: {departmentName}
              </div>
            </div>
            <div
              className="dash-date-badge"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  padding: "9px 16px",
                  borderRadius: 12,
                  background: "white",
                  border: "1px solid rgba(91,154,245,0.15)",
                  boxShadow: "0 2px 12px rgba(61,114,224,0.07)",
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                📅 {dateStr}
              </div>
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  background: "rgba(91,154,245,0.08)",
                  border: "1px solid rgba(91,154,245,0.18)",
                  fontSize: 11,
                  color: "#3d72e0",
                  fontWeight: 700,
                }}
              >
                DSA Portal
              </div>
            </div>
          </div>
        </motion.div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        {/* ── Stats ──────────────────────────────────────────── */}
        <StatsCards stats={statsCards} />

        {/* ── Pending Complaints ─────────────────────────────── */}
        <PendingComplaints pending={pending} onReview={setReviewTarget} />

        {/* ── Faculty Management ─────────────────────────────── */}
        <FacultyManagementPanel title="Department Faculty Management" />
      </div>


      {/* ── Assign Teacher Modal (after Accept) ─────────────── */}
      {assignTarget && (
        <AssignTeacherModal
          complaint={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={handleAssigned}
        />
      )}
    </>
  );
}
