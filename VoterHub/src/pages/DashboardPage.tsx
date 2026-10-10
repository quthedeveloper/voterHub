import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import NotificationsBell from "../components/NotificationsBell";
import { useAuth } from "../auth/AuthContext";
import { Search, Archive, ArrowRight, ChevronDown, Plus } from "lucide-react";
import { BallotBoxSvg, ChartBarsSvg, UsersSvg } from "../components/illustrations";
import { pollsApi, type DashboardPoll } from "../lib/api";
import "./DashboardPage.css";

function metaFor(p: DashboardPoll) {
  if (!p.open) return "Closed";
  if (p.endDate) {
    const end = new Date(`${p.endDate}T23:59:59`).getTime();
    if (!Number.isNaN(end)) {
      const days = Math.ceil((end - Date.now()) / 86400000);
      if (days <= 0) return "Ends today";
      return days === 1 ? "1 day left" : `${days} days left`;
    }
  }
  return "Open";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.fullName.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [polls, setPolls] = useState<DashboardPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { polls } = await pollsApi.listMine();
      setPolls(polls);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your polls.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return polls;
    return polls.filter(
      (p) => p.title.toLowerCase().includes(q) || p.reference.toLowerCase().includes(q)
    );
  }, [polls, search]);

  const visible = showAll ? filtered : filtered.slice(0, 5);

  const totalPolls = polls.length;
  const activePolls = polls.filter((p) => p.open).length;
  const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);

  const stats = [
    { label: "Total Polls", value: totalPolls, art: <BallotBoxSvg width={22} height={22} title="Total polls" /> },
    { label: "Active Polls", value: activePolls, art: <ChartBarsSvg width={22} height={22} title="Active polls" /> },
    { label: "Closed Polls", value: totalPolls - activePolls, art: <Archive size={20} /> },
    { label: "Total Votes", value: totalVotes.toLocaleString(), art: <UsersSvg width={22} height={22} title="Total votes" /> },
  ];

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search">
            <Search size={16} />
            <input
              placeholder="Search polls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="dash-topbar-icons">
            <NotificationsBell />
            <UserMenu />
          </div>
        </div>

        <div className="page-head anim-fade-up">
          <p className="page-eyebrow">Overview</p>
          <h1 className="page-title">{greeting}, {firstName}</h1>
          <p className="page-sub">Here's what's happening with your polls.</p>
        </div>

        <div className="dash-stats">
          {stats.map((s, i) => (
            <div key={s.label} className={`card card-hover dash-stat-card anim-fade-up-${Math.min(i + 1, 3)}`}>
              <span className="icon-badge">{s.art}</span>
              <div>
                <p className="dash-stat-value">{loading ? "–" : s.value}</p>
                <p className="dash-stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-recent-header">
          <h2>Recent Polls</h2>
          {filtered.length > 5 && (
            <button type="button" className="dash-view-all" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Show less" : "View all"} <ArrowRight size={13} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="card"><p className="muted" style={{ padding: 8 }}>Loading your polls…</p></div>
        ) : error ? (
          <div className="card">
            <p style={{ color: "var(--danger)", fontSize: 14 }}>{error}</p>
            <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={load}>
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>
              {search ? "No polls match your search." : "No polls yet."}
            </p>
            {!search && (
              <>
                <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
                  Create your first poll and invite people to vote.
                </p>
                <Link to="/create-poll" className="btn btn-primary btn-sm">
                  <Plus size={15} /> Create poll
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="dash-poll-list">
            {visible.map((p) => {
              const expanded = expandedId === p.id;
              const restricted = p.eligibleVotersCount > 0;
              return (
                <div key={p.id} className="card dash-poll-card">
                  <div className="dash-poll-row">
                    <div className="dash-poll-info">
                      <p className="dash-poll-title">{p.title}</p>
                      <p className="dash-poll-ref">REF: {p.reference} · {metaFor(p)}</p>
                    </div>
                    <div className="dash-poll-metric">
                      <strong>{restricted ? p.eligibleVotersCount.toLocaleString() : "–"}</strong>
                      <span>Eligible voters</span>
                    </div>
                    <div className="dash-poll-metric">
                      <strong>{p.totalVotes.toLocaleString()}</strong>
                      <span>Votes cast</span>
                    </div>
                    <div className="dash-poll-metric">
                      <strong>{p.turnoutPct != null ? `${p.turnoutPct}%` : "–"}</strong>
                      <span>Turnout</span>
                    </div>
                    <span className={`badge ${p.open ? "badge-active" : "badge-closed"}`}>
                      {p.open ? "Active" : "Closed"}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setExpandedId(expanded ? null : p.id)}
                      aria-expanded={expanded}
                    >
                      Results <ChevronDown size={14} className={expanded ? "chev-open" : ""} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ink btn-sm"
                      onClick={() => navigate("/poll-details", { state: { pollId: p.id } })}
                    >
                      Manage
                    </button>
                  </div>

                  {expanded && (
                    <div className="dash-results">
                      {p.options.length === 0 ? (
                        <p className="muted" style={{ fontSize: 13 }}>No options on this poll.</p>
                      ) : (
                        p.options.map((o, i) => (
                          <div key={o.id} className="dash-result-row">
                            <strong className="dash-result-name">{o.name}</strong>
                            <span className="dash-result-votes">{o.votes}</span>
                            <div className="dash-bar-track">
                              <div
                                className="dash-bar-fill"
                                style={{ width: `${o.pct}%`, animationDelay: `${i * 120}ms` }}
                              />
                            </div>
                            <span className="dash-result-pct">{o.pct}%</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
