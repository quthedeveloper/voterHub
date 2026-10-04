import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import { useAuth } from "../auth/AuthContext";
import FormMessage from "../components/FormMessage";
import "../styles/global.css";
import "./AuthPages.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState<"error" | "success" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormMessage(null); // clear any leftover message from a previous attempt

    // Everything the backend's login controller expects, in one object
    const submission = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      remember,
    };

    setLoading(true);
    try {
      const user = await login(submission.email, submission.password, submission.remember);

      setFormMessage("success");
      setTimeout(() => {
        navigate(user.role === "organizer" ? "/dashboard" : "/join-poll");
      }, 800);
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
          message={error || "Logged in successfully!"}
          onDismiss={() => setFormMessage(null)}
        />
      )}

      <div className="split-auth">
        <div className="split-auth-form">
          <div className="split-auth-form-inner">
            <div className="logo" style={{ marginBottom: 40 }}>
              <span><CheckCircle2 size={16} /></span>
              VoteHub
            </div>

            <h1 className="auth-title">
              <Typewriter
                words={['Welcome Back!']}
                loop={1}
                cursor
                cursorStyle="_"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
            <p className="muted" style={{ marginBottom: 28 }}>Log in to your account to continue.</p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{ padding: "20px 20px", fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{ padding: "20px 20px", fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}
                />
              </div>
              <div className="auth-row">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />{" "}
                  Remember me
                </label>
                <a href="#" className="muted" style={{ fontSize: 13 }}>Forgot password?</a>
              </div>
              <button className="btn btn-primary-4 btn-full" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </button>
            </form>

            {/*will add this later  */}
            {/* <div className="auth-divider"><span>or</span></div>

            <button className="btn btn-outline btn-full">Continue with Google</button> */}

            <p className="auth-footer-text">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>

        <div
          className="split-auth-image"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1605433975283-263394f3514e?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
        >
          <p className="split-auth-image-quote">Better decisions with your community.</p>
        </div>
      </div>
    </>
  );
}