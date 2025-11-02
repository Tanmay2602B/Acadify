const pool = require('../config/db');
const { uploadFile, deleteFile } = require('../utils/cloudinary');

// Upload resource (Faculty)
const uploadResource = async (req, res) => {
  try {
    const { title, description, type, program, semester, subjectId } = req.body;
    const uploadedBy = req.user.user_id;
    
    let fileUrl = null;
    let publicId = null;
    
    // Upload file to Cloudinary if provided
    if (req.file) {
      const uploadResult = await uploadFile(req.file.path);
      fileUrl = uploadResult.url;
      publicId = uploadResult.public_id;
    }
    
    const query = `
      INSERT INTO resources (title, description, type, file_path, public_id, program, semester, subject_id, uploaded_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
      title,
      description,
      type,
      fileUrl,
      publicId,
      program,
      semester,
      subjectId,
      uploadedBy
    ]);
    
    res.status(201).json({
      message: 'Resource uploaded successfully',
      resource: {
        id: result.insertId,
        title,
        description,
        type,
        fileUrl,
        program,
        semester,
        subjectId
      }
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
    res.status(500).json({ message: 'Failed to upload resource' });
  }
};

// Get resources for students
const getStudentResources = async (req, res) => {
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
      SELECT r.*, s.name as subject_name, u.name as faculty_name
      FROM resources r
      JOIN subjects s ON r.subject_id = s.id
      JOIN users u ON r.uploaded_by = u.user_id
      WHERE r.program = ? AND r.semester = ?
      ORDER BY r.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [program, semester]);
    
    res.json({ resources: rows });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// Get faculty resources
const getFacultyResources = async (req, res) => {
  try {
    const query = `
      SELECT r.*, s.name as subject_name
      FROM resources r
      JOIN subjects s ON r.subject_id = s.id
      WHERE r.uploaded_by = ?
      ORDER BY r.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [req.user.user_id]);
    
    res.json({ resources: rows });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ message: 'Failed to fetch resources' });
  }
};

// Delete resource (Faculty/Admin)
const deleteResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    // Get resource details
    const [resources] = await pool.execute('SELECT * FROM resources WHERE id = ?', [resourceId]);
    
    if (resources.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    const resource = resources[0];
    
    // Check authorization
    if (req.user.role !== 'admin' && resource.uploaded_by !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to delete this resource' });
    }
    
    // Delete file from Cloudinary if it exists
    if (resource.public_id) {
      await deleteFile(resource.public_id);
    }
    
    // Delete from database
    const query = 'DELETE FROM resources WHERE id = ?';
    await pool.execute(query, [resourceId]);
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Failed to delete resource' });
  }
};

// Download resource
const downloadResource = async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    // Get resource details
    const [resources] = await pool.execute('SELECT * FROM resources WHERE id = ?', [resourceId]);
    
    if (resources.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    const resource = resources[0];
    
    // Check if student is authorized to download this resource
    if (req.user.role === 'student') {
      // Students can only download resources for their program and semester
      const [studentInfo] = await pool.execute(
        'SELECT program, semester FROM users WHERE user_id = ?', 
        [req.user.user_id]
      );
      
      if (studentInfo.length === 0 || 
          studentInfo[0].program !== resource.program || 
          studentInfo[0].semester !== resource.semester) {
        return res.status(403).json({ message: 'Not authorized to download this resource' });
      }
    }
    
    // For now, we'll just return the file URL
    // In a real implementation, you would stream the file
    res.json({ fileUrl: resource.file_path });
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({ message: 'Failed to download resource' });
  }
};

module.exports = {
  uploadResource,
  getStudentResources,
  getFacultyResources,
  deleteResource,
  downloadResource
};