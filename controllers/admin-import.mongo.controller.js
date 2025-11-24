const User = require('../models/User.mongo');
const Student = require('../models/Student.mongo');
const { parseFile, validateStudentData, validateFacultyData, generateTemplate } = require('../utils/csvParser');
const { generateSecurePassword, generateUserId } = require('../utils/passwordGenerator');
const bcrypt = require('bcryptjs');

/**
 * Import students from CSV/Excel
 */
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Parse file
    const data = parseFile(req.file.buffer, req.file.mimetype);
    
    // Validate data
    const { valid, invalid } = validateStudentData(data);
    
    if (valid.length === 0) {
      return res.status(400).json({
        message: 'No valid records found',
        invalid
      });
    }
    
    // Generate user IDs and passwords
    const studentsWithCredentials = valid.map(student => {
      const user_id = generateUserId('student');
      const password = generateSecurePassword(12);
      
      return {
        ...student,
        user_id,
        password, // Plain password for display
        email: student.email.toLowerCase().trim()
      };
    });
    
    // Return preview for confirmation
    res.json({
      message: 'File parsed successfully',
      preview: studentsWithCredentials,
      total: studentsWithCredentials.length,
      invalid: invalid.length > 0 ? invalid : undefined
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Failed to import students', error: error.message });
  }
};

/**
 * Confirm and save imported students
 */
const confirmImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'No students data provided' });
    }
    
    const results = [];
    const errors = [];
    
    for (const studentData of students) {
      try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: studentData.email });
        if (existingUser) {
          errors.push({
            email: studentData.email,
            error: 'Email already exists'
          });
          continue;
        }
        
        // Create user account
        const user = new User({
          user_id: studentData.user_id,
          name: studentData.name,
          email: studentData.email,
          password: studentData.password, // Will be hashed by pre-save hook
          role: 'student',
          program: studentData.program,
          semester: studentData.semester
        });
        
        await user.save();
        
        // Create student profile
        const student = new Student({
          student_id: `S-${studentData.user_id}`,
          user_id: studentData.user_id,
          roll_number: studentData.roll_number || `${studentData.program}${studentData.semester}${Date.now().toString().slice(-4)}`,
          enrollment_number: studentData.enrollment_number || '',
          program: studentData.program,
          semester: studentData.semester,
          batch: studentData.batch || '',
          section: studentData.section || '',
          phone: studentData.phone || '',
          parent_phone: studentData.parent_phone || '',
          address: studentData.address || '',
          date_of_birth: studentData.date_of_birth ? new Date(studentData.date_of_birth) : null,
          blood_group: studentData.blood_group || '',
          status: 'active'
        });
        
        await student.save();
        
        results.push({
          user_id: studentData.user_id,
          name: studentData.name,
          email: studentData.email,
          password: studentData.password, // Return for display only
          success: true
        });
        
      } catch (error) {
        errors.push({
          email: studentData.email,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      message: 'Import completed',
      total: students.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Confirm import error:', error);
    res.status(500).json({ message: 'Failed to save students', error: error.message });
  }
};

/**
 * Import faculty from CSV/Excel
 */
const importFaculty = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const data = parseFile(req.file.buffer, req.file.mimetype);
    const { valid, invalid } = validateFacultyData(data);
    
    if (valid.length === 0) {
      return res.status(400).json({
        message: 'No valid records found',
        invalid
      });
    }
    
    const facultyWithCredentials = valid.map(faculty => {
      const user_id = generateUserId('faculty');
      const password = generateSecurePassword(12);
      
      return {
        ...faculty,
        user_id,
        password,
        email: faculty.email.toLowerCase().trim()
      };
    });
    
    res.json({
      message: 'File parsed successfully',
      preview: facultyWithCredentials,
      total: facultyWithCredentials.length,
      invalid: invalid.length > 0 ? invalid : undefined
    });
    
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Failed to import faculty', error: error.message });
  }
};

/**
 * Confirm and save imported faculty
 */
const confirmImportFaculty = async (req, res) => {
  try {
    const { faculty } = req.body;
    
    if (!Array.isArray(faculty) || faculty.length === 0) {
      return res.status(400).json({ message: 'No faculty data provided' });
    }
    
    const results = [];
    const errors = [];
    
    for (const facultyData of faculty) {
      try {
        const existingUser = await User.findOne({ email: facultyData.email });
        if (existingUser) {
          errors.push({
            email: facultyData.email,
            error: 'Email already exists'
          });
          continue;
        }
        
        const user = new User({
          user_id: facultyData.user_id,
          name: facultyData.name,
          email: facultyData.email,
          password: facultyData.password,
          role: 'faculty',
          department: facultyData.department,
          designation: facultyData.designation
        });
        
        await user.save();
        
        results.push({
          user_id: facultyData.user_id,
          name: facultyData.name,
          email: facultyData.email,
          password: facultyData.password,
          success: true
        });
        
      } catch (error) {
        errors.push({
          email: facultyData.email,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      message: 'Import completed',
      total: faculty.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Confirm import error:', error);
    res.status(500).json({ message: 'Failed to save faculty', error: error.message });
  }
};

/**
 * Download CSV template
 */
const downloadTemplate = (req, res) => {
  try {
    const { type } = req.params; // 'student' or 'faculty'
    
    const template = generateTemplate(type);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-template.csv`);
    res.send(template);
    
  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({ message: 'Failed to generate template' });
  }
};

module.exports = {
  importStudents,
  confirmImportStudents,
  importFaculty,
  confirmImportFaculty,
  downloadTemplate
};
