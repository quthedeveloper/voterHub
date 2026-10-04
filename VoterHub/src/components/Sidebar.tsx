import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ListChecks, PlusCircle, BarChart3, Settings, CheckCircle2 } from "lucide-react";
import "./Sidebar.css";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-polls", label: "My Polls", icon: ListChecks },
  { to: "/create-poll", label: "Create Poll", icon: PlusCircle },
  { to: "/results", label: "Results", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark"><CheckCircle2 size={16} /></span>
        <span>VoteHub</span>
      </div>

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
        <div className="sidebar-avatar">BQ</div>
        <div>
          <p className="sidebar-user-name">Bryan Quartey</p>
          <p className="sidebar-user-role">Organizer</p>
        </div>
      </Link>
    </aside>
  );
}
