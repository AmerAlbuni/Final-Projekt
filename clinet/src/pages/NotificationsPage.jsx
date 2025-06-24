import { useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import '../styles/NotificationsPage.css';

const NotificationsPage = () => {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-wrapper">
      <div className="notifications-container">
        <h1>🔔 Notifications</h1>

        {notifications.length === 0 ? (
          <p className="no-notifications">You have no notifications.</p>
        ) : (
          <>
            <button className="mark-all-btn" onClick={markAllAsRead}>
              Mark All as Read
            </button>

            <div className="notifications-list">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif._id);
                    if (notif.link) navigate(notif.link);
                  }}
                >
                  <p>{notif.message}</p>
                  <small>{new Date(notif.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
