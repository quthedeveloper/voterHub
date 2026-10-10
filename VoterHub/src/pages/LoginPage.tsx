import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import { useAuth } from "../auth/AuthContext";
import { homeForRole } from "../lib/api";
import { useToast } from "../components/Toast";
import FormMessage from "../components/FormMessage";
import { ShieldCheckSvg } from "../components/illustrations";
import "../styles/global.css";
import "./AuthPages.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, initialized } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState<"error" | "success" | null>(null);
  const [loading, setLoading] = useState(false);

  // Already signed in? GuestRoute usually catches this, but stay safe.
  if (initialized && user) {
    return <Navigate to={homeForRole(user.role)} replace />;
  }

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

      const firstName = user.fullName.split(" ")[0];
      toast.success(`Welcome back, ${firstName}! You're logged in.`);
      setTimeout(() => {
        const from = (location.state as { from?: string } | null)?.from;
        navigate(from || homeForRole(user.role), { replace: true });
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setFormMessage("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {formMessage === "error" && (
        <FormMessage
          type="error"
          message={error}
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
                />
              </div>
              <div className="field">
                <label>Password</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
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
              <div className="auth-row">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />{" "}
                  Remember me
                </label>
                <Link to="/forgot-password" style={{ fontSize: 13 }}>Forgot password?</Link>
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
          <div className="auth-image-badge">
            <ShieldCheckSvg width={30} height={30} title="Secure sign in" />
            <div>
              <strong>Secure sign-in</strong>
              <span>Your vote stays private</span>
            </div>
          </div>
          <p className="split-auth-image-quote">Better decisions with your community.</p>
        </div>
      </div>
    </>
  );
}