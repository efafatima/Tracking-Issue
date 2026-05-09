import { motion } from "framer-motion";
import { STATUS_META, SEV_META } from "./helpers";

// 🎯 Icon map (clean & scalable)
const ICONS = {
  "IT Support": "💻",
  "Infrastructure": "🏗️",
  "Admin": "🏢",
};

export default function ComplaintCard({ c = {}, index = 0, onRate, onEdit, onDelete, onView }) {
  const canRate = ["Resolved", "Closed", "Solved", "Fulfilled"].includes(c.status);
  const canManage = c.status === "Submitted";
  const sm = STATUS_META[c.status] || {
    color: "#64748b",
    bg: "#f1f5f9",
    dot: "#64748b",
  };

  const sv = SEV_META[c.severity] || {
    color: "#64748b",
    bg: "#f1f5f9",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 12px 36px rgba(61,114,224,0.11)",
      }}
      style={{
        background: "white",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 2px 12px rgba(61,114,224,0.06)",
        border: "1px solid rgba(91,154,245,0.09)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* ICON */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          flexShrink: 0,
          background:
            "linear-gradient(135deg,rgba(91,154,245,0.13),rgba(61,114,224,0.07))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
        }}
      >
        {ICONS[c.category] || "📌"}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* TITLE */}
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: "#0f172a",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {c.title || "No Title"}
        </div>

        {/* BADGES */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "#64748b",
              background: "#f1f5f9",
              borderRadius: 6,
              padding: "2px 7px",
            }}
          >
            {c.category || "Unknown"}
          </span>

          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: sv.color,
              background: sv.bg,
              borderRadius: 6,
              padding: "2px 7px",
            }}
          >
            {c.priority || c.severity || "N/A"}
          </span>

          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "#475569",
              background: "#eef2ff",
              borderRadius: 6,
              padding: "2px 7px",
            }}
          >
            Assigned: {c.assigned_to_name || c.assigned_teacher_name || "Not assigned"}
          </span>

          <span
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            {c.date || "—"}
          </span>
        </div>
      </div>

      {/* STATUS + ACTION */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* STATUS */}
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 800,
            padding: "4px 10px",
            borderRadius: 20,
            color: sm.color,
            background: sm.bg,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: sm.dot,
              display: "inline-block",
            }}
          />
          {c.status || "Unknown"}
        </span>

        {/* RATE BUTTON */}
        {canRate && !c.rated && (
          <motion.button
            onClick={() => onRate?.(c)}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 4px 14px rgba(245,158,11,0.3)",
            }}
            whileTap={{ scale: 0.95 }}
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              border: "none",
              background: "linear-gradient(90deg,#f59e0b,#f97316)",
              color: "white",
              cursor: "pointer",
            }}
          >
            ⭐ Rate
          </motion.button>
        )}

        {canRate && c.rated && (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "#22c55e",
            }}
          >
            ✓ Rated
          </span>
        )}

        <motion.button
          onClick={() => onView?.(c)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{ fontSize: 10.5, fontWeight: 800, padding: "4px 9px", borderRadius: 18, border: "none", background: "rgba(91,154,245,0.1)", color: "#3d72e0", cursor: "pointer" }}
        >
          View
        </motion.button>

        {canManage && (
          <div style={{ display: "flex", gap: 6 }}>
            <motion.button
              onClick={() => onEdit?.(c)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ fontSize: 10.5, fontWeight: 800, padding: "4px 9px", borderRadius: 18, border: "none", background: "#eef2ff", color: "#3d72e0", cursor: "pointer" }}
            >
              Edit
            </motion.button>
            <motion.button
              onClick={() => onDelete?.(c)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ fontSize: 10.5, fontWeight: 800, padding: "4px 9px", borderRadius: 18, border: "none", background: "rgba(239,68,68,0.08)", color: "#ef4444", cursor: "pointer" }}
            >
              Delete
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
