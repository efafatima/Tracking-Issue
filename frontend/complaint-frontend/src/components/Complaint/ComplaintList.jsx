


import { motion, AnimatePresence } from "framer-motion";
import ComplaintCard from "../../components/Complaint/ComplaintCard";

export default function ComplaintList({ complaints, filterStatus, setFilterStatus, onRate, onEdit, onDelete, onView }) {
  const statuses = ["All", "Submitted", "In Progress", "Resolved", "Closed"];

  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(61,114,224,0.07)", border: "1px solid rgba(91,154,245,0.1)" }}>
      
      {/* Filter Chips */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "12px 16px", borderBottom: "1px solid #f1f5f9" }}>
        {statuses.map(s => (
          <motion.button key={s} onClick={() => setFilterStatus(s)}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            style={{
              fontSize: 10.5, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
              border: "none", cursor: "pointer",
              background: filterStatus === s ? "linear-gradient(90deg,#5b9af5,#3d72e0)" : "#f1f5f9",
              color: filterStatus === s ? "white" : "#64748b",
              transition: "all 0.2s",
            }}
          >
            {s}
          </motion.button>
        ))}
      </div>

      {/* Complaint Cards */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, maxHeight: 460, overflowY: "auto" }}>
        <AnimatePresence>
          {complaints.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
              No complaints found 🔍
            </div>
          ) : (
            complaints.map((c, i) => <ComplaintCard key={c.id} c={c} index={i} onRate={onRate} onEdit={onEdit} onDelete={onDelete} onView={onView} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
