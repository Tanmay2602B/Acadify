const pool = require('../config/db');

// Get faculty dashboard data
const getDashboardData = async (req, res) => {
  try {
    // Get faculty's classes
    const [classes] = await pool.execute(
      'SELECT DISTINCT program, semester FROM users WHERE faculty_id = ?', 
      [req.user.user_id]
    );
    
    // Get recent uploads
    const [uploads] = await pool.execute(
      'SELECT * FROM resources WHERE uploaded_by = ? ORDER BY created_at DESC LIMIT 5', 
      [req.user.user_id]
    );
    
    res.json({
      classes: classes,
      recentUploads: uploads
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, program, semester } = req.body;
    
    const query = `
      INSERT INTO announcements (title, content, program, semester, posted_by) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      title,
      content,
      program,
      semester,
      req.user.user_id
    ]);
    
    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: {
        id: result.insertId,
        title,
        content,
        program,
        semester,
        postedBy: req.user.user_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardData,
  createAnnouncement
};