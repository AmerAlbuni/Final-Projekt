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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await api.get('/teams/my-team', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(res.data.members || []);
        setTeamId(res.data._id);
      } catch (err) {
        console.error('❌ Failed to fetch team members:', err);
        setMembers([]);
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
      console.error("❌ Invite error:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Failed to invite user to team.");
    } finally {
      setInviting(false);
    }
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    try {
      await api.delete(`/teams/${teamId}/member/${memberToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await api.get('/teams/my-team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data.members || []);
      setMessage("🗑️ The user was successfully removed.");
    } catch (err) {
      console.error("❌ Failed to remove member:", err);
      setError("⚠️ Failed to remove the user.");
    } finally {
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const openDeleteModal = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
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
            value={{ value: role, label: role }}
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
        {message && (
          <p className={`team-message ${message.includes("removed") ? "delete" : ""}`}>
            {message}
          </p>
        )}

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
                  onClick={() => openDeleteModal(member)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {showDeleteModal && memberToDelete && (
          <div className="modal-backdrop-team">
            <div className="modal-team">
              <h3>Delete User</h3>
              <p>
                Do you want to remove <strong>{memberToDelete.name}</strong> from your team?
              </p>
              <div className="modal-actions-team">
                <button onClick={confirmDelete} className="delete-btn-team">Delete</button>
                <button className="cancel-btn-team" onClick={cancelDelete}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamLeadTeamMembers;
