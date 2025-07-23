import { useState, useEffect } from 'react';
import CommentList from './CommentList';
import api from '../services/api';
import socket from '../socket';

const CommentModal = ({ task, onClose }) => {
  const [replyTo, setReplyTo] = useState(null);
  const [text, setText] = useState('');
  const [commentsVersion, setCommentsVersion] = useState(0);

  const taskId = task?._id;

  // Handle comment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !taskId) return;
    try {
      await api.post('/comments', {
        taskId,
        text,
        parentComment: replyTo?._id || null,
      });

      socket.emit('sendComment', { taskId });

      setText('');
      setReplyTo(null);
      setCommentsVersion((v) => v + 1);
    } catch (err) {
      console.error('Failed to send comment', err);
    }
  };

  // Listen for incoming socket updates
  useEffect(() => {
    if (!taskId) return;

    socket.emit('joinTask', taskId);

    const handleReceiveComment = (data) => {
      if (data?.taskId === taskId) {
        setCommentsVersion((v) => v + 1);
      }
    };

    socket.on('receiveComment', handleReceiveComment);

    return () => {
      socket.emit('leaveTask', taskId);
      socket.off('receiveComment', handleReceiveComment);
    };
  }, [taskId]);

  return (
    <div>
      <div>
        <h3>
          💬 Comments for: {task?.title || 'Unknown Task'}
        </h3>

        {task?.dueDate && (
          <p>
            <strong>📅 Due:</strong>{" "}
            {new Date(task.dueDate).toLocaleDateString('de-DE')}
          </p>
        )}

        {taskId && (
          <CommentList key={commentsVersion} taskId={taskId} onReply={setReplyTo} />
        )}

        <form onSubmit={handleSubmit}>
          <input
            style={{ margin: '0 0.5rem 0.5rem 0' }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={replyTo ? `Reply to ${replyTo.user?.name}` : 'Write a comment...'}
            required
            autoFocus
          />
          <button className='btn btn-primary' type="submit">Send</button>
          {replyTo && (
            <button type="button" onClick={() => setReplyTo(null)}>
              Cancel Reply
            </button>
          )}
        </form>

        <button className='btn btn-primary' onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default CommentModal;
