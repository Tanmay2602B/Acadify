const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subject_code: {
    type: String,
    required: true
  },
  subject_name: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  credits: {
    type: Number,
    default: 3
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical', 'Lab', 'Project'],
    default: 'Theory'
  },
  hours_per_week: {
    type: Number,
    default: 3
  }
});

const programSchema = new mongoose.Schema({
  program_code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  program_name: {
    type: String,
    required: true
  },
  duration_years: {
    type: Number,
    required: true
  },
  total_semesters: {
    type: Number,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  subjects: [subjectSchema],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
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
programSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Program', programSchema);
