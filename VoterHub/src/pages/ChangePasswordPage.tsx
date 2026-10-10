import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserMenu from "../components/UserMenu";
import NotificationsBell from "../components/NotificationsBell";
import { useToast } from "../components/Toast";
import { meApi } from "../lib/api";
import { Eye, EyeOff, Lock } from "lucide-react";
import "./ChangePasswordPage.css";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) return setError("Enter your current password.");
    if (newPassword.length < 8) return setError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("New passwords don't match.");
    if (newPassword === currentPassword) return setError("New password must be different from the current one.");

    setSaving(true);
    try {
      await meApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully.");
      navigate("/settings", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change your password. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    setValue: (v: string) => void,
    show: boolean,
    setShow: (v: boolean) => void
  ) => (
    <div className="field">
      <label>{label}</label>
      <div className="password-wrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete={label === "Current password" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow(!show)}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );

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
          <p className="page-eyebrow">Security</p>
          <h1 className="page-title">Change password</h1>
          <p className="page-sub">You'll need your current password to set a new one.</p>
        </div>

        <div className="card change-password-card anim-fade-up-1">
          <h3 className="section-title"><Lock size={15} /> New password</h3>
          <form onSubmit={handleSubmit}>
            {field("Current password", currentPassword, setCurrentPassword, showCurrent, setShowCurrent)}
            {field("New password", newPassword, setNewPassword, showNew, setShowNew)}
            <div className="field">
              <label>Confirm new password</label>
              <input
                type={showNew ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="change-password-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate("/settings")}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="btn-spinner" />Saving...</> : "Save new password"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
