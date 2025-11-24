const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notification_id: {
    type: String,
    required: true,
    unique: true
  },
  recipient_id: {
    type: String,
    required: true
  },
  recipient_role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    required: true
  },
  type: {
    type: String,
    enum: ['assignment', 'meeting', 'announcement', 'grade', 'attendance', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: String,
  is_read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient_id: 1, is_read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
