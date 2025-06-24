import express from 'express';
import { createComment, getTaskComments,deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new comment or reply
router.post('/', protect, createComment);

// Get all comments for a task (nested)
router.get('/task/:taskId', protect, getTaskComments);
router.delete('/:id', protect, deleteComment);

export default router;
