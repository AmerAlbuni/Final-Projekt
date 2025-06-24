import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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
        setMembers(res.data.members);
        setTeamId(res.data._id); // ✅ Save the team ID here
      } catch (err) {
        console.error('Failed to fetch team members:', err);
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
      setMembers(updated.data.members);
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
      setMembers(res.data.members);
    } catch (err) {
      console.error("Failed to remove member:", err);
      setError("Could not remove team member.");
    }
  };

  const wrapperStyle = {
    minHeight: "100vh",
    padding: "3rem 1rem",
    background: "linear-gradient(135deg, #0f172a, #334155, #1e40af, #0ea5e9)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
  };

  const containerStyle = {
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(12px)",
    borderRadius: "1.5rem",
    padding: "2rem",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.25)",
  };

  const formStyle = {
    marginBottom: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const inputStyle = {
    padding: "0.8rem 1rem",
    borderRadius: "0.5rem",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
  };

  const buttonStyle = {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "0.75rem 1.25rem",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const buttonHoverStyle = {
    backgroundColor: "#1d4ed8",
  };

  const messageStyle = {
    color: "#16a34a",
    fontWeight: "bold",
  };

  const errorStyle = {
    color: "#dc2626",
    fontWeight: "bold",
  };

  const membersGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
    gap: "1rem",
  };

  const memberCardStyle = {
    background: "white",
    borderRadius: "1rem",
    padding: "1rem 1.5rem",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
  };

  const memberNameStyle = {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "0.25rem",
  };

  const memberEmailStyle = {
    color: "#475569",
    marginBottom: "0.5rem",
  };

  const memberRoleStyle = {
    fontWeight: "500",
    color: "#2563eb",
  };

  const removeButtonStyle = {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    fontSize: "0.9rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  };

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        <h1 style={{ color: "#0f172a", marginBottom: "1rem" }}>👥 Team Members</h1>

        <form onSubmit={handleInvite} style={formStyle}>
          <input
            style={inputStyle}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email to invite"
            required
          />

          <select
            style={inputStyle}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Member">Member</option>
            <option value="TeamLead">Team Lead</option>
          </select>

          <button
            type="submit"
            style={buttonStyle}
            disabled={inviting}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = buttonHoverStyle.backgroundColor)
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = buttonStyle.backgroundColor)
            }
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </form>

        {error && <p style={errorStyle}>{error}</p>}
        {message && <p style={messageStyle}>{message}</p>}

        {loading ? (
          <p style={{ color: "#334155" }}>Loading members...</p>
        ) : members.length === 0 ? (
          <p style={{ color: "#334155" }}>No members in your team yet.</p>
        ) : (
          <div style={membersGridStyle}>
            {members.map((member) => (
              <div key={member._id} style={memberCardStyle}>
                <div style={memberNameStyle}>{member.name}</div>
                <div style={memberEmailStyle}>{member.email}</div>
                <div style={memberRoleStyle}>Role: {member.role}</div>
                <button
                  style={removeButtonStyle}
                  onClick={() => handleRemove(member._id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes gradientShift {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
      `}</style>
    </div>
  );
};

export default TeamLeadTeamMembers;
