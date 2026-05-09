import { motion } from "framer-motion";

export default function StatCard({ label, value, icon, color, bg }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 14px 36px rgba(61,114,224,0.13)" }}
      transition={{ duration: 0.2 }}
      style={{
        background: "white",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(91,154,245,0.09)",
        boxShadow: "0 3px 16px rgba(61,114,224,0.06)",
        cursor: "default",
      }}
    >
      <div style={{ height: 4, background: color, opacity: 0.85 }} />
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, marginBottom: 12 }}>
          {icon}
        </div>
        <div style={{ fontSize: "1.75rem", fontWeight: 900, color: color, letterSpacing: "-0.04em" }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 3 }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}
