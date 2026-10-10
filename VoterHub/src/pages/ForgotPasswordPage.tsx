import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Mail } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import FormMessage from "../components/FormMessage";
import { ShieldCheckSvg } from "../components/illustrations";
import { API_BASE } from "../lib/api";
import "../styles/global.css";
import "./AuthPages.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formMessage, setFormMessage] = useState<"error" | "success" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    setLoading(true);
    try {
      // Always 200 by design — the backend never reveals if the email exists.
      await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSent(true);
      setFormMessage("success");
    } catch {
      // Even on network failure, show the same neutral message.
      setSent(true);
      setFormMessage("success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {formMessage && (
        <FormMessage
          type={formMessage}
          message="If an account exists for that email, a reset link is on its way."
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
                words={["Reset your password"]}
                loop={1}
                cursor
                cursorStyle="_"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
            <p className="muted" style={{ marginBottom: 28 }}>
              Enter the email you signed up with and we'll send you a reset link.
            </p>

            {sent ? (
              <div className="card" style={{ textAlign: "center", padding: "28px 24px" }}>
                <div className="icon-badge icon-badge-success" style={{ margin: "0 auto 14px" }}>
                  <Mail size={20} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Check your inbox</h3>
                <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  If an account exists for <strong>{email}</strong>, a password
                  reset link is on its way. It expires soon, so don't wait too long.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary-4 btn-full" type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
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
