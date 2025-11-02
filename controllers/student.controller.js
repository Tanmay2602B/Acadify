const pool = require('../config/db');

// Get student dashboard data
const getDashboardData = async (req, res) => {
  try {
    // Get student's program and semester
    const [studentInfo] = await pool.execute(
      'SELECT program, semester FROM users WHERE user_id = ?', 
      [req.user.user_id]
    );
    
    if (studentInfo.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const { program, semester } = studentInfo[0];
    
    // Get recent announcements for student's program and semester
    const [announcements] = await pool.execute(
      'SELECT * FROM announcements WHERE program = ? AND semester = ? ORDER BY created_at DESC LIMIT 5', 
      [program, semester]
    );
    
    // Get recent resources for student's program and semester
    const [resources] = await pool.execute(
      'SELECT * FROM resources WHERE program = ? AND semester = ? ORDER BY created_at DESC LIMIT 5', 
      [program, semester]
    );
    
    res.json({
      program,
      semester,
      announcements,
      resources
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
    
    const query = `
      INSERT INTO submissions (resource_id, student_id, submission_path) 
      VALUES (?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      resourceId,
      req.user.user_id,
      submissionPath
    ]);
    
    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: {
        id: result.insertId,
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
    const [studentInfo] = await pool.execute(
      'SELECT program, semester FROM users WHERE user_id = ?', 
      [req.user.user_id]
    );
    
    if (studentInfo.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const { program, semester } = studentInfo[0];
    
    const query = 'SELECT * FROM timetable WHERE program = ? AND semester = ? ORDER BY day, start_time';
    const [rows] = await pool.execute(query, [program, semester]);
    
    res.json({ timetable: rows });
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