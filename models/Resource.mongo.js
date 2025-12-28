const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['notes', 'ppt', 'assignment', 'reference', 'Slides', 'Notes', 'Video', 'Other'],
    default: 'Other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String // Cloudinary public_id for deletion
  },
  filePath: {
    type: String // Kept for backward compatibility, not required
  },
  fileName: {
    type: String, // Original filename for download
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  // Assignment-specific fields
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  lateSubmission: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  // Assignment submissions
  submissions: [{
    student_id: String,
    student_name: String,
    file_url: String,
    submitted_at: Date,
    comments: String,
    marks: Number,
    feedback: String,
    status: {
      type: String,
      enum: ['submitted', 'graded', 'late'],
      default: 'submitted'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', resourceSchema);
