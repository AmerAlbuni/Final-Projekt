import { useEffect, useState } from "react";
import socket from "../socket";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/TeamChat.css";

const TeamChat = () => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [teamId, setTeamId] = useState(null);
  const [noTeam, setNoTeam] = useState(false); // 🆕 Track if user has no team

  useEffect(() => {
    const joinTeamRoom = async () => {
      try {
        const res = await api.get("/teams/my-team", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 204 || !res.data?._id) {
          setNoTeam(true);
          return;
        }

        const fetchedTeamId = res.data._id;
        setTeamId(fetchedTeamId);
        socket.emit("joinRoom", fetchedTeamId);
      } catch (err) {
        console.error("Failed to join chat room:", err);
        setNoTeam(true);
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
    if (!id) return;
    try {
      await api.delete(`/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const canDeleteMessage = (msg) => {
    if (user.role === "Admin" || user.role === "TeamLead") return true;
    return msg.sender?._id === user._id;
  };

  if (noTeam) {
    return (
      <div className="teamchat-wrapper">
        <h2 className="teamchat-heading">💬 Team Chat</h2>
        <p className="no-team-warning">⚠️ You are not assigned to a team.</p>
      </div>
    );
  }

  return (
    <div className="teamchat-wrapper">
      <h2 className="teamchat-heading">💬 Team Chat</h2>
      <div className="teamchat-messages">
        {messages.map((msg) => (
          <div className="teamchat-message" key={msg._id || msg.timestamp}>
            <div className="teamchat-text">
              <strong>{msg.sender?.name || msg.sender}</strong>: {msg.text}
              <small className="teamchat-time">
                ({new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()})
              </small>
            </div>
            {canDeleteMessage(msg) && (
              <button
                className={`delete-btn ${!msg._id ? "disabled" : ""}`}
                onClick={() => handleDelete(msg._id)}
                title={!msg._id ? "Cannot delete unsaved message" : "Delete message"}
                disabled={!msg._id}
              >
                🗑️
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="teamchat-inputbox">
        <input
          type="text"
          placeholder="Type message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="send" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default TeamChat;
