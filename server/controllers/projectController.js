import Project from '../models/Project.js';

// @desc    Create a project
// @route   POST /api/projects
// @access  Admin only
export const createProject = async (req, res) => {
  try {
    const { title, description, deadline, teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    const project = await Project.create({
      title,
      description,
      deadline,
      team: teamId,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('❌ Failed to create project:', err.message);
    res.status(500).json({ message: 'Failed to create project' });
  }
};


export const getProjects = async (req, res) => {
  try {
    let projects;

    if (req.user.role === 'Admin' || req.user.role === 'TeamLead') {
      projects = await Project.find().populate('team');
    } else if (req.user.role === 'TeamLead') {
      if (!req.user.team) {
        return res.status(403).json({ message: 'You must be assigned to a team to view projects.' });
      }

      projects = await Project.find({ team: req.user.team }).populate('team');
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const formatted = projects.map((p) => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      deadline: p.deadline ? p.deadline.toISOString() : null,
      team: {
        name: p.team?.name,
        members: p.team?.members || [],
      },
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Failed to fetch projects:', err.message);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};


export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only admins can delete projects' });
    }

    await project.deleteOne();
    res.json({ message: '✅ Project deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting project:', err.message);
    res.status(500).json({ message: 'Failed to delete project' });
  }
};
// ✅ Get projects assigned to the user's team
export const getProjectsByTeam = async (req, res) => {
  try {
    const user = req.user;

    if (!user.team) {
      return res.status(400).json({ message: 'You are not assigned to a team.' });
    }

    const projects = await Project.find({ team: user.team }).populate('team');

    const formatted = projects.map((p) => ({
      _id: p._id,
      title: p.title,
      description: p.description,
      deadline: p.deadline ? p.deadline.toISOString() : null,
      team: {
        name: p.team?.name,
        members: p.team?.members || [],
      },
    }));

    res.json(formatted);
  } catch (err) {
    console.error('❌ Failed to fetch team projects:', err.message);
    res.status(500).json({ message: 'Failed to fetch team projects' });
  }
};
