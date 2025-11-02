const pool = require('../config/db');

// Create announcement (Admin/Faculty)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, program, semester } = req.body;
    const postedBy = req.user.user_id;
    
    const query = `
      INSERT INTO announcements (title, content, program, semester, posted_by) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      title,
      content,
      program,
      semester,
      postedBy
    ]);
    
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
    console.error('Error creating announcement:', error);
    res.status(500).json({ message: 'Failed to create announcement' });
  }
};

// Get announcements for students
const getStudentAnnouncements = async (req, res) => {
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
    
    const query = `
      SELECT a.*, u.name as posted_by_name
      FROM announcements a
      JOIN users u ON a.posted_by = u.user_id
      WHERE (a.program = ? AND a.semester = ?) OR (a.program IS NULL AND a.semester IS NULL)
      ORDER BY a.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [program, semester]);
    
    res.json({ announcements: rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

// Get all announcements (Admin)
const getAllAnnouncements = async (req, res) => {
  try {
    const query = `
      SELECT a.*, u.name as posted_by_name
      FROM announcements a
      JOIN users u ON a.posted_by = u.user_id
      ORDER BY a.created_at DESC
    `;
    
    const [rows] = await pool.execute(query);
    
    res.json({ announcements: rows });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
};

// Update announcement (Admin/Faculty)
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, program, semester } = req.body;
    
    // Check if user is authorized to update this announcement
    const [announcements] = await pool.execute(
      'SELECT * FROM announcements WHERE id = ?', 
      [id]
    );
    
    if (announcements.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    const announcement = announcements[0];
    
    if (req.user.role !== 'admin' && announcement.posted_by !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to update this announcement' });
    }
    
    const query = `
      UPDATE announcements 
      SET title = ?, content = ?, program = ?, semester = ?
      WHERE id = ?
    `;
    
    await pool.execute(query, [title, content, program, semester, id]);
    
    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ message: 'Failed to update announcement' });
  }
};

// Delete announcement (Admin/Faculty)
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is authorized to delete this announcement
    const [announcements] = await pool.execute(
      'SELECT * FROM announcements WHERE id = ?', 
      [id]
    );
    
    if (announcements.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    
    const announcement = announcements[0];
    
    if (req.user.role !== 'admin' && announcement.posted_by !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to delete this announcement' });
    }
    
    const query = 'DELETE FROM announcements WHERE id = ?';
    await pool.execute(query, [id]);
    
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ message: 'Failed to delete announcement' });
  }
};

module.exports = {
  createAnnouncement,
  getStudentAnnouncements,
  getAllAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
};