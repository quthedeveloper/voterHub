import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import NotificationsBell from "../components/NotificationsBell";
import { Search, Copy, Check, CheckCircle2, ArrowRight } from "lucide-react";
import QRCode from "react-qr-code";
import { ShareLinkSvg } from "../components/illustrations";
import { useToast } from "../components/Toast";
import "./PollCreatedPage.css";

export default function PollCreatedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  const state = (location.state ?? {}) as { reference?: string; pollId?: string };
  const reference = state.reference ?? "";
  const pollId = state.pollId ?? "";

  if (!reference) {
    return (
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <div className="card anim-fade-up" style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
            <h1 className="page-title">No poll here yet</h1>
            <p className="page-sub" style={{ marginBottom: 24 }}>Create a poll first, then share it with your voters.</p>
            <Link to="/create-poll" className="btn btn-primary">Create a poll</Link>
          </div>
        </main>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/join-poll?ref=${encodeURIComponent(reference)}`;

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(label);
    toast.success(`${label} copied.`);
    window.setTimeout(() => setCopied(null), 1600);
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

        <div className="card poll-created-card anim-fade-up">
          <div className="poll-created-check"><CheckCircle2 size={22} /></div>
          <p className="page-eyebrow">Success</p>
          <h1 className="page-title" style={{ marginBottom: 8 }}>Poll created</h1>
          <p className="page-sub" style={{ marginBottom: 24 }}>
            Share the reference or link below so voters can find your poll.
          </p>

          <div className="poll-created-share-art">
            <ShareLinkSvg width={40} height={40} title="Share your poll" />
            <span>Voters join with the reference or the link. Invited voters get in with their email.</span>
          </div>

          <div className="poll-created-grid">
            <div>
              <div className="field">
                <label>Poll reference</label>
                <div className="poll-created-ref">
                  <span>{reference}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => copy(reference, "Reference")}>
                    {copied === "Reference" ? <Check size={13} /> : <Copy size={13} />} Copy
                  </button>
                </div>
              </div>
              <div className="field">
                <label>Share link</label>
                <div className="poll-created-ref">
                  <span>{shareLink}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => copy(shareLink, "Link")}>
                    {copied === "Link" ? <Check size={13} /> : <Copy size={13} />} Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="poll-created-qr">
              <QRCode value={shareLink} size={120} />
              <span className="muted" style={{ fontSize: 12 }}>Scan to join</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: 8 }}
            onClick={() => navigate("/poll-details", { state: { pollId } })}
          >
            Go to Poll Details <ArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}
