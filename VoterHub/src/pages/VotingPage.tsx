import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import "./VotingPage.css";

const candidates = [
  { id: "john", name: "John Mensah", tagline: "Leadership. Unity. Progress.", avatar: "JM" },
  { id: "sarah", name: "Sarah Boateng", tagline: "A stronger voice for students.", avatar: "SB" },
  { id: "michael", name: "Michael Owusu", tagline: "Experience. Action. Results.", avatar: "MO" },
];

export default function VotingPage() {
  const [selected, setSelected] = useState("sarah");
  const navigate = useNavigate();

  return (
    <div className="voting-page">
      <div className="voting-card">
        <div className="logo" style={{ marginBottom: 20 }}>
          <span className="logo-mark"><CheckCircle2 size={16} /></span>
          VoteHub
        </div>

        <div className="voting-meta">
          <div>
            <h1>Student Council Election</h1>
            <p className="muted" style={{ fontSize: 13 }}>REF: UNI-2026-7K42</p>
          </div>
          <span className="voting-timer"><Clock size={13} /> 2 days left</span>
        </div>

        <h2 className="voting-question">Who should be the next president?</h2>

        <div className="voting-options">
          {candidates.map((c) => (
            <label key={c.id} className={`voting-option ${selected === c.id ? "selected" : ""}`}>
              <input
                type="radio"
                name="candidate"
                checked={selected === c.id}
                onChange={() => setSelected(c.id)}
              />
              <div className="voting-avatar">{c.avatar}</div>
              <div className="voting-option-text">
                <strong>{c.name}</strong>
                <span>{c.tagline}</span>
              </div>
            </label>
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={() => navigate("/vote-confirmation")}>
          Submit Vote
        </button>
      </div>
    </div>
  );
}
