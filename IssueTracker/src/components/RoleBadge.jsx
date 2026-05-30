import { ROLE_COLORS } from "@/lib/designTokens";

export default function RoleBadge({ role, showDescription = false }) {
  const config = ROLE_COLORS[role];
  
  if (!config) return null;
  
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 12px",
      borderRadius: 999,
      background: config.light,
      color: config.primary,
      fontWeight: 700,
      fontSize: "0.85rem"
    }}>
      <span>{config.badge}</span>
      <span>{role}</span>
      {showDescription && (
        <span style={{ fontSize: "0.75rem", fontWeight: 500, marginLeft: 4, opacity: 0.8 }}>
          • {config.description}
        </span>
      )}
    </div>
  );
}
