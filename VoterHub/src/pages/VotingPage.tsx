import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import { pollsApi, type Poll } from "../lib/api";
import Skeleton from "../components/Skeleton";
import "./VotingPage.css";

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function anonToken() {
  let token = sessionStorage.getItem("vh_anon_token");
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem("vh_anon_token", token);
  }
  return token;
}

type VoteState = { pollId?: string; email?: string; pin?: string };

export default function VotingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as VoteState;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!state.pollId) return;
    pollsApi
      .byId(state.pollId)
      .then(({ poll }) => {
        if (!poll.open) {
          setError("This poll is not open for voting.");
          return;
        }
        setPoll(poll);
      })
      .catch(() => setError("Could not load this poll. Try joining again."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.pollId) return <Navigate to="/join-poll" replace />;

  const handleSubmit = async () => {
    if (!poll || !selected) return;
    setError(null);
    setSubmitting(true);
    try {
      await pollsApi.vote(poll.id, {
        optionId: selected,
        email: state.email,
        pin: state.pin,
        anonymousToken: state.email ? undefined : anonToken(),
      });
      navigate("/vote-confirmation", { state: { pollId: poll.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your vote. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="voting-page">
      <div className="voting-card">
        <Link to="/" className="logo" style={{ marginBottom: 20 }} aria-label="VoteHub home">
          <span className="logo-mark"><CheckCircle2 size={16} /></span>
          VoteHub
        </Link>

        {loading ? (
          <div aria-label="Loading ballot" style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <Skeleton style={{ height: 24, width: "60%", marginBottom: 8 }} />
                <Skeleton style={{ height: 13, width: "35%" }} />
              </div>
              <Skeleton style={{ height: 28, width: 90, borderRadius: 999 }} />
            </div>
            <Skeleton style={{ height: 22, width: "80%", marginBottom: 24 }} />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} style={{ height: 64, borderRadius: 8, marginBottom: 12 }} />
            ))}
          </div>
        ) : !poll ? (
          <p style={{ color: "var(--danger)", fontSize: 14 }}>{error ?? "Poll not found."}</p>
        ) : (
          <>
            <div className="voting-meta">
              <div>
                <h1>{poll.title}</h1>
                <p className="muted" style={{ fontSize: 13 }}>REF: {poll.reference}</p>
              </div>
              <span className="voting-timer"><Clock size={13} /> {poll.endDate ? `Ends ${poll.endDate}` : "Open"}</span>
            </div>

            <h2 className="voting-question">{poll.question}</h2>

            <div className="voting-options">
              {poll.options.map((o) => (
                <label key={o.id} className={`voting-option ${selected === o.id ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="candidate"
                    checked={selected === o.id}
                    onChange={() => setSelected(o.id)}
                  />
                  <div className="voting-avatar">{initials(o.name)}</div>
                  <div className="voting-option-text">
                    <strong>{o.name}</strong>
                    {o.tagline && <span>{o.tagline}</span>}
                  </div>
                  <CheckCircle2 size={20} className="voting-option-check" />
                </label>
              ))}
            </div>

            {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <button
              className="btn btn-primary btn-full"
              onClick={handleSubmit}
              disabled={!selected || submitting}
            >
              {submitting ? "Submitting..." : "Submit Vote"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
