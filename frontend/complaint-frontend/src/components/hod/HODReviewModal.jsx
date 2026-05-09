import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SEV_META } from "../Complaint/helpers";
import AttachmentsSection from "../Complaint/AttachmentsSection";

const formatSimilarity = (score) => {
  const value = Number(score);
  if (!Number.isFinite(value)) return "0.0%";
  return `${(value > 1 ? value : value * 100).toFixed(1)}%`;
};

const formatDate = (date) => {
  if (!date) return "No date";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No date";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function HODReviewModal({ complaint, busy, onClose, onAccept, onReject }) {
  const [note, setNote] = useState("");

  const sev = SEV_META[complaint?.severity] || SEV_META.Low || { color: "#64748b", bg: "#f1f5f9" };
  const studentName =
    complaint?.user_name ||
    complaint?.student ||
    (complaint?.is_anonymous ? "Anonymous" : "Unknown student");

  return (
    <AnimatePresence>
      {complaint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={busy ? undefined : onClose}
          style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,23,42,0.42)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(680px, 100%)", maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: 18, boxShadow: "0 24px 70px rgba(15,23,42,0.22)", border: "1px solid rgba(226,232,240,0.9)" }}
          >
            {/* Header */}
            <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#3d72e0", textTransform: "uppercase", letterSpacing: 0, marginBottom: 7 }}>
                  Complaint Review
                </div>
                <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.25, color: "#0f172a", fontWeight: 900, overflowWrap: "anywhere" }}>
                  {complaint.title || "Untitled complaint"}
                </h2>
                <p style={{ margin: "7px 0 0", fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
                  {studentName} · {formatDate(complaint.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label="Close review"
                style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b", fontSize: 18, lineHeight: 1, cursor: busy ? "not-allowed" : "pointer", flexShrink: 0 }}
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "18px 22px 6px" }}>
              {/* Info pills */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginBottom: 16 }}>
                <InfoPill label="Severity" value={complaint.severity || "N/A"} color={sev.color} bg={sev.bg} />
                <InfoPill label="Similarity" value={formatSimilarity(complaint.similarity_score)} color="#7c3aed" bg="rgba(124,58,237,0.09)" />
                <InfoPill label="Category" value={complaint.category || "N/A"} color="#0f766e" bg="rgba(15,118,110,0.09)" />
              </div>

              {/* Description */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 14, background: "#f8fafc", padding: "14px 15px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#64748b", marginBottom: 8 }}>Description</div>
                <p style={{ margin: 0, color: "#334155", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {complaint.description || "No description provided."}
                </p>
              </div>

              {/* Attachments */}
              <AttachmentsSection attachments={complaint.attachments} />

              {/* HOD Note field */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: 8 }}>
                  Add Note / Reason (optional)
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={busy}
                  rows={3}
                  placeholder="Add a note for the record, or reason for rejection (if rejecting)..."
                  style={{ width: "100%", padding: "10px 13px", borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#f8faff", outline: "none", resize: "vertical", lineHeight: 1.65, boxSizing: "border-box", opacity: busy ? 0.6 : 1 }}
                />
              </div>
            </div>

            {/* Footer buttons */}
            <div style={{ padding: "14px 22px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #eef2f7", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => onReject(complaint.id, note.trim())}
                disabled={busy}
                style={actionButtonStyle("#ef4444", "#dc2626", busy)}
              >
                {busy ? "Working…" : "Reject"}
              </button>
              <button
                type="button"
                onClick={() => onAccept(complaint.id, note.trim())}
                disabled={busy}
                style={actionButtonStyle("#22c55e", "#16a34a", busy)}
              >
                {busy ? "Working…" : "Accept & Assign"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoPill({ label, value, color, bg }) {
  return (
    <div style={{ minHeight: 72, borderRadius: 12, background: bg, border: `1px solid ${color}22`, padding: "11px 12px" }}>
      <div style={{ fontSize: 10.5, color: "#64748b", fontWeight: 800, marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontSize: 14, fontWeight: 900, overflowWrap: "anywhere" }}>{value}</div>
    </div>
  );
}

const actionButtonStyle = (from, to, busy) => ({
  minWidth: 120,
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: `linear-gradient(90deg,${from},${to})`,
  color: "white",
  fontWeight: 800,
  fontSize: 13,
  cursor: busy ? "not-allowed" : "pointer",
  opacity: busy ? 0.75 : 1,
  boxShadow: `0 5px 14px ${from}33`,
});
