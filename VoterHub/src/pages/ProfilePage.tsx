import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import { Bell, ChevronRight } from "lucide-react";
import "./ProfilePage.css";

export default function ProfilePage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main profile-main">
        <div className="profile-content">
          <div className="page-head anim-fade-up">
            <div className="page-head-row">
              <div>
                <p className="page-eyebrow">Account</p>
                <h1 className="page-title">Profile</h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button className="dash-icon-btn" aria-label="Notifications"><Bell size={18} /></button>
                <UserMenu />
              </div>
            </div>
          </div>

          <div className="card profile-identity anim-fade-up-1">
            <div className="sidebar-avatar" style={{ width: 56, height: 56, fontSize: 17 }}>BQ</div>
            <div>
              <p className="profile-identity-name">Bryan Quartey</p>
              <p className="profile-identity-email">bryan@email.com</p>
              <span className="badge badge-accent">Organizer</span>
            </div>
          </div>

          <div className="card anim-fade-up-2" style={{ marginTop: 16 }}>
            <h3 className="section-title">Account Information</h3>
            <div className="field"><label>Full name</label><input defaultValue="Bryan Quartey" /></div>
            <div className="field"><label>Email address</label><input defaultValue="bryan@email.com" /></div>
            <div className="field" style={{ marginBottom: 0 }}><label>Role</label><input defaultValue="Organizer" disabled /></div>
          </div>

          <div className="card anim-fade-up-3" style={{ marginTop: 16 }}>
            <h3 className="section-title">Settings</h3>
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
    <a href="#" className={`profile-link${danger ? " profile-link-danger" : ""}`}>
      {label}
      <ChevronRight size={15} />
    </a>
  );
}
