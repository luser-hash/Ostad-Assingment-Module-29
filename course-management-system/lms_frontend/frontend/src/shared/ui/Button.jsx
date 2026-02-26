export default function Button({ children, loading, ...props }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      style={{
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid #111827",
        background: "#111827",
        color: "white",
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.8 : 1,
      }}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}