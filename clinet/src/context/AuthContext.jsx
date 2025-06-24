import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import socket from '../socket'; // ✅ import socket

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  // ✅ Auto-logout on token expiration
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp * 1000; // convert to ms
      const now = Date.now();

      if (exp < now) {
        logout(); // token already expired
      } else {
        const timeout = setTimeout(() => {
          logout();
        }, exp - now);

        return () => clearTimeout(timeout);
      }
    } catch (err) {
      console.error('Invalid token format', err);
      logout();
    }
  }, [token]);

  const login = (newToken, user) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(newToken);
    setUser(user);

    // ✅ Join user's private room for notifications
    socket.emit('joinUserRoom', user._id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
