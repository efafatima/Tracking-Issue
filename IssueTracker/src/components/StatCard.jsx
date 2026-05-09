export default function StatCard({ label, value, tone = "var(--primary)" }) {
  return (
    <div className="stat-card">
      <strong style={{ color: tone }}>{value ?? 0}</strong>
      <span className="muted" style={{ fontWeight: 800, fontSize: 13 }}>{label}</span>
    </div>
  );
}
