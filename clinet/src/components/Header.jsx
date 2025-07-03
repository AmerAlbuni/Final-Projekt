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



  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <header className="header">
      <div className="nav-links">
        <div className="sidebar-header">TeamTasks</div>
     
      </div>

      <div className="header-actions">
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

        {/* <button onClick={() => { logout(); navigate("/"); }}>
          Logout
        </button> */}
      </div>
    </header>
  );
};

export default Header;
