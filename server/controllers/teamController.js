import Team from '../models/Team.js';
import User from '../models/User.js';

// ✅ Create a team
export const createTeam = async (req, res) => {
  const { name, teamLead, members } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Team name is required' });
  }

  try {
    const normalizedTeamLead = teamLead === '' ? null : teamLead;

    const newTeam = await Team.create({
      name: name.trim(),
      createdBy: req.user._id,
      teamLead: normalizedTeamLead,
      members: members || [],
    });

    const userIds = [...(members || []), ...(normalizedTeamLead ? [normalizedTeamLead] : [])];
    await User.updateMany({ _id: { $in: userIds } }, { team: newTeam._id });

    const populatedTeam = await Team.findById(newTeam._id)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role');

    res.status(201).json(populatedTeam);
  } catch (err) {
    console.error('❌ Error creating team:', err.message);
    res.status(500).json({ message: 'Server error while creating team' });
  }
};

// ✅ Get all teams (Admin & TeamLead)
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role');

    res.json(teams);
  } catch (err) {
    console.error('❌ Failed to fetch teams:', err.message);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
};

// ✅ Update a team
export const updateTeam = async (req, res) => {
  const { name, teamLead, members } = req.body;

  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (name) team.name = name;
    if (teamLead !== undefined) team.teamLead = teamLead === '' ? null : teamLead;
    if (members) team.members = members;

    await team.save();

    // Clear "team" from all users previously assigned to this team
    await User.updateMany({ team: team._id }, { $unset: { team: '' } });

    // Reassign team to new members and team lead
    const userIds = [...(members || []), ...(teamLead ? [teamLead] : [])];
    await User.updateMany({ _id: { $in: userIds } }, { team: team._id });

    const updatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role');

    res.json(updatedTeam);
  } catch (err) {
    console.error('❌ Update error:', err.message);
    res.status(500).json({ message: 'Failed to update team' });
  }
};

// ✅ Delete a team
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    await User.updateMany({ team: team._id }, { $unset: { team: '' } });

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('❌ Delete team error:', err.message);
    res.status(500).json({ message: 'Server error while deleting team' });
  }
};

// ✅ Get the logged-in user's team
export const getMyTeam = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.team) {
      return res.status(404).json({ message: 'You are not assigned to a team yet.' });
    }

    const team = await Team.findById(user.team)
      .populate('teamLead', 'name email role')
      .populate('members', 'name email role');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (err) {
    console.error('❌ Failed to fetch team:', err.message);
    res.status(500).json({ message: 'Server error fetching team' });
  }
};


// ✅ Invite an existing user (by email) to your team
export const inviteToTeam = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email.' });
    }

    if (!req.user.team) {
      return res.status(400).json({ message: 'You are not part of a team.' });
    }

    if (user.team && user.team.toString() === req.user.team.toString()) {
      return res.status(400).json({ message: 'User is already in your team.' });
    }

    user.team = req.user.team;
    user.role = role;
    await user.save();

    res.json({ message: `${user.name} has been added to your team as ${role}.` });
  } catch (err) {
    console.error('❌ Failed to invite user:', err.message);
    res.status(500).json({ message: 'Failed to invite user to team.' });
  }
};

// controllers/teamController.js
export const removeTeamMember = async (req, res) => {
  const { teamId, memberId } = req.params;
  const user = req.user;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Only allow if user is Admin OR the Team Lead of this team
    if (
      user.role !== 'Admin' &&
      (!team.teamLead || team.teamLead.toString() !== user._id.toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to remove members from this team' });
    }

    // Remove the member from the team
    team.members = team.members.filter(
      (member) => member.toString() !== memberId
    );
    await team.save();

    // Optionally: delete the user entirely (only if you want)
    // await User.findByIdAndDelete(memberId);

    res.status(200).json({ message: 'Member removed from team' });
  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

