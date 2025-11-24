const User = require('../models/User.mongo');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const students = await User.countDocuments({ role: 'student' });
    const faculty = await User.countDocuments({ role: 'faculty' });
    const programs = await User.distinct('program', { program: { $ne: null } });
    
    res.json({
      stats: {
        totalStudents: students,
        totalFaculty: faculty,
        totalPrograms: programs.length
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('user_id name email program semester');
    res.json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all faculty
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' }).select('user_id name email');
    res.json({ faculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const { name, email, role, program, semester } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Generate random password
    const password = Math.random().toString(36).slice(-8);
    
    // Generate user ID based on role
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
    
    const userId = userIdPrefix + Date.now().toString().slice(-6);
    
    // Create user
    const userData = { 
      user_id: userId,
      name, 
      email, 
      password, 
      role, 
      program, 
      semester 
    };
    
    const user = new User(userData);
    await user.save();
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        program: user.program,
        semester: user.semester
      },
      generatedCredentials: {
        userId: user.user_id,
        password
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, program, semester } = req.body;
    
    const user = await User.findOneAndUpdate(
      { user_id: id },
      { name, email, role, program, semester },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOneAndDelete({ user_id: id });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { searchTerm, role } = req.query;
    
    let query = { role };
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { user_id: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query);
    
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    // For now, we'll just return a success message
    // In a full implementation, you would create an Announcement model and save to MongoDB
    res.status(201).json({
      message: 'Announcement created successfully (placeholder)'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    // For now, we'll just return an empty array
    // In a full implementation, you would fetch from MongoDB
    res.json({ announcements: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    // For now, we'll just return a success message
    // In a full implementation, you would update in MongoDB
    res.json({ message: 'Announcement updated successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    // For now, we'll just return a success message
    // In a full implementation, you would delete from MongoDB
    res.json({ message: 'Announcement deleted successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate student report
const generateStudentReport = async (req, res) => {
  try {
    // For now, we'll just return a placeholder
    res.json({ message: 'Student report generated successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate faculty report
const generateFacultyReport = async (req, res) => {
  try {
    // For now, we'll just return a placeholder
    res.json({ message: 'Faculty report generated successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate program report
const generateProgramReport = async (req, res) => {
  try {
    // For now, we'll just return a placeholder
    res.json({ message: 'Program report generated successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create program
const createProgram = async (req, res) => {
  try {
    // For now, we'll just return a success message
    res.status(201).json({ message: 'Program created successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all programs
const getAllPrograms = async (req, res) => {
  try {
    // For now, we'll just return a placeholder
    const programs = await User.distinct('program', { program: { $ne: null } });
    res.json({ programs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update program
const updateProgram = async (req, res) => {
  try {
    // For now, we'll just return a success message
    res.json({ message: 'Program updated successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete program
const deleteProgram = async (req, res) => {
  try {
    // For now, we'll just return a success message
    res.json({ message: 'Program deleted successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create semester
const createSemester = async (req, res) => {
  try {
    // For now, we'll just return a success message
    res.status(201).json({ message: 'Semester created successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all semesters
const getAllSemesters = async (req, res) => {
  try {
    // For now, we'll just return a placeholder
    const semesters = await User.distinct('semester', { semester: { $ne: null } });
    res.json({ semesters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update semester
const updateSemester = async (req, res) => {
  try {
    // For now, we'll just return a success message
    res.json({ message: 'Semester updated successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete semester
const deleteSemester = async (req, res) => {
  try {
    // For now, we'll just return a success message
    res.json({ message: 'Semester deleted successfully (placeholder)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllStudents,
  getAllFaculty,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  createAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  generateStudentReport,
  generateFacultyReport,
  generateProgramReport,
  createProgram,
  getAllPrograms,
  updateProgram,
  deleteProgram,
  createSemester,
  getAllSemesters,
  updateSemester,
  deleteSemester
};