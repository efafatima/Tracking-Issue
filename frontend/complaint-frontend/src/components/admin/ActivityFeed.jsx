// ─── ActivityFeed.jsx ────────────────────────────────────────────
// Receives activities[] from parent (already fetched), shows live feed
import { motion } from "framer-motion";

// Map action keywords → icon + color
const getIconMeta = (action = "") => {
  const a = action.toLowerCase();
  if (a.includes("assign"))    return { icon:"🎓", color:"#5b9af5" };
  if (a.includes("finali"))    return { icon:"🔒", color:"#22c55e" };
  if (a.includes("reject"))    return { icon:"❌", color:"#ef4444" };
  if (a.includes("solved"))    return { icon:"✅", color:"#22c55e" };
  if (a.includes("submit"))    return { icon:"📩", color:"#f59e0b" };
  if (a.includes("closed"))    return { icon:"🔒", color:"#3d72e0" };
  return { icon:"⚡", color:"#8b5cf6" };
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  try {
    const d = new Date(timeStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1)  return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff/60)}h ago`;
    return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
  } catch { return timeStr; }
};

export default function ActivityFeed({ activities = [], onRefresh }) {
  return (
    <div style={{
      background:"white", borderRadius:20, overflow:"hidden",
      boxShadow:"0 4px 24px rgba(61,114,224,0.07)", border:"1px solid rgba(91,154,245,0.1)",
    }}>
      {/* Header */}
      <div style={{ padding:"18px 18px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,#5b9af5,#3d72e0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>⚡</div>
          <div>
            <h2 style={{ fontSize:14, fontWeight:900, color:"#0f172a" }}>Activity Feed</h2>
            <p style={{ fontSize:11, color:"#94a3b8", fontWeight:500 }}>Live system updates</p>
          </div>
        </div>
        {onRefresh && (
          <motion.button onClick={onRefresh} whileHover={{ scale:1.08 }} whileTap={{ scale:0.93 }}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, padding:4, borderRadius:8, color:"#94a3b8" }}
            title="Refresh feed"
          >↻</motion.button>
        )}
      </div>

      {/* Activity list */}
      <div style={{ padding:"8px 0", maxHeight:380, overflowY:"auto" }}>
        {activities.length === 0 ? (
          <div style={{ textAlign:"center", padding:"28px 0", color:"#94a3b8", fontSize:13, fontWeight:600 }}>
            No activity yet.
          </div>
        ) : (
          activities.map((a, i) => {
            const meta = getIconMeta(a.action);
            return (
              <motion.div key={i}
                initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  padding:"12px 18px", display:"flex", gap:10, alignItems:"flex-start",
                  borderBottom: i < activities.length - 1 ? "1px solid #f8fafc" : "none",
                }}
              >
                {/* Icon bubble */}
                <div style={{
                  width:30, height:30, borderRadius:9, flexShrink:0,
                  background:`${meta.color}14`,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:13,
                }}>
                  {meta.icon}
                </div>

                {/* Text */}
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11.5, fontWeight:600, color:"#374151", lineHeight:1.5 }}>
                    {a.action}
                    {a.complaint_title && (
  <span style={{ color:"#94a3b8", fontWeight:500 }}>
    {" "}· {a.complaint_title}
  </span>
)}
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:2 }}>
                    {a.user && (
                      <span style={{ fontSize:10, fontWeight:700, color:meta.color, background:`${meta.color}14`, borderRadius:4, padding:"1px 6px" }}>
                        {a.user}
                      </span>
                    )}
                    <span style={{ fontSize:10.5, color:"#94a3b8", fontWeight:600 }}>
                      {formatTime(a.time || a.created_at)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}