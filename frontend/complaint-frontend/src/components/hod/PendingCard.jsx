import { motion } from "framer-motion";
import { SEV_META } from "../Complaint/helpers";

export default function PendingCard({ c, index, onReview }) {
  const sv = SEV_META[c.severity] || SEV_META.Low || {
    color: "#64748b",
    bg: "#f1f5f9",
  };
  const studentName = c.user_name || c.student || (c.is_anonymous ? "Anonymous" : "Unknown student");
  const createdAt = c.created_at ? new Date(c.created_at) : null;
  const dateLabel = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "No date";

  const catIcon = {
    "IT Support": "IT",
    Infrastructure: "IN",
    Facilities: "FC",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -2,
        boxShadow: "0 10px 32px rgba(61,114,224,0.1)",
      }}
      onClick={() => onReview(c)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onReview(c);
        }
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
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          flexShrink: 0,
          background:
            "linear-gradient(135deg,rgba(91,154,245,0.12),rgba(61,114,224,0.06))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: "#3d72e0",
          fontWeight: 900,
        }}
      >
        {catIcon[c.category] || "CP"}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
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
          {c.title || "Untitled complaint"}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            fontWeight: 600,
            marginTop: 3,
          }}
        >
          {studentName} - {dateLabel}
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
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
            {c.category || "Uncategorized"}
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
            {c.severity || "N/A"}
          </span>

          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "#f59e0b",
              background: "rgba(245,158,11,0.1)",
              borderRadius: 6,
              padding: "2px 7px",
            }}
          >
            Pending
          </span>
        </div>
      </div>

      <motion.button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onReview(c);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          padding: "8px 14px",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
          color: "white",
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
          boxShadow: "0 3px 10px rgba(91,154,245,0.25)",
          flexShrink: 0,
        }}
      >
        Assign Faculty
      </motion.button>
    </motion.div>
  );
}
