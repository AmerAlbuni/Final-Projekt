import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

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

  const wrapperStyle = {
    minHeight: "100vh",
    padding: "5rem 1rem",
    backgroundColor: "transparent",
    animation: "gradientShift 15s ease infinite",
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    fontFamily: "'Inter', sans-serif",
  };

  const containerStyle = {
    background: "transparent",
   boxShadow: "0 0 10px #ff9900, 0 0 25px #ff5e00",
    backdropFilter: "blur(12px)",
    borderRadius: "1.5rem",
    padding: "2rem",
    width: "100%",
    maxWidth: "800px",
  };

  const membersGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
    gap: "1rem",
  };

  const memberCardStyle = {
    background: "transparent",
   boxShadow: "0 0 10px #ff9900, 0 0 25px #ff5e00",
    borderRadius: "1rem",
    padding: "1rem 1.5rem",
   
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

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        <h1 style={{ color: "#0f172a", marginBottom: "1rem" }}>
         My Team (Read-Only)
        </h1>

        {error && <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error}</p>}
        {loading ? (
          <p style={{ color: "#334155" }}>Loading members...</p>
        ) : members.length === 0 ? (
          <p style={{ color: "#334155" }}>No team members found.</p>
        ) : (
          <div style={membersGridStyle}>
            {members.map((member) => (
              <div key={member._id} style={memberCardStyle}>
                <div style={memberNameStyle}>{member.name}</div>
                <div style={memberEmailStyle}>{member.email}</div>
                <div style={memberRoleStyle}>Role: {member.role}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberTeamPage;
