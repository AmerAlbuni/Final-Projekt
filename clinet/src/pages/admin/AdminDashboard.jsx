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
         
         
        </div>

        {/* Navigation Cards */}
      <div className="admin-dashboard-cards">
  <div className="card-border-wrapper" onClick={() => navigate('/admin/users')}>
    <div className="admin-card">
      <h2> Manage Users</h2>
      <p>View, add, or delete team members.</p>
    </div>
  </div>

  <div className="card-border-wrapper" onClick={() => navigate('/admin/projects')}>
    <div className="admin-card">
      <h2> Manage Projects</h2>
      <p>Create and manage team projects.</p>
    </div>
  </div>

  <div className="card-border-wrapper" onClick={() => navigate('/admin/teams')}>
    <div className="admin-card">
      <h2> Manage Teams</h2>
      <p>Assign members to teams.</p>
    </div>
  </div>

  <div className="card-border-wrapper" onClick={() => navigate('/admin/analytics')}>
    <div className="admin-card ">
      <h2> Analytics</h2>
      <p>View progress and productivity.</p>
    </div>
  </div>
</div>


        
      </div>
    </div>
  );
};

export default AdminDashboard;
