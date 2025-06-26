import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TeamChat from '../../components/TeamChat'; // ✅ Import TeamChat
import '../../styles/lead-style/TeamLeadDashboard.css';

const TeamLeadDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="lead-dashboard-wrapper">
      <div className="lead-dashboard-container">
        <div className="lead-dashboard-header">
          <h1> Team Lead Dashboard</h1>
        </div>

        <div className="lead-nav-grid">
          <div className="lead-nav-card" onClick={() => navigate('/lead/projects')}>
            <h2> Projects</h2>
            <p>View your assigned projects.</p>
          </div>

          <div className="lead-nav-card" onClick={() => navigate('/lead/kanban')}>
            <h2> Task Board</h2>
            <p>Manage tasks in Kanban style.</p>
          </div>

          <div className="lead-nav-card" onClick={() => navigate('/lead/team')}>
            <h2> Team Members</h2>
            <p>Invite or view your team members.</p>
          </div>
        </div>

        {/* ✅ Team Chat Component */}
        <div style={{ marginTop: '2rem' }}>
          <TeamChat />
        </div>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
