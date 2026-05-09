import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getTeacherWorkload } from "../../services/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

const CAT_ICON  = { "IT Support": "💻", "Infrastructure": "🏗️", "Facilities": "🏢" };
const CAT_COLOR = { "IT Support": "#5b9af5", "Infrastructure": "#8b5cf6", "Facilities": "#06b6d4" };

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

// ── Radial Progress ────────────────────────────────────────────────
function RadialProgress({ value, max, color, size = 72 }) {
  const R = size / 2 - 8;
  const circ = 2 * Math.PI * R;
  const pct = Math.min(value / Math.max(max, 1), 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="#f1f5f9" strokeWidth={7}/>
      <motion.circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ * (1 - pct) }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}/>
    </svg>
  );
}

// ── Complaint Row ──────────────────────────────────────────────────
function ComplaintRow({ item, i, badge }) {
  const color = CAT_COLOR[item.category] || "#5b9af5";
  const icon  = CAT_ICON[item.category]  || "📋";
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.07 }}
      whileHover={{ background: "rgba(91,154,245,0.03)" }}
      style={{ padding: "12px 22px", display: "flex", alignItems: "center", gap: 13, cursor: "default", borderBottom: "1px solid #f8fafc" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 2 }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "#f1f5f9", color: "#64748b" }}>{item.category}</span>
          <span style={{ marginLeft: 6 }}>· {timeAgo(item.created_at)}</span>
        </div>
      </div>
      {badge}
    </motion.div>
  );
}

// ── Section Card ───────────────────────────────────────────────────
function SectionCard({ icon, iconBg, title, subtitle, count, countColor, children, delay }) {
  return (
    <motion.div {...fadeUp(delay)} style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(61,114,224,0.07)", border: "1px solid rgba(91,154,245,0.1)" }}>
      <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</div>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>{title}</h2>
            <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{subtitle}</p>
          </div>
        </div>
        <span style={{ fontSize: 20, fontWeight: 900, color: countColor, background: `${countColor}12`, padding: "4px 14px", borderRadius: 12 }}>{count}</span>
      </div>
      <div style={{ padding: "4px 0" }}>{children}</div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
export default function TeacherAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWorkload = useCallback(async () => {
    try {
      setError(null);
      const res = await getTeacherWorkload();
      setData(res);
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to load workload data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-refresh every 30s ─────────────────────────────────────
  useAutoRefresh(loadWorkload, 30000);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8faff", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#5b9af5" }}/>
      <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Loading workload…</span>
    </div>
  );

  // FIX: null guard — prevents crash if API call fails
  if (error || !data) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8faff", gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <p style={{ fontSize: 14, color: "#ef4444", fontWeight: 600 }}>{error || "No data available."}</p>
      <button onClick={loadWorkload} style={{ padding: "8px 20px", borderRadius: 10, background: "#5b9af5", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
        Retry
      </button>
    </div>
  );

  // Safe destructure — only reached when data is not null
  const {
    overdue_count = 0,
    pending_3_days_count = 0,
    new_today_count = 0,
    overdue_list = [],
    pending_list = [],
    new_today_list = [],
  } = data;
  const total = overdue_count + pending_3_days_count + new_today_count;

  const topStats = [
    { label: "Overdue",           value: overdue_count,        icon: "⚠️", color: "#ef4444", bg: "rgba(239,68,68,0.1)",   radialMax: Math.max(total, 1) },
    { label: "Pending (≤3 days)", value: pending_3_days_count, icon: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", radialMax: Math.max(total, 1) },
    { label: "New Today",         value: new_today_count,      icon: "🆕", color: "#22c55e", bg: "rgba(34,197,94,0.1)",  radialMax: Math.max(total, 1) },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #f8faff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(91,154,245,0.25); border-radius: 4px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f6ff 0%,#fafbff 60%,#f5f0ff 100%)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 28px 56px" }}>

          {/* Title */}
          <motion.div {...fadeUp(0)} style={{ marginBottom: 28 }}>
            <motion.span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", background: "linear-gradient(90deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}>
              ✦ BZU Departmental Complaint System ✦
            </motion.span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginTop: 4 }}>
              My Work{" "}
              <span style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Analytics</span>
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>Your complaint workload — overdue, pending, and new assignments today.</p>
          </motion.div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 22 }}>
            {topStats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 + i * 0.08 }}
                whileHover={{ y: -3, boxShadow: "0 14px 36px rgba(61,114,224,0.12)" }}
                style={{ background: "white", borderRadius: 20, padding: "20px 20px 18px", boxShadow: "0 4px 20px rgba(61,114,224,0.06)", border: "1px solid rgba(91,154,245,0.09)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <RadialProgress value={s.value} max={s.radialMax} color={s.color} size={72}/>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 900, color: s.color }}>{s.value}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginTop: 2, lineHeight: 1.4 }}>{s.label}</div>
                </div>
              </motion.div>
            ))}

            {/* Total workload card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.31 }}
              whileHover={{ y: -3, boxShadow: "0 14px 36px rgba(61,114,224,0.2)" }}
              style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", borderRadius: 20, padding: "20px 20px 18px", boxShadow: "0 6px 24px rgba(61,114,224,0.22)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7"/>
                  <motion.circle cx="36" cy="36" r="28" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 * (overdue_count / Math.max(total, 1)) }}
                    transition={{ duration: 1.1, delay: 0.5 }}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}/>
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 900, color: "white" }}>
                    {total > 0 ? Math.round((overdue_count / total) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "white", letterSpacing: "-0.03em" }}>{total}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 700, marginTop: 2 }}>Total Active</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.55)", fontWeight: 600, marginTop: 1 }}>
                  {total > 0 ? Math.round((overdue_count / total) * 100) : 0}% overdue
                </div>
              </div>
            </motion.div>
          </div>

          {/* Overdue */}
          {overdue_list.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionCard icon="⚠️" iconBg="linear-gradient(135deg,#ef4444,#dc2626)" title="Overdue Complaints" subtitle="Not solved within 3 days — action needed" count={overdue_count} countColor="#ef4444" delay={0.2}>
                {overdue_list.map((item, i) => (
                  <ComplaintRow key={item.id} item={item} i={i} badge={
                    <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 9px", borderRadius: 20, color: "#ef4444", background: "rgba(239,68,68,0.1)", whiteSpace: "nowrap" }}>🔴 Overdue</span>
                  }/>
                ))}
              </SectionCard>
            </div>
          )}

          {/* Pending + New Today */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <SectionCard icon="⏳" iconBg="linear-gradient(135deg,#f59e0b,#d97706)" title="Pending (within 3 days)" subtitle="Recently assigned — resolve soon" count={pending_3_days_count} countColor="#f59e0b" delay={0.26}>
              {pending_list.length === 0
                ? <div style={{ padding: "22px", textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>🎉 No pending complaints</div>
                : pending_list.map((item, i) => (
                    <ComplaintRow key={item.id} item={item} i={i} badge={
                      <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 9px", borderRadius: 20, color: "#f59e0b", background: "rgba(245,158,11,0.1)", whiteSpace: "nowrap" }}>⏳ Pending</span>
                    }/>
                  ))
              }
            </SectionCard>

            <SectionCard icon="🆕" iconBg="linear-gradient(135deg,#22c55e,#16a34a)" title="New Today" subtitle="Assigned to you today" count={new_today_count} countColor="#22c55e" delay={0.3}>
              {new_today_list.length === 0
                ? <div style={{ padding: "22px", textAlign: "center", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>No new complaints today</div>
                : new_today_list.map((item, i) => (
                    <ComplaintRow key={item.id} item={item} i={i} badge={
                      <span style={{ fontSize: 10.5, fontWeight: 800, padding: "3px 9px", borderRadius: 20, color: "#22c55e", background: "rgba(34,197,94,0.1)", whiteSpace: "nowrap" }}>🆕 New</span>
                    }/>
                  ))
              }
            </SectionCard>
          </div>
        </div>
      </div>
    </>
  );
}
