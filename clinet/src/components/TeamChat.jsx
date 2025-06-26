import { useEffect, useState } from "react";
import socket from "../socket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const TeamChat = () => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const joinTeamRoom = async () => {
      try {
        const res = await api.get("/teams/my-team", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedTeamId = res.data._id;
        setTeamId(fetchedTeamId);
        socket.emit("joinRoom", fetchedTeamId);
      } catch (err) {
        console.error("Failed to join chat room:", err);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await api.get("/chat/team", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    joinTeamRoom();
    fetchMessages();

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [token]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post(
        "/chat/send",
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const savedMessage = res.data;
      setMessages((prev) => [...prev, savedMessage]);
      socket.emit("sendMessage", savedMessage);
      setText("");
    } catch (err) {
      console.error("❌ Failed to send message:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      console.warn("⚠️ Cannot delete message: ID is undefined.");
      return;
    }
    try {
      await api.delete(`/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // 🔐 New function: check delete permission
  const canDeleteMessage = (msg) => {
    if (user.role === "Admin" || user.role === "TeamLead") return true;
    return msg.sender?._id === user._id;
  };

  return (
    <div style={{  borderRadius: "1rem", padding: "1rem" }}>
      <h2>💬 Team Chat</h2>
      <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
        {messages.map((msg) => (
          <div
            key={msg._id || msg.timestamp}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <div>
              <strong>{msg.sender?.name || msg.sender}</strong>: {msg.text}
              <small style={{ marginLeft: "0.5rem" }}>
                ({new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()})
              </small>
            </div>
            {canDeleteMessage(msg) && (
              <button
                onClick={() => handleDelete(msg._id)}
                title={!msg._id ? "Cannot delete unsaved message" : "Delete message"}
                style={{
                  marginLeft: "1rem",
                  background: "transparent",
                  border: "none",
                  color: "#dc2626",
                  opacity: msg._id ? 1 : 0.4,
                  cursor: msg._id ? "pointer" : "not-allowed",
                }}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ flexGrow: 1, padding: "0.5rem" }}
        />
        <button onClick={sendMessage} style={{ padding: "0.5rem 1rem", background: "#ff9900", color: "#fff", border: "none", borderRadius: "0.25rem" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default TeamChat;
