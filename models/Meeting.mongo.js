const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  name: String,
  joined_at: Date,
  left_at: Date,
  duration: Number, // in minutes
  attendance_marked: {
    type: Boolean,
    default: false
  }
});

const meetingSchema = new mongoose.Schema({
  meeting_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  program: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  faculty_id: {
    type: String,
    required: true
  },
  faculty_name: String,
  scheduled_time: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true // in minutes
  },
  jitsi_room_name: {
    type: String,
    required: true,
    unique: true
  },
  jitsi_room_url: String,
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  participants: [participantSchema],
  recording_url: String,
  auto_attendance: {
    type: Boolean,
    default: true
  },
  minimum_duration: {
    type: Number,
    default: 30 // minimum minutes to mark attendance
  }
}, {
  timestamps: true
});

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
