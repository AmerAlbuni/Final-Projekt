import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin-style/AdminAnalytics.css';

const AdminAnalytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  return (
    <div className="admin-analytics-wrapper">
      <div className="admin-analytics-container">
        <h1 className='analytics-h1'> Admin Analytics</h1>

        {loading ? (
          <p className="loading-msg">Loading analytics...</p>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : (
          <>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2> Total Users</h2>
                <p>{data.totalUsers}</p>
              </div>

              <div className="analytics-card">
                <h2> Total Projects</h2>
                <p>{data.totalProjects}</p>
              </div>

              <div className="analytics-card">
                <h2> Total Tasks</h2>
                <p>{data.totalTasks}</p>
              </div>

              <div className="analytics-card">
                <h2> Completed Tasks</h2>
                <p>{data.completedTasks}</p>
              </div>
            </div>

            {/* ✅ Task completion ratio */}
            {data.totalTasks > 0 && (
              <div className="analytics-completion">
                 <span>{Math.round((data.completedTasks / data.totalTasks) * 100)}%</span> Tasks Completed
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
