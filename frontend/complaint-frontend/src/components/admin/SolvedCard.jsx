// ─── SolvedCard.jsx ──────────────────────────────────────────────
// Shows a Solved complaint with one action buttons: Finalize  and complaint
import { useState } from "react";
import { motion } from "framer-motion";
import { rejectSolvedComplaint } from "../../services/api";


const SEV_META = {
  High:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)"   },
  Medium: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)"  },
  Low:    { color:"#22c55e", bg:"rgba(34,197,94,0.1)"   },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month:"short", day:"numeric" });
  } catch { return dateStr; }
};

export default function SolvedCard({ c, index, onFinalize, onReject }) {
  const [rejecting, setRejecting] = useState(false);
  const [rejected,  setRejected]  = useState(false);

  const isFinalized = c.status === "Fulfilled";
  const sev = SEV_META[c.severity] ?? SEV_META.Low;

  // Quick inline reject (without modal) — calls backend directly
  const handleQuickReject = async () => {
  if (rejecting) return;

  setRejecting(true);

  try {
    await rejectSolvedComplaint(c.id);

    setRejected(true);

    setTimeout(() => {
      onReject && onReject(c.id);
    }, 800);

  } catch (e) {
    console.error("reject error:", e);
    setRejecting(false);
  }
};

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, x:20, scale:0.95 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: isFinalized
          ? "linear-gradient(135deg,rgba(34,197,94,0.05),rgba(16,163,74,0.03))"
          : "linear-gradient(135deg,rgba(248,250,255,0.9),rgba(241,245,249,0.6))",
        borderRadius:14, padding:"14px 16px",
        border:`1px solid ${isFinalized ? "rgba(34,197,94,0.2)" : "rgba(91,154,245,0.1)"}`,
        boxShadow:"0 2px 10px rgba(61,114,224,0.05)",
        opacity: rejected ? 0.5 : 1,
        transition:"opacity 0.3s",
      }}
    >
      {/* Top row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:8 }}>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:13, fontWeight:800, color:"#0f172a", lineHeight:1.3, display:"block", marginBottom:3 }}>
            {c.title}
          </span>
          <span style={{ fontSize:10.5, color:"#94a3b8", fontWeight:500 }}>
            #{c.id} · {formatDate(c.created_at)}
          </span>
        </div>

        <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
          <span style={{ fontSize:10, fontWeight:700, color:sev.color, background:sev.bg, borderRadius:6, padding:"2px 8px" }}>
            {c.severity}
          </span>
          <span style={{
            fontSize:10, fontWeight:800, padding:"2px 9px", borderRadius:20,
            color: isFinalized ? "#5b9af5" : "#22c55e",
            background: isFinalized ? "rgba(91,154,245,0.1)" : "rgba(34,197,94,0.1)",
          }}>
            {isFinalized ? "🔒 Fulfilled" : "✅ Solved"}
          </span>
        </div>
      </div>

      {/* Teacher comment */}
      {c.teacher_comments && (
        <div style={{
          fontSize:11.5, color:"#64748b", fontWeight:500, lineHeight:1.55,
          marginBottom:10, padding:"8px 10px",
          background:"rgba(91,154,245,0.04)", borderRadius:8,
          borderLeft:"2px solid rgba(91,154,245,0.2)",
        }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#94a3b8", display:"block", marginBottom:2 }}>TEACHER NOTE</span>
          {c.teacher_comments}
        </div>
      )}

      {/* Teacher info */}
      {c.assigned_teacher && (
        <div style={{ fontSize:11, color:"#64748b", fontWeight:600, marginBottom:10, display:"flex", alignItems:"center", gap:5 }}>
          <span>🎓</span>
          <span>Solved by <strong style={{ color:"#1e293b" }}>{c.assigned_teacher?.name || c.assigned_teacher?.username || c.assigned_teacher}</strong></span>
        </div>
      )}

      {/* Category badge */}
      {c.category && (
        <div style={{ marginBottom:10 }}>
          <span style={{ fontSize:10, fontWeight:700, color:"#64748b", background:"#f1f5f9", borderRadius:6, padding:"2px 8px" }}>
            {c.category}
          </span>
        </div>
      )}

      
      {!isFinalized && (
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
         

          {/* Finalize */}
          <motion.button
            onClick={() => onFinalize(c)}
            whileHover={{ scale:1.04, boxShadow:"0 6px 16px rgba(34,197,94,0.3)" }}
            whileTap={{ scale:0.96 }}
            style={{
              fontSize:11, fontWeight:800, padding:"7px 14px", borderRadius:10,
              background:"linear-gradient(90deg,#22c55e,#16a34a)",
              color:"white", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", gap:5,
              boxShadow:"0 3px 10px rgba(34,197,94,0.2)",
            }}>
            🔒 Finalize
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}