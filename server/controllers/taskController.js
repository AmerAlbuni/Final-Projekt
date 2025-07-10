import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';

// ✅ Create a new task
export const createTask = async (req, res) => {
  const { title, description, status = 'To Do', dueDate, assignee, project } = req.body;

  if (!title || !project) {
    return res.status(400).json({ message: 'Title and project are required' });
  }

  try {
    const projectData = await Project.findById(project);
    if (!projectData) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // ✅ TeamLead can only create tasks for their own team
    if (req.user.role === 'TeamLead') {
      const userTeamId = req.user.team?._id?.toString() || req.user.team?.toString();
      if (!userTeamId || projectData.team?.toString() !== userTeamId) {
        return res.status(403).json({
          message: 'You can only create tasks for your own team\'s projects.',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      dueDate,
      assignee,
      project,
      team: projectData.team,
    });

    // ✅ Send notification to assignee
    if (assignee) {
      const notification = await Notification.create({
        user: assignee,
        message: `You have been assigned to task: "${task.title}"`,
        link: `/member/tasks/${task._id}`,
      });

      // ✅ Emit real-time notification
      if (req.io) {
        req.io.to(assignee.toString()).emit('newNotification', {
          message: notification.message,
          link: notification.link,
          timestamp: notification.createdAt,
        });
      }
    }

    res.status(201).json(task);
  } catch (err) {
    console.error('❌ Failed to create task:', err.message);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// ✅ Get all tasks by project ID
export const getTasks = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid project ID format' });
  }

  try {
    const tasks = await Task.find({ project: projectId })
      .populate('assignee', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('❌ Failed to fetch tasks:', err.message);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// ✅ Update task status
export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status || task.status;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error('❌ Failed to update task status:', err.message);
    res.status(500).json({ message: 'Failed to update task status' });
  }
};

// ✅ Get tasks assigned to the current user
export const getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'title');

    res.json(tasks);
  } catch (err) {
    console.error('❌ Failed to fetch assigned tasks:', err.message);
    res.status(500).json({ message: 'Failed to fetch assigned tasks' });
  }
};

// ✅ Get task by ID (NEW)
export const getTaskById = async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid task ID format' });
  }

  try {
    const task = await Task.findById(id).populate('project', 'title');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error('❌ Failed to fetch task by ID:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// ✅ Delete task (TeamLead only)
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ Ensure TeamLead can only delete tasks from their own team
    const userTeamId = req.user.team?._id?.toString() || req.user.team?.toString();
    if (req.user.role !== "TeamLead" || task.team?.toString() !== userTeamId) {
      return res.status(403).json({
        message: "You can only delete tasks from your own team.",
      });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ Failed to delete task:", err.message);
    res.status(500).json({ message: "Failed to delete task" });
  }
};
