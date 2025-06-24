import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CommentList = ({ taskId, onReply }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments(res.data);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) fetchComments();
  }, [taskId]);

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchComments(); // refresh after delete
    } catch (err) {
      console.error('❌ Failed to delete comment:', err);
      alert('Failed to delete comment');
    }
  };

  const renderComments = (commentList, indent = 0) => {
    return commentList.map((comment) => (
      <div key={comment._id} style={{ marginLeft: indent }}>
        <p>
          <strong>{comment.user.name}</strong>:
        </p>
        <p>{comment.text}</p>
        <div>
          <button onClick={() => onReply(comment)}>Reply</button>
          {(user._id === comment.user._id || user.role === 'Admin') && (
            <button onClick={() => handleDelete(comment._id)}>Delete</button>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, indent + 20)}
      </div>
    ));
  };

  if (loading) return <p>Loading comments...</p>;
  if (error) return <p>{error}</p>;
  if (!comments.length) return <p>No comments yet.</p>;

  return <div>{renderComments(comments)}</div>;
};

export default CommentList;
