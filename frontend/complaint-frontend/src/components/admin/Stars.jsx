export default function Stars({ n }) {
  return (
    <span style={{ fontSize: 12 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= n ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}