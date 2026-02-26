export default function Input({ label, error, ...props }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>}
      <input
        {...props}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`,
          outline: "none",
        }}
      />
      {error && <span style={{ color: "#ef4444", fontSize: 12 }}>{error}</span>}
    </div>
  );
}