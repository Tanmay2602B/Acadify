const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  marked_at: {
    type: Date,
    default: Date.now
  }
});

const attendanceSchema = new mongoose.Schema({
  attendance_id: {
    type: String,
    required: true,
    unique: true
  },
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
  date: {
    type: Date,
    required: true
  },
  records: [attendanceRecordSchema]
}, {
  timestamps: true
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
