import { useToast } from "../../context/ToastContext";
import "../../styles/toast.css";

export default function Toast() {
  const toastContext = useToast();

  // 🔴 DEBUG GUARD
  if (!toastContext) {
    console.error("ToastContext is undefined ❌");
    return null;
  }

  const { toast } = toastContext;

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.message}
    </div>
  );
}
