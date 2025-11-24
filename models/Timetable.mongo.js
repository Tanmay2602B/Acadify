const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  faculty_id: String,
  faculty_name: String,
  room: String,
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial'],
    default: 'lecture'
  }
});

const timetableSchema = new mongoose.Schema({
  timetable_id: {
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
  academic_year: {
    type: String,
    required: true
  },
  entries: [timetableEntrySchema],
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Timetable = mongoose.model('Timetable', timetableSchema);

module.exports = Timetable;
