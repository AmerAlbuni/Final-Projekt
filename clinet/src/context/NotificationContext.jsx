import { createContext, useContext, useState, useEffect } from 'react';
import socket from '../socket';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // ✅ Fetch user's notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      if (token) {
        const res = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      }
    };

    fetchNotifications();
  }, [token]);

  // ✅ Listen for real-time notifications
  useEffect(() => {
    if (user?._id) {
      socket.emit('joinUserRoom', user._id);

      socket.on('newNotification', (data) => {
        setNotifications((prev) => [
          { ...data, read: false }, // add notification to state
          ...prev,
        ]);
      });

      return () => {
        socket.off('newNotification');
      };
    }
  }, [user]);

  const markAsRead = async (id) => {
    await api.patch(`/notifications/${id}/read`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
//                          ✅ match the import
