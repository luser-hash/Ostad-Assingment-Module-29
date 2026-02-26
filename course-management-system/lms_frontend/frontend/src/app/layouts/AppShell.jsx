export default function AppShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#c5872a",
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "white",
        }}
      >
        {children}
      </div>
    </div>
  );
}