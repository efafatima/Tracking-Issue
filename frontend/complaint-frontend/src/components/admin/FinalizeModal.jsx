// ─── FinalizeModal.jsx ───────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { finalizeComplaint, rejectSolvedComplaint } from "../../services/api";

export default function FinalizeModal({ complaint, onClose, onFinalized, onRejected }) {
  const [mode,    setMode]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  // const handle = async (action) => {
  //   setMode(action);
  //   setLoading(true);
  //   setError("");

  //   try {
  //     if (action === "finalize") {
  //       await finalizeComplaint(complaint.id);
  //     } else {
  //       // FIX: was rejectComplaint — now correctly calls rejectSolvedComplaint
  //       await rejectSolvedComplaint(complaint.id);
  //     }

  //     setDone(true);

  //     setTimeout(() => {
  //       if (action === "finalize") onFinalized(complaint.id);
  //       else if (onRejected) onRejected(complaint.id);
  //       onClose();
  //     }, 1000);

  //   } catch (e) {
  //     setError("Action failed. Please try again.");
  //     setLoading(false);
  //     setMode(null);
  //   }
  // };


  const handle = async (action) => {
  if (loading) return; // ✅ prevent double click

  setMode(action);
  setLoading(true);
  setError("");

  try {
    if (action === "finalize") {
      await finalizeComplaint(complaint.id);
    } else {
      await rejectSolvedComplaint(complaint.id);
    }

    setDone(true);

    setTimeout(() => {
      if (action === "finalize") {
        onFinalized && onFinalized(complaint.id);
      } else {
        onRejected && onRejected(complaint.id);
      }

      setLoading(false); // ✅ reset
      onClose();
    }, 900); // slightly smoother timing

  } catch (e) {
    console.error("modal action error:", e); // ✅ debug help
    setError("Action failed. Please try again.");
    setLoading(false);
    setMode(null);
  }
};

  const isLoading = (action) => loading && mode === action;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,23,42,0.52)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: "white", borderRadius: 24, padding: "40px 32px 32px",
          width: "100%", maxWidth: 420, position: "relative", textAlign: "center",
          boxShadow: "0 24px 80px rgba(61,114,224,0.2)",
          border: "1px solid rgba(91,154,245,0.12)",
        }}
      >
        {/* Top accent bar */}
        <motion.div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          height: 4, width: 80, borderRadius: "0 0 8px 8px",
          background: done && mode === "finalize"
            ? "linear-gradient(90deg,#22c55e,#16a34a,#22c55e)"
            : done && mode === "reject"
              ? "linear-gradient(90deg,#ef4444,#dc2626,#ef4444)"
              : "linear-gradient(90deg,#5b9af5,#3d72e0,#7ab5f8,#5b9af5)",
          backgroundSize: "200%",
        }} animate={{ backgroundPosition: ["0%", "100%", "0%"] }} transition={{ duration: 3, repeat: Infinity }} />

        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] }}
          transition={{ duration: 2.5, delay: 0.3, repeat: Infinity, repeatDelay: 3 }}
          style={{ fontSize: 50, marginBottom: 14 }}
        >
          {done ? (mode === "finalize" ? "🔒" : "↩️") : "📝"}
        </motion.div>

        <motion.span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}>
          ✦ BZU Complaint System ✦
        </motion.span>

        <h3 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#0f172a", margin: "10px 0 8px", letterSpacing: "-0.02em" }}>
          Review{" "}
          <span style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Solved Complaint
          </span>
        </h3>

        <p style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500, lineHeight: 1.7, marginBottom: 4 }}>
          "{complaint.title}"
        </p>

        {/* Meta info */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "3px 9px" }}>
            {complaint.category}
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.1)", borderRadius: 6, padding: "3px 9px" }}>
            Solved
          </span>
        </div>

        {complaint.teacher_comments && (
          <div style={{
            margin: "12px 0 16px", padding: "12px 14px",
            background: "rgba(91,154,245,0.05)", borderRadius: 12,
            border: "1px solid rgba(91,154,245,0.12)", textAlign: "left",
          }}>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: "#94a3b8", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Teacher's Note</p>
            <p style={{ fontSize: 12, color: "#374151", fontWeight: 500, lineHeight: 1.6 }}>
              {complaint.teacher_comments}
            </p>
          </div>
        )}

        {complaint.assigned_teacher && (
          <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 20 }}>
            Solved by{" "}
            <strong style={{ color: "#1e293b" }}>
              {complaint.assigned_teacher?.name || complaint.assigned_teacher?.username || "Teacher"}
            </strong>
          </p>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 14, padding: "8px 12px", background: "rgba(239,68,68,0.07)", borderRadius: 8 }}>
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ borderTop: "1px dashed #e2e8f0", margin: "0 0 18px" }} />

        <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 14 }}>
          <strong style={{ color: "#374151" }}>Finalize</strong> to close permanently, or{" "}
          <strong style={{ color: "#374151" }}>Reject</strong> to send back for review.
        </p>

        {/* Three buttons: Cancel | Reject | Finalize */}
        <div style={{ display: "flex", gap: 8 }}>

          {/* Cancel */}
          <motion.button onClick={onClose} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            disabled={loading}
            style={{ flex: 1, height: 48, borderRadius: 13, border: "1.5px solid #e2e8f0", background: "white", color: "#64748b", fontWeight: 700, fontSize: 12, cursor: loading ? "not-allowed" : "pointer" }}>
            Cancel
          </motion.button>

          {/* Reject */}
          <motion.button
            onClick={() => handle("reject")}
            disabled={loading || done}
            whileHover={!loading && !done ? { scale: 1.02, boxShadow: "0 8px 24px rgba(239,68,68,0.3)" } : {}}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1.5, height: 48, borderRadius: 13, border: "none",
              background: isLoading("reject") || (done && mode === "reject")
                ? "linear-gradient(90deg,#f87171,#ef4444)"
                : "linear-gradient(90deg,#fca5a5,#f87171)",
              color: "white", fontWeight: 700, fontSize: 12,
              cursor: loading || done ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 4px 14px rgba(239,68,68,0.2)", transition: "background 0.4s",
            }}>
            <AnimatePresence mode="wait">
              {isLoading("reject")
                ? <motion.div key="spin" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : done && mode === "reject"
                  ? <motion.span key="done" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>↩ Rejected</motion.span>
                  : <motion.span key="idle">✕ Reject</motion.span>
              }
            </AnimatePresence>
          </motion.button>

          {/* Finalize */}
          <motion.button
            onClick={() => handle("finalize")}
            disabled={loading || done}
            whileHover={!loading && !done ? { scale: 1.02, boxShadow: "0 8px 24px rgba(34,197,94,0.4)" } : {}}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 2, height: 48, borderRadius: 13, border: "none",
              background: isLoading("finalize") || (done && mode === "finalize")
                ? "linear-gradient(90deg,#5b9af5,#3d72e0)"
                : "linear-gradient(90deg,#22c55e,#16a34a)",
              color: "white", fontWeight: 700, fontSize: 12,
              cursor: loading || done ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 5px 18px rgba(34,197,94,0.3)", transition: "background 0.4s",
            }}>
            <AnimatePresence mode="wait">
              {isLoading("finalize")
                ? <motion.div key="spin" style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : done && mode === "finalize"
                  ? <motion.span key="done" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}>🔒 Closed!</motion.span>
                  : <motion.span key="idle">🔒 Final</motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>
    </motion.div>
  );
}