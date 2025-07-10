import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";

const MemberTaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
      } catch (err) {
        console.error("Failed to fetch task:", err);
        setError("Task not found.");
      }
    };
    fetchTask();
  }, [id]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!task) return <p>Loading task...</p>;

  return (
    <div style={{ padding: "2rem", color: "white" }}>
      <h1>{task.title}</h1>
      <p>{task.description}</p>
      <p>Status: {task.status}</p>
      <p>
        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
      </p>
      <p>
        Project: {task.project?.title || "Unknown"}
      </p>
    </div>
  );
};

export default MemberTaskDetail;
