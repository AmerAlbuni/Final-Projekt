import express from 'express';
import {
  createTeam,
  getAllTeams,
  updateTeam,
  deleteTeam,
  getMyTeam,
  inviteToTeam,
  removeTeamMember,
} from '../controllers/teamController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only
router.post('/', protect, authorize('Admin'), createTeam);
router.put('/:id', protect, authorize('Admin'), updateTeam);
router.delete('/:id', protect, authorize('Admin'), deleteTeam);

// Admin & Team Lead can list all teams
router.get('/', protect, authorize('Admin', 'TeamLead'), getAllTeams);

// ✅ Allow any authenticated user to get their own team
router.get('/my-team', protect, getMyTeam);

// ✅ ADD THIS ROUTE FOR INVITES
router.post('/invite', protect, authorize('Admin', 'TeamLead'), inviteToTeam);

// Allow both Admin and TeamLead
router.delete('/:teamId/member/:memberId', protect, authorize('Admin', 'TeamLead'), removeTeamMember);


export default router;
