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

  return (
    <div style={wrapperStyle}>
      <div style={containerStyle}>
        <h1 style={{ color: "#0f172a", marginBottom: "1rem" }}>
          👥 My Team (Read-Only)
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

export default MemberTeamPage;
