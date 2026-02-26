export default function Spinner({ label = "Loading..." }) {
  return (
    <div style={{ padding: 16, textAlign: "center" }}>
      <div style={{ fontSize: 14, opacity: 0.8 }}>{label}</div>
    </div>
  );
}