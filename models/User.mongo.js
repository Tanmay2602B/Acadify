const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Define the User schema
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'faculty', 'student']
  },
  program: {
    type: String
  },
  semester: {
    type: String
  },
  department: {
    type: String
  },
  designation: {
    type: String
  },
  phone: {
    type: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token method
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { id: this._id, user_id: this.user_id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;