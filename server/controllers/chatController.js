import mongoose from 'mongoose';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Team from '../models/Team.js';

// ✅ Send a message
export const sendMessage = async (req, res) => {
  const { text } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate('team');
    if (!user.team) {
      return res.status(400).json({ message: 'You are not assigned to a team.' });
    }

    const message = await Message.create({
      sender: user._id,
      team: user.team._id,
      text,
    });

    const populatedMessage = await message.populate('sender', 'name email role');
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('❌ Failed to send message:', err.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// ✅ Get all messages for user's team
export const getTeamMessages = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.team) {
      console.warn(`⚠️ User ${user.email} is not assigned to a team.`);
      return res.status(200).json([]); // Return empty list instead of 400
    }

    const messages = await Message.find({ team: user.team })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err.message);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// ✅ Delete a message (Admin & TeamLead can delete any, Member can delete their own)
export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // 🛡️ Allow only Admins, TeamLeads, or message owner (Member)
    const isOwner = message.sender.toString() === user._id.toString();
    const isPrivileged = user.role === 'Admin' || user.role === 'TeamLead';

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own messages' });
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error('❌ Failed to delete message:', err.message);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};
