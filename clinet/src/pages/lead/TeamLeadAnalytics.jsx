import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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

  const wrapperStyle = {
    minHeight: '100vh',
    padding: '3rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
    background: 'linear-gradient(135deg, #0f172a, #1e40af, #9333ea, #ec4899)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
  };

  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    borderRadius: '1.5rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '900px',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.25)',
    color: '#1e293b',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  };

  const headingStyle = {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
  };

  const numberStyle = {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#9333ea',
  };

  return (
    <div style={wrapperStyle}>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div style={containerStyle}>
        <h1>📊 Team Lead Analytics</h1>

        {loading ? (
          <p>Loading analytics...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <div style={gridStyle}>
            <div style={cardStyle}>
              <h2 style={headingStyle}>📁 Projects</h2>
              <p style={numberStyle}>{data.totalProjects}</p>
            </div>

            <div style={cardStyle}>
              <h2 style={headingStyle}>✅ Completed Tasks</h2>
              <p style={numberStyle}>{data.completedTasks}</p>
            </div>

            <div style={cardStyle}>
              <h2 style={headingStyle}>🕒 Pending Tasks</h2>
              <p style={numberStyle}>{data.pendingTasks}</p>
            </div>

            <div style={cardStyle}>
              <h2 style={headingStyle}>⏰ Overdue Tasks</h2>
              <p style={numberStyle}>{data.overdueTasks}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadAnalytics;
