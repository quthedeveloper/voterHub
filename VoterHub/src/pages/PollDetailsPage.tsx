import Sidebar from "../components/Sidebar";
import { Search, Bell, Share2, Pause, Edit3, XCircle } from "lucide-react";
import "./PollDetailsPage.css";

const candidates = [
  { name: "John Mensah", votes: 61, pct: 47.5 },
  { name: "Sarah Boateng", votes: 87, pct: 33.3 },
  { name: "Michael Owusu", votes: 35, pct: 19.1 },
];

export default function PollDetailsPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search"><Search size={16} /><input placeholder="Search polls..." /></div>
          <div className="dash-topbar-icons"><Bell size={18} /></div>
        </div>

        <div className="poll-details-header">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 className="dash-greeting">Student Council Election</h1>
              <span className="badge badge-active">Active</span>
            </div>
            <p className="muted" style={{ fontSize: 13 }}>REF: UNI-2026-7K42 · 2 days left</p>
          </div>
          <button className="btn btn-outline btn-sm"><Share2 size={14} /> Share Poll</button>
        </div>

        <div className="dash-stats" style={{ marginTop: 20 }}>
          <div className="card dash-stat-card"><p className="dash-stat-value">247</p><p className="muted" style={{ fontSize: 13 }}>Eligible voters</p></div>
          <div className="card dash-stat-card"><p className="dash-stat-value">183</p><p className="muted" style={{ fontSize: 13 }}>Votes cast</p></div>
          <div className="card dash-stat-card"><p className="dash-stat-value">74.1%</p><p className="muted" style={{ fontSize: 13 }}>Turnout</p></div>
        </div>

        <div className="poll-details-grid">
          <div className="card">
            <h3 className="create-poll-section-title">Poll Controls</h3>
            <button className="btn btn-danger btn-full" style={{ marginBottom: 8 }}><XCircle size={15} /> Close Poll</button>
            <button className="btn btn-outline btn-full" style={{ marginBottom: 8 }}><Pause size={15} /> Pause Voting</button>
            <button className="btn btn-outline btn-full"><Edit3 size={15} /> Edit Poll</button>
          </div>

          <div className="card">
            <h3 className="create-poll-section-title">Candidates & Results</h3>
            <div className="poll-details-candidate-list">
              <div className="poll-details-candidate-header">
                <span>Candidate</span><span>Votes</span><span>Percentage</span>
              </div>
              {candidates.map((c) => (
                <div key={c.name} className="poll-details-candidate-row">
                  <span>{c.name}</span>
                  <span>{c.votes}</span>
                  <div className="results-bar-track" style={{ flex: 1 }}>
                    <div className="results-bar-fill" style={{ width: `${c.pct}%` }} />
                  </div>
                  <span style={{ width: 46, textAlign: "right" }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
