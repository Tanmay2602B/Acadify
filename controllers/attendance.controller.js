const pool = require('../config/db');

// Mark attendance for students
const markAttendance = async (req, res) => {
  try {
    const { date, subjectId, attendanceData } = req.body; // attendanceData: [{ studentId, status }]
    const facultyId = req.user.user_id;
    
    // Validate that the faculty is teaching this subject
    const [subjects] = await pool.execute(
      'SELECT * FROM subjects WHERE id = ? AND faculty_id = ?', 
      [subjectId, facultyId]
    );
    
    if (subjects.length === 0) {
      return res.status(403).json({ message: 'Not authorized to mark attendance for this subject' });
    }
    
    // Insert attendance records
    const attendancePromises = attendanceData.map(async (record) => {
      const { studentId, status } = record;
      
      // Check if attendance record already exists for this student, date, and subject
      const [existing] = await pool.execute(
        'SELECT id FROM attendance WHERE user_id = ? AND date = ? AND subject_id = ?',
        [studentId, date, subjectId]
      );
      
      if (existing.length > 0) {
        // Update existing record
        return pool.execute(
          'UPDATE attendance SET status = ? WHERE id = ?',
          [status, existing[0].id]
        );
      } else {
        // Insert new record
        return pool.execute(
          'INSERT INTO attendance (user_id, date, status, subject_id) VALUES (?, ?, ?, ?)',
          [studentId, date, status, subjectId]
        );
      }
    });
    
    await Promise.all(attendancePromises);
    
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
};

// Get student attendance
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.user_id;
    
    const query = `
      SELECT a.date, a.status, s.name as subject_name, u.name as faculty_name
      FROM attendance a
      JOIN subjects s ON a.subject_id = s.id
      JOIN users u ON s.faculty_id = u.user_id
      WHERE a.user_id = ?
      ORDER BY a.date DESC
    `;
    
    const [rows] = await pool.execute(query, [studentId]);
    
    res.json({ attendance: rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
};

// Get faculty attendance report
const getFacultyAttendanceReport = async (req, res) => {
  try {
    const facultyId = req.user.user_id;
    
    const query = `
      SELECT 
        u.user_id,
        u.name as student_name,
        s.name as subject_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(a.id) as total_count,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)), 2) as attendance_percentage
      FROM users u
      JOIN subjects s ON u.program = s.program_id AND u.semester = s.semester_id
      LEFT JOIN attendance a ON u.user_id = a.user_id AND a.subject_id = s.id
      WHERE s.faculty_id = ?
      GROUP BY u.user_id, u.name, s.name
      ORDER BY u.name
    `;
    
    const [rows] = await pool.execute(query, [facultyId]);
    
    res.json({ report: rows });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ message: 'Failed to fetch attendance report' });
  }
};

// Get admin attendance report
const getAdminAttendanceReport = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.name as student_name,
        u.program,
        u.semester,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
        COUNT(a.id) as total_count,
        ROUND((COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)), 2) as attendance_percentage
      FROM users u
      LEFT JOIN attendance a ON u.user_id = a.user_id
      WHERE u.role = 'student'
      GROUP BY u.user_id, u.name, u.program, u.semester
      ORDER BY u.program, u.semester, u.name
    `;
    
    const [rows] = await pool.execute(query);
    
    res.json({ report: rows });
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    res.status(500).json({ message: 'Failed to fetch attendance report' });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getFacultyAttendanceReport,
  getAdminAttendanceReport
};