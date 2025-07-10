import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useEffect, useState } from "react";
import api from "../services/api"; // ✅ needed to call DELETE
import "../styles/Header.css"; // ✅ Import CSS

const Header = () => {
  const { user, logout } = useAuth();
  const { notifications, markAsRead } = useNotification();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [localNotifications, setLocalNotifications] = useState([]);

  const unreadCount = localNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const deleteNotification = async (id, e) => {
    e.stopPropagation(); // prevent triggering the navigate()
    try {
      await api.delete(`/notifications/${id}`);
      setLocalNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

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
            {localNotifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              <>
                {console.log("📨 Notifications:", localNotifications)}
                {localNotifications.map((notif) => (
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
                    <button
                      className="notification-delete"
                      onClick={(e) => deleteNotification(notif._id, e)}
                      title="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
