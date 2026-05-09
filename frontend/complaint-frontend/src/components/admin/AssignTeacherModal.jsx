// ─── AssignTeacherModal.jsx ──────────────────────────────────────
// Fetches real teachers from backend → calls admin_assign_teacher API
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getTeachers, assignTeacher } from "../../services/api";
import AttachmentsSection from "../Complaint/AttachmentsSection";


const SEV_META = {
  High:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)"   },
  Medium: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)"  },
  Low:    { color:"#22c55e", bg:"rgba(34,197,94,0.1)"   },
};

export default function AssignTeacherModal({ complaint, onClose, onAssigned }) {
  const [teachers,  setTeachers]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState("");

  // ── Load teachers list from backend ───────────────────────────
 useEffect(() => {
  const load = async () => {
    try {
      const data = await getTeachers();
      setTeachers(Array.isArray(data) ? data : data.results ?? []);
    } catch (e) {
      setError("Could not load teachers.");
    } finally {
      setFetching(false);
    }
  };

  load();
}, []);

  // ── Assign teacher → POST admin_assign_teacher ────────────────
  const handleAssign = async () => {
  if (!selected) return;

  setLoading(true);
  setError("");

  try {
    await assignTeacher(complaint.id, { assignee_id: selected.id });

    setDone(true);

    setTimeout(() => {
      onAssigned(complaint.id, selected);
      onClose();
    }, 900);

  } catch (e) {
    setError("Assignment failed.");
  } finally {
    setLoading(false);
  }
};
  const sevMeta = SEV_META[complaint.severity] ?? SEV_META.Low;

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{
        position:"fixed", inset:0, zIndex:100,
        background:"rgba(15,23,42,0.52)", backdropFilter:"blur(8px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:24,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale:0.88, opacity:0, y:24 }}
        animate={{ scale:1, opacity:1, y:0 }}
        exit={{ scale:0.88, opacity:0, y:24 }}
        transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background:"white", borderRadius:24, padding:"36px 32px",
          width:"100%", maxWidth:440, position:"relative",
          boxShadow:"0 24px 80px rgba(61,114,224,0.22)",
          border:"1px solid rgba(91,154,245,0.14)",
        }}
      >
        {/* Top accent bar */}
        <motion.div style={{
          position:"absolute", top:0, left:"50%", transform:"translateX(-50%)",
          height:4, width:80, borderRadius:"0 0 8px 8px",
          background:"linear-gradient(90deg,#5b9af5,#3d72e0,#7ab5f8,#5b9af5)",
          backgroundSize:"200%",
        }} animate={{ backgroundPosition:["0%","100%","0%"] }} transition={{ duration:4, repeat:Infinity }} />

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
          <div style={{
            width:44, height:44, borderRadius:13,
            background:"linear-gradient(135deg,#5b9af5,#3d72e0)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
          }}>🎓</div>
          <div>
            <h3 style={{ fontSize:"1rem", fontWeight:900, color:"#0f172a" }}>Assign to Teacher</h3>
            <p style={{ fontSize:11, color:"#94a3b8", fontWeight:500, marginTop:1 }}>"{complaint.title}"</p>
          </div>
        </div>

        {/* Complaint badges */}
        <div style={{ display:"flex", gap:6, marginBottom:18, flexWrap:"wrap" }}>
          <span style={{ fontSize:10.5, fontWeight:700, color:"#64748b", background:"#f1f5f9", borderRadius:6, padding:"3px 9px" }}>
            {complaint.category}
          </span>
          <span style={{ fontSize:10.5, fontWeight:700, color:sevMeta.color, background:sevMeta.bg, borderRadius:6, padding:"3px 9px" }}>
            {complaint.severity}
          </span>
          <span style={{ fontSize:10.5, fontWeight:700, color:"#64748b", background:"#f1f5f9", borderRadius:6, padding:"3px 9px" }}>
            #{complaint.id}
          </span>
        </div>

        {/* Attachments */}
        <AttachmentsSection attachments={complaint.attachments} />

        {/* Section label */}
        <p style={{ fontSize:11, fontWeight:800, color:"#64748b", marginBottom:10, marginTop: complaint.attachments?.length ? 16 : 0, letterSpacing:"0.06em", textTransform:"uppercase" }}>
          Select Teacher
        </p>

        {/* Teachers list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20, maxHeight:240, overflowY:"auto" }}>
          {fetching ? (
            <div style={{ display:"flex", justifyContent:"center", padding:"24px 0", gap:10, alignItems:"center" }}>
              <div style={{ width:18, height:18, border:"2px solid rgba(91,154,245,0.3)", borderTopColor:"#5b9af5", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
              <span style={{ fontSize:12, color:"#94a3b8", fontWeight:600 }}>Loading teachers…</span>
            </div>
          ) : teachers.length === 0 ? (
            <div style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:13 }}>
              No teachers found.
            </div>
          ) : (
            teachers.map((t, i) => (
              <motion.button key={t.id}
                initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(t)}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                style={{
                  display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                  borderRadius:13, cursor:"pointer", textAlign:"left",
                  background: selected?.id === t.id
                    ? "linear-gradient(90deg,rgba(91,154,245,0.12),rgba(61,114,224,0.05))"
                    : "rgba(248,250,255,0.9)",
                  border: selected?.id === t.id
                    ? "2px solid rgba(91,154,245,0.35)"
                    : "2px solid transparent",
                  transition:"all 0.2s",
                }}
              >
                {/* Avatar circle */}
                <div style={{
                  width:38, height:38, borderRadius:"50%", flexShrink:0,
                  background: selected?.id === t.id
                    ? "linear-gradient(135deg,#5b9af5,#3d72e0)"
                    : "linear-gradient(135deg,rgba(91,154,245,0.2),rgba(61,114,224,0.1))",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:15, fontWeight:900,
                  color: selected?.id === t.id ? "white" : "#3d72e0",
                  transition:"all 0.2s",
                }}>
                  {(t.name || t.username || "T")[0].toUpperCase()}
                </div>

                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:800, color: selected?.id === t.id ? "#1e3a8a" : "#1e293b" }}>
                    {t.name || t.username}
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>
                    {t.faculty_designation || "Faculty Member"}{t.department_name ? ` - ${t.department_name}` : ""}
                  </div>
                </div>

                {selected?.id === t.id && (
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }}
                    style={{
                      width:20, height:20, borderRadius:"50%",
                      background:"linear-gradient(135deg,#5b9af5,#3d72e0)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      color:"white", fontSize:11, fontWeight:900,
                    }}>✓</motion.div>
                )}
              </motion.button>
            ))
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ fontSize:12, color:"#ef4444", fontWeight:600, marginBottom:12, padding:"8px 12px", background:"rgba(239,68,68,0.07)", borderRadius:8 }}>
              ⚠ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div style={{ display:"flex", gap:10 }}>
          <motion.button onClick={onClose} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            style={{ flex:1, height:46, borderRadius:12, border:"1.5px solid #e2e8f0", background:"white", color:"#64748b", fontWeight:700, fontSize:13, cursor:"pointer" }}>
            Cancel
          </motion.button>

          <motion.button onClick={handleAssign}
            disabled={!selected || loading || done}
            whileHover={!loading && !done && selected ? { scale:1.02, boxShadow:"0 8px 24px rgba(61,114,224,0.35)" } : {}}
            whileTap={{ scale:0.97 }}
            style={{
              flex:2, height:46, borderRadius:12, border:"none",
              background: done
                ? "linear-gradient(90deg,#22c55e,#16a34a)"
                : !selected
                  ? "#e2e8f0"
                  : "linear-gradient(90deg,#5b9af5,#3d72e0)",
              color: !selected && !done ? "#94a3b8" : "white",
              fontWeight:700, fontSize:13,
              cursor: !selected || loading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              transition:"background 0.4s",
            }}>
            <AnimatePresence mode="wait">
              {loading
                ? <motion.div key="spin" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                    style={{ width:16, height:16, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                : done
                  ? <motion.span key="done" initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }}>✓ Assigned!</motion.span>
                  : <motion.span key="idle" initial={{ opacity:0 }} animate={{ opacity:1 }}>Assign Teacher →</motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
