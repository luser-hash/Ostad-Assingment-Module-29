import { useEffect, useState } from "react";
import { toastSubscribe } from "./toastStore";

export default function ToastHost() {
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  useEffect(() => toastSubscribe(setToast), []);

  if (!toast.visible) return null;

  const color =
    toast.type === "success" ? "#16a34a" : toast.type === "error" ? "#991b1b" : "#111827";

  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "white",
          border: "1px solid #e5e7eb",
          borderLeft: `6px solid ${color}`,
          borderRadius: 14,
          padding: "12px 14px",
          fontWeight: 900,
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        {toast.message}
      </div>
    </div>
  );
}