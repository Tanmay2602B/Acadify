const mongoose = require('mongoose');

const timetableSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    required: true
  },
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  subject_code: {
    type: String,
    required: true
  },
  subject_name: {
    type: String,
    required: true
  },
  faculty_id: {
    type: String,
    required: true
  },
  faculty_name: {
    type: String,
    required: true
  },
  room: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Lecture', 'Lab', 'Tutorial', 'Practical'],
    default: 'Lecture'
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
    type: Number,
    required: true
  },
  section: {
    type: String,
    default: 'A'
  },
  academic_year: {
    type: String,
    required: true
  },
  slots: [timetableSlotSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  created_by: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
timetableSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Timetable', timetableSchema);
