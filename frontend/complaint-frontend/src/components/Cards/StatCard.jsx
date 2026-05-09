



import { motion } from "framer-motion";

export default function StatsCards({ stats }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 14,
        marginBottom: 26,
      }}
    >
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 + i * 0.07 }}
          whileHover={{
            y: -3,
            boxShadow: "0 12px 32px rgba(61,114,224,0.12)",
          }}
          style={{
            background: "white",
            borderRadius: 18,
            padding: "18px 18px 16px",
            boxShadow: "0 3px 16px rgba(61,114,224,0.06)",
            border: "1px solid rgba(91,154,245,0.09)",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: s.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              marginBottom: 10,
            }}
          >
            {s.icon}
          </div>

          {/* Value */}
          <div
            style={{
              fontSize: "1.6rem",
              fontWeight: 900,
              color: s.color,
              letterSpacing: "-0.04em",
            }}
          >
            {s.value}
          </div>

          {/* Label */}
          <div
            style={{
              fontSize: 11.5,
              color: "#94a3b8",
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {s.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}