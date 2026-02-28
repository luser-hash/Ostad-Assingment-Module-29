import { useEffect, useState } from "react";
import { toastSubscribe } from "@/components/ui/toast-store";

export default function ToastHost() {
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  useEffect(() => toastSubscribe(setToast), []);

  if (!toast.visible) return null;

  const accentClass =
    toast.type === "success"
      ? "border-l-green-600"
      : toast.type === "error"
        ? "border-l-red-700"
        : "border-l-slate-900";

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[9999] grid place-items-center">
      <div
        className={`w-full max-w-[520px] rounded-xl border border-border border-l-4 bg-background px-4 py-3 text-sm font-bold shadow-lg ${accentClass}`}
      >
        {toast.message}
      </div>
    </div>
  );
}
