import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js'; // Needed for name

// ✅ Create a new comment or reply
export const createComment = async (req, res) => {
  try {
    const { text, taskId, parentComment } = req.body;
    const userId = req.user._id;

    const comment = new Comment({
      text,
      task: taskId,
      user: userId,
      parentComment: parentComment || null,
    });

    const saved = await comment.save();

    // === Notification Logic ===
    const task = await Task.findById(taskId).populate('assignee', 'name email');
    const user = await User.findById(userId);

    // Notify assignee (if not the one commenting)
    if (
      task?.assignee &&
      task.assignee._id.toString() !== userId.toString()
    ) {
      await Notification.create({
        user: task.assignee._id,
        message: `${user.name} commented on task "${task.title}"`,
        link: `/tasks/${task._id}`,
      });
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to create comment',
      error: err.message,
    });
  }
};

// ✅ Fetch all comments for a task, nested as threads
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate('user', 'name email')
      .lean();

    // Group by parentComment
    const map = {};
    comments.forEach((c) => (map[c._id] = { ...c, replies: [] }));
    const roots = [];

    comments.forEach((c) => {
      if (c.parentComment) {
        map[c.parentComment]?.replies.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    res.json(roots);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch comments',
      error: err.message,
    });
  }
};

// ✅ Delete a comment (and its replies)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only the author or an Admin can delete
    if (
      comment.user.toString() !== userId.toString() &&
      req.user.role !== 'Admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete replies first (cascade delete)
    await Comment.deleteMany({ parentComment: id });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete comment:', err.message);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
