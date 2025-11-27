const User = require('../models/User.mongo');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('admin', 'faculty', 'student').required(),
  program: Joi.string().optional(),
  semester: Joi.string().optional(),
  department: Joi.string().allow('').optional(),
  designation: Joi.string().allow('').optional(),
  phone: Joi.string().allow('').optional()
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

    const { name, email, role, program, semester, department, designation, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user
    const userData = { name, email, role, program, semester, department, designation, phone };
    const { userId, password } = await User.create(userData);

    // Generate token
    const user = await User.findByEmail(email);
    const token = User.generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      generatedCredentials: {
        userId,
        password
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    if (error.message.includes('Database')) {
      return res.status(500).json({
        message: 'Database connection failed. Please check your database configuration.',
        detail: error.message
      });
    }
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
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = User.generateToken(user);

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    if (error.message.includes('Database')) {
      return res.status(500).json({
        message: 'Database connection failed. Please check your database configuration.',
        detail: error.message
      });
    }
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
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
    if (error.message.includes('Database')) {
      return res.status(500).json({
        message: 'Database connection failed. Please check your database configuration.',
        detail: error.message
      });
    }
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};