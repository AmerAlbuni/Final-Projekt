import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import socket from '../socket';

const CommentModal = ({ task, onClose }) => {
  const { token } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/task/${task._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch (err) {
        console.error('Error loading comments:', err);
      }
    };

    fetchComments();
  }, [task, token]);

  useEffect(() => {
    socket.emit('joinTask', task._id);

    socket.on('receiveComment', (newComment) => {
      setComments((prev) => [...prev, newComment]);
    });

    return () => {
      socket.emit('leaveTask', task._id);
      socket.off('receiveComment');
    };
  }, [task._id]);

  const handleSend = async () => {
    if (!text.trim()) return;

    const newComment = {
      taskId: task._id,
      text,
      parentCommentId: replyTo?._id || null,
    };

    try {
      await api.post('/comments', newComment, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setText('');
      setReplyTo(null);
    } catch (err) {
      console.error('Failed to send comment:', err);
    }
  };

  const renderComments = (parentId = null) =>
    comments
      .filter((c) => c.parentCommentId === parentId)
      .map((comment) => (
        <div key={comment._id} style={{ marginLeft: parentId ? '20px' : '0', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>{comment.text}</p>
            <button
              onClick={() => setReplyTo(comment)}
              style={{ marginLeft: '8px', cursor: 'pointer', background: 'none', border: 'none', color: '#3b82f6' }}
            >
              Reply
            </button>
          </div>
          <div>{renderComments(comment._id)}</div>
        </div>
      ));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}
      >
        <button
          onClick={onClose}
          style={{ float: 'right', fontSize: '1.5rem', border: 'none', background: 'none', cursor: 'pointer' }}
          aria-label="Close"
        >
          ✖
        </button>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>💬 Comments</h2>

        <div>{renderComments()}</div>

        {replyTo && (
          <div style={{ marginTop: '1rem', padding: '8px', background: '#f0f4f8', borderRadius: '6px' }}>
            Replying to: <em>"{replyTo.text.slice(0, 40)}"</em>
            <button
              onClick={() => setReplyTo(null)}
              style={{ marginLeft: '12px', cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444' }}
            >
              Cancel
            </button>
          </div>
        )}

        <textarea
          rows={3}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', marginTop: '1rem', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }}
        />

        <button
          onClick={handleSend}
          style={{
            marginTop: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default CommentModal;
