import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import NotificationsBell from "../components/NotificationsBell";
import { Search, ArrowUpDown, Plus, ChevronDown } from "lucide-react";
import { pollsApi, type DashboardPoll } from "../lib/api";
import Skeleton from "../components/Skeleton";
import "./MyPollsPage.css";

type Filter = "all" | "active" | "closed";
type Sort = "newest" | "oldest" | "votes";

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

export default function MyPollsPage() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState<DashboardPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
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

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = polls.filter((p) => {
      if (filter === "active" && !p.open) return false;
      if (filter === "closed" && p.open) return false;
      if (q && !p.title.toLowerCase().includes(q) && !p.reference.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "votes") return b.totalVotes - a.totalVotes;
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sort === "newest" ? db - da : da - db;
    });
    return list;
  }, [polls, search, filter, sort]);

  const counts = useMemo(
    () => ({
      all: polls.length,
      active: polls.filter((p) => p.open).length,
      closed: polls.filter((p) => !p.open).length,
    }),
    [polls]
  );

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "active", label: `Active (${counts.active})` },
    { key: "closed", label: `Closed (${counts.closed})` },
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
          <div className="mypolls-head-row">
            <div>
              <p className="page-eyebrow">Your polls</p>
              <h1 className="page-title">My Polls</h1>
              <p className="page-sub">
                {counts.all === 0 ? "Polls you create will show up here." : `${counts.all} poll${counts.all === 1 ? "" : "s"} total.`}
              </p>
            </div>
            <Link to="/create-poll" className="btn btn-primary btn-sm">
              <Plus size={15} /> Create poll
            </Link>
          </div>
        </div>

        <div className="mypolls-controls anim-fade-up-1">
          <div className="mypolls-tabs" role="tablist" aria-label="Filter polls">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={filter === t.key}
                className={`mypolls-tab${filter === t.key ? " active" : ""}`}
                onClick={() => setFilter(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label className="mypolls-sort">
            <ArrowUpDown size={14} />
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort polls">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="votes">Most votes</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="mypolls-list" aria-label="Loading polls">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <Skeleton style={{ height: 16, width: "40%" }} />
                    <Skeleton style={{ height: 12, width: "28%" }} />
                  </div>
                  <Skeleton style={{ height: 32, width: 70 }} />
                  <Skeleton style={{ height: 32, width: 70 }} />
                  <Skeleton style={{ height: 24, width: 64, borderRadius: 999 }} />
                  <Skeleton style={{ height: 34, width: 96, borderRadius: 8 }} />
                </div>
              </div>
            ))}
          </div>
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
              {search || filter !== "all" ? "No polls match." : "No polls yet."}
            </p>
            {!search && filter === "all" && (
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
          <div className="mypolls-list">
            {visible.map((p, idx) => {
              const expanded = expandedId === p.id;
              const restricted = p.eligibleVotersCount > 0;
              return (
                <div key={p.id} className={`card mypolls-card anim-fade-up-${Math.min((idx % 3) + 1, 3)}`}>
                  <div className="mypolls-row">
                    <div className="mypolls-info">
                      <p className="mypolls-title">{p.title}</p>
                      <p className="mypolls-ref">REF: {p.reference} · {metaFor(p)}</p>
                      {p.question && <p className="mypolls-question">{p.question}</p>}
                    </div>
                    <div className="mypolls-metrics">
                      <div className="dash-poll-metric">
                        <strong>{restricted ? p.eligibleVotersCount.toLocaleString() : "–"}</strong>
                        <span>Eligible</span>
                      </div>
                      <div className="dash-poll-metric">
                        <strong>{p.totalVotes.toLocaleString()}</strong>
                        <span>Votes</span>
                      </div>
                      <div className="dash-poll-metric">
                        <strong>{p.turnoutPct != null ? `${p.turnoutPct}%` : "–"}</strong>
                        <span>Turnout</span>
                      </div>
                    </div>
                    <span className={`badge ${p.open ? "badge-active" : "badge-closed"}`}>
                      {p.open ? "Active" : "Closed"}
                    </span>
                    <div className="mypolls-actions">
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
                  </div>

                  {expanded && (
                    <div className="mypolls-results">
                      {p.options.length === 0 ? (
                        <p className="muted" style={{ fontSize: 13 }}>No options on this poll.</p>
                      ) : (
                        p.options.map((o, i) => (
                          <div key={o.id} className="mypolls-result-row">
                            <strong className="mypolls-result-name">{o.name}</strong>
                            <span className="mypolls-result-votes">{o.votes}</span>
                            <div className="mypolls-bar-track">
                              <div
                                className="mypolls-bar-fill"
                                style={{ width: `${o.pct}%`, animationDelay: `${i * 120}ms` }}
                              />
                            </div>
                            <span className="mypolls-result-pct">{o.pct}%</span>
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
