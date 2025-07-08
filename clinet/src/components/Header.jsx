import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import "../styles/Header.css"; // :weißes_häkchen: Import CSS

const Header = () => {
  const { i18n, t } = useTranslation();
  const { user, logout } = useAuth();
  const { notifications, markAsRead } = useNotification();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  if (!user) return null;

  return (
    <header className="header">
      <div className="nav-links">
        <div className="sidebar-header">TeamTasks</div>
      </div>
      <div className="header-actions">
        <div className="language">
          <Globe color="#FF9900" size={20} />
          <select
            className="language-select"
            value={i18n.language}
            onChange={(e) => {
              const lang = e.target.value;
              i18n.changeLanguage(lang);
              localStorage.setItem("lang", lang);
            }}
          >
            <option value="en"> English</option>
            <option value="de"> Deutsch</option>
            <option value="ar"> العربية</option>
          </select>
        </div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
        </div>
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
      </div>
    </header>
  );
};
export default Header;
