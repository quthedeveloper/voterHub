import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Typewriter } from  "react-simple-typewriter";
import FormMessage from "../components/FormMessage";
import "./AuthPages.css";

export default function SignupPage() {
   const navigate = useNavigate();
 
  const [role, setRole] = useState<"organizer" | "voter">("organizer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [formMessage, setFormMessage] = useState<"error" | "success" | null>(null);
  const [loading, setLoading] = useState(false);
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormMessage(null);
 
    // Everything the backend's register controller expects, in one object
    const submission = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role,
    };
 
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setFormMessage("error");
        return;
      }
      setFormMessage("success");

       setTimeout(() => {
        navigate("/login", { state: { registered: true } });
      }, 1200);
    } catch (err) {
      setError("Could not reach the server. Check your connection and try again.");
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
          message={error || "Account created successfully!"}
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
                words={['Create your account']}
                loop={1}
                cursor
                cursorStyle="_"
                typeSpeed={100}
                deleteSpeed={50}
                delaySpeed={1000}
              />
          </h1>
          <p className="muted" style={{ marginBottom: 28 }}>Join VoteHub and start creating polls today.</p>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <input type="text" placeholder="John Doe" 
               name="fullName"
               value={formData.fullName}
               onChange={handleInputChange}
               style={{ padding: "20px 20px", fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}/>
            </div>
            <div className="field">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" 
               name="email"
               value={formData.email}
               onChange={handleInputChange}
               style={{ padding: "20px 20px", fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}/>
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="Create a password" 
               name="password"
               value={formData.password}
               onChange={handleInputChange}
               style={{ padding: "20px 20px", fontSize: 16, borderRadius: 8, border: "1px solid #ccc" }}  />
            </div>
            <div className="field">
              <label>Role</label>
              <div className="auth-role-options">
                <label className="auth-role-option">
                  <input type="radio" name="role" checked={role === "organizer"} onChange={() => setRole("organizer")} />
                  <div>
                    <strong>Organizer</strong>
                    <span>Create & manage polls</span>
                  </div>
                </label>
                <label className="auth-role-option">
                  <input type="radio" name="role" checked={role === "voter"} onChange={() => setRole("voter")} />
                  <div>
                    <strong>Voter</strong>
                    <span>Participate in polls</span>
                  </div>
                </label>
              </div>
            </div>
            <button className="btn btn-primary-4 btn-full" type="submit" style={{ marginTop: 8 }}>
              Create account
            </button>
          </form>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>

      <div
        className="split-auth-image"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1619059617660-d42ec4abe29a?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      >
        <p className="split-auth-image-quote">Better decisions with your community.</p>
      </div>
    </div>
    </>
  );
}
