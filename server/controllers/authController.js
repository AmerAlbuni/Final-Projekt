import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

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
    const user = await User.findOne({ email }).populate("team", "name");

    if (!user)
      return res.status(401).json({ message: 'Email is not registered' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Incorrect email or password' });

    const token = generateToken(user._id);

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

// @desc    Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token + expiry on user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset.\n\nPlease click the link below to reset your password:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    });

    res.status(200).json({ message: 'Reset link sent to email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
