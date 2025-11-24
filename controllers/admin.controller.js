const User = require('../models/User.mongo');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [students] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    const [faculty] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role = "faculty"');
    const [programs] = await pool.execute('SELECT COUNT(DISTINCT program) as count FROM users WHERE program IS NOT NULL');
    
    res.json({
      stats: {
        totalStudents: students[0].count,
        totalFaculty: faculty[0].count,
        totalPrograms: programs[0].count
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
    const students = await User.getAllStudents();
    res.json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all faculty
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await User.getAllFaculty();
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
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Create user
    const userData = { name, email, role, program, semester };
    const { userId, password } = await User.create(userData);
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        userId,
        name,
        email,
        role,
        program,
        semester
      },
      generatedCredentials: {
        userId,
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
    
    const query = 'UPDATE users SET name = ?, email = ?, role = ?, program = ?, semester = ? WHERE id = ?';
    await pool.execute(query, [name, email, role, program, semester, id]);
    
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
    
    const query = 'DELETE FROM users WHERE id = ?';
    await pool.execute(query, [id]);
    
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
    
    let query = 'SELECT * FROM users WHERE role = ?';
    let params = [role];
    
    if (searchTerm) {
      query += ' AND (name LIKE ? OR email LIKE ? OR user_id LIKE ?)';
      const searchPattern = `%${searchTerm}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    const [rows] = await pool.execute(query, params);
    
    res.json({ users: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, program, semester } = req.body;
    const postedBy = req.user.user_id;
    
    const query = 'INSERT INTO announcements (title, content, program, semester, posted_by) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.execute(query, [title, content, program, semester, postedBy]);
    
    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: {
        id: result.insertId,
        title,
        content,
        program,
        semester,
        postedBy
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all announcements
const getAllAnnouncements = async (req, res) => {
  try {
    const query = 'SELECT * FROM announcements ORDER BY created_at DESC';
    const [rows] = await pool.execute(query);
    res.json({ announcements: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update announcement
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, program, semester } = req.body;
    
    const query = 'UPDATE announcements SET title = ?, content = ?, program = ?, semester = ? WHERE id = ?';
    await pool.execute(query, [title, content, program, semester, id]);
    
    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete announcement
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM announcements WHERE id = ?';
    await pool.execute(query, [id]);
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate student report
const generateStudentReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.name as student_name,
        u.email,
        u.program,
        u.semester,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(a.id) as total_count,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)), 2) as attendance_percentage
      FROM users u
      LEFT JOIN attendance a ON u.user_id = a.user_id
      WHERE u.role = 'student'
      GROUP BY u.user_id, u.name, u.email, u.program, u.semester
      ORDER BY u.program, u.semester, u.name
    `;
    
    const [rows] = await pool.execute(query);
    
    res.json({ report: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate faculty report
const generateFacultyReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.name as faculty_name,
        u.email,
        COUNT(s.id) as total_students,
        COUNT(DISTINCT sub.id) as total_subjects
      FROM users u
      LEFT JOIN subjects sub ON u.user_id = sub.faculty_id
      LEFT JOIN users s ON sub.program_id = s.program AND sub.semester_id = s.semester
      WHERE u.role = 'faculty'
      GROUP BY u.user_id, u.name, u.email
      ORDER BY u.name
    `;
    
    const [rows] = await pool.execute(query);
    
    res.json({ report: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate program report
const generateProgramReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.name as program_name,
        p.duration,
        COUNT(DISTINCT s.id) as total_semesters,
        COUNT(DISTINCT u.id) as total_students,
        COUNT(DISTINCT f.id) as total_faculty
      FROM programs p
      LEFT JOIN semesters s ON p.id = s.program_id
      LEFT JOIN users u ON p.name = u.program AND u.role = 'student'
      LEFT JOIN subjects sub ON p.id = sub.program_id
      LEFT JOIN users f ON sub.faculty_id = f.user_id AND f.role = 'faculty'
      GROUP BY p.id, p.name, p.duration
      ORDER BY p.name
    `;
    
    const [rows] = await pool.execute(query);
    
    res.json({ report: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create program
const createProgram = async (req, res) => {
  try {
    const { name, duration } = req.body;
    
    const query = 'INSERT INTO programs (name, duration) VALUES (?, ?)';
    const [result] = await pool.execute(query, [name, duration]);
    
    res.status(201).json({
      message: 'Program created successfully',
      program: {
        id: result.insertId,
        name,
        duration
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all programs
const getAllPrograms = async (req, res) => {
  try {
    const query = 'SELECT * FROM programs';
    const [rows] = await pool.execute(query);
    res.json({ programs: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update program
const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration } = req.body;
    
    const query = 'UPDATE programs SET name = ?, duration = ? WHERE id = ?';
    await pool.execute(query, [name, duration, id]);
    
    res.json({ message: 'Program updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete program
const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First delete related semesters
    await pool.execute('DELETE FROM semesters WHERE program_id = ?', [id]);
    
    // Then delete the program
    const query = 'DELETE FROM programs WHERE id = ?';
    await pool.execute(query, [id]);
    
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create semester
const createSemester = async (req, res) => {
  try {
    const { name, programId } = req.body;
    
    const query = 'INSERT INTO semesters (name, program_id) VALUES (?, ?)';
    const [result] = await pool.execute(query, [name, programId]);
    
    res.status(201).json({
      message: 'Semester created successfully',
      semester: {
        id: result.insertId,
        name,
        programId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all semesters
const getAllSemesters = async (req, res) => {
  try {
    const query = 'SELECT * FROM semesters';
    const [rows] = await pool.execute(query);
    res.json({ semesters: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update semester
const updateSemester = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, programId } = req.body;
    
    const query = 'UPDATE semesters SET name = ?, program_id = ? WHERE id = ?';
    await pool.execute(query, [name, programId, id]);
    
    res.json({ message: 'Semester updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete semester
const deleteSemester = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM semesters WHERE id = ?';
    await pool.execute(query, [id]);
    
    res.json({ message: 'Semester deleted successfully' });
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