import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import '../../styles/admin-style/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-container">
        {/* Header */}
        <div className="admin-dashboard-header">
          <h1 className="admin-dashboard-title">👑 Admin Dashboard</h1>
          <p className="admin-dashboard-subtitle">
            Welcome, <strong>{user?.name}</strong> ({user?.role})
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="admin-dashboard-cards">
          <div className="admin-card" onClick={() => navigate('/admin/users')}>
            <h2>👥 Manage Users</h2>
            <p>View, add, or delete team members.</p>
          </div>

          <div className="admin-card" onClick={() => navigate('/admin/projects')}>
            <h2>📁 Manage Projects</h2>
            <p>Create and manage team projects.</p>
          </div>

          <div className="admin-card" onClick={() => navigate('/admin/teams')}>
            <h2>🧑‍🤝‍🧑 Manage Teams</h2>
            <p>Assign members to teams.</p>
          </div>

          <div className="admin-card analys" onClick={() => navigate('/admin/analytics')}>
            <h2>📊 Analytics</h2>
            <p>View progress and productivity.</p>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default AdminDashboard;
