const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  roll_number: {
    type: String,
    required: true,
    unique: true
  },
  enrollment_number: {
    type: String,
    unique: true,
    sparse: true
  },
  program: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  },
  batch: String,
  section: String,
  phone: String,
  parent_phone: String,
  address: String,
  date_of_birth: Date,
  blood_group: String,
  admission_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
