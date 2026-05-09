import { motion } from "framer-motion";
import { fadeUp } from "../Complaint/helpers";

const typeConfig = {
  warning: {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    color: "#b45309",
    dot: "#f59e0b",
  },
  info: {
    bg: "rgba(91,154,245,0.08)",
    border: "rgba(91,154,245,0.25)",
    color: "#1d4ed8",
    dot: "#5b9af5",
  },
  danger: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    color: "#b91c1c",
    dot: "#ef4444",
  },
  success: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    color: "#065f46",
    dot: "#10b981",
  },
};

export default function DSAActionCenter({ actionItems = [], onRefresh }) {
  const isEmpty = actionItems.length === 0;

  return (
    <motion.div
      {...fadeUp(2)}
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid rgba(91,154,245,0.12)",
        boxShadow: "0 2px 16px rgba(61,114,224,0.06)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px 14px",
          borderBottom: "1px solid rgba(91,154,245,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#5b9af5",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 3,
            }}
          >
            Action
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            DSA Action Center
          </h3>
        </div>
        <button
          onClick={onRefresh}
          title="Refresh"
          style={{
            border: "1px solid rgba(91,154,245,0.2)",
            background: "rgba(91,154,245,0.06)",
            borderRadius: 8,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 14,
            color: "#5b9af5",
            transition: "all 0.15s",
          }}
        >
          ↻
        </button>
      </div>

      {/* Action Items */}
      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {isEmpty ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎉</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#475569", marginBottom: 4 }}>
              All clear!
            </div>
            <div style={{ fontSize: 12.5 }}>No pending actions right now.</div>
          </div>
        ) : (
          actionItems.map((item, i) => {
            const cfg = typeConfig[item.type] || typeConfig.info;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                style={{
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: 11,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                }}
              >
                {/* Dot indicator */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: cfg.dot,
                    marginTop: 4,
                    flexShrink: 0,
                    boxShadow: `0 0 0 3px ${cfg.dot}22`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: cfg.color,
                      lineHeight: 1.45,
                    }}
                  >
                    {item.icon && (
                      <span style={{ marginRight: 5 }}>{item.icon}</span>
                    )}
                    {item.text}
                  </div>
                  {item.action && (
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: cfg.dot,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      {item.action} →
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      {!isEmpty && (
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid rgba(91,154,245,0.08)",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11.5, color: "#94a3b8", fontWeight: 500 }}>
            {actionItems.length} item{actionItems.length > 1 ? "s" : ""} 
          </span>
          <span style={{ fontSize: 11, color: "#cbd5e1" }}>
            Auto-refreshes every 30s
          </span>
        </div>
      )}
    </motion.div>
  );
}