import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/member-style/MemberTeamPage.css";

const MemberTeamPage = () => {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get("/teams/my-team", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data.members);
      } catch (err) {
        console.error("Failed to fetch team members:", err);
        setError("Could not load team members.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [token]);

  return (
    <div className="team-wrapper">
      <div className="team-container">
        <h1 className="team-heading">My Team (Read-Only)</h1>

        {error && <p className="team-error">{error}</p>}
        {loading ? (
          <p className="team-loading">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="team-empty">No team members found.</p>
        ) : (
          <div className="members-grid">
            {members.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-name">{member.name}</div>
                <div className="member-email">{member.email}</div>
                <div className="member-role">Role: {member.role}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTeamPage;
