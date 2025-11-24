const mongoose = require('mongoose');

const subjectGradeSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  internal_marks: Number,
  external_marks: Number,
  total_marks: Number,
  max_marks: Number,
  grade: String,
  credits: Number
});

const reportCardSchema = new mongoose.Schema({
  report_id: {
    type: String,
    required: true,
    unique: true
  },
  student_id: {
    type: String,
    required: true
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
  subjects: [subjectGradeSchema],
  total_marks_obtained: Number,
  total_max_marks: Number,
  percentage: Number,
  cgpa: Number,
  sgpa: Number,
  attendance_percentage: Number,
  remarks: String,
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  generated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const ReportCard = mongoose.model('ReportCard', reportCardSchema);

module.exports = ReportCard;
