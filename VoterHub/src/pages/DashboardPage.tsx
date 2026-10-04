import Sidebar from "../components/Sidebar";
import { Search, Bell, MoreVertical } from "lucide-react";
import "./DashboardPage.css";

const stats = [
  { label: "Total Polls", value: 5 },
  { label: "Active Polls", value: 2 },
  { label: "Closed Polls", value: 3 },
  { label: "Total Voters", value: "1,248" },
];

const polls = [
  { title: "Student Council Election", ref: "UNI-2026-7K42", meta: "2 days left", status: "Active" as const, voters: 247, votes: 183, turnout: "74.1%" },
  { title: "Class Representative", ref: "CLS-2026-91PV", meta: "Closed", status: "Closed" as const, voters: 42, votes: 39, turnout: "92.9%" },
  { title: "Faculty Board", ref: "FAC-2026-30TQ", meta: "2 days left", status: "Active" as const, voters: 120, votes: 76, turnout: "63.3%" },
];

export default function DashboardPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search">
            <Search size={16} />
            <input placeholder="Search polls..." />
          </div>
          <div className="dash-topbar-icons">
            <Bell size={18} />
            <div className="sidebar-avatar" style={{ width: 32, height: 32 }}>BQ</div>
          </div>
        </div>

        <h1 className="dash-greeting">Good afternoon, Bryan 👋</h1>
        <p className="muted" style={{ marginBottom: 24 }}>Here's an overview of your polls and activity.</p>

        <div className="dash-stats">
          {stats.map((s) => (
            <div key={s.label} className="card dash-stat-card">
              <p className="dash-stat-value">{s.value}</p>
              <p className="muted" style={{ fontSize: 13 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="dash-recent-header">
          <h2>Recent Polls</h2>
          <a href="#" className="muted" style={{ fontSize: 13 }}>View all →</a>
        </div>

        <div className="dash-poll-list">
          {polls.map((p) => (
            <div key={p.ref} className="card dash-poll-row">
              <div className="dash-poll-info">
                <p className="dash-poll-title">{p.title}</p>
                <p className="muted" style={{ fontSize: 12 }}>REF: {p.ref} · {p.meta}</p>
              </div>
              <div className="dash-poll-metric">
                <strong>{p.voters}</strong>
                <span>Eligible voters</span>
              </div>
              <div className="dash-poll-metric">
                <strong>{p.votes}</strong>
                <span>Votes cast</span>
              </div>
              <div className="dash-poll-metric">
                <strong>{p.turnout}</strong>
                <span>Turnout</span>
              </div>
              <span className={`badge ${p.status === "Active" ? "badge-active" : "badge-closed"}`}>{p.status}</span>
              <button className="btn btn-outline btn-sm">{p.status === "Active" ? "Manage" : "View results"}</button>
              <MoreVertical size={16} className="muted" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
