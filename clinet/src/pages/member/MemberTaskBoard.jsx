// src/pages/member/MemberTaskBoard.jsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const MemberTaskBoard = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/assigned", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch assigned tasks:", err);
      setError("Failed to load your tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks();
  }, [token]);

  const statuses = ["To Do", "In Progress", "Done"];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📝 My Assigned Tasks</h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned to you yet.</p>
      ) : (
        statuses.map((status) => (
          <section key={status} style={{ marginBottom: "2rem" }}>
            <h2>{status}</h2>
            {tasks.filter((task) => task.status === status).length === 0 ? (
              <p>No tasks in this status.</p>
            ) : (
              tasks
                .filter((task) => task.status === status)
                .map((task) => (
                  <article
                    key={task._id}
                    style={{
                      backgroundColor: "transparent",
                      boxShadow: "0 0 20px #ff9900, 0 0 20px #ff5e00",
                      padding: "1rem",
                      marginBottom: "1rem",
                      borderRadius: "8px",
                      color: "white", // dark gray for text
                    }}
                  >
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <p>
                      <small>
                        Due:{" "}
                        {task.dueDate ? task.dueDate.substring(0, 10) : "N/A"}
                      </small>
                    </p>
                    <p>
                      <small>Project: {task.project?.title || "Unknown"}</small>
                    </p>
                  </article>
                ))
            )}
          </section>
        ))
      )}
    </div>
  );
};

export default MemberTaskBoard;
