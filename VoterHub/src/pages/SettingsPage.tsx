import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import NotificationsBell from "../components/NotificationsBell";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import { ChevronRight, KeyRound, LogOut, User } from "lucide-react";
import "./SettingsPage.css";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // ProtectedRoute only renders this page for a signed-in user.
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    toast.success("You've been logged out. See you soon!");
    navigate("/", { replace: true });
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        <div className="dash-topbar">
          <div className="dash-search">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Settings</span>
          </div>
          <div className="dash-topbar-icons">
            <NotificationsBell />
            <UserMenu />
          </div>
        </div>

        <div className="page-head anim-fade-up">
          <p className="page-eyebrow">Preferences</p>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your account and security.</p>
        </div>

        <div className="settings-content">
          <div className="card anim-fade-up-1">
            <h3 className="section-title"><User size={15} /> Account</h3>
            <div className="settings-identity">
              <div className="settings-avatar">{initials(user.fullName)}</div>
              <div>
                <p className="settings-name">{user.fullName}</p>
                <p className="settings-email">{user.email}</p>
              </div>
              <span className={`badge ${user.role === "organizer" ? "badge-active" : "badge-closed"}`}>
                {user.role === "organizer" ? "Organizer" : "Voter"}
              </span>
            </div>
            <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              Account details are managed through your sign-in provider. Contact support if anything looks wrong.
            </p>
          </div>

          <div className="card anim-fade-up-2">
            <h3 className="section-title"><KeyRound size={15} /> Security</h3>
            <Link to="/change-password" className="settings-row">
              <span className="settings-row-label"><KeyRound size={15} /> Change password</span>
              <ChevronRight size={15} />
            </Link>
            <button type="button" onClick={handleLogout} className="settings-row settings-row-danger">
              <span className="settings-row-label"><LogOut size={15} /> Log out</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
