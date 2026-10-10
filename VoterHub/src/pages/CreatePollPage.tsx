import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import NotificationsBell from "../components/NotificationsBell";
import { Plus, Search } from "lucide-react";
import { pollsApi } from "../lib/api";
import "./CreatePollPage.css";

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [toggles, setToggles] = useState({
    oneVote: true,
    requireLogin: true,
    showResults: true,
    setPin: false,
    restrictInvited: false,
  });
  const [pin, setPin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const updateOption = (i: number, value: string) => {
    const next = [...options];
    next[i] = value;
    setOptions(next);
  };

  const toggle = (key: keyof typeof toggles) => setToggles({ ...toggles, [key]: !toggles[key] });

  const handleCreate = async () => {
    setError(null);
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!title.trim()) return setError("Give your poll a title.");
    if (!question.trim()) return setError("Add the question voters will answer.");
    if (cleanOptions.length < 2) return setError("Add at least two options.");

    const emails = inviteEmails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);

    setCreating(true);
    try {
      const { poll } = await pollsApi.create({
        title: title.trim(),
        description: description.trim(),
        question: question.trim(),
        options: cleanOptions.map((name) => ({ name })),
        settings: {
          oneVotePerVoter: toggles.oneVote,
          requireLogin: toggles.requireLogin,
          showResults: toggles.showResults,
          votingPin: toggles.setPin ? pin.trim() : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        eligibleEmails: toggles.restrictInvited ? emails : [],
      });
      navigate("/poll-created", { state: { reference: poll.reference, pollId: poll.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the poll. Try again.");
    } finally {
      setCreating(false);
    }
  };

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

        <div className="page-head anim-fade-up">
          <div className="page-head-row">
            <div>
              <p className="page-eyebrow">New poll</p>
              <h1 className="page-title">Create a Poll</h1>
              <p className="page-sub">Set up your poll.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="card anim-fade-up" style={{ borderColor: "var(--danger)", marginBottom: 16 }}>
            <p style={{ color: "var(--danger)", fontSize: 14, fontWeight: 500 }}>{error}</p>
          </div>
        )}

        <div className="create-poll-grid">
          <div className="card anim-fade-up-1">
            <h3 className="section-title">Poll Details</h3>
            <div className="field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Student Council Election" />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a brief description (optional)" />
            </div>
            <div className="field">
              <label>Question *</label>
              <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Who should be the next president?" />
            </div>
            <div className="field">
              <label>Options / Candidates *</label>
              {options.map((opt, i) => (
                <input
                  key={i}
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  style={{ marginBottom: 8 }}
                />
              ))}
              <button type="button" className="create-poll-add-option" onClick={() => setOptions([...options, ""])}>
                <Plus size={14} /> Add option
              </button>
            </div>
          </div>

          <div className="card anim-fade-up-2">
            <h3 className="section-title">Voting Settings</h3>
            <ToggleRow label="Allow only one vote per voter" checked={toggles.oneVote} onChange={() => toggle("oneVote")} />
            <ToggleRow label="Require login to vote" checked={toggles.requireLogin} onChange={() => toggle("requireLogin")} />
            <ToggleRow label="Show results after voting" checked={toggles.showResults} onChange={() => toggle("showResults")} />
            <ToggleRow label="Set a voting PIN (optional)" checked={toggles.setPin} onChange={() => toggle("setPin")} />
            {toggles.setPin && (
              <div className="field">
                <input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="e.g. 6-digit PIN" maxLength={20} />
              </div>
            )}
            <ToggleRow label="Restrict to invited voters" checked={toggles.restrictInvited} onChange={() => toggle("restrictInvited")} />
            {toggles.restrictInvited && (
              <div className="field">
                <label>Invite list</label>
                <textarea
                  rows={5}
                  value={inviteEmails}
                  onChange={(e) => setInviteEmails(e.target.value)}
                  placeholder={"One email per line, e.g.\nama@example.com\nkwame@example.com"}
                />
                <p className="field-hint">Only these emails will be able to vote. You can add more later.</p>
              </div>
            )}

            <h3 className="section-title" style={{ marginTop: 20 }}>Schedule</h3>
            <div className="create-poll-schedule">
              <div className="field">
                <label>Start date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="field">
                <label>End date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="create-poll-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
            {creating ? "Creating..." : "Create Poll"}
          </button>
        </div>
      </main>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button type="button" className={`toggle ${checked ? "on" : ""}`} onClick={onChange} aria-pressed={checked} />
    </div>
  );
}
