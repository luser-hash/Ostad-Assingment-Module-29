export default function AuthCard({ title, subtitle, children }) {
  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{title}</h2>
      {subtitle && <p style={{ marginTop: 6, opacity: 0.7 }}>{subtitle}</p>}
      <div style={{ marginTop: 14 }}>{children}</div>
    </div>
  );
}