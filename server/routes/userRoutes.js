// routes/userRoutes.js
import express from 'express';
import {
  createUser,
  deleteUser,
  updateUserRoleAndTeam,
   getAllUsers  // ✅ FIXED: now imported
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create user (Admin only)
router.post('/', protect, authorize('Admin'), createUser);

// Delete user (Admin only)
router.delete('/:id', protect, authorize('Admin'), deleteUser);

// Update user's team and/or role (Admin only)
router.put('/:id', protect, authorize('Admin'), updateUserRoleAndTeam);
router.get('/', protect, authorize('Admin'), getAllUsers);

export default router;
