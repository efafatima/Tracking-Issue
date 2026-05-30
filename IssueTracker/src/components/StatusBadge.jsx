import { STATUS_COLORS } from "@/lib/designTokens";

export default function StatusBadge({ status, showIcon = true }) {
  const config = STATUS_COLORS[status];
  
  if (!config) return null;
  
  return (
    <span 
      className="status-badge"
      style={{
        background: config.bg,
        color: config.color
      }}
    >
      {showIcon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
      {config.label}
    </span>
  );
}
