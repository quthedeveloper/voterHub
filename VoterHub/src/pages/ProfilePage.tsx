import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import { Bell, ChevronRight, LogOut, KeyRound } from "lucide-react";
import "./ProfilePage.css";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // ProtectedRoute only renders this page for a signed-in user.
  if (!user) return null;

  const isOrganizer = user.role === "organizer";

  const handleLogout = async () => {
    await logout();
    toast.success("You've been logged out. See you soon!");
    navigate("/", { replace: true });
  };

  return (
    <div className="app-shell">
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
              </div>
            </div>
          </div>

          <div className="card profile-identity anim-fade-up-1">
            <div className="sidebar-avatar" style={{ width: 56, height: 56, fontSize: 17 }}>
              {initials(user.fullName)}
            </div>
            <div>
              <p className="profile-identity-name">{user.fullName}</p>
              <p className="profile-identity-email">{user.email}</p>
              <span className={`badge ${isOrganizer ? "badge-accent" : "badge-active"}`}>
                {isOrganizer ? "Organizer" : "Voter"}
              </span>
            </div>
          </div>

          <div className="card anim-fade-up-2" style={{ marginTop: 16 }}>
            <h3 className="section-title">Account Information</h3>
            <div className="profile-info-row">
              <span className="profile-info-label">Full name</span>
              <span className="profile-info-value">{user.fullName}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Email address</span>
              <span className="profile-info-value">{user.email}</span>
            </div>
            <div className="profile-info-row profile-info-row-last">
              <span className="profile-info-label">Role</span>
              <span className="profile-info-value">{isOrganizer ? "Organizer" : "Voter"}</span>
            </div>
          </div>

          <div className="card anim-fade-up-3" style={{ marginTop: 16 }}>
            <h3 className="section-title">Settings</h3>
            <Link to="/forgot-password" className="profile-link">
              <span className="profile-link-label"><KeyRound size={15} /> Change password</span>
              <ChevronRight size={15} />
            </Link>
            <button type="button" onClick={handleLogout} className="profile-link profile-link-danger">
              <span className="profile-link-label"><LogOut size={15} /> Log out</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div
          className="profile-side-art"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?fm=jpg&q=70&w=700&auto=format&fit=crop')" }}
          role="img"
          aria-label="Hand placing a ballot in a ballot box (photo by Element5 Digital on Unsplash)"
        >
          <p className="profile-side-quote">Better decisions with your community.</p>
        </div>
      </main>
    </div>
  );
}
