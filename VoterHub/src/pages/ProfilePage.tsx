import Sidebar from "../components/Sidebar";
import { Bell, ChevronRight } from "lucide-react";
import "./ProfilePage.css";

export default function ProfilePage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main profile-main">
        <div className="profile-content">
          <div className="dash-topbar">
            <h1 className="dash-greeting">Profile</h1>
            <Bell size={18} className="muted" />
          </div>

          <div className="card profile-identity">
            <div className="sidebar-avatar" style={{ width: 52, height: 52, fontSize: 16 }}>BQ</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Bryan Quartey</p>
              <p className="muted" style={{ fontSize: 13 }}>bryan@email.com</p>
              <span className="badge badge-active" style={{ marginTop: 4, display: "inline-block" }}>Organizer</span>
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="create-poll-section-title">Account Information</h3>
            <div className="field"><label>Full name</label><input defaultValue="Bryan Quartey" /></div>
            <div className="field"><label>Email address</label><input defaultValue="bryan@email.com" /></div>
            <div className="field"><label>Role</label><input defaultValue="Organizer" disabled /></div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h3 className="create-poll-section-title">Settings</h3>
            <ProfileLink label="Personal information" />
            <ProfileLink label="Notifications" />
            <ProfileLink label="Security" />
            <ProfileLink label="Log out" danger />
          </div>
        </div>

        <div
          className="profile-side-image"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?fm=jpg&q=70&w=700&auto=format&fit=crop')" }}
        >
          <p className="split-auth-image-quote">Better decisions with your community.</p>
        </div>
      </main>
    </div>
  );
}

function ProfileLink({ label, danger }: { label: string; danger?: boolean }) {
  return (
    <a href="#" className="profile-link" style={danger ? { color: "var(--danger)" } : undefined}>
      {label}
      <ChevronRight size={15} />
    </a>
  );
}
