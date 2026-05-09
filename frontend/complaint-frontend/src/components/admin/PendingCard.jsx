// ─── PendingCard.jsx ─────────────────────────────────────────────
// Shows a "Ready for Assignment" complaint with "Assign Teacher" button
import { motion } from "framer-motion";
import { getReadyComplaints} from "../../services/api";

const SEV_META = {
  High:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)",  dot:"#ef4444" },
  Medium: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)", dot:"#f59e0b" },
  Low:    { color:"#22c55e", bg:"rgba(34,197,94,0.1)",  dot:"#22c55e" },
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
  } catch { return dateStr; }
};

export default function PendingCard({ c, index, onAssign }) {
  const sev = SEV_META[c.severity] ?? SEV_META.Low;



  return (
    <motion.div
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, x:-20, scale:0.95 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background:"linear-gradient(135deg,rgba(248,250,255,0.9),rgba(241,245,249,0.6))",
        borderRadius:14, padding:"14px 16px",
        border:"1px solid rgba(91,154,245,0.1)",
        boxShadow:"0 2px 10px rgba(61,114,224,0.05)",
      }}
    >
      {/* Top row: title + severity badge */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:sev.dot, flexShrink:0 }} />
            <span style={{ fontSize:13, fontWeight:800, color:"#0f172a", lineHeight:1.3 }}>
              {c.title}
            </span>
          </div>
          <span style={{ fontSize:10.5, color:"#94a3b8", fontWeight:500 }}>
            #{c.id} · {formatDate(c.created_at)}
          </span>
        </div>
        <span style={{
          fontSize:10, fontWeight:800, padding:"3px 9px", borderRadius:20, flexShrink:0,
          color:sev.color, background:sev.bg,
        }}>
          {c.severity}
        </span>
      </div>

      {/* Description preview */}
      {c.description && (
        <p style={{
          fontSize:11.5, color:"#64748b", fontWeight:500, lineHeight:1.55,
          marginBottom:10,
          display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {c.description}
        </p>
      )}

      {/* Bottom row: category + assign button */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {c.category && (
            <span style={{ fontSize:10, fontWeight:700, color:"#64748b", background:"#f1f5f9", borderRadius:6, padding:"2px 8px" }}>
              {c.category}
            </span>
          )}
          {c.is_anonymous && (
            <span style={{ fontSize:10, fontWeight:700, color:"#8b5cf6", background:"rgba(139,92,246,0.1)", borderRadius:6, padding:"2px 8px" }}>
              Anonymous
            </span>
          )}
        </div>

        <motion.button
          onClick={() => onAssign(c)}
          whileHover={{ scale:1.04, boxShadow:"0 6px 18px rgba(61,114,224,0.28)" }}
          whileTap={{ scale:0.96 }}
          style={{
            fontSize:11, fontWeight:800, padding:"7px 14px", borderRadius:10,
            background:"linear-gradient(90deg,#5b9af5,#3d72e0)",
            color:"white", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:5, flexShrink:0,
            boxShadow:"0 3px 12px rgba(61,114,224,0.22)",
          }}
        >
          <motion.span animate={{ opacity:[1,0.5,1] }} transition={{ duration:1.5, repeat:Infinity }}>●</motion.span>
          Assign Teacher
        </motion.button>
      </div>
    </motion.div>
  );
}