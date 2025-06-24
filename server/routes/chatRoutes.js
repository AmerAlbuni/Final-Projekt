import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  sendMessage,
  getTeamMessages,
  deleteMessage, // ✅ add this
} from '../controllers/chatController.js';

const router = express.Router();

// ✅ Send a message to team chat
router.post('/send', protect, sendMessage);

// ✅ Get all messages for current user's team
router.get('/team', protect, getTeamMessages);

// ✅ Delete message (Admin or TeamLead only)
router.delete('/:id', protect, deleteMessage); // ✅ new route

export default router;
