import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminTrend, getTeacherPerformance } from "../../services/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

// ── Trend Chart ────────────────────────────────────────────────────
function TrendChart({ data }) {
  const [hovered, setHovered] = useState(null);
  const W = 560; const H = 170;
  const pad = { t: 20, r: 20, b: 32, l: 36 };
  const maxV = Math.max(...data.map((d) => d.total), 1) + 4;

  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r));
  const yT = data.map((d) => pad.t + (1 - d.total / maxV) * (H - pad.t - pad.b));
  const yS = data.map((d) => pad.t + (1 - d.solved / maxV) * (H - pad.t - pad.b));
  const yP = data.map((d) => pad.t + (1 - d.pending / maxV) * (H - pad.t - pad.b));

  const makePath = (ys) => xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
  const makeArea = (ys) => `${makePath(ys)} L${xs[xs.length - 1]},${H - pad.b} L${xs[0]},${H - pad.b} Z`;
  const gridVals = [0, Math.round(maxV / 3), Math.round((2 * maxV) / 3), maxV];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
      <defs>
        <linearGradient id="ac1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b9af5" stopOpacity="0.16"/><stop offset="100%" stopColor="#5b9af5" stopOpacity="0"/></linearGradient>
        <linearGradient id="ac2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.14"/><stop offset="100%" stopColor="#22c55e" stopOpacity="0"/></linearGradient>
        <linearGradient id="ac3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/></linearGradient>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#5b9af5"/><stop offset="100%" stopColor="#3d72e0"/></linearGradient>
        <filter id="glow2"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {gridVals.map((v, i) => {
        const y = pad.t + (1 - v / maxV) * (H - pad.t - pad.b);
        return (
          <g key={i}>
            <line x1={pad.l} y1={y} x2={W - pad.r} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4"/>
            <text x={pad.l - 6} y={y + 4} textAnchor="end" style={{ fontSize: 9, fill: "#94a3b8", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 }}>{v}</text>
          </g>
        );
      })}
      <motion.path d={makeArea(yT)} fill="url(#ac1)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}/>
      <motion.path d={makeArea(yS)} fill="url(#ac2)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}/>
      <motion.path d={makeArea(yP)} fill="url(#ac3)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}/>
      <motion.path d={makePath(yT)} fill="none" stroke="url(#lg1)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow2)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}/>
      <motion.path d={makePath(yS)} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.45, ease: "easeOut" }}/>
      <motion.path d={makePath(yP)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}/>
      {xs.map((x, i) => (
        <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
          {hovered === i && (
            <>
              <line x1={x} y1={pad.t} x2={x} y2={H - pad.b} stroke="rgba(91,154,245,0.2)" strokeWidth="1" strokeDasharray="3 3"/>
              <rect x={x - 42} y={pad.t} width={84} height={52} rx={8} fill="white" style={{ filter: "drop-shadow(0 2px 10px rgba(61,114,224,0.18))" }}/>
              <text x={x} y={pad.t + 13} textAnchor="middle" style={{ fontSize: 9, fill: "#5b9af5", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800 }}>📋 {data[i].total} total</text>
              <text x={x} y={pad.t + 26} textAnchor="middle" style={{ fontSize: 9, fill: "#22c55e", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800 }}>✓ {data[i].solved} solved</text>
              <text x={x} y={pad.t + 39} textAnchor="middle" style={{ fontSize: 9, fill: "#f59e0b", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800 }}>⏳ {data[i].pending} pending</text>
            </>
          )}
          <motion.circle cx={x} cy={yT[i]} r={hovered === i ? 6 : 4} fill="white" stroke="#5b9af5" strokeWidth="2.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.08, type: "spring" }} style={{ cursor: "pointer" }}/>
          <motion.circle cx={x} cy={yS[i]} r={hovered === i ? 5 : 3.5} fill="white" stroke="#22c55e" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.08, type: "spring" }} style={{ cursor: "pointer" }}/>
          <text x={x} y={H - 6} textAnchor="middle" style={{ fontSize: 9.5, fill: "#94a3b8", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700 }}>{data[i].date}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Efficiency Bar ─────────────────────────────────────────────────
function EfficiencyBar({ value, color }) {
  return (
    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 6, overflow: "hidden", flex: 1 }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: "100%", borderRadius: 6, background: `linear-gradient(90deg,${color}88,${color})` }}/>
    </div>
  );
}

// ── Teacher Card ───────────────────────────────────────────────────
function TeacherCard({ d, i, colors }) {
  const [hov, setHov] = useState(false);
  const color = colors[i % colors.length];
  const isEfficient = d.efficiency_percent >= 80;
  const isFast = d.avg_resolution_days <= 2;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "white", borderRadius: 18, padding: "20px", boxShadow: hov ? "0 12px 36px rgba(61,114,224,0.13)" : "0 3px 16px rgba(61,114,224,0.06)", border: `1px solid ${hov ? color + "44" : "rgba(91,154,245,0.09)"}`, transition: "all 0.25s ease", cursor: "default" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 900, color, border: `2px solid ${color}33` }}>
            {d.teacher.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>
              {d.teacher.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, marginTop: 1 }}>Teacher</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {isEfficient && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>★ Top</span>}
          {isFast && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20, color: "#5b9af5", background: "rgba(91,154,245,0.1)" }}>⚡ Fast</span>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[{ label: "Assigned", value: d.assigned, color: "#5b9af5" }, { label: "Solved", value: d.solved, color: "#22c55e" }, { label: "Pending", value: d.pending, color: "#f59e0b" }].map((s) => (
          <div key={s.label} style={{ background: `${s.color}09`, borderRadius: 10, padding: "9px 10px", textAlign: "center", border: `1px solid ${s.color}18` }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9.5, color: "#94a3b8", fontWeight: 700, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Efficiency</span>
          <span style={{ fontSize: 11, fontWeight: 900, color }}>{d.efficiency_percent}%</span>
        </div>
        <EfficiencyBar value={d.efficiency_percent} color={color}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 10, background: "rgba(248,250,255,0.9)", border: "1px solid rgba(91,154,245,0.08)" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>⏱ Avg Resolution</span>
        <span style={{ fontSize: 12, fontWeight: 900, color: isFast ? "#22c55e" : "#f59e0b" }}>{d.avg_resolution_days} days</span>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
export default function AdminAnalyticsDashboard() {
  const [trendData, setTrendData] = useState([]);
  const [teacherData, setTeacherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TEACHER_COLORS = ["#5b9af5", "#8b5cf6", "#06b6d4", "#f59e0b", "#22c55e", "#f97316", "#ec4899"];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [trend, teachers] = await Promise.all([getAdminTrend(), getTeacherPerformance()]);
      setTrendData(Array.isArray(trend) ? trend : []);
      setTeacherData(Array.isArray(teachers) ? teachers : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-refresh every 30s ─────────────────────────────────────
  useAutoRefresh(loadData, 30000);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8faff", gap: 16 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid #e2e8f0", borderTopColor: "#5b9af5" }}/>
      <span style={{ fontSize: 14, color: "#94a3b8", fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Loading analytics…</span>
    </div>
  );

  const trend = trendData;
  const teachers = teacherData;
  const totalComplaints = trend.reduce((s, d) => s + d.total, 0);
  const totalSolved = trend.reduce((s, d) => s + d.solved, 0);
  const totalPending = trend.reduce((s, d) => s + d.pending, 0);
  const resRate = totalComplaints > 0 ? Math.round((totalSolved / totalComplaints) * 100) : 0;
  const avgEff = teachers.length > 0 ? (teachers.reduce((s, t) => s + t.efficiency_percent, 0) / teachers.length).toFixed(1) : 0;

  const topStats = [
    { label: "Total (7 days)", value: totalComplaints, icon: "📋", color: "#5b9af5", bg: "rgba(91,154,245,0.1)" },
    { label: "Solved", value: totalSolved, icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "Pending", value: totalPending, icon: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Resolution Rate", value: `${resRate}%`, icon: "🎯", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { label: "Avg Efficiency", value: `${avgEff}%`, icon: "⚡", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { label: "Teachers", value: teachers.length, icon: "👩‍🏫", color: "#ec4899", bg: "rgba(236,72,153,0.1)" },
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
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 28px 64px" }}>

          {/* Title */}
          <motion.div {...fadeUp(0)} style={{ marginBottom: 28 }}>
            <motion.span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", background: "linear-gradient(90deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}>
              ✦ System-Wide Overview ✦
            </motion.span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginTop: 4 }}>
              {" "}
              <span style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Analytics</span>
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>7-day complaint trends & teacher performance overview.</p>
          </motion.div>

          {/* Error banner */}
          {error && (
            <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: 13, fontWeight: 600 }}>
              ⚠️ {error} — showing last available data.
            </div>
          )}

          {/* Top Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 13, marginBottom: 22 }}>
            {topStats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.07 }}
                whileHover={{ y: -3, boxShadow: "0 14px 36px rgba(61,114,224,0.12)" }}
                style={{ background: "white", borderRadius: 18, padding: "18px 16px 14px", boxShadow: "0 3px 16px rgba(61,114,224,0.06)", border: "1px solid rgba(91,154,245,0.09)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 10 }}>{s.icon}</div>
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.07 }}
                  style={{ fontSize: "1.55rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>{s.value}</motion.div>
                <div style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Trend Chart */}
          <motion.div {...fadeUp(0.16)} style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 4px 24px rgba(61,114,224,0.07)", border: "1px solid rgba(91,154,245,0.1)", marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#5b9af5,#3d72e0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📈</div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 900, color: "#0f172a" }}>7-Day Complaint Trend</h2>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Daily received · solved · pending</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[{ color: "#5b9af5", label: "Total" }, { color: "#22c55e", label: "Solved" }, { color: "#f59e0b", label: "Pending" }].map((l) => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }}/>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {trend.length > 0 ? (
              <>
                <TrendChart data={trend}/>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginTop: 16 }}>
                  {trend.map((d, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                      style={{ textAlign: "center", padding: "8px 4px", borderRadius: 10, background: d.pending > 0 ? "rgba(245,158,11,0.05)" : "rgba(34,197,94,0.05)", border: `1px solid ${d.pending > 0 ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)"}` }}>
                      <div style={{ fontSize: 9.5, fontWeight: 800, color: "#94a3b8", marginBottom: 4 }}>{d.date}</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: "#5b9af5" }}>{d.total}</div>
                      <div style={{ fontSize: 9, color: "#22c55e", fontWeight: 700 }}>✓{d.solved}</div>
                      {d.pending > 0 && <div style={{ fontSize: 9, color: "#f59e0b", fontWeight: 700 }}>⏳{d.pending}</div>}
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>No trend data available yet.</div>
            )}
          </motion.div>

          {/* Teacher Performance */}
          <motion.div {...fadeUp(0.24)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: "linear-gradient(135deg,#8b5cf6,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👩‍🏫</div>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 900, color: "#0f172a" }}>Teacher Performance</h2>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Efficiency · resolution time · workload</p>
                </div>
              </div>
              <div style={{ padding: "6px 14px", borderRadius: 10, background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#8b5cf6" }}>{teachers.length} Active Teachers</span>
              </div>
            </div>

            {teachers.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                {teachers.map((t, i) => <TeacherCard key={t.teacher} d={t} i={i} colors={TEACHER_COLORS}/>)}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13, background: "white", borderRadius: 20, border: "1px solid rgba(91,154,245,0.1)" }}>
                No teacher data available yet.
              </div>
            )}

            {teachers.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                style={{ marginTop: 16, padding: "14px 20px", borderRadius: 16, background: "white", border: "1px solid rgba(91,154,245,0.12)", boxShadow: "0 3px 16px rgba(61,114,224,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>📊 System Averages</span>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[
                    { label: "Avg Efficiency", value: `${avgEff}%`, color: "#5b9af5" },
                    { label: "Avg Resolution", value: teachers.length > 0 ? `${(teachers.reduce((s, t) => s + t.avg_resolution_days, 0) / teachers.length).toFixed(1)} days` : "—", color: "#8b5cf6" },
                    { label: "Total Assigned", value: teachers.reduce((s, t) => s + t.assigned, 0), color: "#06b6d4" },
                  ].map((stat) => (
                    <div key={stat.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, background: `linear-gradient(90deg,${stat.color},${stat.color}bb)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</div>
                      <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}