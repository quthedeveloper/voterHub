import Sidebar from "../components/Sidebar";
import { Search, Bell, MoreVertical, Archive, ArrowRight } from "lucide-react";
import { BallotBoxSvg, ChartBarsSvg, UsersSvg } from "../components/illustrations";
import "./DashboardPage.css";

const stats = [
  { label: "Total Polls", value: 5, art: <BallotBoxSvg width={22} height={22} title="Total polls" /> },
  { label: "Active Polls", value: 2, art: <ChartBarsSvg width={22} height={22} title="Active polls" /> },
  { label: "Closed Polls", value: 3, art: <Archive size={20} /> },
  { label: "Total Voters", value: "1,248", art: <UsersSvg width={22} height={22} title="Total voters" /> },
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
            <button className="dash-icon-btn" aria-label="Notifications"><Bell size={18} /></button>
            <div className="sidebar-avatar" style={{ width: 36, height: 36 }}>BQ</div>
          </div>
        </div>

        <div className="page-head anim-fade-up">
          <p className="page-eyebrow">Overview</p>
          <h1 className="page-title">Good afternoon, Bryan 👋</h1>
          <p className="page-sub">Here's an overview of your polls and activity.</p>
        </div>

        <div className="dash-stats">
          {stats.map((s, i) => (
            <div key={s.label} className={`card card-hover dash-stat-card anim-fade-up-${Math.min(i + 1, 3)}`}>
              <span className="icon-badge">{s.art}</span>
              <div>
                <p className="dash-stat-value">{s.value}</p>
                <p className="dash-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-recent-header">
          <h2>Recent Polls</h2>
          <a href="#" className="dash-view-all">View all <ArrowRight size={13} /></a>
        </div>

        <div className="dash-poll-list">
          {polls.map((p) => (
            <div key={p.ref} className="card card-hover dash-poll-row">
              <div className="dash-poll-info">
                <p className="dash-poll-title">{p.title}</p>
                <p className="dash-poll-ref">REF: {p.ref} · {p.meta}</p>
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
