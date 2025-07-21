import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { de } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import '../styles/CreateTaskModal.css';

const CreateTaskModal = ({ projectId, onClose, onTaskCreated }) => {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: null,
  });

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await api.get("/teams/my-team", {
          headers: { Authorization: `Bearer ${token}` },
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
    if (!projectId) return console.error("No project ID found");

    try {
      const res = await api.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("🧪 Selected Project:", res.data);
    } catch (err) {
      console.error("❌ Failed to fetch project:", err.response?.data || err.message);
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      console.log("🧪 User team from token:", decodedToken.team);
    } catch (err) {
      console.error("❌ Failed to decode token:", err.message);
    }

    const taskData = {
      ...form,
      assignee: form.assignee?.value || "",
      dueDate: form.dueDate?.toISOString().split("T")[0],
      project: projectId,
    };

    try {
      await api.post("/tasks", taskData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onTaskCreated();
      onClose();
    } catch (err) {
      console.error("❌ Create task failed:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      <form className="create-task-form" onSubmit={handleSubmit}>
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

        <DatePicker
          selected={form.dueDate}
          onChange={(date) => setForm({ ...form, dueDate: date })}
          dateFormat="dd.MM.yyyy"
          locale={de}
          placeholderText="Set due date"
          className="custom-datepicker"
        />

        <Select
          className="react-select"
          classNamePrefix="react-select"
          value={form.assignee}
          onChange={(e) => setForm({ ...form, assignee: e })}
          options={users.map((user) => ({
            value: user._id,
            label: user.name,
          }))}
        />

        <div className="create-task-buttons">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Create</button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskModal;
