const Notification = require('../models/Notification.mongo');

// Email transporter (lazy initialization)
let transporter = null;

function getTransporter() {
  if (!transporter) {
    try {
      const nodemailer = require('nodemailer');
      transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } catch (error) {
      console.warn('Nodemailer not configured:', error.message);
      return null;
    }
  }
  return transporter;
}

/**
 * Create and send notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification
 */
async function createNotification(notificationData) {
  try {
    const notification = new Notification({
      notification_id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...notificationData
    });
    
    await notification.save();
    
    // Send email notification (async, don't wait)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      sendEmailNotification(notificationData).catch(err => {
        console.error('Email notification failed:', err.message);
      });
    }
    
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

/**
 * Send email notification
 * @param {Object} data - Notification data
 */
async function sendEmailNotification(data) {
  try {
    const emailTransporter = getTransporter();
    if (!emailTransporter) {
      return; // Email not configured
    }
    
    // Get user email from database
    const User = require('../models/User.mongo');
    const user = await User.findOne({ user_id: data.recipient_id });
    
    if (!user || !user.email) {
      return;
    }
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@acadify.com',
      to: user.email,
      subject: data.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Acadify</h1>
          </div>
          <div style="padding: 20px; background: #f9fafb;">
            <h2 style="color: #1f2937;">${data.title}</h2>
            <p style="color: #4b5563; line-height: 1.6;">${data.message}</p>
            ${data.link ? `<a href="${data.link}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Details</a>` : ''}
          </div>
          <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This is an automated message from Acadify. Please do not reply.</p>
          </div>
        </div>
      `
    };
    
    await emailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
}

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Notifications
 */
async function getUserNotifications(userId, options = {}) {
  const query = { recipient_id: userId };
  
  if (options.unreadOnly) {
    query.is_read = false;
  }
  
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
  
  return notifications;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} - Updated notification
 */
async function markAsRead(notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { notification_id: notificationId },
    { is_read: true },
    { new: true }
  );
  
  return notification;
}

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Update result
 */
async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    { recipient_id: userId, is_read: false },
    { is_read: true }
  );
  
  return result;
}

/**
 * Get unread count
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Unread count
 */
async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({
    recipient_id: userId,
    is_read: false
  });
  
  return count;
}

/**
 * Notify about new assignment
 * @param {Object} assignment - Assignment data
 * @param {Array} studentIds - Student IDs to notify
 */
async function notifyNewAssignment(assignment, studentIds) {
  const notifications = studentIds.map(studentId => ({
    recipient_id: studentId,
    recipient_role: 'student',
    type: 'assignment',
    title: 'New Assignment Posted',
    message: `A new assignment "${assignment.title}" has been posted for ${assignment.subject}. Due date: ${new Date(assignment.due_date).toLocaleDateString()}`,
    link: `/student/assignments/${assignment.resource_id}`,
    priority: 'high'
  }));
  
  await Promise.all(notifications.map(n => createNotification(n)));
}

/**
 * Notify about new meeting
 * @param {Object} meeting - Meeting data
 * @param {Array} studentIds - Student IDs to notify
 */
async function notifyNewMeeting(meeting, studentIds) {
  const notifications = studentIds.map(studentId => ({
    recipient_id: studentId,
    recipient_role: 'student',
    type: 'meeting',
    title: 'New Meeting Scheduled',
    message: `A new meeting "${meeting.title}" has been scheduled for ${new Date(meeting.scheduled_time).toLocaleString()}`,
    link: `/student/meetings/${meeting.meeting_id}`,
    priority: 'high'
  }));
  
  await Promise.all(notifications.map(n => createNotification(n)));
}

/**
 * Notify about grade update
 * @param {string} studentId - Student ID
 * @param {Object} gradeData - Grade data
 */
async function notifyGradeUpdate(studentId, gradeData) {
  await createNotification({
    recipient_id: studentId,
    recipient_role: 'student',
    type: 'grade',
    title: 'Grade Updated',
    message: `Your grade for "${gradeData.subject}" has been updated. Score: ${gradeData.score}/${gradeData.total}`,
    link: `/student/grades`,
    priority: 'medium'
  });
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  notifyNewAssignment,
  notifyNewMeeting,
  notifyGradeUpdate
};
