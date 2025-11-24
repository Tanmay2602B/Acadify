const User = require('../models/User.mongo');

// Get student dashboard data
const getDashboardData = async (req, res) => {
  try {
    // Get student's program and semester
    const student = await User.findOne({ user_id: req.user.user_id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const { program, semester } = student;
    
    // For now, we'll return placeholder data
    // In a full implementation, you would fetch announcements and resources from MongoDB
    res.json({
      program,
      semester,
      announcements: [],
      resources: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  try {
    const { resourceId } = req.body;
    const submissionPath = req.file ? req.file.path : null;
    
    // For now, we'll return a placeholder response
    // In a full implementation, you would save the submission to MongoDB
    res.status(201).json({
      message: 'Assignment submitted successfully (placeholder)',
      submission: {
        resourceId,
        studentId: req.user.user_id,
        submissionPath
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student's timetable
const getTimetable = async (req, res) => {
  try {
    // Get student's program and semester
    const student = await User.findOne({ user_id: req.user.user_id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const { program, semester } = student;
    
    // For now, we'll return placeholder data
    // In a full implementation, you would fetch timetable from MongoDB
    res.json({ timetable: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardData,
  submitAssignment,
  getTimetable
};