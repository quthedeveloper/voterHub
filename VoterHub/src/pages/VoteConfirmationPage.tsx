import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { VoteBurstSvg } from "../components/illustrations";
import "./VoteConfirmationPage.css";

export default function VoteConfirmationPage() {
  return (
    <div className="voting-page">
      <div className="voting-card confirm-card">
        <div className="confirm-art"><VoteBurstSvg width={110} height={110} title="Vote submitted" /></div>
        <h1>Vote submitted</h1>
        <p className="muted">Your vote has been recorded.</p>

        <div className="confirm-poll-chip">
          <div className="confirm-poll-chip-icon"><CheckCircle2 size={16} /></div>
          <div>
            <strong>Student Council Election</strong>
            <span>REF: UNI-2026-7K42</span>
          </div>
          <Link to="/results" className="btn btn-outline btn-sm">View Results</Link>
        </div>

        <Link to="/" className="confirm-back"><ArrowLeft size={14} /> Back to home</Link>
      </div>
    </div>
  );
}
