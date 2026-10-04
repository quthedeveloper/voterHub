import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, LogIn } from "lucide-react";
import { ShieldCheckSvg } from "./illustrations";
import "./LoginAlert.css";

type LoginAlertProps = {
  /** Controls visibility. Rendered only when true. */
  open: boolean;
  /** Called when the alert is dismissed (overlay click, Escape, or close button). */
  onClose: () => void;
  title?: string;
  message?: string;
};

/**
 * LoginAlert — a modal prompt asking the visitor to log in.
 * Created as a standalone component; not wired into any page yet.
 * Drop it into a page and toggle `open` when a guest-only action needs auth.
 *
 *   const [showLogin, setShowLogin] = useState(false);
 *   ...
 *   <LoginAlert open={showLogin} onClose={() => setShowLogin(false)} />
 */
export default function LoginAlert({
  open,
  onClose,
  title = "Log in to continue",
  message = "You need an account to do that. Log in or create a free account to keep going.",
}: LoginAlertProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="login-alert-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="login-alert-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-alert-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="login-alert-art">
          <ShieldCheckSvg width={88} height={88} title="Login required" />
        </div>

        <h2 className="login-alert-title">{title}</h2>
        <p className="login-alert-message">{message}</p>

        <Link to="/login" className="btn btn-primary btn-full btn-lg">
          <LogIn size={17} />
          Log In
        </Link>
        <p className="login-alert-fine">
          New here? <Link to="/signup" className="login-alert-link">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
