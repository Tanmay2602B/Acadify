const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Slides', 'Notes', 'Video', 'Other'],
    default: 'Other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  filePath: {
    type: String, // Absolute path for deletion
    required: true
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resource', resourceSchema);
