import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register new user
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  // ✅ Restrict role to 'Member' during public registration
  if (role && role !== 'Member') {
    return res
      .status(403)
      .json({ message: 'You can only register as a Member' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'Member', // Enforce role at the DB level too
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Populate team info
    const user = await User.findOne({ email }).populate("team", "name");

    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);

    // ✅ Include team in response
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: user.team ? {
          _id: user.team._id,
          name: user.team.name
        } : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
