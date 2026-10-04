import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import "./FormMessage.css";

type FormMessageProps = {
  type?: "error" | "success";
  message: string;
  duration?: number;       // ms before it auto-dismisses; 0 disables auto-dismiss
  onDismiss?: () => void;  // called once it's fully gone (e.g. clear parent's error state)
};

export default function FormMessage({
  type = "error",
  message,
  duration = 4000,
  onDismiss,
}: FormMessageProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Fires whenever a new message comes in, including the same text twice in a row
  useEffect(() => {
    if (!message) return;

    setLeaving(false);
    setVisible(true);

    if (!duration) return;
    const timer = setTimeout(() => setLeaving(true), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!visible || !message) return null;

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={`form-message form-message-${type} ${leaving ? "is-leaving" : "is-entering"}`}
      role={type === "error" ? "alert" : "status"}
      onAnimationEnd={() => {
        if (leaving) {
          setVisible(false);
          onDismiss?.();
        }
      }}
    >
      <Icon size={16} />
      <span>{message}</span>
    </div>
  );
}