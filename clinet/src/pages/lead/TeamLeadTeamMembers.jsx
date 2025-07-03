import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import '../../styles/lead-style/TeamLeadTeamMembers.css';
import Select from 'react-select';

const TeamLeadTeamMembers = () => {
  const { token } = useAuth();

  const [teamId, setTeamId] = useState(null);
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await api.get('/teams/my-team', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data.members || []);
        setTeamId(res.data._id);
      } catch (err) {
        console.error('Failed to fetch team members:', err);
        setMembers([]); // fallback if no team
        setError("You are not assigned to a team.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [token]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviting(true);
    setError("");
    setMessage("");

    try {
      const res = await api.post("/teams/invite", { email, role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message);
      setEmail("");
      setRole("Member");

      const updated = await api.get("/teams/my-team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(updated.data.members || []);
    } catch (err) {
      console.error("Invite error:", err);
      setError(err?.response?.data?.message || "Failed to invite user to team.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId) => {
    try {
      await api.delete(`/teams/${teamId}/member/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await api.get('/teams/my-team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data.members || []);
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError("Could not remove team member.");
    }
  };

  return (
    <div className="team-wrapper">
      <div className="team-container">
        <h1 className="team-title">Team Members</h1>

        <form onSubmit={handleInvite} className="team-form">
          <input
            className="team-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email to invite"
            required
          />

          <Select
            className="react-select"
            classNamePrefix="react-select"
            value={role}
            onChange={(e) => setRole(e.value)}
            options={[
              { value: "Member", label: "Member" },
              { value: "TeamLead", label: "Team Lead" },
            ]}
          />

          <button
            type="submit"
            className="team-button"
            disabled={inviting}
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </form>

        {error && <p className="team-error">{error}</p>}
        {message && <p className="team-message">{message}</p>}

        {loading ? (
          <p className="team-loading">Loading members...</p>
        ) : !Array.isArray(members) || members.length === 0 ? (
          <p className="team-loading">No members in your team yet.</p>
        ) : (
          <div className="members-grid">
            {members.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-name">{member.name}</div>
                <div className="member-email">{member.email}</div>
                <div className="member-role">Role: {member.role}</div>
                <button
                  className="remove-button"
                  onClick={() => handleRemove(member._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadTeamMembers;
