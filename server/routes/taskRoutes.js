import express from 'express';
import {
  createTask,
  getTasks,
  updateTaskStatus,
  getAssignedTasks,
} from '../controllers/taskController.js';
import { protect, isTeamLead, isMember, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below require login
router.use(protect);

// ✅ Team Leads can create tasks
router.post('/', isTeamLead, createTask);

// ✅ Team Leads and Members can view tasks for a specific project
router.get('/project/:projectId', authorize('TeamLead', 'Member'), getTasks);

// ✅ Team Leads can update task status
router.patch('/:taskId/status', isTeamLead, updateTaskStatus);

// ✅ Members can view their assigned tasks
router.get('/assigned', isMember, getAssignedTasks);

export default router;
