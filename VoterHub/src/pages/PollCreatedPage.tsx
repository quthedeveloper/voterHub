import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import { Search, Bell, QrCode, Copy, CheckCircle2, ArrowRight } from "lucide-react";
import { ShareLinkSvg } from "../components/illustrations";
import "./PollCreatedPage.css";

export default function PollCreatedPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search"><Search size={16} /><input placeholder="Search polls..." /></div>
          <div className="dash-topbar-icons">
            <button className="dash-icon-btn" aria-label="Notifications"><Bell size={18} /></button>
            <UserMenu />
          </div>
        </div>

        <div className="card poll-created-card anim-fade-up">
          <div className="poll-created-check"><CheckCircle2 size={22} /></div>
          <p className="page-eyebrow">Success</p>
          <h1 className="page-title" style={{ marginBottom: 8 }}>Poll created</h1>
          <p className="page-sub" style={{ marginBottom: 24 }}>
            Share the link or QR code below so voters can find your poll.
          </p>

          <div className="poll-created-share-art">
            <ShareLinkSvg width={40} height={40} title="Share your poll" />
            <span>Voters can join with the reference, the link, or a quick scan.</span>
          </div>

          <div className="poll-created-grid">
            <div>
              <div className="field">
                <label>Poll reference</label>
                <div className="poll-created-ref">
                  <span>UNI-2026-7K42</span>
                  <button className="btn btn-outline btn-sm"><Copy size={13} /> Copy</button>
                </div>
              </div>
              <div className="field">
                <label>Share link</label>
                <div className="poll-created-ref">
                  <span>votehub.app/p/UNI-2026-7K42</span>
                  <button className="btn btn-outline btn-sm"><Copy size={13} /> Copy</button>
                </div>
              </div>
            </div>
            <div className="poll-created-qr">
              <QrCode size={90} />
              <span className="muted" style={{ fontSize: 12 }}>Download QR Code</span>
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 8 }}>Go to Poll Details <ArrowRight size={15} /></button>
        </div>
      </main>
    </div>
  );
}
