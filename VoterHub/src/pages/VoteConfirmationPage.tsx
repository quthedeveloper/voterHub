import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { VoteBurstSvg } from "../components/illustrations";
import { pollsApi, type Poll } from "../lib/api";
import Skeleton from "../components/Skeleton";
import "./VoteConfirmationPage.css";

type ConfirmState = { pollId?: string };

export default function VoteConfirmationPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as ConfirmState;
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(!!state.pollId);

  useEffect(() => {
    if (!state.pollId) return;
    pollsApi
      .byId(state.pollId)
      .then(({ poll }) => setPoll(poll))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="voting-page">
      <div className="voting-card confirm-card">
        <div className="confirm-art"><VoteBurstSvg width={110} height={110} title="Vote submitted" /></div>
        <h1>Vote submitted</h1>
        <p className="muted">Your vote has been recorded.</p>

        <div className="confirm-poll-chip">
          <div className="confirm-poll-chip-icon"><CheckCircle2 size={16} /></div>
          {loading ? (
            <div style={{ flex: 1 }}>
              <Skeleton style={{ height: 14, width: "60%", marginBottom: 6 }} />
              <Skeleton style={{ height: 12, width: "40%" }} />
            </div>
          ) : (
            <div>
              <strong>{poll?.title ?? "Your poll"}</strong>
              <span>{poll ? `REF: ${poll.reference}` : "Thanks for voting."}</span>
            </div>
          )}
          {poll && (
            <Link to="/results" state={{ pollId: poll.id }} className="btn btn-outline btn-sm">
              View Results
            </Link>
          )}
        </div>

        <Link to="/" className="confirm-back"><ArrowLeft size={14} /> Back to home</Link>
      </div>
    </div>
  );
}
