import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/lead-style/TeamLeadAnalytics.css';

const TeamLeadAnalytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/lead', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  return (
    <div className="analytics-wrapper">
      <div className="analytics-container">
        <h1> Team Lead Analytics</h1>

        {loading ? (
          <p>Loading analytics...</p>
        ) : error ? (
          <p className="analytics-error">{error}</p>
        ) : (
          <div className="analytics-grid">
            <div className="analytics-card">
              <h2 className="analytics-heading">📁 Projects</h2>
              <p className="analytics-number">{data.totalProjects}</p>
            </div>

            <div className="analytics-card">
              <h2 className="analytics-heading">✅ Completed Tasks</h2>
              <p className="analytics-number">{data.completedTasks}</p>
            </div>

            <div className="analytics-card">
              <h2 className="analytics-heading">🕒 Pending Tasks</h2>
              <p className="analytics-number">{data.pendingTasks}</p>
            </div>

            <div className="analytics-card">
              <h2 className="analytics-heading">⏰ Overdue Tasks</h2>
              <p className="analytics-number">{data.overdueTasks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadAnalytics;
