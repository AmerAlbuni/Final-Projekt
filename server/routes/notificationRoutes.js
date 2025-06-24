import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markAsRead,
} from '../controllers/notificationController.js';
import { protect }from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createNotification); // manually trigger (can be called internally too)
router.get('/', protect, getUserNotifications);
router.patch('/:id/read', protect, markAsRead);

export default router;
