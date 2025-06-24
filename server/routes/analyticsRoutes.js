import express from 'express';
import {
  getAnalytics,
  getTeamLeadAnalytics,
} from '../controllers/analyticsController.js';

import {
  protect,
  isAdmin,
  isTeamLead,
} from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Admin-only analytics (global stats)
router.get('/admin', protect, isAdmin, getAnalytics);

// 🔐 Team Lead-only analytics (team-specific stats)
router.get('/lead', protect, isTeamLead, getTeamLeadAnalytics);

export default router;
