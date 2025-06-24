import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

// ✅ Admin: Get Global Analytics
export const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalTasks, completedTasks] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'Done' }),
    ]);

    res.json({
      totalUsers,
      totalProjects,
      totalTasks,
      completedTasks,
    });
  } catch (err) {
    console.error('❌ Admin analytics error:', err.message);
    res.status(500).json({ message: 'Failed to load analytics' });
  }
};

// ✅ Team Lead: Get Team-specific Analytics
export const getTeamLeadAnalytics = async (req, res) => {
  try {
    const user = req.user;
    const teamId = user.team?._id || user.team;

    if (!teamId) {
      return res.status(400).json({ message: 'User is not assigned to any team' });
    }

    const [totalProjects, completedTasks, pendingTasks, overdueTasks] = await Promise.all([
      Project.countDocuments({ team: teamId }),
      Task.countDocuments({ team: teamId, status: 'Done' }),
      Task.countDocuments({ team: teamId, status: { $ne: 'Done' } }),
      Task.countDocuments({
        team: teamId,
        status: { $ne: 'Done' },
        dueDate: { $lt: new Date() },
      }),
    ]);

    res.json({
      totalProjects,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  } catch (err) {
    console.error('❌ Team lead analytics error:', err.message);
    res.status(500).json({ message: 'Failed to load team analytics' });
  }
};
