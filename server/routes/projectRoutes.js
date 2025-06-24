import express from 'express';
import {
  createProject,
  getProjects,
  deleteProject,
  getProjectsByTeam, // ✅ ADD THIS
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below require auth
router.use(protect);

// ✅ NEW ROUTE: Get projects by team (TeamLead, Member)
router.get('/team', authorize('TeamLead', 'Member'), getProjectsByTeam);

// ✅ GET all projects (Admin, TeamLead, Member)
router.get('/', authorize('Admin', 'TeamLead', 'Member'), getProjects);

// ✅ POST: only Admin (currently)
router.post('/', authorize('Admin'), createProject);

// ✅ DELETE: only Admin
router.delete('/:id', authorize('Admin'), deleteProject);

export default router;
