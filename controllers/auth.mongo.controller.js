const User = require('../models/User.mongo');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'faculty', 'student').required(),
  program: Joi.string().optional(),
  semester: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Register user
const register = async (req, res) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const { name, email, role, program, semester } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    
    // Create user
    const userData = { 
      user_id: generateUserId(role),
      name, 
      email, 
      password, 
      role, 
      program, 
      semester 
    };
    
    const user = new User(userData);
    await user.save();
    
    // Generate token
    const token = user.generateToken();
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      generatedCredentials: {
        userId: user.user_id,
        password
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = user.generateToken();
    
    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        program: user.program,
        semester: user.semester
      }
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

// Generate user ID based on role
const generateUserId = (role) => {
  let userIdPrefix = '';
  switch (role) {
    case 'admin':
      userIdPrefix = 'ADM';
      break;
    case 'faculty':
      userIdPrefix = 'FAC';
      break;
    case 'student':
      userIdPrefix = 'STU';
      break;
    default:
      userIdPrefix = 'USR';
  }
  
  return userIdPrefix + Date.now().toString().slice(-6);
};

module.exports = {
  register,
  login,
  getProfile
};