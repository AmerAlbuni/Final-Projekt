import Notification from '../models/Notification.js';

// ✅ Create a notification with real-time emit
export const createNotification = async (req, res) => {
  try {
    const { userId, message, link } = req.body;

    const notification = new Notification({
      user: userId,
      message,
      link,
    });

    const saved = await notification.save();

    // 🔔 Emit real-time notification to the user's socket room
    if (req.io) {
      req.io.to(userId).emit('newNotification', saved);
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create notification', error: err.message });
  }
};

// ✅ Get all notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get notifications', error: err.message });
  }
};

// ✅ Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification', error: err.message });
  }
};

// ✅ Delete a notification by ID
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification', error: err.message });
  }
};
