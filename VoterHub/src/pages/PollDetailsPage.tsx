import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
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
          <div className="dash-topbar-icons">
            <button className="dash-icon-btn" aria-label="Notifications"><Bell size={18} /></button>
            <UserMenu />
          </div>
        </div>

        <div className="page-head anim-fade-up">
          <div className="page-head-row">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h1 className="page-title" style={{ marginBottom: 0 }}>Student Council Election</h1>
                <span className="badge badge-active">Active</span>
              </div>
              <p className="page-sub" style={{ fontSize: 13 }}>REF: UNI-2026-7K42 · 2 days left</p>
            </div>
            <button className="btn btn-outline btn-sm"><Share2 size={14} /> Share Poll</button>
          </div>
        </div>

        <div className="dash-stats">
          <div className="card card-hover dash-stat-card anim-fade-up-1"><div><p className="dash-stat-value">247</p><p className="dash-stat-label">Eligible voters</p></div></div>
          <div className="card card-hover dash-stat-card anim-fade-up-2"><div><p className="dash-stat-value">183</p><p className="dash-stat-label">Votes cast</p></div></div>
          <div className="card card-hover dash-stat-card anim-fade-up-3"><div><p className="dash-stat-value">74.1%</p><p className="dash-stat-label">Turnout</p></div></div>
        </div>

        <div className="poll-details-grid">
          <div className="card anim-fade-up-2">
            <h3 className="section-title">Poll Controls</h3>
            <div className="poll-details-controls">
              <button className="btn btn-danger btn-full"><XCircle size={15} /> Close Poll</button>
              <button className="btn btn-outline btn-full"><Pause size={15} /> Pause Voting</button>
              <button className="btn btn-outline btn-full"><Edit3 size={15} /> Edit Poll</button>
            </div>
          </div>

          <div className="card anim-fade-up-3">
            <h3 className="section-title">Candidates & Results</h3>
            <div className="poll-details-candidate-list">
              <div className="poll-details-candidate-header">
                <span>Candidate</span><span>Votes</span><span>Percentage</span><span />
              </div>
              {candidates.map((c, i) => (
                <div key={c.name} className="poll-details-candidate-row">
                  <strong>{c.name}</strong>
                  <span>{c.votes}</span>
                  <div className="poll-details-bar-track" style={{ flex: 1 }}>
                    <div className="poll-details-bar-fill" style={{ width: `${c.pct}%`, animationDelay: `${i * 140}ms` }} />
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
