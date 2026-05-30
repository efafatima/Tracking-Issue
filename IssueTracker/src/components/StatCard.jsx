import { CircleUserRound } from "lucide-react";

export default function StatCard({ label, value, tone = "var(--primary)", icon: Icon = CircleUserRound, featured = false, helper }) {
  return (
    <div className={`stat-card${featured ? " primary" : ""}`}>
      <div className="stat-icon"><Icon size={17} /></div>
      <span className="muted" style={{ fontWeight: 800, fontSize: 13 }}>{label}</span>
      <strong style={{ color: featured ? undefined : tone }}>{value ?? 0}</strong>
      {helper && <div className="muted" style={{ marginTop: 8, fontSize: 12, fontWeight: 800 }}>{helper}</div>}
    </div>
  );
}
