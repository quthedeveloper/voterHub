import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { ChartBarsSvg } from "../components/illustrations";
import { pollsApi, type Poll } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import Skeleton from "../components/Skeleton";
import "./ResultsPage.css";

type ResultOption = { id: string; name: string; tagline: string | null; votes: number; pct: number };
type Results = {
  options: ResultOption[];
  totalVotes: number;
  eligibleVotersCount: number;
  turnoutPct: number | null;
};

type ResultsState = { pollId?: string };

function closeLabel(poll: Poll) {
  if (!poll.open) return "This poll is closed.";
  if (poll.endDate) {
    const end = new Date(`${poll.endDate}T23:59:59`).getTime();
    if (!Number.isNaN(end)) {
      const days = Math.ceil((end - Date.now()) / 86400000);
      if (days <= 0) return "The poll closes today.";
      return `The poll will close in ${days} day${days === 1 ? "" : "s"}.`;
    }
  }
  return "The poll is still open.";
}

export default function ResultsPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const state = (location.state ?? {}) as ResultsState;
  const pollId = state.pollId ?? searchParams.get("id");

  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(!!pollId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pollId) return;
    let cancelled = false;

    const load = async (first: boolean) => {
      if (first) {
        setLoading(true);
        setError(null);
      }
      try {
        const [{ poll: p }, r] = await Promise.all([
          pollsApi.byId(pollId),
          pollsApi.results(pollId),
        ]);
        if (cancelled) return;
        setPoll(p);
        setResults(r);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not load results.");
      } finally {
        if (first && !cancelled) setLoading(false);
      }
    };

    load(true);
    // Live updates while the poll is open.
    const t = window.setInterval(() => {
      load(false);
    }, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [pollId]);

  const leaderId =
    results && results.totalVotes > 0
      ? results.options.reduce((best, o) => (o.votes > (best?.votes ?? -1) ? o : best), null as ResultOption | null)?.id
      : null;

  return (
    <div className="results-page">
      <div className="results-card">
        <div className="results-header">
          <Link to="/" className="logo" aria-label="VoteHub home"><span className="logo-mark"><CheckCircle2 size={16} /></span>VoteHub</Link>
          {poll?.open && (
            <span className="badge badge-active"><span className="results-live-dot" />Live Results</span>
          )}
        </div>

        {!pollId ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <h1 style={{ marginBottom: 8 }}>No poll selected</h1>
            <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
              Choose a poll to see its results.
            </p>
            <Link
              to={user?.role === "organizer" ? "/my-polls" : "/join-poll"}
              className="btn btn-primary btn-sm"
            >
              {user?.role === "organizer" ? "Go to My Polls" : "Join a poll"}
            </Link>
          </div>
        ) : loading ? (
          <div aria-label="Loading results">
            <Skeleton style={{ height: 30, width: "60%", marginBottom: 8 }} />
            <Skeleton style={{ height: 13, width: "30%", marginBottom: 20 }} />
            <div className="results-stats">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card results-stat">
                  <Skeleton style={{ height: 24, width: "50%", marginBottom: 8 }} />
                  <Skeleton style={{ height: 12, width: "80%" }} />
                </div>
              ))}
            </div>
            <Skeleton style={{ height: 22, width: 140, margin: "20px 0 16px" }} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Skeleton style={{ height: 14, width: "35%" }} />
                  <Skeleton style={{ height: 14, width: 70 }} />
                </div>
                <Skeleton style={{ height: 10, borderRadius: 999 }} />
              </div>
            ))}
          </div>
        ) : error || !poll || !results ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <h1 style={{ marginBottom: 8 }}>Results unavailable</h1>
            <p className="muted" style={{ fontSize: 14, marginBottom: 20 }}>
              {error ?? "Could not load this poll's results."}
            </p>
            <Link to="/" className="btn btn-outline btn-sm">
              <ArrowLeft size={14} /> Back to home
            </Link>
          </div>
        ) : (
          <>
            <div className="results-title-row">
              <h1>{poll.title}</h1>
              <span className={`badge ${poll.open ? "badge-active" : "badge-closed"}`}>
                {poll.open ? "Active" : "Closed"}
              </span>
            </div>
            <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>REF: {poll.reference}</p>

            <div className="results-stats">
              <div className="card results-stat">
                <strong>{results.eligibleVotersCount > 0 ? results.eligibleVotersCount.toLocaleString() : "–"}</strong>
                <span>Eligible voters</span>
              </div>
              <div className="card results-stat"><strong>{results.totalVotes.toLocaleString()}</strong><span>Votes cast</span></div>
              <div className="card results-stat">
                <strong>{results.turnoutPct != null ? `${results.turnoutPct}%` : "–"}</strong>
                <span>Turnout</span>
              </div>
            </div>

            <h2 className="results-subtitle">
              <ChartBarsSvg width={26} height={26} title="Results chart" />
              Results
            </h2>
            <div className="results-list">
              {results.options.map((r, i) => (
                <div key={r.id} className={`results-row${r.id === leaderId ? " results-winner" : ""}`}>
                  <div className="results-row-top">
                    <span>
                      <strong>{r.name}</strong>
                      {r.id === leaderId && <span className="results-winner-badge">Leading</span>}
                    </span>
                    <span className="results-pct">{r.votes} · {r.pct}%</span>
                  </div>
                  <div className="results-bar-track">
                    <div className="results-bar-fill" style={{ width: `${r.pct}%`, animationDelay: `${i * 140}ms` }} />
                  </div>
                </div>
              ))}
            </div>

            <p className="muted" style={{ fontSize: 12, marginTop: 20 }}>
              {poll.open ? "Results update automatically. " : ""}{closeLabel(poll)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
