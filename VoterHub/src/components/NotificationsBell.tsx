import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Vote } from "lucide-react";
import { notificationsApi, type Notification } from "../lib/api";
import "./NotificationsBell.css";

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function NotificationList({
  notifications,
  onSelect,
}: {
  notifications: Notification[];
  onSelect: (n: Notification) => void;
}) {
  if (notifications.length === 0) {
    return <p className="notifications-empty">No notifications yet.</p>;
  }
  return (
    <div className="notifications-list">
      {notifications.map((n) => (
        <button
          key={n.id}
          type="button"
          className={`notification-item${n.read ? "" : " unread"}`}
          onClick={() => onSelect(n)}
        >
          <span className="notification-icon"><Vote size={15} /></span>
          <span className="notification-text">
            <strong>{n.title}</strong>
            {n.body && <span>{n.body}</span>}
            <em>{timeAgo(n.createdAt)}</em>
          </span>
          {!n.read && <span className="notification-dot" />}
        </button>
      ))}
    </div>
  );
}

/** Bell button with unread badge + dropdown. Drop into any app topbar. */
export default function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const { notifications } = await notificationsApi.list();
      setNotifications(notifications);
    } catch {
      /* table may not exist yet — stay quiet */
    }
  };

  useEffect(() => {
    load();
    const t = window.setInterval(load, 60000);
    return () => window.clearInterval(t);
  }, []);

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

  const unread = notifications.filter((n) => !n.read).length;

  const handleSelect = async (n: Notification) => {
    setOpen(false);
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      notificationsApi.markRead(n.id).catch(() => {});
    }
    if (n.pollReference) navigate(`/join-poll?ref=${encodeURIComponent(n.pollReference)}`);
    else if (n.pollId) navigate("/join-poll");
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notificationsApi.markAllRead().catch(() => {});
  };

  return (
    <div className="notifications-bell" ref={ref}>
      <button
        type="button"
        className="dash-icon-btn notifications-trigger"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => {
          setOpen((o) => !o);
          load();
        }}
      >
        <Bell size={18} />
        {unread > 0 && <span className="notifications-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>

      {open && (
        <div className="notifications-dropdown">
          <div className="notifications-head">
            <strong>Notifications</strong>
            {unread > 0 && (
              <button type="button" className="notifications-mark-all" onClick={handleMarkAll}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <NotificationList notifications={notifications} onSelect={handleSelect} />
        </div>
      )}
    </div>
  );
}
