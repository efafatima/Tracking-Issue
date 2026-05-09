import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getAnalytics } from "../../services/api";
import { useAutoRefresh } from "../../hooks/useAutoRefresh";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
});

// ── Donut Chart ────────────────────────────────────────────────────
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const [hovered, setHovered] = useState(null);
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const R = 68;
  const r = 44;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const slices = data.map((d) => {
    const pct = total > 0 ? d.value / total : 0;
    const len = pct * circumference;
    const startOffset = offset;
    offset += len;
    return { ...d, pct, len, startOffset };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={R - r}/>
          {slices.map((s, i) => (
            <motion.circle key={s.label} cx={cx} cy={cy} r={R} fill="none" stroke={s.color}
              strokeWidth={hovered === i ? R - r + 5 : R - r}
              strokeDasharray={`0 ${circumference}`}
              strokeDashoffset={-s.startOffset + circumference * 0.25}
              strokeLinecap="round"
              style={{ cursor: "pointer", transition: "stroke-width 0.2s" }}
              animate={{ strokeDasharray: `${s.len} ${circumference}` }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}/>
          ))}
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
          {hovered !== null ? (
            <>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: slices[hovered].color, letterSpacing: "-0.03em" }}>{slices[hovered].value}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginTop: 1 }}>{slices[hovered].label}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>{total}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, marginTop: 1 }}>Total</div>
            </>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 20px", width: "100%" }}>
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }}/>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", whiteSpace: "nowrap" }}>{d.label}</div>
                <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 600 }}>{d.value} · {pct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Bar Chart ──────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {data.map((d, i) => (
        <div key={d.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "default" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
              {d.icon} {d.label}
            </span>
            <motion.span animate={{ color: hovered === i ? "#3d72e0" : "#94a3b8" }} style={{ fontSize: 12.5, fontWeight: 800 }}>{d.value}</motion.span>
          </div>
          <div style={{ height: 10, background: "#f1f5f9", borderRadius: 8, overflow: "hidden", position: "relative" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%", borderRadius: 8, background: hovered === i ? "linear-gradient(90deg,#5b9af5,#7ab5f8)" : "linear-gradient(90deg,#5b9af5,#3d72e0)", transition: "background 0.2s", position: "relative", overflow: "hidden" }}>
              <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2, delay: 0.8 + i * 0.12, repeat: Infinity, repeatDelay: 3 }}
                style={{ position: "absolute", top: 0, left: 0, width: "40%", height: "100%", background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)" }}/>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Sparkline ──────────────────────────────────────────────────────
function Sparkline({ data }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>
        Not enough data for trend chart yet.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value));
  const W = 280; const H = 60;
  const pad = 8;
  const span = data.length - 1;
  const xs = data.map((_, i) => pad + (i / span) * (W - pad * 2));
  const ys = data.map((d) => H - pad - ((d.value - min) / (max - min || 1)) * (H - pad * 2));
  const path = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
  const fill = `${path} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b9af5" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#5b9af5" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <motion.path d={fill} fill="url(#sparkFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}/>
      <motion.path d={path} fill="none" stroke="#5b9af5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}/>
      {xs.map((x, i) => (
        <motion.circle key={i} cx={x} cy={ys[i]} r={3.5} fill="white" stroke="#5b9af5" strokeWidth={2}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }}/>
      ))}
      {data.map((d, i) => (
        <text key={i} x={xs[i]} y={H} textAnchor="middle" style={{ fontSize: 9, fill: "#94a3b8", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 600 }}>{d.month}</text>
      ))}
    </svg>
  );
}

// ── Main ───────────────────────────────────────────────────────────
export default function StudentAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const result = await getAnalytics();
      setData(result);
    } catch (err) {
      console.error("Analytics error:", err);
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Auto-refresh every 30s ─────────────────────────────────────
  useAutoRefresh(fetchAnalytics, 30000);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(91,154,245,0.2)", borderTopColor: "#5b9af5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}/>
      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>Loading analytics…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error || !data) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚠️</div>
      <p style={{ fontSize: 14, color: "#ef4444", fontWeight: 600 }}>{error || "No data available."}</p>
      <button onClick={fetchAnalytics} style={{ padding: "8px 20px", borderRadius: 10, background: "#5b9af5", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
        Retry
      </button>
    </div>
  );

  const PIE_DATA = data.status_data.map((item) => ({
    label: item.label,
    value: item.value,
    color:
      item.label === "Solved" ? "#22c55e" :
      item.label === "Pending" ? "#f59e0b" :
      item.label === "In Progress" ? "#8b5cf6" : "#5b9af5",
    lightColor: "rgba(91,154,245,0.12)",
  }));

  const BAR_DATA = data.category_data.map((item) => ({ label: item.label, value: item.value, icon: "📌" }));
  const MONTHLY = data.monthly_data;
  const total = PIE_DATA.reduce((s, d) => s + d.value, 0);
  const solved = PIE_DATA.find((d) => d.label === "Solved")?.value ?? 0;
  const pending = PIE_DATA.find((d) => d.label === "Pending")?.value ?? 0;
  const rate = total > 0 ? Math.round((solved / total) * 100) : 0;

  const topStats = [
    { label: "Total Complaints", value: total, icon: "📋", color: "#5b9af5", bg: "rgba(91,154,245,0.1)" },
    { label: "Solved", value: solved, icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "Pending", value: pending, icon: "⏳", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(91,154,245,0.25); border-radius: 4px; }
      `}</style>

      <div style={{ padding: "32px 28px 48px", maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <motion.div {...fadeUp(0)} style={{ marginBottom: 28 }}>
          <motion.span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", background: "linear-gradient(90deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}>
            ✦ BZU Departmental Complaint System ✦
          </motion.span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", marginTop: 4 }}>
            My{" "}
            <span style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Analytics</span>
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>Your personal complaint statistics and trends.</p>
        </motion.div>

        {/* Top stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 22 }}>
          {topStats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3, boxShadow: "0 14px 36px rgba(61,114,224,0.12)" }}
              style={{ background: "white", borderRadius: 18, padding: "20px 20px 16px", boxShadow: "0 3px 16px rgba(61,114,224,0.06)", border: "1px solid rgba(91,154,245,0.09)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>{s.icon}</div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }}
                style={{ fontSize: "1.8rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>{s.value}</motion.div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginTop: 3 }}>{s.label}</div>
            </motion.div>
          ))}
          {/* Resolution rate card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, boxShadow: "0 14px 36px rgba(61,114,224,0.12)" }}
            style={{ background: "linear-gradient(135deg,#5b9af5,#3d72e0)", borderRadius: 18, padding: "20px 20px 16px", boxShadow: "0 6px 24px rgba(61,114,224,0.22)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, marginBottom: 12, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>🎯</div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.48 }}
              style={{ fontSize: "1.8rem", fontWeight: 900, color: "white", letterSpacing: "-0.04em" }}>{rate}%</motion.div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600, marginTop: 3 }}>Resolution Rate</div>
          </motion.div>
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
          <motion.div {...fadeUp(0.15)} style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 4px 24px rgba(61,114,224,0.07)", border: "1px solid rgba(91,154,245,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#5b9af5,#3d72e0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🍩</div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>Complaint Status</h2>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Distribution overview</p>
              </div>
            </div>
            <DonutChart data={PIE_DATA}/>
          </motion.div>
          <motion.div {...fadeUp(0.2)} style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 4px 24px rgba(61,114,224,0.07)", border: "1px solid rgba(91,154,245,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#5b9af5,#3d72e0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📊</div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>By Category</h2>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Complaints per type</p>
              </div>
            </div>
            {BAR_DATA.length > 0
              ? <BarChart data={BAR_DATA}/>
              : <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: 13 }}>No category data yet.</div>
            }
          </motion.div>
        </div>

        {/* Monthly Sparkline */}
        <motion.div {...fadeUp(0.25)} style={{ background: "white", borderRadius: 20, padding: "24px", boxShadow: "0 4px 24px rgba(61,114,224,0.07)", border: "1px solid rgba(91,154,245,0.1)", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#5b9af5,#3d72e0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📈</div>
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>Monthly Trend</h2>
                <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Complaints submitted per month</p>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>↑ Active</span>
          </div>
          {MONTHLY.length > 0
            ? <Sparkline data={MONTHLY}/>
            : <div style={{ textAlign: "center", padding: "30px 0", color: "#94a3b8", fontSize: 13 }}>No monthly data yet.</div>
          }
        </motion.div>

        {/* Status Breakdown */}
        <motion.div {...fadeUp(0.3)}>
          <h2 style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", marginBottom: 12 }}>Status Breakdown</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {PIE_DATA.map((d, i) => {
              const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
              return (
                <motion.div key={d.label}
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -3, boxShadow: "0 12px 30px rgba(61,114,224,0.1)" }}
                  style={{ background: "white", borderRadius: 16, padding: "18px 18px 14px", boxShadow: "0 3px 14px rgba(61,114,224,0.06)", border: `1px solid ${d.color}22` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }}/>
                    <span style={{ fontSize: 11, fontWeight: 800, color: d.color, background: d.lightColor, padding: "2px 8px", borderRadius: 20 }}>{pct}%</span>
                  </div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>{d.value}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700, marginTop: 3 }}>{d.label}</div>
                  <div style={{ marginTop: 10, height: 4, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.5 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: "100%", borderRadius: 4, background: d.color }}/>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
}