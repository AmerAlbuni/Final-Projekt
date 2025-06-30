import express from 'express';
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword, // ✅ New import
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword); // ✅ Already added
router.post('/reset-password/:token', resetPassword); // ✅ Add this line

router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
