import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ListChecks, PlusCircle, BarChart3, Settings, CheckCircle2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import "./Sidebar.css";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-polls", label: "My Polls", icon: ListChecks },
  { to: "/create-poll", label: "Create Poll", icon: PlusCircle },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const name = user?.fullName ?? "Organizer";
  const roleLabel = user?.role === "organizer" ? "Organizer" : "Voter";

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar-logo" aria-label="VoteHub home">
        <span className="logo-mark"><CheckCircle2 size={16} /></span>
        <span>VoteHub</span>
      </Link>

      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to ? "active" : ""}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <Link to="/profile" className="sidebar-user">
        <div className="sidebar-avatar">{initials(name)}</div>
        <div>
          <p className="sidebar-user-name">{name}</p>
          <p className="sidebar-user-role">{roleLabel}</p>
        </div>
      </Link>
    </aside>
  );
}
