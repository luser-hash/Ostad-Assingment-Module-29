export default function Panel({ title, children, right }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
        background: "white",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 15, fontWeight: 1000 }}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}