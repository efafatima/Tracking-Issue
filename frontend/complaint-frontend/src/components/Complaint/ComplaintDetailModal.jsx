import { useState } from "react";
import { motion } from "framer-motion";
import { addComplaintComment } from "../../services/api";

const fmt = (d) => {
  if (!d) return "—";
  const p = new Date(d);
  return isNaN(p) ? "—" : p.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_STYLE = {
  "Submitted":   { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "In Progress": { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  "Resolved":    { color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  "Closed":      { color: "#64748b", bg: "#f1f5f9" },
  "Rejected":    { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  "Escalated":   { color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
};

const PRI_STYLE = {
  "Urgent": { color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  "High":   { color: "#f97316", bg: "rgba(249,115,22,0.09)" },
  "Medium": { color: "#f59e0b", bg: "rgba(245,158,11,0.09)" },
  "Low":    { color: "#22c55e", bg: "rgba(34,197,94,0.09)" },
};

export default function ComplaintDetailModal({ complaint, onClose, onCommentAdded }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentErr, setCommentErr] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sm = STATUS_STYLE[complaint?.status] || { color: "#64748b", bg: "#f1f5f9" };
  const pm = PRI_STYLE[complaint?.priority || complaint?.severity] || { color: "#64748b", bg: "#f1f5f9" };
  const assignedName = complaint?.assigned_to_name || complaint?.assigned_teacher_name;

  const handleAddComment = async () => {
    if (!comment.trim()) return setCommentErr("Please write a comment before submitting.");
    setSubmitting(true);
    setCommentErr("");
    try {
      await addComplaintComment(complaint.id, comment.trim());
      setComment("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      onCommentAdded?.();
    } catch {
      setCommentErr("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(640px,100%)", maxHeight: "90vh", overflowY: "auto", background: "white", borderRadius: 20, boxShadow: "0 28px 80px rgba(15,23,42,0.24)", border: "1px solid #e2e8f0" }}
      >
        {/* Header */}
        <div style={{ padding: "20px 22px 15px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#3d72e0", textTransform: "uppercase", marginBottom: 5 }}>Complaint Details</div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: "#0f172a", lineHeight: 1.25, overflowWrap: "anywhere" }}>
              {complaint.title || "Untitled"}
            </h2>
            <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600, marginTop: 4 }}>ID #{complaint.id}</div>
          </div>
          <button onClick={onClose} style={{ width: 33, height: 33, borderRadius: 9, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 17, color: "#64748b", flexShrink: 0 }}>×</button>
        </div>

        <div style={{ padding: "18px 22px 22px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Status + Category + Priority badges */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            <span style={{ padding: "5px 13px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: sm.color, background: sm.bg }}>
              ● {complaint.status}
            </span>
            <span style={{ padding: "5px 13px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: "#0f766e", background: "rgba(15,118,110,0.09)" }}>
              {complaint.category || "Uncategorized"}
            </span>
            <span style={{ padding: "5px 13px", borderRadius: 20, fontSize: 11, fontWeight: 800, color: pm.color, background: pm.bg }}>
              {(complaint.priority || complaint.severity || "—")} Priority
            </span>
          </div>

          {/* Description */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 13, padding: "14px 16px", background: "#f8fafc" }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8 }}>Description</div>
            <p style={{ margin: 0, fontSize: 13, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {complaint.description || "No description provided."}
            </p>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            <InfoBox label="Assigned To" value={assignedName || "Not assigned yet"} accent={assignedName ? "#3d72e0" : undefined} />
            <InfoBox label="Submitted On" value={fmt(complaint.created_at)} />
            <InfoBox label="Last Updated" value={fmt(complaint.updated_at)} />
            <InfoBox label="Resolved On" value={fmt(complaint.resolved_at)} />
          </div>

          {/* Attachments */}
          {complaint.attachments && complaint.attachments.length > 0 && (
            <div style={{ border: "1px solid rgba(91,154,245,0.25)", borderRadius: 13, padding: "14px 16px", background: "rgba(91,154,245,0.03)" }}>
              <div style={{ fontSize: 10.5, fontWeight: 900, color: "#3d72e0", textTransform: "uppercase", marginBottom: 10 }}>
                Attachments ({complaint.attachments.length})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {complaint.attachments.map((att) => {
                  const isImage = att.file_type?.startsWith("image/");
                  const fileName = att.file_url ? att.file_url.split("/").pop() : `File #${att.id}`;
                  return (
                    <div key={att.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, background: "white", border: "1px solid #e2e8f0" }}>
                      {isImage ? (
                        <img src={att.file_url} alt="attachment" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 7, border: "1px solid #e2e8f0", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                          {att.file_type?.includes("pdf") ? "📄" : att.file_type?.includes("word") ? "📝" : "📎"}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</div>
                        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>{att.file_type || "Unknown type"}</div>
                      </div>
                      <a href={att.file_url} target="_blank" rel="noreferrer"
                        style={{ fontSize: 11, fontWeight: 800, padding: "5px 11px", borderRadius: 8, background: "rgba(61,114,224,0.08)", color: "#3d72e0", textDecoration: "none", flexShrink: 0 }}>
                        View
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Teacher / staff response */}
          {complaint.teacher_comments && (
            <div style={{ border: "1px solid rgba(34,197,94,0.3)", borderRadius: 13, padding: "14px 16px", background: "rgba(34,197,94,0.05)" }}>
              <div style={{ fontSize: 10.5, fontWeight: 900, color: "#16a34a", textTransform: "uppercase", marginBottom: 8 }}>
                Staff Response
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#1e293b", lineHeight: 1.65 }}>{complaint.teacher_comments}</p>
            </div>
          )}

          {/* Add comment section */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 900, color: "#64748b", textTransform: "uppercase", marginBottom: 9 }}>
              Add Additional Information
            </div>

            {submitted && (
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#16a34a", background: "rgba(34,197,94,0.08)", borderRadius: 9, padding: "8px 12px", marginBottom: 8 }}>
                ✓ Comment added successfully.
              </div>
            )}
            {commentErr && (
              <div style={{ fontSize: 12, fontWeight: 600, color: "#b91c1c", background: "rgba(239,68,68,0.07)", borderRadius: 9, padding: "8px 12px", marginBottom: 8 }}>
                ⚠ {commentErr}
              </div>
            )}

            <textarea
              value={comment}
              onChange={(e) => { setComment(e.target.value); setCommentErr(""); }}
              rows={3}
              placeholder="Add more details, clarifications, or follow-up information..."
              style={{ width: "100%", padding: "10px 13px", borderRadius: 11, border: "1.5px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#f8faff", outline: "none", resize: "vertical", lineHeight: 1.65, boxSizing: "border-box" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 9 }}>
              <motion.button
                onClick={handleAddComment}
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.02, boxShadow: "0 6px 20px rgba(61,114,224,0.25)" } : {}}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: submitting ? "#94a3b8" : "linear-gradient(90deg,#5b9af5,#3d72e0)", color: "white", fontWeight: 800, fontSize: 13, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Sending…" : "Add Comment"}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoBox({ label, value, accent }) {
  return (
    <div style={{ background: "#f8fafc", borderRadius: 11, padding: "10px 13px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: accent || "#1e293b" }}>{value}</div>
    </div>
  );
}
