import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

export default function GetStartedSection() {
  return (
    <section
      className="landing-cta"
      style={
        {
        backgroundImage:
          "url('https://images.unsplash.com/photo-1619059617660-d42ec4abe29a?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          marginTop: 90,
      }
      
    }
    >
      <div className="landing-cta-overlay" />

      <div className="landing-cta-card">
        <p className="landing-eyebrow landing-cta-eyebrow">READY WHEN YOU ARE</p>
        <h2 className="landing-voice-headings landing-cta-heading">
          Get Ready to Get Started
        </h2>
        <p className="landing-cta-sub">
          Your account is one click away. Log in and start creating polls,
          collecting votes, and seeing results in minutes.
        </p>

        <Link to="/login" className="btn btn-primary landing-cta-btn">
          <LogIn size={18} />
          Log In
        </Link>

        <p className="landing-cta-fine">
          New here?{" "}
          <Link to="/signup" className="landing-cta-link">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}