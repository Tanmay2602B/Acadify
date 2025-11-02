const pool = require('../config/db');

// Get all student council members
const getCouncilMembers = async (req, res) => {
  try {
    const query = `
      SELECT sc.*, u.name as student_name, u.email as student_email
      FROM student_council sc
      JOIN users u ON sc.student_id = u.user_id
      ORDER BY sc.id
    `;
    
    const [rows] = await pool.execute(query);
    
    res.json({ members: rows });
  } catch (error) {
    console.error('Error fetching council members:', error);
    res.status(500).json({ message: 'Failed to fetch council members' });
  }
};

// Add student council member
const addCouncilMember = async (req, res) => {
  try {
    const { role, studentId, startDate, endDate } = req.body;
    
    // Check if student exists and is a student
    const [students] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ? AND role = "student"', 
      [studentId]
    );
    
    if (students.length === 0) {
      return res.status(400).json({ message: 'Student not found or not a student' });
    }
    
    // Check if role is already filled
    const [existing] = await pool.execute(
      'SELECT * FROM student_council WHERE role = ? AND (end_date IS NULL OR end_date > CURDATE())', 
      [role]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: `Role ${role} is already filled` });
    }
    
    const query = `
      INSERT INTO student_council (role, student_id, start_date, end_date) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [role, studentId, startDate, endDate]);
    
    res.status(201).json({
      message: 'Council member added successfully',
      member: {
        id: result.insertId,
        role,
        studentId,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error adding council member:', error);
    res.status(500).json({ message: 'Failed to add council member' });
  }
};

// Update student council member
const updateCouncilMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, studentId, startDate, endDate } = req.body;
    
    // Check if student exists and is a student
    const [students] = await pool.execute(
      'SELECT * FROM users WHERE user_id = ? AND role = "student"', 
      [studentId]
    );
    
    if (students.length === 0) {
      return res.status(400).json({ message: 'Student not found or not a student' });
    }
    
    const query = `
      UPDATE student_council 
      SET role = ?, student_id = ?, start_date = ?, end_date = ?
      WHERE id = ?
    `;
    
    await pool.execute(query, [role, studentId, startDate, endDate, id]);
    
    res.json({ message: 'Council member updated successfully' });
  } catch (error) {
    console.error('Error updating council member:', error);
    res.status(500).json({ message: 'Failed to update council member' });
  }
};

// Remove student council member
const removeCouncilMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM student_council WHERE id = ?';
    await pool.execute(query, [id]);
    
    res.json({ message: 'Council member removed successfully' });
  } catch (error) {
    console.error('Error removing council member:', error);
    res.status(500).json({ message: 'Failed to remove council member' });
  }
};

module.exports = {
  getCouncilMembers,
  addCouncilMember,
  updateCouncilMember,
  removeCouncilMember
};