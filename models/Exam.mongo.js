const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['radio', 'checkbox', 'text'],
    default: 'radio'
  },
  question_text: {
    type: String,
    required: true
  },
  image: String, // Path to uploaded image
  options: [String], // Array of options for radio/checkbox
  correct_answer: mongoose.Schema.Types.Mixed, // String for radio/text, Array for checkbox
  marks: {
    type: Number,
    default: 1
  }
});

const examSchema = new mongoose.Schema({
  exam_id: {
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
    type: mongoose.Schema.Types.Mixed, // Allow both String and Number
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
  duration: {
    type: Number,
    required: true // in minutes
  },
  total_marks: {
    type: Number,
    required: true
  },
  start_time: {
    type: Date,
    required: true
  },
  end_time: {
    type: Date,
    required: true
  },
  questions: [questionSchema],
  anti_cheat_enabled: {
    type: Boolean,
    default: true
  },
  randomize_questions: {
    type: Boolean,
    default: true
  },
  show_results: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
});

const submissionSchema = new mongoose.Schema({
  submission_id: {
    type: String,
    required: true,
    unique: true
  },
  exam_id: {
    type: String,
    required: true
  },
  student_id: {
    type: String,
    required: true
  },
  answers: [{
    question_id: mongoose.Schema.Types.ObjectId,
    selected_answer: String
  }],
  score: Number,
  total_marks: Number,
  percentage: Number,
  submitted_at: {
    type: Date,
    default: Date.now
  },
  time_taken: Number, // in minutes
  tab_switches: {
    type: Number,
    default: 0
  },
  suspicious_activity: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Exam = mongoose.model('Exam', examSchema);
const ExamSubmission = mongoose.model('ExamSubmission', submissionSchema);

module.exports = { Exam, ExamSubmission };
