import express from 'express';
import {
  createTask,
  getTasks,
  updateTaskStatus,
  getAssignedTasks,
  getTaskById,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, isTeamLead, isMember, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below require login
router.use(protect);

// ✅ Team Leads can create tasks
router.post('/', isTeamLead, createTask);

// ✅ Team Leads and Members can view tasks for a specific project
router.get('/project/:projectId', authorize('TeamLead', 'Member'), getTasks);

// ✅ Team Leads and Members can update task status and progress
router.patch('/:taskId/status', authorize('TeamLead', 'Member'), updateTaskStatus);

// ✅ Members can view their assigned tasks
router.get('/assigned', isMember, getAssignedTasks);

// ✅ Team Leads can delete tasks
router.delete('/:taskId', isTeamLead, deleteTask);

// ✅ Any logged-in user can view a task by ID
router.get('/:id', getTaskById); // 👈 Keep this LAST

export default router;
