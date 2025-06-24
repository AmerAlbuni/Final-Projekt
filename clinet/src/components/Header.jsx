import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useEffect, useState } from "react";
import "../styles/Header.css"; // ✅ Import CSS

const Header = () => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead } = useNotification();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const links = {
    Admin: [
      { to: "/admin", label: "Dashboard" },
      { to: "/admin/users", label: "Users" },
      { to: "/admin/projects", label: "Projects" },
      { to: "/admin/teams", label: "Teams" },
      { to: "/admin/analytics", label: "Analytics" },
    ],
    TeamLead: [
      { to: "/lead", label: "Dashboard" },
      { to: "/lead/kanban", label: "Kanban" },
      { to: "/lead/projects", label: "Projects" },
      { to: "/lead/team", label: "Team" },
      { to: "/lead/analytics", label: "Analytics" },
    ],
    Member: [
      { to: "/member", label: "Dashboard" },
      { to: "/member/tasks", label: "My Tasks" },
    ],
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <header className="header">
      <div className="nav-links">
        {links[user.role]?.map((link) => (
          <Link key={link.to} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>

      <div className="header-actions">
        <button
          className="notification-button"
          onClick={() => setShowDropdown((prev) => !prev)}
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {showDropdown && (
          <div className="notification-dropdown">
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${
                    notif.read ? "read" : "unread"
                  }`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif._id);
                    if (notif.link) navigate(notif.link);
                    setShowDropdown(false);
                  }}
                >
                  {notif.message}
                </div>
              ))
            )}
          </div>
        )}

        <button onClick={() => { logout(); navigate("/"); }}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
