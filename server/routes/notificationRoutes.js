import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification, // ✅ import new controller
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Create a notification (internal or manual trigger)
router.post('/', protect, createNotification);

// ✅ Get all notifications for logged-in user
router.get('/', protect, getUserNotifications);

// ✅ Mark as read
router.patch('/:id/read', protect, markAsRead);

// ✅ Delete a notification
router.delete('/:id', protect, deleteNotification); // ✅ NEW

export default router;
