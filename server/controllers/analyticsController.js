import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const getAnalytics = async (req, res) => {
  try {
    // 1. User counts by role
    const userRoles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // 2. Teams and member counts + team name
    const teamUsers = await User.find({ team: { $ne: null } }).populate("team", "name");
    const teams = Object.values(
      teamUsers.reduce((acc, user) => {
        const teamId = user.team?._id?.toString();
        const teamName = user.team?.name || "Unnamed";
        if (!acc[teamId]) {
          acc[teamId] = { _id: teamId, name: teamName, members: 1 };
        } else {
          acc[teamId].members += 1;
        }
        return acc;
      }, {})
    );

    // 3. Projects per team + list of all project titles
    const projects = await Project.find({}, "title team");
    const projectsPerTeam = projects.reduce((acc, proj) => {
      const teamId = proj.team?.toString() || "none";
      acc[teamId] = (acc[teamId] || 0) + 1;
      return acc;
    }, {});
    const projectsByTeam = Object.entries(projectsPerTeam).map(([id, count]) => ({
      _id: id,
      count,
    }));

    // 4. Task status breakdown + all tasks with assignee name
    const taskStatuses = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const tasks = await Task.find()
      .populate("assignee", "name")
      .select("title assignee");

    // 🆕 5. Project Progress: tasks done vs. remaining
    const progressPerProject = await Task.aggregate([
      {
        $group: {
          _id: "$project",
          total: { $sum: 1 },
          done: {
            $sum: {
              $cond: [{ $eq: ["$status", "Done"] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "projectInfo",
        },
      },
      { $unwind: "$projectInfo" },
      {
        $project: {
          _id: 0,
          projectId: "$_id",
          title: "$projectInfo.title",
          done: 1,
          total: 1,
          remaining: { $subtract: ["$total", "$done"] },
        },
      },
    ]);

    // 6. Upcoming tasks (next 7 days) — (can be removed if unused)
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    const upcomingDeadlines = await Task.find({
      dueDate: { $gte: now, $lte: in7Days }
    }).select("title dueDate project");

    // 7. User names grouped by role
    const allUsers = await User.find().select("name role");
    const usersByRole = allUsers.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user.name);
      return acc;
    }, {});

    res.json({
      userRoles,
      usersByRole, // ✅
      teams,
      projectsPerTeam: projectsByTeam,
      projectTitles: projects.map((p) => ({ title: p.title, team: p.team })),
      taskStatuses,
      tasks: tasks.map((t) => ({
        title: t.title,
        assignee: t.assignee ? t.assignee.name : "Unassigned",
      })),
      progressPerProject, // ✅ new section
      upcomingDeadlines,  // optional
    });
  } catch (err) {
    console.error("❌ Admin analytics error:", err.message);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};

// ✅ Team Lead: Get Team-specific Analytics
export const getTeamLeadAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const teamId = user.team?._id || user.team;

    if (!teamId) {
      return res.status(200).json({
        message: 'No team assigned.',
        totalProjects: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
      });
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
