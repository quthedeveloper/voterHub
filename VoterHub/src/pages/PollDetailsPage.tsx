import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import NotificationsBell from "../components/NotificationsBell";
import { Search, Share2, Pause, XCircle, Edit3, Plus, Trash2, Check, Minus } from "lucide-react";
import { pollsApi, type Poll, type EligibleVoter } from "../lib/api";
import { useToast } from "../components/Toast";
import Skeleton from "../components/Skeleton";
import "./PollDetailsPage.css";

type DetailsState = { pollId?: string };

type Results = {
  options: { id: string; name: string; tagline: string | null; votes: number; pct: number }[];
  totalVotes: number;
  eligibleVotersCount: number;
  turnoutPct: number | null;
};

export default function PollDetailsPage() {
  const location = useLocation();
  const toast = useToast();
  const state = (location.state ?? {}) as DetailsState;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [voters, setVoters] = useState<EligibleVoter[]>([]);
  const [votedCount, setVotedCount] = useState(0);
  const [results, setResults] = useState<Results | null>(null);
  const [resultsHidden, setResultsHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEmails, setNewEmails] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollId = state.pollId;

  const load = async (id: string) => {
    const [{ poll: p }, ev] = await Promise.all([
      pollsApi.byId(id),
      pollsApi.eligibleVoters(id).catch(() => ({ voters: [], total: 0, voted: 0 })),
    ]);
    setPoll(p);
    setVoters(ev.voters);
    setVotedCount(ev.voted);
    try {
      setResults(await pollsApi.results(id));
      setResultsHidden(false);
    } catch {
      setResultsHidden(true);
    }
  };

  useEffect(() => {
    if (!pollId) return;
    load(pollId)
      .catch(() => setError("Could not load this poll."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!pollId) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <div className="card anim-fade-up" style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
            <h1 className="page-title">No poll selected</h1>
            <p className="page-sub" style={{ marginBottom: 24 }}>Pick a poll from your dashboard to see its details.</p>
            <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  const handleAdd = async () => {
    const emails = newEmails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    setAdding(true);
    try {
      const { added, total } = await pollsApi.addEligibleVoters(pollId, emails);
      setNewEmails("");
      toast.success(`Added ${added} voter${added === 1 ? "" : "s"} (${total} invited).`);
      const ev = await pollsApi.eligibleVoters(pollId);
      setVoters(ev.voters);
      setVotedCount(ev.voted);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add voters.");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (evId: string) => {
    try {
      await pollsApi.removeEligibleVoter(pollId, evId);
      const ev = await pollsApi.eligibleVoters(pollId);
      setVoters(ev.voters);
      setVotedCount(ev.voted);
      toast.success("Voter removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove voter.");
    }
  };

  const totalVotes = results?.totalVotes ?? 0;
  const turnout = results?.turnoutPct ?? (voters.length > 0 ? Math.round((votedCount / voters.length) * 1000) / 10 : null);

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search"><Search size={16} /><input placeholder="Search polls..." /></div>
          <div className="dash-topbar-icons">
            <NotificationsBell />
            <UserMenu />
          </div>
        </div>

        {loading ? (
          <div aria-label="Loading poll details">
            <div className="page-head">
              <Skeleton style={{ height: 14, width: 120, marginBottom: 10 }} />
              <Skeleton style={{ height: 34, width: "55%", marginBottom: 10 }} />
              <Skeleton style={{ height: 14, width: "35%" }} />
            </div>
            <div className="dash-stats">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card" style={{ padding: 20 }}>
                  <Skeleton style={{ height: 26, width: "50%", marginBottom: 8 }} />
                  <Skeleton style={{ height: 13, width: "75%" }} />
                </div>
              ))}
            </div>
            <div className="card" style={{ marginTop: 16 }}>
              <Skeleton style={{ height: 18, width: 180, marginBottom: 16 }} />
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Skeleton style={{ height: 14, width: 140 }} />
                  <Skeleton style={{ height: 8, flex: 1, borderRadius: 999 }} />
                  <Skeleton style={{ height: 14, width: 48 }} />
                </div>
              ))}
            </div>
          </div>
        ) : error || !poll ? (
          <p style={{ color: "var(--danger)" }}>{error ?? "Poll not found."}</p>
        ) : (
          <>
            <div className="page-head anim-fade-up">
              <div className="page-head-row">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h1 className="page-title" style={{ marginBottom: 0 }}>{poll.title}</h1>
                    <span className={`badge ${poll.open ? "badge-active" : "badge-closed"}`}>
                      {poll.open ? "Active" : "Closed"}
                    </span>
                    {poll.eligibleVotersCount > 0 && <span className="badge badge-accent">Invite-only</span>}
                  </div>
                  <p className="page-sub" style={{ fontSize: 13 }}>
                    REF: {poll.reference}{poll.endDate ? ` · Ends ${poll.endDate}` : ""}
                  </p>
                </div>
                <button className="btn btn-outline btn-sm"><Share2 size={14} /> Share Poll</button>
              </div>
            </div>

            <div className="dash-stats">
              <div className="card card-hover dash-stat-card anim-fade-up-1"><div><p className="dash-stat-value">{voters.length}</p><p className="dash-stat-label">Eligible voters</p></div></div>
              <div className="card card-hover dash-stat-card anim-fade-up-2"><div><p className="dash-stat-value">{totalVotes}</p><p className="dash-stat-label">Votes cast</p></div></div>
              <div className="card card-hover dash-stat-card anim-fade-up-3"><div><p className="dash-stat-value">{turnout !== null ? `${turnout}%` : "—"}</p><p className="dash-stat-label">Turnout</p></div></div>
            </div>

            <div className="poll-details-grid">
              <div className="card anim-fade-up-2">
                <h3 className="section-title">Poll Controls</h3>
                <div className="poll-details-controls">
                  <button className="btn btn-danger btn-full"><XCircle size={15} /> Close Poll</button>
                  <button className="btn btn-outline btn-full"><Pause size={15} /> Pause Voting</button>
                  <button className="btn btn-outline btn-full"><Edit3 size={15} /> Edit Poll</button>
                </div>

                <h3 className="section-title" style={{ marginTop: 24 }}>Eligible Voters</h3>
                <div className="field">
                  <textarea
                    rows={3}
                    value={newEmails}
                    onChange={(e) => setNewEmails(e.target.value)}
                    placeholder={"Add emails, one per line"}
                  />
                </div>
                <button className="btn btn-outline btn-full" onClick={handleAdd} disabled={adding}>
                  <Plus size={15} /> {adding ? "Adding..." : "Add voters"}
                </button>
              </div>

              <div className="card anim-fade-up-3">
                <h3 className="section-title">Candidates & Results</h3>
                {resultsHidden || !results ? (
                  <p className="muted" style={{ fontSize: 14 }}>Results are not public for this poll.</p>
                ) : (
                  <div className="poll-details-candidate-list">
                    <div className="poll-details-candidate-header">
                      <span>Candidate</span><span>Votes</span><span>Percentage</span><span />
                    </div>
                    {results.options.map((c, i) => (
                      <div key={c.id} className="poll-details-candidate-row">
                        <strong>{c.name}</strong>
                        <span>{c.votes}</span>
                        <div className="poll-details-bar-track" style={{ flex: 1 }}>
                          <div className="poll-details-bar-fill" style={{ width: `${c.pct}%`, animationDelay: `${i * 140}ms` }} />
                        </div>
                        <span style={{ width: 46, textAlign: "right" }}>{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="section-title" style={{ marginTop: 24 }}>Invite list</h3>
                {voters.length === 0 ? (
                  <p className="muted" style={{ fontSize: 14 }}>Open poll — anyone with the reference can vote.</p>
                ) : (
                  <div className="poll-details-voter-list">
                    {voters.map((v) => (
                      <div key={v.id} className="poll-details-voter-row">
                        <span className="poll-details-voter-email">{v.email}</span>
                        <span className={`badge ${v.hasVoted ? "badge-active" : "badge-closed"}`}>
                          {v.hasVoted ? <Check size={12} /> : <Minus size={12} />}
                          {v.hasVoted ? "Voted" : "Pending"}
                        </span>
                        {!v.hasVoted && (
                          <button
                            className="dash-icon-btn"
                            aria-label={`Remove ${v.email}`}
                            onClick={() => handleRemove(v.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
