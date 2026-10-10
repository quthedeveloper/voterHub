import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, ArrowLeft, AlertTriangle } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import FormMessage from "../components/FormMessage";
import { ShieldCheckSvg } from "../components/illustrations";
import { API_BASE } from "../lib/api";
import "../styles/global.css";
import "./AuthPages.css";

/** Supabase puts the recovery token in the URL hash: #access_token=...&type=recovery */
function getRecoveryToken(): string | null {
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  if (params.get("type") !== "recovery") return null;
  return params.get("access_token");
}

export default function ResetPasswordPage() {
  const recoveryToken = useMemo(getRecoveryToken, []);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState<"error" | "success" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormMessage(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setFormMessage("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      setFormMessage("error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recoveryToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reset your password.");
      setDone(true);
      setFormMessage("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setFormMessage("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {formMessage && (
        <FormMessage
          type={formMessage}
          message={error || "Password updated. You can now log in."}
          onDismiss={() => setFormMessage(null)}
        />
      )}

      <div className="split-auth">
        <div className="split-auth-form">
          <div className="split-auth-form-inner">
            <Link to="/" className="logo" style={{ marginBottom: 40 }} aria-label="VoteHub home">
              <span><CheckCircle2 size={16} /></span>
              VoteHub
            </Link>

            <h1 className="auth-title">
              <Typewriter
                words={["Choose a new password"]}
                loop={1}
                cursor
                cursorStyle="_"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
            <p className="muted" style={{ marginBottom: 28 }}>
              Make it strong and unique to VoteHub.
            </p>

            {!recoveryToken ? (
              <div className="card" style={{ textAlign: "center", padding: "28px 24px" }}>
                <div className="icon-badge" style={{ margin: "0 auto 14px", background: "#fdecec", color: "var(--danger)" }}>
                  <AlertTriangle size={20} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>This link isn't valid</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                  Reset links expire quickly and can only be used once. Request a fresh one below.
                </p>
                <Link to="/forgot-password" className="btn btn-primary btn-full">
                  Request a new link
                </Link>
              </div>
            ) : done ? (
              <div className="card" style={{ textAlign: "center", padding: "28px 24px" }}>
                <div className="icon-badge icon-badge-success" style={{ margin: "0 auto 14px" }}>
                  <CheckCircle2 size={20} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Password updated</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
                  You're all set. Log in with your new password.
                </p>
                <Link to="/login" className="btn btn-primary btn-full">
                  Log in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>New password</label>
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label>Confirm new password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat your new password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary-4 btn-full" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            )}

            <p style={{ marginTop: 20, textAlign: "center" }}>
              <Link to="/login" className="join-poll-back" style={{ marginTop: 0 }}>
                <ArrowLeft size={14} /> Back to log in
              </Link>
            </p>
          </div>
        </div>

        <div
          className="split-auth-image"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605433975283-263394f3514e?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        >
          <div className="auth-image-badge">
            <ShieldCheckSvg width={30} height={30} title="Secure password reset" />
            <div>
              <strong>Secure reset</strong>
              <span>Links expire quickly</span>
            </div>
          </div>
          <p className="split-auth-image-quote">Better decisions with your community.</p>
        </div>
      </div>
    </>
  );
}
