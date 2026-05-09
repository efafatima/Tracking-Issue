import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PendingCard from "./PendingCard";

const CATEGORIES = ["All", "Academic", "Administrative", "Facilities", "Behavior-related", "Other"];
const PRIORITIES = ["All", "Urgent", "High", "Medium", "Low"];

export default function PendingComplaints({ pending, onReview }) {
  const [catFilter, setCatFilter] = useState("All");
  const [priFilter, setPriFilter] = useState("All");

  const filtered = (pending || []).filter((c) => {
    const catOk = catFilter === "All" || c.category === catFilter;
    const priOk = priFilter === "All" || (c.priority || c.severity) === priFilter;
    return catOk && priOk;
  });

  const pillBase = (active) => ({
    fontSize: 10.5,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    transition: "all 0.18s",
    background: active ? "linear-gradient(90deg,#5b9af5,#3d72e0)" : "#f1f5f9",
    color: active ? "white" : "#64748b",
  });

  const priPillBase = (active) => ({
    ...pillBase(false),
    background: active ? "linear-gradient(90deg,#f59e0b,#f97316)" : "#f1f5f9",
    color: active ? "white" : "#64748b",
  });

  return (
    <motion.div>
      <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(61,114,224,0.07)", border: "1px solid rgba(91,154,245,0.1)" }}>

        {/* Header + filters */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#f59e0b,#f97316)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              ⏳
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", margin: 0 }}>Pending Complaints</h2>
              <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, margin: 0 }}>
                {filtered.length} of {pending?.length || 0} · click a complaint to review
              </p>
            </div>
          </div>

          {/* Category filter */}
          <div style={{ marginBottom: 9 }}>
            <div style={{ fontSize: 9.5, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5, letterSpacing: "0.05em" }}>Filter by Category</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCatFilter(c)} style={pillBase(catFilter === c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* Priority filter */}
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: 5, letterSpacing: "0.05em" }}>Filter by Priority</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {PRIORITIES.map((p) => (
                <button key={p} onClick={() => setPriFilter(p)} style={priPillBase(priFilter === p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaint list */}
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 420, overflowY: "auto" }}>
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div style={{ padding: 18, textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 700 }}>
                {(pending?.length || 0) === 0 ? "No pending complaints." : "No complaints match the selected filters."}
              </div>
            ) : (
              filtered.map((c, index) => (
                <PendingCard key={c.id} c={c} index={index} onReview={onReview} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
