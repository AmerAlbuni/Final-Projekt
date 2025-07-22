import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin-style/AdminAnalytics.css";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF4444", "#8884d8"];

const AdminAnalytics = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/analytics/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAnalytics();
  }, [token]);

  return (
    <div className="admin-analytics-wrapper">
      <div className="admin-analytics-container">
        <h1 className="analytics-h1">📊 Admin Analytics</h1>

        {loading ? (
          <p className="loading-msg">Loading analytics...</p>
        ) : error ? (
          <p className="error-msg">{error}</p>
        ) : (
          <>
            {/* 🔹 Summary Cards */}
            <div className="analytics-grid">
              <div className="analytics-card">
                <h2>🧑‍🤝‍🧑 Teams</h2>
                <p>{data.teams.length}</p>
              </div>
              <div className="analytics-card">
                <h2>📁 Projects</h2>
                <p>{data.projectTitles.length}</p>
              </div>
              <div className="analytics-card">
                <h2>✅ Tasks</h2>
                <p>{data.tasks.length}</p>
              </div>
              <div className="analytics-card">
                <h2>👥 Users</h2>
                <p>{data.userRoles.reduce((sum, r) => sum + r.count, 0)}</p>
              </div>
            </div>

            {/* 🔸 Bottom Grid: 2 Rows of 2 */}
            <div className="analytics-subgrid">
              {/* Users per Role */}
              <div className="analytics-subcard">
                <h2>👤 Users per Role</h2>
                <ul className="team-list">
                  {data.userRoles.map((role) => (
                    <li key={role._id}>
                      {role._id}: <strong>{role.count}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Task Status Donut Chart */}
              <div className="analytics-subcard">
                <h2>📊 Task Status</h2>
                <div className="donut-chart-wrapper">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={data.taskStatuses}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                      >
                        {data.taskStatuses.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="legend-wrapper">
                    {data.taskStatuses.map((entry, index) => (
                      <div className="legend-item" key={entry._id}>
                        <span
                          className="legend-color"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="legend-label">{entry._id}</span>
                        <span className="legend-count">{entry.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

           

              {/* 📈 Project Progress */}
              <div className="analytics-subcard">
                <h2>📈 Project Progress</h2>
                {data.progressPerProject.length === 0 ? (
                  <p>No projects found</p>
                ) : (
                  <ul className="team-list">
                    {data.progressPerProject.map((proj) => (
                      <li
                        key={proj.projectId}
                        className="project-progress-item"
                      >
                        <div className="progress-project-title">
                          {proj.title}
                        </div>
                        <div className="progress-project-stats">
                          ✅ Done: {proj.done}
                          <br />
                          <br />
                         ⏳Remaining: {proj.remaining}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
