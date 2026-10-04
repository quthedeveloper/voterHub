import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ShieldCheckSvg } from "../components/illustrations";
import "./JoinPollPage.css";

export default function JoinPollPage() {
  const navigate = useNavigate();

  return (
    <div className="join-poll">
      <div className="join-poll-card">
        <div
          className="join-poll-hero"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?fm=jpg&q=70&w=700&auto=format&fit=crop')" }}
        >
          <div className="logo" style={{ color: "#fff" }}>
            <span className="logo-mark" style={{ background: "#fff", color: "var(--ink)" }}>✓</span>
            VoteHub
          </div>
          <div className="join-poll-hero-art">
            <ShieldCheckSvg width={44} height={44} title="Secure poll access" />
          </div>
          <h1>Join a Poll</h1>
        </div>

        <div className="join-poll-form">
          <p className="muted" style={{ marginBottom: 20 }}>
            Enter the poll reference and PIN (if required) to access the voting page.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); navigate("/vote"); }}>
            <div className="field">
              <label>Poll Reference *</label>
              <input placeholder="e.g. UNI-2026-7K42" />
            </div>
            <div className="field">
              <label>Voting PIN (Optional)</label>
              <input placeholder="e.g. 6-digit PIN" />
            </div>
            <button className="btn btn-primary btn-full" type="submit">Join Poll</button>
          </form>

          <Link to="/" className="join-poll-back"><ArrowLeft size={14} /> Back to home</Link>
        </div>
      </div>
    </div>
  );
}
