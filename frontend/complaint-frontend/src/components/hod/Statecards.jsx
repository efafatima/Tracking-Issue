import { motion } from "framer-motion";

export default function StatsCards({ stats }) {
  return (
    <div className="stat-grid">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, boxShadow: "0 14px 36px rgba(61,114,224,0.13)" }}
          style={{
            background: "white",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 3px 16px rgba(61,114,224,0.06)",
            border: "1px solid rgba(91,154,245,0.09)",
            cursor: "default",
          }}
        >
          <div style={{ height: 4, background: s.color, opacity: 0.85 }} />
          <div style={{ padding: "16px 18px 18px" }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, marginBottom: 12 }}>
              {s.icon}
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: s.color, letterSpacing: "-0.04em" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 3 }}>
              {s.label}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
