const User = require('../models/User.mongo');
const Student = require('../models/Student.mongo');
const bcrypt = require('bcryptjs');

// Bulk add students from CSV/JSON
const bulkAddStudents = async (req, res) => {
  try {
    const { students } = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: 'Invalid student data. Expected an array of students.' });
    }
    
    const results = [];
    const errors = [];
    
    for (const studentData of students) {
      try {
        // Validate required fields
        if (!studentData.name || !studentData.email || !studentData.roll_number || !studentData.program || !studentData.semester) {
          errors.push({
            data: studentData,
            error: 'Missing required fields (name, email, roll_number, program, semester)'
          });
          continue;
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: studentData.email });
        if (existingUser) {
          errors.push({
            data: studentData,
            error: 'Email already exists'
          });
          continue;
        }
        
        // Check if roll number already exists
        const existingStudent = await Student.findOne({ roll_number: studentData.roll_number });
        if (existingStudent) {
          errors.push({
            data: studentData,
            error: 'Roll number already exists'
          });
          continue;
        }
        
        // Generate user_id and student_id
        const user_id = `STU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const student_id = `S-${studentData.roll_number}`;
        
        // Generate default password (can be roll number or a random password)
        const defaultPassword = studentData.password || studentData.roll_number;
        
        // Create user account
        const user = new User({
          user_id,
          name: studentData.name,
          email: studentData.email,
          password: defaultPassword, // Will be hashed by pre-save hook
          role: 'student',
          program: studentData.program,
          semester: studentData.semester
        });
        
        await user.save();
        
        // Create student profile
        const student = new Student({
          student_id,
          user_id,
          roll_number: studentData.roll_number,
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
          name: studentData.name,
          email: studentData.email,
          roll_number: studentData.roll_number,
          user_id,
          student_id,
          success: true
        });
      } catch (error) {
        errors.push({
          data: studentData,
          error: error.message
        });
      }
    }
    
    res.status(201).json({
      message: 'Bulk student upload completed',
      total: students.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors
    });
  } catch (error) {
    console.error('Error in bulk student upload:', error);
    res.status(500).json({ message: 'Failed to upload students', error: error.message });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const { program, semester, status } = req.query;
    
    const query = {};
    if (program) query.program = program;
    if (semester) query.semester = semester;
    if (status) query.status = status;
    
    const students = await Student.find(query).sort({ roll_number: 1 });
    
    // Populate user details
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        const user = await User.findOne({ user_id: student.user_id });
        return {
          ...student.toObject(),
          name: user?.name,
          email: user?.email
        };
      })
    );
    
    res.json({ students: studentsWithDetails });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    const updates = req.body;
    
    const student = await Student.findOne({ student_id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update student fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'user_id' && key !== 'student_id') {
        student[key] = updates[key];
      }
    });
    
    await student.save();
    
    // Update user fields if provided
    if (updates.name || updates.email) {
      const user = await User.findOne({ user_id: student.user_id });
      if (user) {
        if (updates.name) user.name = updates.name;
        if (updates.email) user.email = updates.email;
        if (updates.program) user.program = updates.program;
        if (updates.semester) user.semester = updates.semester;
        await user.save();
      }
    }
    
    res.json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const student = await Student.findOne({ student_id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Delete user account
    await User.deleteOne({ user_id: student.user_id });
    
    // Delete student profile
    await Student.deleteOne({ student_id });
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Failed to delete student' });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { student_id } = req.params;
    
    const student = await Student.findOne({ student_id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const user = await User.findOne({ user_id: student.user_id });
    
    res.json({
      student: {
        ...student.toObject(),
        name: user?.name,
        email: user?.email
      }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Failed to fetch student' });
  }
};

module.exports = {
  bulkAddStudents,
  getAllStudents,
  updateStudent,
  deleteStudent,
  getStudentById
};
