import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./Toast";
import "./UserMenu.css";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Avatar button with a dropdown: profile info, link to profile, log out.
 * Drop into any app topbar.
 */
export default function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    setLeaving(true);
    try {
      await logout();
      toast.success("You've been logged out. See you soon!");
      navigate("/", { replace: true });
    } finally {
      setLeaving(false);
    }
  };

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className={`user-menu-trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="sidebar-avatar" style={{ width: 36, height: 36 }}>
          {initials(user.fullName)}
        </span>
        <ChevronDown size={14} className="user-menu-chevron" />
      </button>

      {open && (
        <div className="user-menu-dropdown" role="menu">
          <div className="user-menu-head">
            <span className="sidebar-avatar" style={{ width: 40, height: 40 }}>
              {initials(user.fullName)}
            </span>
            <div className="user-menu-identity">
              <strong>{user.fullName}</strong>
              <span>{user.email}</span>
              <span className={`badge ${user.role === "organizer" ? "badge-accent" : "badge-active"}`}>
                {user.role === "organizer" ? "Organizer" : "Voter"}
              </span>
            </div>
          </div>
          <div className="user-menu-divider" />
          <Link
            to="/profile"
            className="user-menu-item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <UserIcon size={16} /> Profile
          </Link>
          <button
            type="button"
            className="user-menu-item user-menu-logout"
            role="menuitem"
            onClick={handleLogout}
            disabled={leaving}
          >
            <LogOut size={16} /> {leaving ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}
