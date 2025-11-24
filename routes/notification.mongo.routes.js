const express = require('express');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../services/notificationService');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    const notifications = await getUserNotifications(req.user.user_id, {
      unreadOnly: unreadOnly === 'true',
      limit: parseInt(limit) || 50
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await getUnreadCount(req.user.user_id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Mark as read
router.put('/:notification_id/read', async (req, res) => {
  try {
    const notification = await markAsRead(req.params.notification_id);
    res.json({ message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    const result = await markAllAsRead(req.user.user_id);
    res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark all as read' });
  }
});

module.exports = router;
