import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext"; // ✅ Import AuthContext

const CreateTaskModal = ({ projectId, onClose, onTaskCreated }) => {
  const { token } = useAuth(); // ✅ Get token from context

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get("/teams/my-team", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token to fetch members
          },
        });
        setUsers(res.data.members);
      } catch (err) {
        console.error("Failed to fetch team members", err);
      }
    };
    fetchTeam();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      console.error("No project ID found. Cannot create task.");
      return;
    }

    const taskData = {
      ...form,
      project: projectId,
    };

    console.log("🧪 Submitting task:", taskData); // ✅ Debug log for request payload

    try {
      await api.post("/tasks", taskData, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Send token with POST
        },
      });
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error("❌ Create task failed:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Create Task</h2>

        <input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
        />

        <select
          value={form.assignee}
          onChange={(e) => setForm({ ...form, assignee: e.target.value })}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>

        <div>
          <button type="button" onClick={onClose}>
            Cancel
          </button>

          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskModal;
