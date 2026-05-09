 import {STATUS_META,SEV_META ,PRED_META }from  "../Complaint/helpers";
 import { useState } from "react";
 import { motion,AnimatePresence } from "framer-motion";
 import ConfidenceBar from "./ConfidenceBar";
 export default function ComplaintCard({ c, index, onOpenSolution, onStatusChange }) {
  const prediction = c?.prediction || { label: "Low", confidence: 0 };
  const studentName = c.user_name || c.student || (c.is_anonymous ? "Anonymous" : "Unknown student");
 
  const sm = STATUS_META[c.status] || STATUS_META["Submitted"];
  const sv = SEV_META[c.priority || c.severity];
 
  const pm = PRED_META[prediction.label] || PRED_META["Low"];
  const [expanded, setExpanded] = useState(false);
  



  const catIcon = { "IT Support": "💻", "Infrastructure": "🏗️", "Facilities": "🏢" };

const NEXT_STATUS = {
  Submitted: "In Progress",
  Pending: "In Progress",
  "In Progress": "Resolved",
  Resolved: null,
  Solved: null,
};

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      layout
      style={{
        background: "white", borderRadius: 20,
        border: "1px solid rgba(91,154,245,0.1)",
        boxShadow: "0 3px 16px rgba(61,114,224,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}
      >
        {/* Category icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 13, flexShrink: 0,
          background: "linear-gradient(135deg,rgba(91,154,245,0.12),rgba(61,114,224,0.07))",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{catIcon[c.category]}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{c.title}</div>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}
              style={{ fontSize: 12, color: "#94a3b8", flexShrink: 0, marginTop: 2 }}
            >▼</motion.span>
          </div>
          <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600, marginTop: 4 }}>
            👤 {studentName} · {c.date}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", background: "#f1f5f9", borderRadius: 6, padding: "2px 8px" }}>
              {c.category}
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: sv.color, background: sv.bg, borderRadius: 6, padding: "2px 8px" }}>
              {c.priority || c.severity}
            </span>
            <span style={{
              fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
              color: sm.color, background: sm.bg, display: "flex", alignItems: "center", gap: 4,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: sm.dot, display: "inline-block" }} />
              {c.status}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Divider */}
              <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(91,154,245,0.15),transparent)" }} />

              {/* AI Prediction box */}
              <div style={{
                padding: "14px 16px", borderRadius: 14,
                background: pm.bg, border: `1.5px solid ${pm.color}22`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>🤖</span>
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a" }}>AI Severity Prediction</span>
                  <span style={{
                    marginLeft: "auto", fontSize: 10.5, fontWeight: 800,
                    color: pm.color, background: pm.bg,
                    padding: "2px 8px", borderRadius: 20, border: `1px solid ${pm.color}33`,
                  }}>
                    {pm.icon} {prediction.label}

                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Confidence</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: pm.color }}>{prediction.confidence}%</span>
                </div>
                <ConfidenceBar value={prediction.confidence} color={pm.color} />
              </div>

              {/* Solution comment (if exists) */}
              {c.solution && (
                <div style={{
                  padding: "13px 15px", borderRadius: 14,
                  background: "rgba(34,197,94,0.06)", border: "1.5px solid rgba(34,197,94,0.18)",
                }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", marginBottom: 5, display: "flex", alignItems: "center", gap: 5 }}>
                    ✅ Solution Comment
                  </div>
                  <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.6 }}>{c.solution}</p>
                </div>
              )}

              {/* Status stepper */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {["Submitted", "In Progress", "Resolved"].map((s, i) => {
                  const steps = ["Submitted", "In Progress", "Resolved"];
                  const curr = steps.indexOf(c.status);
                  const isDone = i <= curr;
                  const isActive = i === curr;
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
                      <div style={{
                        width: isActive ? 28 : 22, height: isActive ? 28 : 22,
                        borderRadius: "50%", flexShrink: 0,
                        background: isDone
                          ? isActive ? "linear-gradient(135deg,#5b9af5,#3d72e0)" : "#5b9af5"
                          : "#f1f5f9",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: isActive ? 12 : 10, fontWeight: 900,
                        color: isDone ? "white" : "#94a3b8",
                        boxShadow: isActive ? "0 3px 12px rgba(91,154,245,0.35)" : "none",
                        transition: "all 0.3s",
                      }}>
                        {isDone && !isActive ? "✓" : i + 1}
                      </div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: isDone ? "#3d72e0" : "#94a3b8", marginLeft: 4, whiteSpace: "nowrap" }}>
                        {s}
                      </div>
                      {i < 2 && <div style={{ flex: 1, height: 2, background: i < steps.indexOf(c.status) ? "#5b9af5" : "#f1f5f9", marginLeft: 6, borderRadius: 2 }} />}
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              {!["Resolved", "Solved"].includes(c.status) && (
                <div style={{ display: "flex", gap: 10 }}>
                  <motion.button
                    onClick={() => onOpenSolution(c)}
                    whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(61,114,224,0.25)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, height: 42, borderRadius: 11,  cursor: "pointer",
                      background: "white", color: "#3d72e0", fontWeight: 700, fontSize: 12.5,
                      border: "2px solid rgba(91,154,245,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    }}>
                    💬 {c.solution ? "Edit Comment" : "Add Solution"}
                  </motion.button>

                  <motion.button
                    // onClick={() => onStatusChange(c.id, NEXT_STATUS[c.status])}

                    onClick={() => {
  const current = c.status?.trim();
  const next = NEXT_STATUS[current];




  if (!next) {
    console.error("Invalid status flow:", current);
    return;
  }

  onStatusChange(c.id, next);
}}
                    whileHover={{ scale: 1.03, boxShadow: "0 6px 20px rgba(61,114,224,0.32)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      flex: 1, height: 42, borderRadius: 11, border: "none", cursor: "pointer",
                      background: "linear-gradient(90deg,#5b9af5,#3d72e0)",
                      color: "white", fontWeight: 700, fontSize: 12.5,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      boxShadow: "0 4px 14px rgba(61,114,224,0.25)",
                    }}>
                    {["Pending", "Submitted"].includes(c.status) ? "⚡ Start Progress" : "✅ Mark Resolved"}
                  </motion.button>
                </div>
              )}

              {["Resolved", "Solved"].includes(c.status) && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px", borderRadius: 11,
                  background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)",
                }}>
                  <span style={{ fontSize: 16 }}>🎉</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#16a34a" }}>Complaint Resolved!</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
