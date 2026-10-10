import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MailWarning } from "lucide-react";
import { ShieldCheckSvg } from "../components/illustrations";
import { pollsApi, type Poll } from "../lib/api";
import { useAuth } from "../auth/AuthContext";
import "./JoinPollPage.css";

type Step = "lookup" | "email" | "blocked";

export default function JoinPollPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [reference, setReference] = useState(searchParams.get("ref") ?? "");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [poll, setPoll] = useState<Poll | null>(null);
  const [step, setStep] = useState<Step>("lookup");
  const [blockedMessage, setBlockedMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fail = (message: string) => {
    setError(message);
    setLoading(false);
  };

  /** Step 1: find the poll and validate the PIN. */
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const ref = reference.trim();
    if (!ref) return fail("Enter the poll reference.");

    setLoading(true);
    try {
      const { poll: found } = await pollsApi.byReference(ref);
      if (!found.open) return fail("This poll is not open for voting.");
      // Validate the PIN (if any) before going further.
      await pollsApi.eligibility(found.id, { pin: pin.trim() || undefined });

      if (found.requireLogin && !user) {
        setPoll(found);
        setBlockedMessage("This poll requires you to log in before voting.");
        setStep("blocked");
        setLoading(false);
        return;
      }

      setPoll(found);
      if (found.eligibleVotersCount > 0) {
        setStep("email");
      } else {
        navigate("/vote", { state: { pollId: found.id, pin: pin.trim() || undefined } });
      }
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not find that poll. Check the reference.");
    } finally {
      setLoading(false);
    }
  };

  /** Step 2 (invite-only polls): confirm the email is on the list. */
  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poll) return;
    setError(null);
    const cleanEmail = email.trim();
    if (!cleanEmail) return fail("Enter the email address you were invited with.");

    setLoading(true);
    try {
      const result = await pollsApi.eligibility(poll.id, {
        email: cleanEmail,
        pin: pin.trim() || undefined,
      });
      if (!result.eligible) {
        setBlockedMessage("This email is not on the invite list for this poll.");
        setStep("blocked");
        return;
      }
      if (result.hasVoted && poll.oneVotePerVoter) {
        setBlockedMessage("A vote has already been cast with this email.");
        setStep("blocked");
        return;
      }
      navigate("/vote", { state: { pollId: poll.id, email: cleanEmail, pin: pin.trim() || undefined } });
    } catch (err) {
      fail(err instanceof Error ? err.message : "Could not verify that email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-poll">
      <div className="join-poll-card">
        <div
          className="join-poll-hero"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?fm=jpg&q=70&w=700&auto=format&fit=crop')" }}
        >
          <div className="logo" style={{ color: "#fff" }}>
            <span className="logo-mark" style={{ background: "#fff", color: "var(--ink)" }}>✓</span>
            VoteHub
          </div>
          <div className="join-poll-hero-art">
            <ShieldCheckSvg width={44} height={44} title="Secure poll access" />
          </div>
          <h1>Join a Poll</h1>
        </div>

        <div className="join-poll-form">
          {step === "blocked" ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <MailWarning size={40} style={{ color: "var(--accent)", marginBottom: 16 }} />
              <h2 style={{ fontSize: 20, marginBottom: 8 }}>Can't let you in</h2>
              <p className="muted" style={{ marginBottom: 24 }}>{blockedMessage}</p>
              {blockedMessage.includes("log in") ? (
                <Link to="/login" state={{ from: "/join-poll" }} className="btn btn-primary btn-full">
                  Log in
                </Link>
              ) : (
                <button className="btn btn-outline btn-full" onClick={() => { setStep("lookup"); setPoll(null); }}>
                  Try a different poll
                </button>
              )}
            </div>
          ) : step === "email" && poll ? (
            <>
              <p className="muted" style={{ marginBottom: 6 }}>
                <strong style={{ color: "var(--ink)" }}>{poll.title}</strong> is invite-only.
              </p>
              <p className="muted" style={{ marginBottom: 20 }}>
                Enter the email address you were invited with.
              </p>
              <form onSubmit={handleEmailCheck}>
                <div className="field">
                  <label>Email address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                  {loading ? <><span className="btn-spinner" />Checking...</> : "Continue to vote"}
                </button>
              </form>
              <button className="join-poll-back" onClick={() => { setStep("lookup"); setPoll(null); }}>
                <ArrowLeft size={14} /> Back
              </button>
            </>
          ) : (
            <>
              <p className="muted" style={{ marginBottom: 20 }}>
                Enter the poll reference and PIN (if required) to access the voting page.
              </p>
              <form onSubmit={handleLookup}>
                <div className="field">
                  <label>Poll Reference *</label>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="e.g. VTH-2026-X7K2"
                  />
                </div>
                <div className="field">
                  <label>Voting PIN (if required)</label>
                  <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="e.g. 6-digit PIN" />
                </div>
                {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
                <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                  {loading ? <><span className="btn-spinner" />Finding poll...</> : "Join Poll"}
                </button>
              </form>
            </>
          )}

          <Link to="/" className="join-poll-back"><ArrowLeft size={14} /> Back to home</Link>
        </div>
      </div>
    </div>
  );
}
