import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Select from 'react-select';
import DatePicker from "react-datepicker";
import { de } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

const CreateTaskModal = ({ projectId, onClose, onTaskCreated }) => {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: null, // will be a Date object now
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

    const taskData = {
      ...form,
      assignee: form.assignee?.value || "",
      dueDate: form.dueDate?.toISOString().split("T")[0], // Format: yyyy-mm-dd
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
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "1rem",
          backgroundColor: "transparent",
          borderRadius: "0.6rem",
          boxShadow: "0 4px 12px #ff9900, 0 4px 12px #ff5e00",
          marginTop: "2rem",
        }}
      >
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

        {/* 🗓️ German-formatted datepicker */}
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

        <div>
          <button
            style={{
              marginRight: "0.5rem",
              backgroundColor: "#ac712e",
              color: "white",
              borderRadius: "0.5rem",
            }}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            style={{
              backgroundColor: "#ac712e",
              color: "white",
              borderRadius: "0.5rem",
            }}
            type="submit"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskModal;
