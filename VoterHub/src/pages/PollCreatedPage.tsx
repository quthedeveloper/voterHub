import Sidebar from "../components/Sidebar";
import { Search, Bell, QrCode, Copy, CheckCircle2 } from "lucide-react";
import "./PollCreatedPage.css";

export default function PollCreatedPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search"><Search size={16} /><input placeholder="Search polls..." /></div>
          <div className="dash-topbar-icons"><Bell size={18} /></div>
        </div>

        <div className="card poll-created-card">
          <div className="poll-created-check"><CheckCircle2 size={22} /></div>
          <h1 className="dash-greeting">Poll Created!</h1>
          <p className="muted" style={{ marginBottom: 24 }}>
            Share the link or QR code below so voters can find your poll.
          </p>

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

          <button className="btn btn-primary" style={{ marginTop: 8 }}>Go to Poll Details</button>
        </div>
      </main>
    </div>
  );
}
