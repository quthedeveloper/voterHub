import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Plus, Search, Bell } from "lucide-react";
import "./CreatePollPage.css";

export default function CreatePollPage() {
  const navigate = useNavigate();
  const [options, setOptions] = useState(["", "", ""]);
  const [toggles, setToggles] = useState({ oneVote: true, requireLogin: true, showResults: true, setPin: false });

  const updateOption = (i: number, value: string) => {
    const next = [...options];
    next[i] = value;
    setOptions(next);
  };

  const toggle = (key: keyof typeof toggles) => setToggles({ ...toggles, [key]: !toggles[key] });

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search"><Search size={16} /><input placeholder="Search polls..." /></div>
          <div className="dash-topbar-icons"><Bell size={18} /></div>
        </div>

        <div className="page-head anim-fade-up">
          <div className="page-head-row">
            <div>
              <p className="page-eyebrow">New poll</p>
              <h1 className="page-title">Create a Poll</h1>
              <p className="page-sub">Set up your poll details and preferences.</p>
            </div>
          </div>
        </div>

        <div className="create-poll-grid">
          <div className="card anim-fade-up-1">
            <h3 className="section-title">Poll Details</h3>
            <div className="field">
              <label>Title *</label>
              <input placeholder="e.g. Student Council Election" />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea rows={2} placeholder="Add a brief description (optional)" />
            </div>
            <div className="field">
              <label>Question *</label>
              <input placeholder="e.g. Who should be the next president?" />
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
              <button className="create-poll-add-option" onClick={() => setOptions([...options, ""])}>
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
                <input placeholder="e.g. 6-digit PIN" />
              </div>
            )}

            <h3 className="section-title" style={{ marginTop: 20 }}>Schedule</h3>
            <div className="create-poll-schedule">
              <div className="field">
                <label>Start date</label>
                <input type="date" />
              </div>
              <div className="field">
                <label>End date</label>
                <input type="date" />
              </div>
            </div>
          </div>
        </div>

        <div className="create-poll-actions">
          <button className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn btn-primary" onClick={() => navigate("/poll-created")}>Create Poll</button>
        </div>
      </main>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button className={`toggle ${checked ? "on" : ""}`} onClick={onChange} />
    </div>
  );
}
