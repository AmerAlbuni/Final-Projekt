import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import TeamChat from "../../components/TeamChat"; // ✅ Import TeamChat
import "../../styles/member-style/MemberDashboard.css";

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="member-dashboard-wrapper">
      <div className="member-dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Member Dashboard</h1>
        </header>
        <div className="dashboard-nav">
          <div
            className="dashboard-card"
            onClick={() => navigate("/member/tasks")}
          >
            <h2>🗂️ My Tasks</h2>
            <p>View and comment on your assigned tasks.</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/member/team")}
          >
            <h2>👥 My Team</h2>
            <p>See your teammates (read-only).</p>
          </div>
        </div>

        {/* ✅ Team Chat Section */}
        <div style={{ marginTop: "2rem" }}>
          <TeamChat />
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
