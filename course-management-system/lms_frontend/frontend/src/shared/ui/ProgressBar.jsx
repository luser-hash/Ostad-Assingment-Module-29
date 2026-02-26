export default function ProgressBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 900 }}>
        <span style={{ opacity: 0.75 }}>Progress</span>
        <span>{v}%</span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: "#e5e7eb", overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", background: "#111827" }} />
      </div>
    </div>
  );
}