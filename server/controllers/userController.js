// controllers/userController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/email.js'; // ✅ ADDED

const validRoles = ['Admin', 'TeamLead', 'Member'];

// ✅ CREATE user (Admin only)
export const createUser = async (req, res) => {
  let { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 6 characters long' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  try {
    email = email.trim().toLowerCase();
    name = name.trim();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // ✅ Send registration email
    await sendEmail({
      to: user.email,
      subject: '🎉 You have been registered',
      text: `Hello ${user.name},\n\nYou have been successfully registered as a ${user.role}.\n\nWelcome to the platform!`,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ✅ DELETE user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ✅ ASSIGN role and/or team to user (Admin only)
export const updateUserRoleAndTeam = async (req, res) => {
  const { role, team } = req.body;

  if (!role && !team) {
    return res.status(400).json({ message: 'Please provide role or team to update' });
  }

  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (role) user.role = role;
    if (team) user.team = team;

    await user.save();

    res.json({ message: '✅ User updated successfully', user });
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('team', 'name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};
